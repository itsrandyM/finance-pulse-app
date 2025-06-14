
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const Navigation = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-finance-primary">Finance Pulse</h1>
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-finance-primary">Finance Pulse</h1>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/">
            <h1 className="text-xl font-bold text-finance-primary">Finance Pulse</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/budget" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/budget') 
                  ? 'bg-finance-primary text-white' 
                  : 'text-gray-600 hover:text-finance-primary'
              }`}
            >
              Budget
            </Link>
            <Link 
              to="/tracking" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/tracking') 
                  ? 'bg-finance-primary text-white' 
                  : 'text-gray-600 hover:text-finance-primary'
              }`}
            >
              Tracking
            </Link>
            <Link 
              to="/expense-history" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/expense-history') 
                  ? 'bg-finance-primary text-white' 
                  : 'text-gray-600 hover:text-finance-primary'
              }`}
            >
              History
            </Link>
            <Link 
              to="/income" 
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/income') 
                  ? 'bg-finance-primary text-white' 
                  : 'text-gray-600 hover:text-finance-primary'
              }`}
            >
              Income
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
