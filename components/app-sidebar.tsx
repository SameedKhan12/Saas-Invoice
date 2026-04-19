// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
// } from "@/components/ui/sidebar";
// import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react";
// import { signOut } from "next-auth/react";

// export function AppSidebar() {
//   const pathname = usePathname();

//   return (
//     <Sidebar collapsible="icon">
//       {/* Header */}
//       <SidebarHeader>
//         <h2 className="text-lg font-semibold px-2">
//           Invoice SaaS
//         </h2>
//       </SidebarHeader>

//       {/* Content */}
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton
//                   asChild
//                   isActive={pathname === "/dashboard"}
//                 >
//                   <Link href="/" className="flex items-center gap-2">
//                     <LayoutDashboard className="w-4 h-4" />
//                     <span>Dashboard</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>

//               <SidebarMenuItem>
//                 <SidebarMenuButton
//                   asChild
//                   isActive={pathname === "/clients"}
//                 >
//                   <Link href="/clients" className="flex items-center gap-2">
//                     <Users className="w-4 h-4" />
//                     <span>Clients</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>

//               <SidebarMenuItem>
//                 <SidebarMenuButton
//                   asChild
//                   isActive={pathname === "/invoices"}
//                 >
//                   <Link href="/invoices" className="flex items-center gap-2">
//                     <FileText className="w-4 h-4" />
//                     <span>Invoices</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       {/* Footer */}
//       <SidebarFooter className="my-1">
//         <SidebarMenuButton
//           className=" text-red-600  hover:text-red-700 transition-colors "
//           onClick={() => {
//             signOut({ callbackUrl: "/login" });
//           }}
//         >
//           <LogOut className="w-4 h-4" />
//           Logout
//         </SidebarMenuButton>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userImage = session?.user?.image ?? "";

  // Generate initials for avatar fallback
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <h2 className="text-lg font-semibold px-2">Invoice SaaS</h2>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/clients"}>
                  <Link href="/clients" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Clients</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/invoices"}>
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

      {/* Footer — user item + dropdown */}
      <SidebarFooter className="p-2">
        <DropdownMenu>
          <Item className="rounded-md px-1">
            {/* Avatar */}
            <ItemMedia>
              <Avatar className="h-8 w-8">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </ItemMedia>

            {/* Name + email */}
            <ItemContent>
              <ItemTitle className="text-sm font-medium leading-none">
                {userName}
              </ItemTitle>
              <ItemDescription className="text-xs text-muted-foreground truncate">
                {userEmail}
              </ItemDescription>
            </ItemContent>

            {/* ⋯ trigger */}
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

          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-56"
          >
            {/* User info header */}
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{userName}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {userEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
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