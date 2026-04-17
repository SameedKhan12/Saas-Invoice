// import NextAuth, { DefaultSession } from "next-auth";
// import Google from "next-auth/providers/google";

// declare module "next-auth" {
//   interface Session{
//     user:{
//       id:string
//     } & DefaultSession["user"]
//   }
// }

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }
//   ),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks:{
//     async jwt({token,user,account}){
//       if(user){
//         token.id = user.id;
//       }
//       return token;
//     },
//     async session({session,token}){
//       if (session.user){
//         session.user.id = token.id as string;
//       }
//       return session;
//     }
//   },
// })

// auth.ts
import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import db from "@/db"; 
import { users } from "@/db/schema"; 
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
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
        const [existingUser] = await db.select().from(users).where(eq(users.email, user.email));
        if (!existingUser) {
          await db.insert(users).values({
            id: crypto.randomUUID(), 
            email: user.email,
            password: "oauth_authenticated",
          });
        }
        return true;
      } catch (error) {
        return false;
      }
    },

    async jwt({ token, user }) {
      if (token.email) {
        const [dbUser] = await db.select().from(users).where(eq(users.email, token.email));
        if (dbUser) token.id = dbUser.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});