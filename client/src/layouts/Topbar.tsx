import { User, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Topbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    const userRole = user?.role || 'user';
    
    if (path === '/' || path === '/dashboard') {
      switch (userRole.toLowerCase()) {
        case 'admin':
          return 'Admin Dashboard';
        case 'manager':
          return 'Manager Dashboard';
        case 'staff':
          return 'Staff Dashboard';
        case 'viewer':
          return 'Viewer Dashboard';
        default:
          return 'Dashboard';
      }
    }
    if (path === '/fruit-deliveries') return 'Fruit Deliveries';
    if (path === '/staff-salaries') return 'Staff Salaries';
    if (path === '/expenses/petty-cash') return 'Petty Cash';
    if (path === '/expenses/misc') return 'Misc Expenses';
    if (path === '/oil-logs') return 'Oil Extraction Logs';
    if (path === '/reports') return 'Reports';
    if (path === '/admin') return 'Admin Panel';
    if (path === '/settings') return 'Settings';
    return 'CrudeFi';
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-4 md:px-8 lg:px-12 flex justify-between items-center sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <User className="text-amber-700" size={16} />
            </div>
            <ChevronDown className="text-gray-500" size={16} />
          </button>
          
          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.email || 'user@example.com'}</div>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {user?.role?.toUpperCase() || 'USER'}
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
