import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { userRouter } from './routes/user.routes';
import { listingRouter } from './routes/listing.routes';
import { transactionRouter } from './routes/transaction.routes';
import { messageRouter } from './routes/message.routes';
import { offerRouter } from './routes/offer.routes';
import reviewRouter from './routes/review.routes';
import { adminRouter } from './routes/admin.routes';
import { paymentRouter } from './routes/payment.routes';
import { uploadRouter } from './routes/upload.routes';
import scraperRouter from './routes/scraper.routes';
import { setupWebSocket } from './websocket';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';
import { setupWorkers, shutdownWorkers } from './workers';

const app: Express = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
});
app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes (Clerk handles auth, no auth routes needed)
app.use('/api/v1/users', userRouter);
app.use('/api/v1/listings', listingRouter);
app.use('/api/v1/transactions', transactionRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/offers', offerRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/uploads', uploadRouter);
app.use('/api/v1/scrape', scraperRouter);

// Also support /api routes without version
app.use('/api/users', userRouter);
app.use('/api/listings', listingRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/messages', messageRouter);
app.use('/api/offers', offerRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/scrape', scraperRouter);

// Error handler
app.use(errorHandler);

// WebSocket setup
setupWebSocket(io);

// Start server
const PORT = config.port;

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Connected to database');

    // Connect to Redis and start workers
    await redis.connect();
    await setupWorkers();

    const HOST = process.env.HOST || '0.0.0.0';
    httpServer.listen(PORT, HOST, () => {
      logger.info(`Server running on ${HOST}:${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await shutdownWorkers();
  await redis.quit();
  await prisma.$disconnect();
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

main();

export { app, io };
