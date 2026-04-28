import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { users } from "@/db/schema";
import db from "@/db";
import { eq } from "drizzle-orm";
import { StripeConnectBanner } from "@/components/stripe-connect-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (Date.now() > new Date(session.expires).getTime()) redirect("/login");

  const userID = session.user.id;

  const [userData] = await db.select().from(users).where(eq(users.id, userID!));

  // 4. If session is valid but user is missing from DB (rare edge case)
  if (!userData) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex-1">
        <div className="p-4 border-b flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="font-semibold">Dashboard</h1>
        </div>
        {!userData.stripeAccountId && <StripeConnectBanner />}
        <SessionProvider>


        <div className="p-6">{children}</div>
        </SessionProvider>
      </main>
    </SidebarProvider>
  );
}
