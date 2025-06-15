
import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-base md:text-lg text-gray-600">
        Welcome back! Here's your budget overview
      </p>
    </div>
  );
};

export default DashboardHeader;
