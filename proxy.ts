// middleware.ts
import { auth } from "./lib/auth"; 

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  // 1. Check if the request is for the Stripe Webhook
  const isStripeWebhook = nextUrl.pathname === "/api/stripe/webhook";
  const isAuthPage = nextUrl.pathname.startsWith('/login') || 
                     nextUrl.pathname.startsWith('/signup');

  // 2. If it's the webhook, do nothing (let it pass through)
  if (isStripeWebhook) {
    return; 
  }

  // 3. Protect your other routes
  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL('/login', nextUrl));
  }
})

export const config = {
  // This matcher ignores internal Next.js files and the api route
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|$).*)"],
}