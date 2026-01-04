import { authMiddleware } from '@clerk/nextjs';

// This middleware placeholder can be extended with protected routes
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ['/'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
