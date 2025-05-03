
import React, { ReactNode } from 'react';
import Navigation from './Navigation';
import MobileNavBar from './MobileNavBar';
import { useMobile } from '@/hooks/use-mobile';
import GlobalLoadingIndicator from './GlobalLoadingIndicator';

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props) => {
  const { isMobile } = useMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalLoadingIndicator />
      
      {!isMobile && (
        <div className="flex flex-1">
          <Navigation />
          <main className="flex-1 p-6 animate-fade-in">
            {children}
          </main>
        </div>
      )}
      
      {isMobile && (
        <>
          <main className="flex-1 p-4 pb-20 animate-fade-in">
            {children}
          </main>
          <MobileNavBar />
        </>
      )}
    </div>
  );
};

export default Layout;
