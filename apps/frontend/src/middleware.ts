import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes (everything else is protected by default)
const isPublicRoute = createRouteMatcher([
  '/',
  '/browse(.*)',
  '/listing/(.*)',
  '/user/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

// Use Clerk's built-in protection to avoid mutating immutable headers
export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }

  // Use modern Clerk redirect param to avoid deprecated afterSignInUrl warnings
  if (isPublicRoute(req)) {
    const url = new URL(req.url);
    const redirectUrl = url.searchParams.get('redirect_url');
    if (redirectUrl) {
      url.searchParams.delete('redirect_url');
      url.searchParams.set('redirectUrl', redirectUrl);
      return Response.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
