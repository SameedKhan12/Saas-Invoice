import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session{
    user:{
      id:string
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  ),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks:{
    async jwt({token,user,account}){
      if(user){
        token.id = user.id;
      }
      return token;
    },
    async session({session,token}){
      if (session.user){
        session.user.id = token.id as string;
      }
      return session;
    }
  },
})