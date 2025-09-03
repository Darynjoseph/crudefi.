import { Home, Package, Users, FileText, Settings, TrendingUp, DollarSign, Shield, Menu, X, Clock, Cog, Building, Truck, Apple } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, createContext, useContext } from "react";

// Sidebar context for managing sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: true,
  setIsCollapsed: () => {}
});

export const useSidebar = () => useContext(SidebarContext);

// Sidebar Provider Component
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

const Sidebar = () => {
  const { hasAnyRole } = useAuth();
  const location = useLocation();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  // Navigation items organized by groups
  const navGroups = [
            {
          title: "Operations",
          items: [
            { 
              icon: <Home size={18} />, 
              label: "Dashboard", 
              path: "/dashboard",
              roles: ["admin", "manager", "staff", "viewer"]
            },
            { 
              icon: <Package size={18} />, 
              label: "Fruit Deliveries", 
              path: "/fruit-deliveries",
              roles: ["admin", "manager", "staff"]
            },
            { 
              icon: <TrendingUp size={18} />, 
              label: "Oil Logs", 
              path: "/oil-logs",
              roles: ["admin", "manager", "staff"]
            },
            { 
              icon: <Truck size={18} />, 
              label: "Suppliers", 
              path: "/suppliers",
              roles: ["admin", "manager", "staff"]
            },
            { 
              icon: <Apple size={18} />, 
              label: "Fruits", 
              path: "/fruits",
              roles: ["admin", "manager", "staff"]
            }
          ]
        },
    {
      title: "Finance",
      items: [
        { 
          icon: <FileText size={18} />, 
          label: "Expenses", 
          path: "/expenses",
          roles: ["admin", "manager", "staff"]
        },
        { 
          icon: <Building size={18} />, 
          label: "Assets", 
          path: "/assets",
          roles: ["admin", "manager", "staff"]
        },
        { 
          icon: <Cog size={18} />, 
          label: "Expense Setup", 
          path: "/expense-setup",
          roles: ["admin", "manager"]
        }
      ]
    },
    {
      title: "HR & Shifts",
      items: [
        { 
          icon: <Users size={18} />, 
          label: "Staff Management", 
          path: "/staff",
          roles: ["admin", "manager"]
        },
        { 
          icon: <Cog size={18} />, 
          label: "Roles", 
          path: "/roles",
          roles: ["admin", "manager"]
        },
        { 
          icon: <Clock size={18} />, 
          label: "Shift Management", 
          path: "/shifts",
          roles: ["admin", "manager"]
        }
      ]
    },
    {
      title: "Analytics",
      items: [
        { 
          icon: <FileText size={18} />, 
          label: "Reports", 
          path: "/reports",
          roles: ["admin", "manager", "viewer"]
        }
      ]
    },
    {
      title: "System",
      items: [
        { 
          icon: <Shield size={18} />, 
          label: "Admin Panel", 
          path: "/admin",
          roles: ["admin"]
        }
      ]
    }
  ];

  // Filter nav groups and items based on user role
  const visibleNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasAnyRole(item.roles))
  })).filter(group => group.items.length > 0);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 p-2.5 bg-green-900 text-white rounded-xl shadow-lg hover:bg-green-800 transition-all duration-200 backdrop-blur-sm border border-green-700/20"
      >
        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      {/* Backdrop - only show on mobile/tablet when sidebar is open */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-green-900 text-white z-40 transition-transform duration-300 ease-in-out shadow-2xl border-r border-green-800/20
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="flex-shrink-0 px-6 pt-6">
            <div className="text-2xl font-bold text-white mb-6">CrudeFi</div>
          </div>
          
          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-track-green-800 scrollbar-thumb-green-600 hover:scrollbar-thumb-green-500">
            <nav className="flex flex-col space-y-6">
              {visibleNavGroups.map((group, groupIndex) => (
                <div key={group.title}>
                  {/* Group Header */}
                  <div className="px-3 mb-3">
                    <h3 className="text-xs font-semibold text-green-300 uppercase tracking-wider">
                      {group.title}
                    </h3>
                  </div>
                  
                  {/* Group Items */}
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <NavItem 
                        key={item.path}
                        icon={item.icon} 
                        label={item.label} 
                        path={item.path} 
                        isActive={location.pathname === item.path}
                        onClick={() => setIsCollapsed(true)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>

    </>
  );
};

const NavItem = ({ 
  icon, 
  label, 
  path, 
  isActive,
  onClick
}: { 
  icon: React.ReactNode; 
  label: string; 
  path: string;
  isActive: boolean;
  onClick?: () => void;
}) => (
  <Link 
    to={path}
    onClick={onClick}
    className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors ${
      isActive 
        ? 'bg-green-800 text-white font-medium shadow-sm' 
        : 'text-green-100 hover:bg-green-800/50 hover:text-white'
    }`}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </Link>
);

export default Sidebar;
