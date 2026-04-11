import { redirect } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import { SessionProvider } from "next-auth/react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {


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
