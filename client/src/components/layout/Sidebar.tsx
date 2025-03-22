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
      className={`${isOpen ? 'block' : 'hidden'} md:flex md:w-72 flex-shrink-0 flex-col bg-gradient-to-b from-[hsl(224,71%,4%)] to-[hsl(224,71%,10%)] shadow-xl fixed md:relative inset-y-0 left-0 z-30 md:z-0 h-full transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-center h-20 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-1.5">
            <span className="material-icons text-white">shield</span>
          </div>
          <span className="text-xl font-bold text-white">
            Credit<span className="text-primary">Guardian</span>
          </span>
        </div>
      </div>
      
      <div className="flex flex-col justify-between flex-1 overflow-y-auto">
        <div className="px-3 py-6">
          <div className="mb-6">
            <h3 className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Main Menu
            </h3>
            <nav className="space-y-1">
              {navItems.slice(0, 4).map((item) => (
                <Link 
                  key={item.path}
                  href={item.path}
                  onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
                >
                  <div 
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      location === item.path
                        ? "bg-primary/20 text-white"
                        : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className={`material-icons mr-3 ${
                      location === item.path ? "text-primary" : "text-neutral-400"
                    }`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          
          <div>
            <h3 className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Features
            </h3>
            <nav className="space-y-1">
              {navItems.slice(4).map((item) => (
                <Link 
                  key={item.path}
                  href={item.path}
                  onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
                >
                  <div 
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      location === item.path
                        ? "bg-primary/20 text-white"
                        : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className={`material-icons mr-3 ${
                      location === item.path ? "text-primary" : "text-neutral-400"
                    }`}>
                      {item.icon}
                    </span>
                    {item.label}
                    
                    {/* Badge for Tools to highlight it as new */}
                    {item.path === "/tools" && (
                      <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </div>
        
        {user && (
          <div className="p-4 mx-3 mb-4 rounded-lg bg-neutral-800">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white">
                <span className="text-sm font-medium">{user.avatarInitials}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-neutral-400">{user.email}</p>
              </div>
              <button className="ml-auto text-neutral-400 hover:text-white">
                <span className="material-icons text-sm">more_vert</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
