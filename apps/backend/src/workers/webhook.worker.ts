import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

export interface WebhookJobData {
  event: string;
  payload: any;
}

async function processWebhookJob(job: Job<WebhookJobData>) {
  const { event, payload } = job.data;

  switch (event) {
    case 'payment.captured': {
      const payment = payload.payment.entity;
      logger.info(`Webhook: payment captured ${payment.id}`);
      break;
    }

    case 'payment.failed': {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      // Idempotency: only update if not already in a terminal state
      const existing = await prisma.transaction.findFirst({
        where: { razorpayOrderId: orderId },
      });

      if (existing && existing.status !== 'payment_failed' && existing.status !== 'completed' && existing.status !== 'cancelled') {
        await prisma.transaction.updateMany({
          where: { razorpayOrderId: orderId },
          data: {
            paymentStatus: 'failed',
            status: 'payment_failed',
          },
        });
      }
      break;
    }

    case 'refund.created': {
      const refund = payload.refund.entity;
      logger.info(`Webhook: refund created ${refund.id}`);
      break;
    }

    default:
      logger.info(`Unhandled webhook event: ${event}`);
  }
}

export function createWebhookWorker(): Worker {
  const worker = new Worker('webhook', processWebhookJob, {
    connection: redis,
    concurrency: 3,
  });

  worker.on('completed', (job) => {
    logger.info(`Webhook job ${job.id} completed (event: ${job.data.event})`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Webhook job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}
