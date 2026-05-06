"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemActions,
} from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  FileText,
  MoreHorizontal,
  User,
  CreditCard,
  Bell,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image ?? "";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <h2 className="text-lg font-semibold px-2">Invoice SaaS</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href}>
                    <Link href={href} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — user item + dropdown */}
      <SidebarFooter className="p-2">
        <DropdownMenu>
          <Item className="rounded-md px-1 items-center">
            <ItemMedia>
              <Avatar className="h-8 w-8">
                <AvatarImage src={userImage!== ""? userImage : undefined} alt={userName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent className="max-w-3/5">
              <ItemTitle className="text-sm font-medium leading-none">
                {userName}
              </ItemTitle>
              <ItemDescription className="text-xs text-muted-foreground truncate">
                {userEmail}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  aria-label="User menu"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </ItemActions>
          </Item>

          <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userImage!== ""? userImage : undefined} alt={userName} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0  overflow-x-hidden">
                  <span className="text-sm font-medium truncate">{userName}</span>
                  <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <User className="mr-2 h-4 w-4" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}