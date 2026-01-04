import { Server as SocketServer, Socket } from 'socket.io';
import { verifyToken } from '@clerk/backend';
import { config } from '../config';
import { logger } from '../utils/logger';
import { cache } from '../lib/redis';
import { prisma } from '../lib/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupWebSocket(io: SocketServer) {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify Clerk JWT
      const payload = await verifyToken(token, {
        secretKey: config.clerkSecretKey,
      });

      if (!payload || !payload.sub) {
        return next(new Error('Invalid token'));
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { clerkId: payload.sub },
        select: { id: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    logger.info(`User connected: ${userId}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Store user as online
    await cache.set(`online:${userId}`, 'true', 300); // 5 min expiry

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId });

    // Handle joining conversation rooms
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      logger.debug(`User ${userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      logger.debug(`User ${userId} left conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:indicator', {
        conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:indicator', {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    // Handle message read receipts
    socket.on('message:read', ({ conversationId, messageId }) => {
      socket.to(`conversation:${conversationId}`).emit('message:read', {
        conversationId,
        messageId,
        readBy: userId,
        readAt: new Date(),
      });
    });

    // Keep-alive ping
    socket.on('ping', () => {
      cache.set(`online:${userId}`, 'true', 300);
      socket.emit('pong');
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${userId}`);
      
      // Check if user has other connections
      const sockets = await io.in(`user:${userId}`).fetchSockets();
      
      if (sockets.length === 0) {
        // No other connections, mark as offline
        await cache.del(`online:${userId}`);
        socket.broadcast.emit('user:offline', { userId });
      }
    });
  });

  return io;
}

// Helper functions to emit events from services
export function emitToUser(io: SocketServer, userId: string, event: string, data: unknown) {
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToConversation(io: SocketServer, conversationId: string, event: string, data: unknown) {
  io.to(`conversation:${conversationId}`).emit(event, data);
}

export function emitNewMessage(io: SocketServer, conversationId: string, message: unknown) {
  io.to(`conversation:${conversationId}`).emit('message:new', message);
}

export function emitNotification(io: SocketServer, userId: string, notification: unknown) {
  io.to(`user:${userId}`).emit('notification:new', notification);
}

export function emitTransactionUpdate(
  io: SocketServer, 
  buyerId: string, 
  sellerId: string, 
  data: unknown
) {
  io.to(`user:${buyerId}`).to(`user:${sellerId}`).emit('transaction:status_changed', data);
}
