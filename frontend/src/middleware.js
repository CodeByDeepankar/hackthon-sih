import { clerkMiddleware } from "@clerk/nextjs/server";

// Mark auth pages (and optionally home) as public to avoid redirect loops
export default clerkMiddleware({
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
  ],
});

export const config = {
  // Apply Clerk middleware to all routes (including app routes and API)
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
