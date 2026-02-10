import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { emailService } from '../services/email.service';
import { logger } from '../utils/logger';

export interface EmailJobData {
  type: string;
  params: any;
}

async function processEmailJob(job: Job<EmailJobData>) {
  const { type, params } = job.data;

  switch (type) {
    case 'escrow_funded':
      await emailService.sendEscrowFundedEmail(params);
      break;
    case 'transaction_complete':
      await emailService.sendTransactionCompleteEmail(params);
      break;
    case 'refund':
      await emailService.sendRefundEmail(params);
      break;
    case 'listing_approved':
      await emailService.sendListingApprovedEmail(params.email, params.name, params.listingTitle, params.listingId);
      break;
    case 'listing_rejected':
      await emailService.sendListingRejectedEmail(params.email, params.name, params.listingTitle, params.reason);
      break;
    case 'dispute_resolved':
      await emailService.sendDisputeResolvedEmail(params.email, params.name, params.resolution, params.disputeId);
      break;
    default:
      logger.warn(`Unknown email job type: ${type}`);
  }
}

export function createEmailWorker(): Worker {
  const worker = new Worker('email', processEmailJob, {
    connection: redis,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed (type: ${job.data.type})`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Email job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}
