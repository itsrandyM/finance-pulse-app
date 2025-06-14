
import React from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Wallet, LayoutDashboard, TrendingUp, User, DollarSign, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileNavBar from "./MobileNavBar";
import GlobalLoadingIndicator from './GlobalLoadingIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const navItemClasses = (path: string) => cn(
    "w-full flex items-center gap-3 px-4 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-150",
    location.pathname === path && "bg-slate-800 text-white font-semibold"
  );
  
  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Setup" },
    { path: "/budget", icon: Wallet, label: "Budget" },
    { path: "/tracking", icon: TrendingUp, label: "Tracking" },
    { path: "/income", icon: DollarSign, label: "Income" },
    { path: "/expense-history", icon: History, label: "History" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <>
          <GlobalLoadingIndicator />
          {!isMobile && (
            <Sidebar className="min-w-[72px] w-64 md:w-64 bg-slate-900 border-r border-slate-800 shadow-none transition-all duration-200">
              <SidebarHeader className="p-4 h-16 flex items-center gap-3 border-b border-slate-800">
                <div className="bg-blue-500 p-2 rounded-lg">
                    <img
                    src="/favicon.ico"
                    className="h-6 w-6"
                    alt="Wallet Logo"
                    />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">
                  Wallet
                </span>
              </SidebarHeader>
              <SidebarContent className="flex-1 pt-4">
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                            asChild
                            isActive={location.pathname === item.path}
                            tooltip={item.label}
                        >
                            <Link
                            to={item.path}
                            className={navItemClasses(item.path)}
                            >
                            <Icon className="h-5 w-5" />
                            <span className="hidden md:inline">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                  })}
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
