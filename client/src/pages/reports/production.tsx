import React, { useState, useEffect } from 'react';
import { ArrowLeft, Factory, Zap, TrendingUp, BarChart3, Calendar, Download, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartCard } from '../../components/premium/ChartCard';
import DashboardCard from '../../components/common/DashboardCard';
import { useAuth } from '../../contexts/AuthContext';

const ProductionReports = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  // Production vs Expenses Data
  const productionVsExpensesData = [
    { month: 'Jan', production: 4200, expenses: 22000 },
    { month: 'Feb', production: 3800, expenses: 25000 },
    { month: 'Mar', production: 5100, expenses: 21000 },
    { month: 'Apr', production: 4900, expenses: 28000 },
    { month: 'May', production: 5500, expenses: 26000 }
  ];

  const equipmentUsageData = [
    { name: 'Press Machine A', value: 85 },
    { name: 'Press Machine B', value: 78 },
    { name: 'Filtration Unit', value: 92 },
    { name: 'Packaging Line', value: 88 }
  ];

  const productionTrendData = [
    { month: 'Week 1', value: 1200 },
    { month: 'Week 2', value: 1350 },
    { month: 'Week 3', value: 1180 },
    { month: 'Week 4', value: 1420 },
    { month: 'Week 5', value: 1380 }
  ];

  const efficiencyData = [
    { month: 'Jan', value: 87 },
    { month: 'Feb', value: 82 },
    { month: 'Mar', value: 91 },
    { month: 'Apr', value: 85 },
    { month: 'May', value: 89 }
  ];

  const productionKPIs = [
    {
      title: 'Total Production',
      value: '23,500 L',
      change: '+18.3%',
      changeType: 'positive' as const,
      icon: <Factory className="h-6 w-6" />,
      color: 'blue' as const
    },
    {
      title: 'Production Efficiency',
      value: '86.8%',
      change: '+4.2%',
      changeType: 'positive' as const,
      icon: <Zap className="h-6 w-6" />,
      color: 'green' as const
    },
    {
      title: 'Equipment Uptime',
      value: '94.5%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: <Gauge className="h-6 w-6" />,
      color: 'purple' as const
    },
    {
      title: 'Cost per Litre',
      value: 'KES 1.11',
      change: '-8.5%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'amber' as const
    }
  ];

  // Production vs Expenses Combo Chart Component
  const ProductionVsExpensesChart = () => {
    const maxProduction = Math.max(...productionVsExpensesData.map(d => d.production));
    const maxExpenses = Math.max(...productionVsExpensesData.map(d => d.expenses));

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            Production vs Expenses
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Production (Litres)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Expenses (KES)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {productionVsExpensesData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{item.month}</span>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-blue-600 font-medium">{item.production.toLocaleString()}L</span>
                  <span className="text-red-600 font-medium">KES {item.expenses.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Production Bar */}
                <div className="flex-1">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${(item.production / maxProduction) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Expenses Bar */}
                <div className="flex-1">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${(item.expenses / maxExpenses) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const equipmentPerformance = [
    { 
      equipment: 'Press Machine A', 
      uptime: 95, 
      efficiency: 87, 
      output: '8,500L', 
      maintenance: 'Due in 15 days',
      status: 'Excellent',
      color: 'bg-green-500' 
    },
    { 
      equipment: 'Press Machine B', 
      uptime: 89, 
      efficiency: 82, 
      output: '7,200L', 
      maintenance: 'Completed',
      status: 'Good',
      color: 'bg-blue-500' 
    },
    { 
      equipment: 'Filtration Unit', 
      uptime: 98, 
      efficiency: 94, 
      output: '23,500L', 
      maintenance: 'Due in 8 days',
      status: 'Excellent',
      color: 'bg-green-500' 
    },
    { 
      equipment: 'Packaging Line', 
      uptime: 92, 
      efficiency: 88, 
      output: '23,500L', 
      maintenance: 'Due in 22 days',
      status: 'Good',
      color: 'bg-blue-500' 
    }
  ];

  const handleExport = () => {
    console.log('Exporting production report...');
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
                Oil Production Reports
              </h1>
              <p className="text-gray-600 text-lg font-medium mt-1">
                Production metrics, efficiency analysis, and output tracking
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
          {productionKPIs.map((kpi, index) => (
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

        {/* Production vs Expenses Combo Chart */}
        <ProductionVsExpensesChart />

        {/* Production Trends and Equipment Usage */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartCard
            title="Weekly Production Volume"
            type="line"
            data={productionTrendData}
            className="w-full"
          />

          <ChartCard
            title="Equipment Usage (%)"
            type="pie"
            data={equipmentUsageData}
            className="w-full"
          />
        </div>

        {/* Efficiency Trends */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartCard
            title="Production Efficiency Trends"
            type="line"
            data={efficiencyData}
            className="w-full"
          />

          {/* Quality Metrics */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Gauge className="h-5 w-5" />
              </div>
              Quality Metrics
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Oil Purity</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-[96%] h-full bg-green-500 rounded-full"></div>
                  </div>
                  <span className="font-bold text-green-600">96%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Extraction Rate</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-[89%] h-full bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="font-bold text-blue-600">89%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Yield Efficiency</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-[92%] h-full bg-purple-500 rounded-full"></div>
                  </div>
                  <span className="font-bold text-purple-600">92%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Waste Reduction</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="w-[87%] h-full bg-yellow-500 rounded-full"></div>
                  </div>
                  <span className="font-bold text-yellow-600">87%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Performance Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Equipment Performance Analysis</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Last 30 days
            </div>
          </div>

          <div className="space-y-4">
            {equipmentPerformance.map((equipment, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${equipment.color}`} />
                  <div>
                    <p className="font-semibold text-gray-800">{equipment.equipment}</p>
                    <p className="text-sm text-gray-600">{equipment.maintenance}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-6 text-right">
                  <div>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="font-bold text-green-600">{equipment.uptime}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="font-bold text-blue-600">{equipment.efficiency}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Output</p>
                    <p className="font-bold text-gray-800">{equipment.output}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      equipment.status === 'Excellent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {equipment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Production Summary Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Monthly Production Summary</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Production (L)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Expenses</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Cost/Litre</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Efficiency</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { month: 'January', production: 4200, expenses: 22000, costPerLitre: 5.24, efficiency: 87, revenue: 63000 },
                  { month: 'February', production: 3800, expenses: 25000, costPerLitre: 6.58, efficiency: 82, revenue: 57000 },
                  { month: 'March', production: 5100, expenses: 21000, costPerLitre: 4.12, efficiency: 91, revenue: 76500 },
                  { month: 'April', production: 4900, expenses: 28000, costPerLitre: 5.71, efficiency: 85, revenue: 73500 },
                  { month: 'May', production: 5500, expenses: 26000, costPerLitre: 4.73, efficiency: 89, revenue: 82500 }
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{row.month}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      {row.production.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      KES {row.expenses.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800">
                      KES {row.costPerLitre.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-blue-600">
                      {row.efficiency}%
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      KES {row.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionReports;
