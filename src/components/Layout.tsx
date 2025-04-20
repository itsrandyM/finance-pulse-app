
import React from 'react';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup } from '@/components/ui/sidebar';
import { useLocation } from 'react-router-dom';
import { Wallet, LayoutDashboard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-finance-primary" />
              <span className="font-semibold text-lg">Wallet</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
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
                      <span>Setup</span>
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
                      <span>Tracking</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
