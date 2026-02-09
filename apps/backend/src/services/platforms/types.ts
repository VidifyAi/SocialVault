export interface ScraperResult {
  username: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  followers?: number;
  following?: number;
  posts?: number;
  isVerified?: boolean;
  metadata?: Record<string, any>;
}
