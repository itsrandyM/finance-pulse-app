
import React from 'react';
import Navigation from './Navigation';
import { useToast } from '@/components/ui/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-finance-background">
      <Navigation />
      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
