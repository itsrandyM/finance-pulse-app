
import React from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { useLocation } from 'react-router-dom';
import { Wallet, LayoutDashboard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="hidden md:flex items-center gap-2">
              <Wallet className="h-6 w-6 text-finance-primary" />
              <span className="font-semibold text-lg">Wallet</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/'}
                  tooltip="Setup"
                >
                  <a href="/" className={cn(
                    "w-full",
                    location.pathname === '/' && "text-finance-primary"
                  )}>
                    <LayoutDashboard />
                    <span className="hidden md:inline">Setup</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/budget'}
                  tooltip="Budget"
                >
                  <a href="/budget" className={cn(
                    "w-full",
                    location.pathname === '/budget' && "text-finance-primary"
                  )}>
                    <Wallet />
                    <span className="hidden md:inline">Budget</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/tracking'}
                  tooltip="Tracking"
                >
                  <a href="/tracking" className={cn(
                    "w-full",
                    location.pathname === '/tracking' && "text-finance-primary"
                  )}>
                    <TrendingUp />
                    <span className="hidden md:inline">Tracking</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
