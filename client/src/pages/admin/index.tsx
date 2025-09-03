import { useState } from 'react';
import { 
  Users, Settings, Database, Activity, Plus, Eye, Edit, Trash2, 
  Shield, Server, AlertTriangle, BarChart3, Download, Upload,
  Key, Clock, FileText, Wifi, WifiOff, CheckCircle, XCircle,
  TrendingUp, Bell, Mail, Smartphone, HardDrive, Cpu, Monitor
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SummaryCard } from '../../components/premium/SummaryCard';

// Mock data for demonstration
const mockUsers = [
  { id: 1, name: 'John Admin', email: 'admin@crudefi.com', role: 'admin', status: 'active' },
  { id: 2, name: 'Jane Manager', email: 'manager@crudefi.com', role: 'manager', status: 'active' },
  { id: 3, name: 'Bob Staff', email: 'staff@crudefi.com', role: 'staff', status: 'active' },
  { id: 4, name: 'Alice Viewer', email: 'viewer@crudefi.com', role: 'viewer', status: 'inactive' },
];

const mockSystemStats = {
  totalUsers: 24,
  activeUsers: 18,
  totalTransactions: 1247,
  systemUptime: '99.9%'
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // User management state
  const [users, setUsers] = useState(mockUsers);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [loading, setLoading] = useState(false);

  // User management functions
  const handleAddUser = async (userData: any) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...userData,
        status: 'active'
      };
      setUsers([...users, newUser]);
      setShowAddUserModal(false);
      // showSuccess('User added successfully');
    } catch (error) {
      console.error('Error adding user:', error);
      // showError('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userToEdit: typeof mockUsers[0]) => {
    setSelectedUser(userToEdit);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (userData: any) => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? { ...u, ...userData } : u
      );
      setUsers(updatedUsers);
      setShowEditUserModal(false);
      setSelectedUser(null);
      // showSuccess('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      // showError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (userToView: typeof mockUsers[0]) => {
    setSelectedUser(userToView);
    setShowViewUserModal(true);
  };

  const handleDeleteUser = (userToDelete: typeof mockUsers[0]) => {
    setSelectedUser(userToDelete);
    setShowDeleteUserModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const updatedUsers = users.filter(u => u.id !== selectedUser.id);
      setUsers(updatedUsers);
      setShowDeleteUserModal(false);
      setSelectedUser(null);
      // showSuccess('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      // showError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800">
                Admin Control Tower
              </h1>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Complete system oversight, management, and configuration hub.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-3 rounded-xl">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* System Health Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="System Health"
            value="Operational"
            change="99.9%"
            changeType="positive"
            icon={CheckCircle}
            description="All systems running"
            className="col-span-1"
          />
          <SummaryCard
          title="Active Users" 
            value={mockSystemStats.activeUsers.toString()}
            change="+5%"
            changeType="positive"
            icon={Users}
            description={`of ${mockSystemStats.totalUsers} total`}
            className="col-span-1"
          />
          <SummaryCard
            title="Database Status"
            value="Connected"
            change="<1ms"
            changeType="positive"
            icon={Database}
            description="Response time"
            className="col-span-1"
          />
          <SummaryCard
            title="Server Load"
            value="23%"
            change="-8%"
            changeType="positive"
            icon={Server}
            description="CPU usage"
            className="col-span-1"
        />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Monitor },
                { id: 'users', label: 'User & Roles', icon: Users },
                { id: 'system', label: 'System Config', icon: Settings },
                { id: 'security', label: 'Access & Security', icon: Shield },
                { id: 'production', label: 'Production', icon: TrendingUp },
                { id: 'monitoring', label: 'Monitoring', icon: Activity },
                { id: 'tools', label: 'Advanced Tools', icon: BarChart3 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'users' && (
              <UserManagementTab 
                users={users} 
                onAddUser={() => setShowAddUserModal(true)}
                onViewUser={handleViewUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
            {activeTab === 'system' && <SystemConfigTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'production' && <ProductionTab />}
            {activeTab === 'monitoring' && <MonitoringTab />}
            {activeTab === 'tools' && <AdvancedToolsTab />}
          </div>
        </div>

        {/* User Management Modals */}
        {showAddUserModal && (
          <AddUserModal
            onClose={() => setShowAddUserModal(false)}
            onSave={handleAddUser}
            loading={loading}
          />
        )}

        {showEditUserModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowEditUserModal(false);
              setSelectedUser(null);
            }}
            onSave={handleUpdateUser}
            loading={loading}
          />
        )}

        {showViewUserModal && selectedUser && (
          <ViewUserModal
            user={selectedUser}
            onClose={() => {
              setShowViewUserModal(false);
              setSelectedUser(null);
            }}
          />
        )}

        {showDeleteUserModal && selectedUser && (
          <DeleteUserModal
            user={selectedUser}
            onClose={() => {
              setShowDeleteUserModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleConfirmDelete}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

// Stat Card Component
const StatCard = ({ title, value, icon, color }: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) => {
  const colorClasses = {
    blue: 'bg-primary',
    green: 'bg-primary',
    purple: 'bg-accent',
    indigo: 'bg-accent'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-xl text-white ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Overview Tab - Enhanced Dashboard Widgets
const OverviewTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Staff Performance Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
            Staff Performance Summary
          </h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Active Staff Today</span>
            <span className="font-semibold text-gray-900">12/15</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Avg Hours/Staff</span>
            <span className="font-semibold text-gray-900">8.2h</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Production Efficiency</span>
            <span className="font-semibold text-primary-600">94%</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Labor Cost Today</span>
            <span className="font-semibold text-gray-900">UGX 245,000</span>
          </div>
        </div>
      </div>

      {/* Quick System Health */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-primary-600" />
            System Health Check
          </h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Wifi className="h-4 w-4 mr-2 text-primary-500" />
              <span className="text-sm text-gray-600">Backend API</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-primary-600">Online</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Database className="h-4 w-4 mr-2 text-primary-500" />
              <span className="text-sm text-gray-600">Database</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-primary-600">Connected</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <HardDrive className="h-4 w-4 mr-2 text-accent-500" />
              <span className="text-sm text-gray-600">Storage</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-accent-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-accent-600">85% Used</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Cpu className="h-4 w-4 mr-2 text-primary-500" />
              <span className="text-sm text-gray-600">Server Load</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-primary-600">23%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Recent Critical Activity */}
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-primary-600" />
        Recent Critical Activity
      </h4>
      <div className="space-y-3">
        {[
          { action: 'New admin user created', user: 'system', time: '2 hours ago', type: 'security', severity: 'high' },
          { action: 'Database backup completed', user: 'auto-system', time: '6 hours ago', type: 'maintenance', severity: 'info' },
          { action: 'Failed login attempts detected', user: 'security-monitor', time: '1 day ago', type: 'security', severity: 'warning' },
          { action: 'System performance optimization', user: 'admin', time: '2 days ago', type: 'maintenance', severity: 'info' }
        ].map((log, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                log.severity === 'high' ? 'bg-accent-500' : 
                log.severity === 'warning' ? 'bg-accent-400' : 'bg-primary-500'
              }`} />
              <div>
                <span className="font-medium text-gray-900 text-sm">{log.action}</span>
                <div className="text-xs text-gray-500">{log.type} • by {log.user}</div>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              {log.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// User Management Tab
const UserManagementTab = ({ 
  users, 
  onAddUser, 
  onViewUser, 
  onEditUser, 
  onDeleteUser 
}: { 
  users: typeof mockUsers; 
  onAddUser: () => void;
  onViewUser: (user: typeof mockUsers[0]) => void;
  onEditUser: (user: typeof mockUsers[0]) => void;
  onDeleteUser: (user: typeof mockUsers[0]) => void;
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium text-gray-900">User Management</h3>
      <button 
        onClick={onAddUser}
        className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 flex items-center space-x-3 font-medium transition-colors"
      >
        <Plus size={16} />
        <span>Add User</span>
      </button>
    </div>
    
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-primary-100 text-primary-800' :
                  user.role === 'manager' ? 'bg-accent-100 text-accent-800' :
                  user.role === 'staff' ? 'bg-primary-100 text-primary-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === 'active' ? 'bg-primary-100 text-primary-800' : 'bg-accent-100 text-accent-800'
                }`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onViewUser(user)}
                    className="text-primary-600 hover:text-primary-900"
                    title="View User"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => onEditUser(user)}
                    className="text-accent-600 hover:text-accent-900"
                    title="Edit User"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => onDeleteUser(user)}
                    className="text-accent-600 hover:text-accent-900"
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// System Settings Tab
const SystemSettingsTab = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">General Settings</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">System Name</label>
            <input type="text" value="CrudeFi System" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Email</label>
            <input type="email" value="admin@crudefi.com" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Security Settings</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <input type="checkbox" checked className="mr-2" />
            <label className="text-sm text-gray-700">Enable two-factor authentication</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" checked className="mr-2" />
            <label className="text-sm text-gray-700">Require strong passwords</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <label className="text-sm text-gray-700">Enable session timeout</label>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// System Configuration Tab
const SystemConfigTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* API Keys & Integrations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Key className="h-5 w-5 mr-2 text-primary-600" />
          API Keys & Integrations
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Payment Gateway</span>
            <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded-full">Active</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">SMS Service</span>
            <span className="text-xs px-2 py-1 bg-accent-100 text-accent-800 rounded-full">Inactive</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Email Service</span>
            <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded-full">Active</span>
          </div>
        </div>
      </div>

      {/* Reporting Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary-600" />
          Reporting Periods
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Report Period</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Daily</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Generate Reports</label>
            <div className="flex items-center">
              <input type="checkbox" checked className="mr-2" />
              <span className="text-sm text-gray-600">Enable automatic report generation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Security Tab
const SecurityTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Access Permissions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary-600" />
          Role-Based Permissions
        </h4>
        <div className="space-y-3">
          {[
            { role: 'Admin', permissions: 'Full Access', users: 2 },
            { role: 'Manager', permissions: 'Limited Admin', users: 5 },
            { role: 'Staff', permissions: 'Operations Only', users: 12 },
            { role: 'Viewer', permissions: 'Read Only', users: 3 }
          ].map((role, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <span className="font-medium text-gray-900">{role.role}</span>
                <div className="text-xs text-gray-500">{role.permissions}</div>
              </div>
              <span className="text-sm text-gray-600">{role.users} users</span>
            </div>
          ))}
        </div>
      </div>

      {/* Session Monitoring */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary-600" />
          Active Sessions
        </h4>
    <div className="space-y-3">
      {[
            { user: 'admin@crudefi.com', location: 'Uganda, Kampala', device: 'Chrome/Win', time: '2h ago' },
            { user: 'manager@crudefi.com', location: 'Uganda, Entebbe', device: 'Safari/Mac', time: '30m ago' },
            { user: 'staff@crudefi.com', location: 'Uganda, Jinja', device: 'Edge/Win', time: '5m ago' }
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <span className="font-medium text-gray-900 text-sm">{session.user}</span>
                <div className="text-xs text-gray-500">{session.location} • {session.device}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">{session.time}</div>
                <button className="text-xs text-accent-600 hover:text-accent-800">Force Logout</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Production Oversight Tab
const ProductionTab = () => (
  <div className="space-y-6">
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
        Staff Efficiency vs Output
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">94%</div>
          <div className="text-sm text-gray-600">Overall Efficiency</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">2,450kg</div>
          <div className="text-sm text-gray-600">Today's Output</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">UGX 8.2k</div>
          <div className="text-sm text-gray-600">Cost per KG</div>
        </div>
      </div>
    </div>
  </div>
);

// Monitoring Tab
const MonitoringTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Error Logs */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-accent-600" />
          Recent Error Logs
        </h4>
        <div className="space-y-2">
          {[
            { level: 'ERROR', message: 'Database connection timeout', time: '2m ago' },
            { level: 'WARN', message: 'High memory usage detected', time: '15m ago' },
            { level: 'ERROR', message: 'API rate limit exceeded', time: '1h ago' }
      ].map((log, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center">
                <span className={`text-xs px-2 py-1 rounded font-medium mr-2 ${
                  log.level === 'ERROR' ? 'bg-accent-100 text-accent-800' : 'bg-accent-100 text-accent-700'
                }`}>
                  {log.level}
                </span>
                <span className="text-sm text-gray-900">{log.message}</span>
              </div>
              <span className="text-xs text-gray-500">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-primary-600" />
          Backup & Restore
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Last Backup</span>
            <span className="text-sm font-medium text-gray-900">6 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Backup Size</span>
            <span className="text-sm font-medium text-gray-900">142 MB</span>
          </div>
          <div className="flex space-x-2 pt-2">
            <button className="flex-1 bg-primary text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
              Create Backup
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200">
              Restore
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Advanced Tools Tab
const AdvancedToolsTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Data Export/Import */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Download className="h-5 w-5 mr-2 text-primary-600" />
          Data Export/Import
        </h4>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-primary text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-primary-700">
              Excel
            </button>
            <button className="bg-primary text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-primary-700">
              CSV
            </button>
            <button className="bg-primary text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-primary-700">
              PDF
            </button>
          </div>
          <div className="border-t pt-3">
            <button className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Setup */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-primary-600" />
          Alert Notifications
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600">Email Alerts</span>
            </div>
            <input type="checkbox" checked className="" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600">SMS Alerts</span>
            </div>
            <input type="checkbox" className="" />
          </div>
          <div className="pt-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Alert Threshold</label>
            <select className="w-full px-2 py-1 border border-gray-300 rounded text-sm">
              <option>Critical Only</option>
              <option>High & Critical</option>
              <option>All Levels</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// User Management Modals
const AddUserModal = ({ onClose, onSave, loading }: {
  onClose: () => void;
  onSave: (userData: any) => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditUserModal = ({ user, onClose, onSave, loading }: {
  user: typeof mockUsers[0];
  onClose: () => void;
  onSave: (userData: any) => void;
  loading: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Edit className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ViewUserModal = ({ user, onClose }: {
  user: typeof mockUsers[0];
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <Eye className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-sm text-gray-900">{user.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
              user.role === 'admin' ? 'bg-primary-100 text-primary-800' :
              user.role === 'manager' ? 'bg-accent-100 text-accent-800' :
              user.role === 'staff' ? 'bg-primary-100 text-primary-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {user.role}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
              user.status === 'active' ? 'bg-primary-100 text-primary-800' : 'bg-accent-100 text-accent-800'
            }`}>
              {user.status}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <p className="mt-1 text-sm text-gray-900">#{user.id}</p>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

const DeleteUserModal = ({ user, onClose, onConfirm, loading }: {
  user: typeof mockUsers[0];
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Delete User</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-8 w-8 text-accent-500 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
          </div>
        </div>
        
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-4">
          <p className="text-accent-800 text-sm">
            <strong>Warning:</strong> Deleting user "{user.name}" will permanently remove their account and all associated data.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <p><strong>User:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-accent-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  </div>
);