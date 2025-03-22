interface TopbarProps {
  title: string;
  onMenuClick: () => void;
  user: any;
}

export default function Topbar({ title, onMenuClick, user }: TopbarProps) {
  return (
    <header className="bg-white shadow-md z-10">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button 
            id="sidebarToggle" 
            className="md:hidden text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 p-2 rounded-lg transition-colors"
            onClick={onMenuClick}
            aria-label="Toggle navigation menu"
          >
            <span className="material-icons">menu</span>
          </button>
          <div className="ml-4 md:ml-0">
            <h1 className="text-xl font-bold text-gradient">{title}</h1>
            <div className="hidden sm:block h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full mt-1"></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="mr-2 hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-40 md:w-64 transition-all"
              />
              <span className="material-icons absolute left-3 top-2 text-neutral-400 text-sm">search</span>
            </div>
          </div>
          
          <button className="text-neutral-600 hover:text-primary bg-neutral-100 hover:bg-neutral-200 p-2 rounded-lg transition-colors">
            <span className="material-icons">help_outline</span>
          </button>
          
          <div className="relative">
            <button className="text-neutral-600 hover:text-primary bg-neutral-100 hover:bg-neutral-200 p-2 rounded-lg transition-colors">
              <span className="material-icons">notifications</span>
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">3</span>
            </button>
          </div>
          
          <div className="relative">
            <button className="ml-2 flex items-center space-x-2 bg-neutral-100 hover:bg-neutral-200 px-3 py-2 rounded-lg transition-colors">
              {user && (
                <>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white">
                    <span className="text-sm font-medium">{user.avatarInitials}</span>
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-neutral-700">
                    {user.name}
                  </span>
                  <span className="hidden md:inline material-icons text-neutral-400 text-base">
                    expand_more
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Status bar - Shows current version and last update */}
      <div className="flex justify-between items-center py-1 px-4 sm:px-6 lg:px-8 bg-neutral-50 border-t border-neutral-200 text-[10px] text-neutral-500">
        <div>
          <span>Version 1.2.0</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          <span>Last updated: March 22, 2025</span>
        </div>
      </div>
    </header>
  );
}
