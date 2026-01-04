import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      clerkId: string;
      id: string;
      userId: string;
      email: string;
      role: string;
    };
  }
}
