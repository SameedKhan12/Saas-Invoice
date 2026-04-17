"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <h2 className="text-lg font-semibold px-2">
          Invoice SaaS
        </h2>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                >
                  <Link href="/" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/clients"}
                >
                  <Link href="/clients" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Clients</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/invoices"}
                >
                  <Link href="/invoices" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Invoices</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="my-1">
        <SidebarMenuButton
          className=" text-red-600  hover:text-red-700 transition-colors "
          onClick={() => {
            signOut({ callbackUrl: "/login" });
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}