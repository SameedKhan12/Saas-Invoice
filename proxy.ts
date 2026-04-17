// export { auth as proxy } from "@/lib/auth";



// export const config = {
//    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|signup|$).*)"]
// }
// middleware.ts (Renamed from proxy.ts)
// proxy.ts
import { auth } from "./lib/auth"; 

// Next.js 16 looks for this named export
export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/signup');

  // If not logged in and trying to access dashboard
  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
})

export const config = {
  // Ensure your matcher covers the dashboard
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|$).*)"],
}