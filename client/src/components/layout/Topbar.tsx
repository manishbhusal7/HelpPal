interface TopbarProps {
  title: string;
  onMenuClick: () => void;
  user: any;
}

export default function Topbar({ title, onMenuClick, user }: TopbarProps) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button 
            id="sidebarToggle" 
            className="md:hidden text-neutral-500 hover:text-neutral-700"
            onClick={onMenuClick}
          >
            <span className="material-icons">menu</span>
          </button>
          <h1 className="ml-2 md:ml-0 text-lg font-semibold text-neutral-900">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-neutral-500 hover:text-neutral-700">
            <span className="material-icons">help_outline</span>
          </button>
          <button className="text-neutral-500 hover:text-neutral-700 relative">
            <span className="material-icons">notifications</span>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent-500"></span>
          </button>
          {user && (
            <div className="md:hidden">
              <button className="text-neutral-500 hover:text-neutral-700 flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  <span className="text-sm font-medium">{user.avatarInitials}</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
