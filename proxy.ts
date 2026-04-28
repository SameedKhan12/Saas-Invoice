import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  if (req.nextUrl.pathname.startsWith("/api/stripe/webhook")) {
    return NextResponse.next();
  }

  // 1. Check if the request is for the Stripe Webhook
  const isStripeWebhook = nextUrl.pathname === "/api/stripe/webhook";
  const isPayPage = /^\/pay\/[^\/]+$/.test(pathname);

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/signup");

  // 2. If it's the webhook, do nothing (let it pass through)
  if (isStripeWebhook || isPayPage ) {
    return NextResponse.next()
  }


  // 3. Protect your other routes
  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  // This matcher ignores internal Next.js files and the api route
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|$).*)","/pay/:path*"],
};
