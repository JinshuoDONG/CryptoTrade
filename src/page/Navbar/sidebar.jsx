import { Button } from "@/components/ui/button";
import { SheetClose } from '@/components/ui/sheet';
import {
  ActivitySquare,
  Bookmark,
  CreditCard,
  Home,
  Landmark,
  LayoutDashboard,
  LogOut,
  User,
  Wallet
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
  

  const menu = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-6 w-6" />
    },
    {
      name: "Portfolio",
      path: "/portfolio",
      icon: <LayoutDashboard className="h-6 w-6" />
    },
    {
      name: "Watchlist",
      path: "/watchlist",
      icon: <Bookmark className="h-6 w-6" />
    },
    {
      name: "Activity",
      path: "/activity",
      icon: <ActivitySquare className="h-6 w-6" />
    },
    {
      name: "Wallet",
      path: "/wallet",
      icon: <Wallet className="h-6 w-6" />
    },
    {
      name: "Payment Details",
      path: "/payment-details",
      icon: <Landmark className="h-6 w-6" />
    },
    {
      name: "Withdrawal",
      path: "/withdrawal",
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="h-6 w-6" />
    },
    {
      name: "Logout",
      path: "/Auth",
      icon: <LogOut className="h-6 w-6" />
    }
  ];
  

  const Sidebar = () => {
    const navigate = useNavigate();


    return (
      <div className="mt-10 space-y-5">
        {menu.map((item) => (
          <div key={item.name}>
            <SheetClose asChild>
              <Button
                variant="outline"
                className="flex items-center gap-5 py-6 w-full justify-start"
                onClick={() => navigate(item.path)}
              >
                <span className="w-8">{item.icon}</span>
                <p>{item.name}</p>
              </Button>
            </SheetClose>
          </div>
        ))}
      </div>
    );
  };

export default Sidebar