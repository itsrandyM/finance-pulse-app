
import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { Skeleton } from '@/components/ui/skeleton';

const GlobalLoadingIndicator: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-finance-primary"></div>
        <p className="text-finance-primary font-medium">Processing your request...</p>
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingIndicator;
