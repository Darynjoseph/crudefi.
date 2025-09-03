import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle, Calendar, Download, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartCard } from '../../components/premium/ChartCard';
import DashboardCard from '../../components/common/DashboardCard';
import { useAuth } from '../../contexts/AuthContext';

const DeliveryReports = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  // Supplier Performance Data
  const supplierData = [
    { name: 'Fresh Fruits Ltd', value: 35 },
    { name: 'Green Valley Co', value: 28 },
    { name: 'Tropical Harvest', value: 22 },
    { name: 'Farm Direct', value: 15 }
  ];

  const fruitTypeData = [
    { name: 'Mangoes', value: 45 },
    { name: 'Avocados', value: 30 },
    { name: 'Oranges', value: 15 },
    { name: 'Lemons', value: 10 }
  ];

  const deliveryTrendData = [
    { month: 'Week 1', value: 12 },
    { month: 'Week 2', value: 15 },
    { month: 'Week 3', value: 18 },
    { month: 'Week 4', value: 14 },
    { month: 'Week 5', value: 20 }
  ];

  const qualityScoreData = [
    { month: 'Jan', value: 92 },
    { month: 'Feb', value: 89 },
    { month: 'Mar', value: 94 },
    { month: 'Apr', value: 91 },
    { month: 'May', value: 96 }
  ];

  const deliveryKPIs = [
    {
      title: 'Total Deliveries',
      value: '79',
      change: '+15.2%',
      changeType: 'positive' as const,
      icon: <Package className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'On-Time Rate',
      value: '94.3%',
      change: '+3.1%',
      changeType: 'positive' as const,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Quality Score',
      value: '92.4%',
      change: '+2.8%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple' as const
    },
    {
      title: 'Cost Efficiency',
      value: '87.6%',
      change: '+5.4%',
      changeType: 'positive' as const,
      icon: <Truck className="h-6 w-6" />,
      color: 'amber' as const
    }
  ];

  const supplierPerformance = [
    { 
      supplier: 'Fresh Fruits Ltd', 
      deliveries: 35, 
      onTime: 97, 
      quality: 94, 
      cost: 'KES 45/kg',
      trend: '+8%',
      color: 'bg-green-500' 
    },
    { 
      supplier: 'Green Valley Co', 
      deliveries: 28, 
      onTime: 92, 
      quality: 91, 
      cost: 'KES 42/kg',
      trend: '+5%',
      color: 'bg-blue-500' 
    },
    { 
      supplier: 'Tropical Harvest', 
      deliveries: 22, 
      onTime: 89, 
      quality: 88, 
      cost: 'KES 48/kg',
      trend: '-2%',
      color: 'bg-yellow-500' 
    },
    { 
      supplier: 'Farm Direct', 
      deliveries: 15, 
      onTime: 95, 
      quality: 96, 
      cost: 'KES 50/kg',
      trend: '+12%',
      color: 'bg-purple-500' 
    }
  ];

  // Delivery Performance Gauge Component
  const DeliveryPerformanceGauge = ({ percentage, title }: { percentage: number; title: string }) => {
    const getColor = (value: number) => {
      if (value >= 90) return 'text-green-600';
      if (value >= 75) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getBarColor = (value: number) => {
      if (value >= 90) return 'bg-green-500';
      if (value >= 75) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={getBarColor(percentage).replace('bg-', 'text-')}
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${percentage}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getColor(percentage)}`}>
                {percentage}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Performance Score</p>
        </div>
      </div>
    );
  };

  const handleExport = () => {
    console.log('Exporting delivery report...');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/reports')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">
                Fruit Delivery Reports
              </h1>
              <p className="text-gray-600 text-lg font-medium mt-1">
                Delivery performance, supplier analysis, and logistics insights
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deliveryKPIs.map((kpi, index) => (
            <DashboardCard
              key={index}
              title={kpi.title}
              value={kpi.value}
              subtitle={`${kpi.change} from last period`}
              icon={kpi.icon}
              color={kpi.color}
            />
          ))}
        </div>

        {/* Performance Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DeliveryPerformanceGauge percentage={94} title="On-Time Delivery" />
          <DeliveryPerformanceGauge percentage={92} title="Quality Score" />
          <DeliveryPerformanceGauge percentage={88} title="Cost Efficiency" />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Supplier Distribution */}
          <ChartCard
            title="Supplier Distribution"
            type="pie"
            data={supplierData}
            className="w-full"
          />

          {/* Fruit Type Distribution */}
          <ChartCard
            title="Fruit Type Distribution"
            type="pie"
            data={fruitTypeData}
            className="w-full"
          />
        </div>

        {/* Delivery Trends and Quality */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartCard
            title="Weekly Delivery Volume"
            type="line"
            data={deliveryTrendData}
            className="w-full"
          />

          <ChartCard
            title="Quality Score Trends"
            type="line"
            data={qualityScoreData}
            className="w-full"
          />
        </div>

        {/* Supplier Performance Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Supplier Performance Analysis</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Last 30 days
            </div>
          </div>

          <div className="space-y-4">
            {supplierPerformance.map((supplier, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${supplier.color}`} />
                  <div>
                    <p className="font-semibold text-gray-800">{supplier.supplier}</p>
                    <p className="text-sm text-gray-600">{supplier.deliveries} deliveries</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-6 text-right">
                  <div>
                    <p className="text-sm text-gray-600">On-Time</p>
                    <p className="font-bold text-green-600">{supplier.onTime}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quality</p>
                    <p className="font-bold text-blue-600">{supplier.quality}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg. Cost</p>
                    <p className="font-bold text-gray-800">{supplier.cost}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trend</p>
                    <span className={`font-medium ${
                      supplier.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {supplier.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Issues and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Issues */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Delivery Issues</h3>
            
            <div className="space-y-4">
              {[
                { issue: 'Late delivery from Green Valley Co', severity: 'medium', date: '2 hours ago', status: 'Resolved' },
                { issue: 'Quality concern - Tropical Harvest', severity: 'high', date: '1 day ago', status: 'In Progress' },
                { issue: 'Partial delivery - Farm Direct', severity: 'low', date: '2 days ago', status: 'Resolved' },
                { issue: 'Transport delay - Fresh Fruits Ltd', severity: 'medium', date: '3 days ago', status: 'Resolved' }
              ].map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-5 w-5 ${
                      issue.severity === 'high' ? 'text-red-500' :
                      issue.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-800">{issue.issue}</p>
                      <p className="text-sm text-gray-600">{issue.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Performance Summary</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Delivery Time</span>
                <span className="font-bold text-gray-800">2.3 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-bold text-green-600">94.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cost per KG (Average)</span>
                <span className="font-bold text-gray-800">KES 46.25</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Volume (Month)</span>
                <span className="font-bold text-gray-800">12,450 KG</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Suppliers</span>
                <span className="font-bold text-gray-800">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Quality Rejections</span>
                <span className="font-bold text-red-600">2.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryReports;
