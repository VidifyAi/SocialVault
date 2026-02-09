import https from 'https';
import { ScraperResult } from './types';

/**
 * Instagram Public HTML Scraper
 * Fetches public profile page and parses Open Graph meta tags.
 * No API key needed.
 *
 * Parses:
 *   og:description  – "{followers} Followers, {following} Following, {posts} Posts..."
 *   og:title        – display name
 *   og:image        – profile picture
 * Fallback: extracts edge_followed_by from embedded JSON in <script> tags
 */

const TIMEOUT = 8000;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function fetchPage(url: string, redirects = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    if (redirects > 5) {
      reject(new Error('Too many redirects'));
      return;
    }

    const req = https.get(url, {
      headers: {
        'User-Agent': randomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      timeout: TIMEOUT,
    }, (res) => {
      if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const origin = new URL(url).origin;
          redirectUrl = origin + (redirectUrl.startsWith('/') ? '' : '/') + redirectUrl;
        }
        resolve(fetchPage(redirectUrl, redirects + 1));
        return;
      }

      if ((res.statusCode || 500) >= 400) {
        reject(new Error(res.statusCode === 404 ? 'USER_NOT_FOUND' : `HTTP_${res.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk) => {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        if (chunks.reduce((s, c) => s + c.length, 0) > 2_000_000) {
          req.destroy();
          reject(new Error('Response too large'));
        }
      });
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('TIMEOUT')); });
  });
}

function parseFollowerString(str: string): number | undefined {
  // "1.2M Followers" / "123K Followers" / "12,345 Followers"
  const match = str.match(/([\d,.]+)\s*([KMBkmb])?\s*Follower/i);
  if (!match) return undefined;
  let num = parseFloat(match[1].replace(/,/g, ''));
  const suffix = (match[2] || '').toUpperCase();
  if (suffix === 'K') num *= 1_000;
  else if (suffix === 'M') num *= 1_000_000;
  else if (suffix === 'B') num *= 1_000_000_000;
  return Math.round(num);
}

function parseCount(str: string, label: string): number | undefined {
  const re = new RegExp(`([\\d,.]+)\\s*([KMBkmb])?\\s*${label}`, 'i');
  const match = str.match(re);
  if (!match) return undefined;
  let num = parseFloat(match[1].replace(/,/g, ''));
  const suffix = (match[2] || '').toUpperCase();
  if (suffix === 'K') num *= 1_000;
  else if (suffix === 'M') num *= 1_000_000;
  else if (suffix === 'B') num *= 1_000_000_000;
  return Math.round(num);
}

export async function scrapeInstagram(username: string): Promise<ScraperResult> {
  const clean = username.replace(/^@/, '').trim();
  const url = `https://www.instagram.com/${clean}/`;

  let html: string;
  try {
    html = await fetchPage(url);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') throw error;
    if (error.message === 'TIMEOUT') throw error;
    throw new Error(`Failed to fetch Instagram profile: ${error.message}`);
  }

  // Check if we landed on a login page or error page
  if (html.includes('"LoginAndSignupPage"') || html.includes('Page Not Found')) {
    throw new Error('USER_NOT_FOUND');
  }

  const result: ScraperResult = { username: clean };

  // og:title → display name
  const ogTitle = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i)
    || html.match(/content=["']([^"']+)["']\s+property=["']og:title["']/i);
  if (ogTitle) {
    let title = ogTitle[1].trim();
    // Instagram titles are often "Display Name (@username) • Instagram photos and videos"
    title = title.replace(/\s*\(@[^)]+\).*$/i, '').trim();
    title = title.replace(/\s*[•·|].*/i, '').trim();
    if (title && title.toLowerCase() !== 'instagram') {
      result.displayName = title;
    }
  }

  // og:description → followers, following, posts
  const ogDesc = html.match(/property=["']og:description["']\s+content=["']([^"']+)["']/i)
    || html.match(/content=["']([^"']+)["']\s+property=["']og:description["']/i);
  if (ogDesc) {
    const desc = ogDesc[1];
    result.followers = parseFollowerString(desc);
    result.following = parseCount(desc, 'Following');
    result.posts = parseCount(desc, 'Posts');
    // The rest of the description after the stats is the bio
    const bioMatch = desc.match(/Posts?\s*[-–—]\s*(.+)/i)
      || desc.match(/Posts?\s*[.]\s*(.+)/i);
    if (bioMatch) {
      result.bio = bioMatch[1].trim();
    }
  }

  // og:image → profile picture
  const ogImage = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)
    || html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
  if (ogImage) {
    result.profilePicture = ogImage[1].trim();
  }

  // Fallback: try to extract from embedded JSON in <script> tags
  if (!result.followers) {
    const edgeMatch = html.match(/"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)\s*\}/);
    if (edgeMatch) {
      result.followers = parseInt(edgeMatch[1], 10);
    }
  }

  if (!result.following) {
    const followingMatch = html.match(/"edge_follow"\s*:\s*\{\s*"count"\s*:\s*(\d+)\s*\}/);
    if (followingMatch) {
      result.following = parseInt(followingMatch[1], 10);
    }
  }

  if (!result.posts) {
    const postsMatch = html.match(/"edge_owner_to_timeline_media"\s*:\s*\{\s*"count"\s*:\s*(\d+)/);
    if (postsMatch) {
      result.posts = parseInt(postsMatch[1], 10);
    }
  }

  if (!result.bio) {
    const bioJsonMatch = html.match(/"biography"\s*:\s*"([^"]+)"/);
    if (bioJsonMatch) {
      result.bio = bioJsonMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
  }

  const verifiedMatch = html.match(/"is_verified"\s*:\s*(true|false)/);
  if (verifiedMatch) {
    result.isVerified = verifiedMatch[1] === 'true';
  }

  return result;
}
