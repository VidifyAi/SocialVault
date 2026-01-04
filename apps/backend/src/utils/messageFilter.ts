/**
 * Message Content Filter
 * Detects contact information sharing to prevent off-platform deals
 */

export interface FilterResult {
  hasContactInfo: boolean;
  flagged: boolean;
  warnings: string[];
  detectedItems: {
    type: 'email' | 'phone' | 'url' | 'social_handle' | 'payment';
    value: string;
    masked: string;
  }[];
  sanitizedContent: string;
}

// Regex patterns for detecting contact info
const patterns = {
  // Email addresses
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  
  // Phone numbers (various formats)
  phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  
  // URLs (including common domains without http)
  url: /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi,
  
  // Social media handles (@username patterns)
  socialHandle: /(?:^|\s)@[a-zA-Z0-9_]{3,30}/g,
  
  // Common payment apps/methods
  paymentApps: /\b(?:paypal|venmo|zelle|cashapp|cash\s*app|gpay|google\s*pay|apple\s*pay|wise|payoneer|bitcoin|btc|eth|ethereum|crypto|usdt)\b/gi,
  
  // Telegram/WhatsApp mentions
  messagingApps: /\b(?:telegram|whatsapp|whats\s*app|signal|discord|skype|wechat)\b/gi,
  
  // Spelled out contact info attempts (e@mail, zero-nine patterns)
  obfuscatedEmail: /[a-zA-Z0-9]+\s*(?:at|@|\[at\]|\(at\))\s*[a-zA-Z0-9]+\s*(?:dot|\.|\[dot\]|\(dot\))\s*[a-zA-Z]+/gi,
  
  // Number words (common evasion technique)
  numberWords: /\b(?:zero|one|two|three|four|five|six|seven|eight|nine)\b.*\b(?:zero|one|two|three|four|five|six|seven|eight|nine)\b/gi,
};

// Whitelist for allowed URLs (your platform, common safe links)
const urlWhitelist = [
  'socialswapr.com',
  'localhost',
  'instagram.com',
  'twitter.com',
  'tiktok.com',
  'youtube.com',
  'facebook.com',
  // Social platforms are OK since they're what's being sold
];

/**
 * Check if a URL is whitelisted
 */
function isWhitelistedUrl(url: string): boolean {
  return urlWhitelist.some(domain => url.toLowerCase().includes(domain));
}

/**
 * Mask detected content for logging/display
 */
function maskContent(content: string, type: string): string {
  if (type === 'email') {
    const [local, domain] = content.split('@');
    return `${local.charAt(0)}***@${domain}`;
  }
  if (type === 'phone') {
    return content.replace(/\d(?=\d{4})/g, '*');
  }
  if (type === 'url') {
    return content.substring(0, 15) + '...';
  }
  return content.charAt(0) + '***';
}

/**
 * Analyze message content for contact information
 */
export function analyzeMessage(content: string): FilterResult {
  const result: FilterResult = {
    hasContactInfo: false,
    flagged: false,
    warnings: [],
    detectedItems: [],
    sanitizedContent: content,
  };

  // Check for emails
  const emails = content.match(patterns.email);
  if (emails) {
    emails.forEach(email => {
      result.detectedItems.push({
        type: 'email',
        value: email,
        masked: maskContent(email, 'email'),
      });
    });
    result.warnings.push('Email address detected');
    result.flagged = true;
  }

  // Check for phone numbers
  const phones = content.match(patterns.phone);
  if (phones) {
    phones.forEach(phone => {
      result.detectedItems.push({
        type: 'phone',
        value: phone,
        masked: maskContent(phone, 'phone'),
      });
    });
    result.warnings.push('Phone number detected');
    result.flagged = true;
  }

  // Check for URLs (excluding whitelisted)
  const urls = content.match(patterns.url);
  if (urls) {
    urls.forEach(url => {
      if (!isWhitelistedUrl(url)) {
        result.detectedItems.push({
          type: 'url',
          value: url,
          masked: maskContent(url, 'url'),
        });
        result.warnings.push('External URL detected');
        result.flagged = true;
      }
    });
  }

  // Check for social handles (potential contact sharing)
  const handles = content.match(patterns.socialHandle);
  if (handles) {
    // Don't flag if it looks like they're describing the account being sold
    const suspiciousHandles = handles.filter(h => {
      const lower = h.toLowerCase().trim();
      // Flag if it seems like personal contact sharing
      return lower.includes('dm') || lower.includes('message') || lower.includes('contact');
    });
    if (suspiciousHandles.length > 0) {
      suspiciousHandles.forEach(handle => {
        result.detectedItems.push({
          type: 'social_handle',
          value: handle.trim(),
          masked: maskContent(handle.trim(), 'social_handle'),
        });
      });
      result.warnings.push('Social media handle shared (possible off-platform contact)');
      result.flagged = true;
    }
  }

  // Check for payment app mentions
  const paymentMentions = content.match(patterns.paymentApps);
  if (paymentMentions) {
    paymentMentions.forEach(app => {
      result.detectedItems.push({
        type: 'payment',
        value: app,
        masked: app,
      });
    });
    result.warnings.push('Payment method mentioned - reminder: all payments should go through SocialSwapr escrow');
    result.flagged = true;
  }

  // Check for messaging app mentions
  const messagingMentions = content.match(patterns.messagingApps);
  if (messagingMentions) {
    messagingMentions.forEach(app => {
      result.detectedItems.push({
        type: 'social_handle',
        value: app,
        masked: app,
      });
    });
    result.warnings.push('External messaging app mentioned');
    result.flagged = true;
  }

  // Check for obfuscated emails
  const obfuscatedEmails = content.match(patterns.obfuscatedEmail);
  if (obfuscatedEmails) {
    obfuscatedEmails.forEach(email => {
      result.detectedItems.push({
        type: 'email',
        value: email,
        masked: '(obfuscated email)',
      });
    });
    result.warnings.push('Possible obfuscated email detected');
    result.flagged = true;
  }

  result.hasContactInfo = result.detectedItems.length > 0;

  return result;
}

/**
 * Get warning message for users
 */
export function getWarningMessage(result: FilterResult): string {
  if (!result.flagged) return '';
  
  return `⚠️ Warning: Your message appears to contain contact information or payment details. ` +
    `Remember: Deals made outside SocialSwapr are not protected by our escrow service or buyer/seller protection. ` +
    `If something goes wrong with an off-platform deal, we cannot help recover your funds.`;
}

/**
 * Check if message should be blocked (severe violations)
 */
export function shouldBlockMessage(result: FilterResult): boolean {
  // For now, we don't block - just warn
  // Could enable blocking for repeat offenders
  return false;
}

/**
 * Severity level for admin review prioritization
 */
export function getSeverityLevel(result: FilterResult): 'low' | 'medium' | 'high' {
  if (!result.flagged) return 'low';
  
  const hasPayment = result.detectedItems.some(i => i.type === 'payment');
  const hasMultiple = result.detectedItems.length > 2;
  const hasObfuscation = result.detectedItems.some(i => i.masked.includes('obfuscated'));
  
  if (hasPayment && (hasMultiple || hasObfuscation)) return 'high';
  if (hasPayment || hasObfuscation) return 'medium';
  return 'low';
}
