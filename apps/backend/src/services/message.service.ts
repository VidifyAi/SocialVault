import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { 
  analyzeMessage, 
  getWarningMessage, 
  shouldBlockMessage, 
  getSeverityLevel,
  FilterResult 
} from '../utils/messageFilter';

interface CreateMessageData {
  senderId: string;
  conversationId?: string;
  recipientId?: string;
  listingId?: string;
  content: string;
  attachments?: string[];
}

interface SendMessageResult {
  message: any;
  warning?: string;
  flagged: boolean;
}

export class MessageService {
  async sendMessage(data: CreateMessageData): Promise<SendMessageResult> {
    let conversationId = data.conversationId;

    // Analyze message content for contact info / payment mentions
    const filterResult = analyzeMessage(data.content);
    
    // Check if message should be blocked (severe violations)
    if (shouldBlockMessage(filterResult)) {
      throw new BadRequestError(
        'Your message contains content that violates our policies. ' +
        'Please remove contact information or payment details and try again.'
      );
    }

    // If no conversation ID, create or find one
    if (!conversationId) {
      if (!data.recipientId) {
        throw new BadRequestError('Either conversationId or recipientId is required');
      }

      // Check if conversation exists between these users (for this listing if specified)
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          ...(data.listingId ? { listingId: data.listingId } : {}),
          participants: {
            every: {
              userId: { in: [data.senderId, data.recipientId] },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (existingConversation && existingConversation.participants.length === 2) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const newConversation = await prisma.conversation.create({
          data: {
            listingId: data.listingId,
            participants: {
              create: [
                { userId: data.senderId },
                { userId: data.recipientId },
              ],
            },
          },
        });
        conversationId = newConversation.id;
      }
    }

    // Verify user is part of conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: data.senderId,
      },
    });

    if (!participant) {
      throw new ForbiddenError('You are not part of this conversation');
    }

    // Create message with flagging info if detected
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: data.senderId,
        content: data.content,
        attachments: data.attachments || [],
        readBy: [data.senderId],
        // Add flagging data
        isFlagged: filterResult.flagged,
        flagReason: filterResult.warnings.length > 0 ? filterResult.warnings.join('; ') : null,
        flagSeverity: filterResult.flagged ? getSeverityLevel(filterResult) : null,
        detectedItems: filterResult.detectedItems.length > 0 ? filterResult.detectedItems : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // TODO: Send real-time notification via WebSocket
    // TODO: Send push notification

    // Return message with warning if flagged
    return {
      message,
      warning: filterResult.flagged ? getWarningMessage(filterResult) : undefined,
      flagged: filterResult.flagged,
    };
  }

  async getConversations(userId: string) {
    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            listing: {
              select: {
                id: true,
                platform: true,
                username: true,
                displayName: true,
                screenshots: true,
              },
            },
            transaction: {
              select: {
                id: true,
                status: true,
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                content: true,
                senderId: true,
                createdAt: true,
                readBy: true,
              },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          lastMessageAt: 'desc',
        },
      },
    });

    return participations.map((p) => {
      const otherParticipants = p.conversation.participants
        .filter((part) => part.userId !== userId)
        .map((part) => part.user);

      const lastMessage = p.conversation.messages[0];
      const hasUnread = lastMessage && !lastMessage.readBy.includes(userId);

      return {
        id: p.conversation.id,
        participants: otherParticipants,
        listing: p.conversation.listing,
        transaction: p.conversation.transaction,
        lastMessage,
        hasUnread,
        lastMessageAt: p.conversation.lastMessageAt,
      };
    });
  }

  async getMessages(conversationId: string, userId: string, limit = 50, before?: string) {
    // Verify user is part of conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      throw new ForbiddenError('You are not part of this conversation');
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return messages.reverse();
  }

  async markAsRead(conversationId: string, userId: string) {
    // Verify user is part of conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      throw new ForbiddenError('You are not part of this conversation');
    }

    // Mark all unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        NOT: {
          readBy: { has: userId },
        },
      },
      data: {
        readBy: {
          push: userId,
        },
      },
    });

    // Update participant's last read time
    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    return { success: true };
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        listing: {
          select: {
            id: true,
            platform: true,
            username: true,
            displayName: true,
            price: true,
            screenshots: true,
          },
        },
        transaction: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError('Conversation');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );

    if (!isParticipant) {
      throw new ForbiddenError('You are not part of this conversation');
    }

    return conversation;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });

    const conversationIds = conversations.map((c) => c.conversationId);

    const unreadCount = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        NOT: {
          readBy: { has: userId },
        },
        senderId: { not: userId },
      },
    });

    return unreadCount;
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Get flagged messages for admin review
   */
  async getFlaggedMessages(options: {
    page?: number;
    limit?: number;
    severity?: 'low' | 'medium' | 'high';
  }) {
    const { page = 1, limit = 20, severity } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      isFlagged: true,
    };

    if (severity) {
      where.flagSeverity = severity;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          conversation: {
            include: {
              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      email: true,
                    },
                  },
                },
              },
              listing: {
                select: {
                  id: true,
                  displayName: true,
                  platform: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
      prisma.message.count({ where }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get flagged message statistics
   */
  async getFlaggedStats() {
    const [total, high, medium, low, last24h] = await Promise.all([
      prisma.message.count({ where: { isFlagged: true } }),
      prisma.message.count({ where: { isFlagged: true, flagSeverity: 'high' } }),
      prisma.message.count({ where: { isFlagged: true, flagSeverity: 'medium' } }),
      prisma.message.count({ where: { isFlagged: true, flagSeverity: 'low' } }),
      prisma.message.count({
        where: {
          isFlagged: true,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      total,
      bySeverity: { high, medium, low },
      last24h,
    };
  }
}

export const messageService = new MessageService();
