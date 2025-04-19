import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Flame, 
  Atom, 
  BookOpen, 
  MessagesSquare, 
  LucideIcon, 
  LayoutDashboard,
  Beaker,
  Settings
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

type LogoDisplayType = "logo-only" | "logo-text";

const Navbar = () => {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  
  interface Settings {
    navbarSettings?: {
      logo: string;
      logoText: string;
      primaryColor: string;
      displayMode: LogoDisplayType;
    };
  }
  
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });
  
  const [logoDisplay, setLogoDisplay] = useState<LogoDisplayType>("logo-text");
  const navbarSettings = settings?.navbarSettings || {
    logo: "",
    logoText: "SC",
    primaryColor: "#3b82f6",
    displayMode: "logo-text"
  };

  const navItems: NavItem[] = [
    { path: "/", label: "Home", icon: Atom },
    { path: "/events", label: "Events", icon: Beaker },
    { path: "/wiki", label: "Wiki", icon: BookOpen },
    { path: "/contact", label: "Contact", icon: MessagesSquare }
  ];

  const toggleLogoDisplay = () => {
    setLogoDisplay(logoDisplay === "logo-only" ? "logo-text" : "logo-only");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  useEffect(() => {
    if (settings?.navbarSettings?.displayMode) {
      setLogoDisplay(settings.navbarSettings.displayMode);
    }
  }, [settings]);
  const renderLogo = () => {
    const primaryColor = navbarSettings.primaryColor;
    const logoText = navbarSettings.logoText || "SC";
    const logoImage = navbarSettings.logo;
    
    switch (logoDisplay) {
      case "logo-only":
        return logoImage ? (
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <img 
              src={logoImage} 
              alt="Logo" 
              className="h-full w-full object-cover" 
            />
          </div>
        ) : (
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer" 
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-white font-bold font-mono">{logoText}</span>
          </div>
        );

      case "logo-text":
        return (
          <div className="flex items-center space-x-3">
            {logoImage ? (
              <div className="h-10 w-10 overflow-hidden rounded-full">
                <img 
                  src={logoImage} 
                  alt="Logo" 
                  className="h-full w-full object-cover" 
                />
              </div>
            ) : (
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer" 
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white font-bold font-mono">{logoText}</span>
              </div>
            )}
            <span 
              className="font-bold text-lg" 
              style={{ color: primaryColor }}
            >
              Science Carnival
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-950 shadow-md dark:shadow-gray-800 z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="hover:opacity-80 transition-opacity">
                  {renderLogo()}
                </div>
                <Link href="/" className="ml-2">
                  <div className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-1 hidden sm:flex items-center justify-center">
                    <Atom className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.path} className="relative">
                      <Link href={item.path}>
                        <span className={`${isActive(item.path) ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'} cursor-pointer font-medium px-3 py-2 rounded-md text-sm flex items-center`}>
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </span>
                      </Link>
                    </div>
                  );
                })}
                {user?.isAdmin && (
                  <div className="relative">
                    <Link href="/dashboard">
                      <span className={`${location.startsWith('/dashboard') ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'} cursor-pointer font-medium px-3 py-2 rounded-md text-sm flex items-center`}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
            <div className="mx-2">
              {user ? (
                <Button onClick={handleLogout} variant="outline" className="hidden sm:inline-flex mr-2 text-xs sm:text-sm">
                  Logout
                </Button>
              ) : (
                <Link href="/auth">
                  <Button className="bg-primary hover:bg-blue-600 text-white hidden sm:inline-flex text-xs sm:text-sm">
                    Login
                  </Button>
                </Link>
              )}
            </div>
            <div className="md:hidden ml-2">
              <button
                type="button"
                onClick={toggleMenu}
                className="bg-white dark:bg-gray-800 p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">Open main menu</span>
                {menuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 shadow-lg dark:shadow-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Theme Toggle in mobile menu */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-300">Theme</span>
              <ThemeToggle />
            </div>
            
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <div 
                    className={`${isActive(item.path) ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800'} cursor-pointer flex items-center px-3 py-2 rounded-md text-base font-medium`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
            {user?.isAdmin && (
              <Link href="/dashboard">
                <div 
                  className={`${location.startsWith('/dashboard') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-primary'} cursor-pointer flex items-center px-3 py-2 rounded-md text-base font-medium`}
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  Dashboard
                </div>
              </Link>
            )}
            {user && (
              <div 
                className="text-gray-600 hover:bg-gray-100 hover:text-primary cursor-pointer flex items-center px-3 py-2 rounded-md text-base font-medium"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                <Settings className="mr-3 h-5 w-5" />
                Logout
              </div>
            )}
            {!user && (
              <Link href="/auth">
                <div 
                  className="text-gray-600 hover:bg-gray-100 hover:text-primary cursor-pointer flex items-center px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Login
                </div>
              </Link>
            )}

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
