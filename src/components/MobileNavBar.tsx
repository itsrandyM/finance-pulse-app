
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Wallet, TrendingUp, User, BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Setup", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/budget", label: "Budget", icon: <Wallet className="h-5 w-5" /> },
  { href: "/income", label: "Income", icon: <BadgeDollarSign className="h-5 w-5" /> },
  { href: "/tracking", label: "Tracking", icon: <TrendingUp className="h-5 w-5" /> },
  { href: "/profile", label: "Profile", icon: <User className="h-5 w-5" /> }
];

const MobileNavBar: React.FC = () => {
  const location = useLocation();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center z-50 h-16 md:hidden"
      role="navigation"
    >
      {navLinks.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className={cn(
            "flex flex-col items-center justify-center space-y-1 text-xs text-gray-500 hover:text-finance-primary transition-colors",
            location.pathname === link.href && "text-finance-primary font-semibold"
          )}
        >
          {link.icon}
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
};
export default MobileNavBar;
