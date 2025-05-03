
import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { LoadingSpinner } from './ui/loading-spinner';

const GlobalLoadingIndicator: React.FC = () => {
  const { isLoading } = useLoading();
  
  if (!isLoading) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      <div className="h-full bg-finance-primary animate-pulse"></div>
    </div>
  );
};

export default GlobalLoadingIndicator;
