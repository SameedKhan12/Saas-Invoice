import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import { SessionProvider, useSession } from "next-auth/react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth()
if(!session?.user) redirect('/login')
  if(session.expires)

  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex-1">
        <div className="p-4 border-b flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="font-semibold">Dashboard</h1>
        </div>
        <SessionProvider>
          <div className="p-6">{children}</div>
        </SessionProvider>
      </main>
    </SidebarProvider>
  );
}
