
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.push("/login");
    }
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex-1">
        <div className="p-4 border-b flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="font-semibold">Dashboard</h1>
        </div>

        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}