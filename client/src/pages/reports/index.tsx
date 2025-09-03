import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  Package, 
  Factory, 
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ReportsHub = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const reportCategories = [
    {
      id: 'financial',
      title: 'Financial Reports',
      description: 'Comprehensive financial analysis, P&L statements, and expense tracking',
      icon: DollarSign,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      path: '/reports/financial',
      features: ['Expense Analysis', 'Revenue Tracking', 'Cost Breakdown', 'Budget vs Actual']
    },
    {
      id: 'labor',
      title: 'Labor & Salary Reports',
      description: 'Staff performance, salary analysis, and workforce insights',
      icon: Users,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/reports/labor',
      features: ['Salary Analysis', 'Staff Performance', 'Attendance Tracking', 'Cost per Employee']
    },
    {
      id: 'deliveries',
      title: 'Fruit Deliveries',
      description: 'Delivery performance, supplier analysis, and logistics insights',
      icon: Package,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      path: '/reports/deliveries',
      features: ['Delivery Performance', 'Supplier Analysis', 'Quality Metrics', 'Cost Efficiency']
    },
    {
      id: 'production',
      title: 'Oil Production',
      description: 'Production metrics, efficiency analysis, and output tracking',
      icon: Factory,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      path: '/reports/production',
      features: ['Production Volume', 'Efficiency Metrics', 'Quality Control', 'Equipment Usage']
    },
    {
      id: 'combined',
      title: 'Combined Analytics',
      description: 'Advanced P&L, cross-functional analysis, and executive dashboards',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      path: '/reports/combined',
      features: ['P&L Statements', 'ROI Analysis', 'Trend Forecasting', 'Executive Summary']
    }
  ];

  const quickStats = [
    {
      title: 'Total Reports Generated',
      value: '1,247',
      change: '+12%',
      changeType: 'positive' as const,
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      title: 'Data Points Analyzed',
      value: '45.2K',
      change: '+8%',
      changeType: 'positive' as const,
      icon: PieChart,
      color: 'text-blue-600'
    },
    {
      title: 'Last Updated',
      value: 'Just now',
      change: 'Real-time',
      changeType: 'neutral' as const,
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  const handleCategoryClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">
                Reports Hub
              </h1>
              <p className="text-gray-600 text-lg font-medium mt-2">
                Comprehensive analytics and insights for your operations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Categories Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Report Categories</h2>
            <p className="text-gray-600">Click any category to explore detailed analytics</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reportCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.path)}
                className="group relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                {/* Gradient Header */}
                <div className={`${category.color} p-6 text-white relative`}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{category.title}</h3>
                      <p className="text-white/90 text-sm">{category.description}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <category.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Features List */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {category.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${category.iconBg.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Click to explore</span>
                      <div className={`p-2 ${category.iconBg} rounded-lg`}>
                        <category.icon className={`h-4 w-4 ${category.iconColor}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Recent Report Activity</h3>
            <button className="text-primary hover:text-primary/80 font-medium text-sm">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { report: 'Financial Summary', time: '2 minutes ago', user: 'Admin', type: 'Generated' },
              { report: 'Staff Performance', time: '15 minutes ago', user: 'Manager', type: 'Viewed' },
              { report: 'Delivery Analytics', time: '1 hour ago', user: 'Supervisor', type: 'Exported' },
              { report: 'Production Report', time: '3 hours ago', user: 'Admin', type: 'Generated' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{activity.report}</p>
                    <p className="text-sm text-gray-600">{activity.type} by {activity.user}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsHub;
