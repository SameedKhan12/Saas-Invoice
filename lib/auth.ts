import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import db from "@/db";
import { eq } from "drizzle-orm";
import { signInSchema } from "./utils/zodSchema";
import { users } from "@/db/schema";
import { compare } from "bcrypt";
import { ZodError } from "zod";
import { getCachedDashboardData } from "./cache/dashboard";
import { getCachedInvoices } from "./cache/invoices";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "login",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials, request) => {
        try {
          const result = await signInSchema.safeParse(credentials);
          if (!result.success) {
            return null;
          }
          const { email, password } = result.data;

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
          const isMatch = await compare(password, user.password);
          if (!isMatch) {
            throw new Error("Invalid Credentials");
          }
          return user;
        } catch (error) {
          if (error instanceof ZodError) {
            // Return `null` to indicate that the credentials are invalid
            return null;
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days instead of 30 minutes
    updateAge: 60 * 60 * 24, // only refresh token once per day
  },

  jwt: {
  maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: "/login", // Redirects unauthenticated users here
  },
  callbacks: {
    // THIS IS THE KEY FOR PROXY.TS
    authorized: async ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const isPublicPage = request.nextUrl.pathname === "/login";

      // If they are on a public page, let them through
      if (isPublicPage) return true;

      // Otherwise, return true only if logged in (false redirects to login)
      return isLoggedIn;
    },

    async signIn({ user }) {
      if (!user.email) return false;
      try {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email));
        if (!existingUser) {
          await db.insert(users).values({
            id: user.id,
            email: user.email,
            password: "oauth_authenticated",
          });
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },

    async jwt({ token, user, trigger }) {
      // `user` is only available on first sign in
      // After that it's undefined — token already has everything
      if (user) {
        // First sign in — fetch ID once and store in token
        const [dbUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, user.email!));

        if (dbUser) token.id = dbUser.id;
      }

      // Every subsequent request — token.id is already there, no DB hit
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (session.user?.id) {
          // Fire and forget — don't await, just warm the cache
          getCachedDashboardData(session.user.id).catch(() => {});
          getCachedInvoices(session.user.id).catch(() => {});
        }
      }
      return session;
    },
  },
});
