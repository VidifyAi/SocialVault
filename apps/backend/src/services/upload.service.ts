// S3 Upload Service
// Handles file uploads to AWS S3 or compatible storage (Cloudflare R2, MinIO)

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Initialize S3 client
const s3Client = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  },
  ...(config.s3Endpoint && {
    endpoint: config.s3Endpoint,
    forcePathStyle: true, // Required for MinIO/R2
  }),
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: ['application/pdf'],
  video: ['video/mp4', 'video/quicktime'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  contentType: string;
  size: number;
}

interface UploadOptions {
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
}

class UploadService {
  private bucket: string;

  constructor() {
    this.bucket = config.s3Bucket;
  }

  /**
   * Upload a file buffer to S3
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      folder = 'uploads',
      maxSize = MAX_FILE_SIZE,
      allowedTypes = [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.document],
    } = options;

    // Validate file size
    if (buffer.length > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    // Validate MIME type
    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }

    // Generate unique filename
    const ext = path.extname(originalName);
    const uniqueName = `${uuidv4()}${ext}`;
    const key = `${folder}/${uniqueName}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // ACL: 'public-read', // Uncomment if bucket allows public access
      Metadata: {
        originalName,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    // Generate URL
    const url = this.getPublicUrl(key);

    return {
      key,
      url,
      bucket: this.bucket,
      contentType: mimeType,
      size: buffer.length,
    };
  }

  /**
   * Upload screenshot for listing
   */
  async uploadListingScreenshot(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    listingId: string
  ): Promise<UploadResult> {
    return this.uploadFile(buffer, originalName, mimeType, {
      folder: `listings/${listingId}/screenshots`,
      allowedTypes: ALLOWED_MIME_TYPES.image,
    });
  }

  /**
   * Upload verification proof for listing
   */
  async uploadVerificationProof(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    listingId: string
  ): Promise<UploadResult> {
    return this.uploadFile(buffer, originalName, mimeType, {
      folder: `listings/${listingId}/verification`,
      allowedTypes: [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.document],
    });
  }

  /**
   * Upload transfer step proof
   */
  async uploadTransferProof(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    transactionId: string,
    stepNumber: number
  ): Promise<UploadResult> {
    return this.uploadFile(buffer, originalName, mimeType, {
      folder: `transactions/${transactionId}/step-${stepNumber}`,
      allowedTypes: ALLOWED_MIME_TYPES.image,
    });
  }

  /**
   * Upload dispute evidence
   */
  async uploadDisputeEvidence(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    disputeId: string
  ): Promise<UploadResult> {
    return this.uploadFile(buffer, originalName, mimeType, {
      folder: `disputes/${disputeId}/evidence`,
      allowedTypes: [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.document, ...ALLOWED_MIME_TYPES.video],
      maxSize: 50 * 1024 * 1024, // 50MB for videos
    });
  }

  /**
   * Upload KYC document
   */
  async uploadKycDocument(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: string
  ): Promise<UploadResult> {
    return this.uploadFile(buffer, originalName, mimeType, {
      folder: `kyc/${userId}`,
      allowedTypes: [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.document],
    });
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: string
  ): Promise<UploadResult> {
    return this.uploadFile(buffer, originalName, mimeType, {
      folder: `avatars`,
      allowedTypes: ALLOWED_MIME_TYPES.image,
      maxSize: 5 * 1024 * 1024, // 5MB
    });
  }

  /**
   * Upload message attachment
   */
  async uploadMessageAttachment(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    conversationId: string
  ): Promise<UploadResult> {
    return this.uploadFile(buffer, originalName, mimeType, {
      folder: `messages/${conversationId}`,
      allowedTypes: [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.document],
      maxSize: 25 * 1024 * 1024, // 25MB
    });
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Generate a presigned URL for uploading
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Generate a presigned URL for downloading
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    if (config.s3Endpoint) {
      // For R2 or MinIO with custom endpoint
      return `${config.s3Endpoint}/${this.bucket}/${key}`;
    }
    // Standard S3 URL
    return `https://${this.bucket}.s3.${config.awsRegion}.amazonaws.com/${key}`;
  }

  /**
   * Generate presigned URL for client-side upload
   */
  async createUploadSession(
    folder: string,
    filename: string,
    contentType: string
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const ext = path.extname(filename);
    const uniqueName = `${uuidv4()}${ext}`;
    const key = `${folder}/${uniqueName}`;

    const uploadUrl = await this.getPresignedUploadUrl(key, contentType);
    const publicUrl = this.getPublicUrl(key);

    return {
      uploadUrl,
      key,
      publicUrl,
    };
  }
}

export const uploadService = new UploadService();
