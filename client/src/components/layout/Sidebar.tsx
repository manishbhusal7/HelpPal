import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: any;
}

export default function Sidebar({ isOpen, setIsOpen, user }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/credit-score", label: "Credit Score", icon: "credit_score" },
    { path: "/accounts", label: "Accounts", icon: "account_balance" },
    { path: "/simulator", label: "Simulator", icon: "trending_up" },
    { path: "/tools", label: "Tools", icon: "build" },
    { path: "/alerts", label: "Alerts", icon: "notifications" },
    { path: "/settings", label: "Settings", icon: "settings" }
  ];

  return (
    <div 
      id="sidebar" 
      className={`${isOpen ? 'block' : 'hidden'} md:flex md:w-64 flex-shrink-0 flex-col bg-white border-r border-gray-200 fixed md:relative inset-y-0 left-0 z-30 md:z-0 h-full transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <span className="text-xl font-semibold text-primary-500">Credit Guardian</span>
      </div>
      
      <div className="flex flex-col justify-between flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
            >
              <a 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  location === item.path
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-primary-600"
                }`}
              >
                <span className={`material-icons mr-3 ${
                  location === item.path ? "text-primary-700" : "text-neutral-400"
                }`}>
                  {item.icon}
                </span>
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
        
        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                <span className="text-sm font-medium">{user.avatarInitials}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-700">{user.name}</p>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
