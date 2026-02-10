import { Worker } from 'bullmq';
import { createEmailWorker } from './email.worker';
import { createWebhookWorker } from './webhook.worker';
import { logger } from '../utils/logger';

let workers: Worker[] = [];

export async function setupWorkers(): Promise<void> {
  const emailWorker = createEmailWorker();
  const webhookWorker = createWebhookWorker();
  workers = [emailWorker, webhookWorker];
  logger.info('BullMQ workers started (email, webhook)');
}

export async function shutdownWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
  logger.info('BullMQ workers shut down');
}
