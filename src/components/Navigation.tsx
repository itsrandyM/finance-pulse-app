
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DollarSign, PieChart, BarChart } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Setup', icon: <DollarSign className="h-5 w-5" /> },
    { path: '/budget', label: 'Budget', icon: <BarChart className="h-5 w-5" /> },
    { path: '/tracking', label: 'Tracking', icon: <PieChart className="h-5 w-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10 md:static md:top-0 md:left-auto md:right-auto md:border-t-0 md:border-r md:h-screen md:w-64">
      <div className="flex justify-around md:flex-col md:h-full md:p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center justify-center md:justify-start p-4 text-gray-500 transition-colors duration-200 hover:text-finance-primary",
              location.pathname === item.path && "text-finance-primary"
            )}
          >
            {item.icon}
            <span className="hidden md:block ml-2">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
