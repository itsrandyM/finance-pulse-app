
import React from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Wallet, LayoutDashboard, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNavBar from "./MobileNavBar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <>
          {!isMobile && (
            <Sidebar className="min-w-[72px] w-64 md:w-64 bg-white border-r shadow-none transition-all duration-200">
              <SidebarHeader className="p-4 h-16 flex items-center gap-2 border-b">
                <img
                  src="/favicon.ico"
                  className="h-8 w-8"
                  alt="Wallet Logo"
                />
                <span className="font-bold text-xl tracking-tight text-finance-primary">
                  Wallet
                </span>
              </SidebarHeader>
              <SidebarContent className="flex-1 pt-8">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === "/"}
                      tooltip="Setup"
                    >
                      <Link
                        to="/"
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 hover:text-finance-primary",
                          location.pathname === "/" && "text-finance-primary font-semibold"
                        )}
                      >
                        <LayoutDashboard />
                        <span className="hidden md:inline">Setup</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === "/budget"}
                      tooltip="Budget"
                    >
                      <Link
                        to="/budget"
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 hover:text-finance-primary",
                          location.pathname === "/budget" && "text-finance-primary font-semibold"
                        )}
                      >
                        <Wallet />
                        <span className="hidden md:inline">Budget</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === "/tracking"}
                      tooltip="Tracking"
                    >
                      <Link
                        to="/tracking"
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 hover:text-finance-primary",
                          location.pathname === "/tracking" && "text-finance-primary font-semibold"
                        )}
                      >
                        <TrendingUp />
                        <span className="hidden md:inline">Tracking</span>
                      </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === "/profile"}
                      tooltip="Profile"
                    >
                      <Link
                        to="/profile"
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 hover:text-finance-primary",
                          location.pathname === "/profile" && "text-finance-primary font-semibold"
                        )}
                      >
                        <User />
                        <span className="hidden md:inline">Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
          )}
          <main className={cn(
              "flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full",
              isMobile && "pb-16"
            )}>
            {children}
          </main>
          {isMobile && <MobileNavBar />}
        </>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
