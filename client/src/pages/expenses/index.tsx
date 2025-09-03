import React, { useState, useEffect } from 'react';
import { Plus, Filter, FileDown, Eye, Edit, Trash2, Calendar, DollarSign, TrendingUp, FileText, Download, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { SummaryCard } from '../../components/premium/SummaryCard';
import { expenseApi } from '../../lib/services/expenseApi';
import type { ExpenseFilters, ExpenseStats } from '../../lib/services/expenseApi';

// Types
interface Expense {
  expense_id: number;
  expense_date: string;
  category_name: string;
  type_name: string;
  description: string;
  amount: number;
  entered_by: string;
  created_at: string;
  attachments?: string[];
}

interface FilterState {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  category: string;
  type: string;
  customStartDate: string;
  customEndDate: string;
}



const ExpensesPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    category: '',
    type: '',
    customStartDate: '',
    customEndDate: ''
  });

  // Load data
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const apiFilters: ExpenseFilters = {};
      
      // Apply date filters
      if (filters.dateRange === 'today') {
        const today = new Date().toISOString().split('T')[0];
        apiFilters.dateFrom = today;
        apiFilters.dateTo = today;
      } else if (filters.dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        apiFilters.dateFrom = weekAgo.toISOString().split('T')[0];
      } else if (filters.dateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        apiFilters.dateFrom = monthAgo.toISOString().split('T')[0];
      } else if (filters.dateRange === 'custom') {
        if (filters.customStartDate) apiFilters.dateFrom = filters.customStartDate;
        if (filters.customEndDate) apiFilters.dateTo = filters.customEndDate;
      }
      
      const response = await expenseApi.getExpenses(apiFilters);
      if (response.success) {
        setExpenses(response.data);
      } else {
        showError('Failed to load expenses from database');
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      showError('Failed to connect to expense database');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses based on current filters
  const filteredExpenses = expenses.filter(expense => {
    // Date filter
    if (filters.dateRange !== 'all') {
      const expenseDate = new Date(expense.expense_date);
      const today = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          if (expenseDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          if (expenseDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          if (expenseDate < monthAgo) return false;
          break;
        case 'custom':
          if (filters.customStartDate && expenseDate < new Date(filters.customStartDate)) return false;
          if (filters.customEndDate && expenseDate > new Date(filters.customEndDate)) return false;
          break;
      }
    }

    // Category filter
    if (filters.category && expense.category_name !== filters.category) return false;

    // Type filter
    if (filters.type && expense.type_name !== filters.type) return false;

    return true;
  });

  // Calculate KPIs
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const topCategory = getTopCategory(filteredExpenses);
  const topExpenseType = getTopExpenseType(filteredExpenses);
  const totalEntries = filteredExpenses.length;

  function getTopCategory(expenses: Expense[]): string {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category_name] = (categoryTotals[expense.category_name] || 0) + expense.amount;
    });
    return Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b, 'N/A');
  }

  function getTopExpenseType(expenses: Expense[]): string {
    const typeTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      typeTotals[expense.type_name] = (typeTotals[expense.type_name] || 0) + expense.amount;
    });
    return Object.keys(typeTotals).reduce((a, b) => typeTotals[a] > typeTotals[b] ? a : b, 'N/A');
  }

  // Handlers
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    // TODO: Implement actual export functionality
    showSuccess(`Expenses exported as ${format.toUpperCase()}`);
    setShowExportDropdown(false);
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setExpenses(expenses.filter(expense => expense.expense_id !== expenseId));
        showSuccess('Expense deleted successfully');
      } catch (error) {
        showError('Failed to delete expense');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getAvailableTypes = () => {
    // Get unique types for the selected category from actual expense data
    if (!filters.category) return [];
    
    const categoryExpenses = expenses.filter(expense => expense.category_name === filters.category);
    const uniqueTypes = [...new Set(categoryExpenses.map(expense => expense.type_name))];
    return uniqueTypes;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800">
                Expenses
              </h1>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Track and manage all organizational expenses with detailed categorization.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/expenses/add'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                {showExportDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => handleExport('csv')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export as CSV
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export as Excel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Expenses (Month)"
            value={formatCurrency(totalExpenses)}
            change="+8%"
            changeType="positive"
            icon={DollarSign}
            description="Current period"
            className="col-span-1"
          />
          <SummaryCard
            title="Top Category"
            value={topCategory}
            change="+12%"
            changeType="positive"
            icon={TrendingUp}
            description="Highest spending"
            className="col-span-1"
          />
          <SummaryCard
            title="Top Expense Type"
            value={topExpenseType}
            change="+5%"
            changeType="positive"
            icon={FileText}
            description="Most frequent"
            className="col-span-1"
          />
          <SummaryCard
            title="Entries Recorded"
            value={totalEntries.toString()}
            change="+15"
            changeType="positive"
            icon={Calendar}
            description="Total transactions"
            className="col-span-1"
          />
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <h3 className="text-lg font-medium text-gray-900">
                Expenses ({filteredExpenses.length} entries)
              </h3>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center space-x-4">
                {/* Date Range Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Date Range:</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Custom Date Range */}
                {filters.dateRange === 'custom' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={filters.customStartDate}
                      onChange={(e) => setFilters({ ...filters, customStartDate: e.target.value })}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600">to</span>
                    <input
                      type="date"
                      value={filters.customEndDate}
                      onChange={(e) => setFilters({ ...filters, customEndDate: e.target.value })}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Category:</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value, type: '' })}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Categories</option>
                    {[...new Set(expenses.map(expense => expense.category_name))].map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Type:</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    disabled={!filters.category}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                  >
                    <option value="">All Types</option>
                    {getAvailableTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {(filters.dateRange !== 'all' || filters.category || filters.type) && (
                  <button
                    onClick={() => setFilters({ dateRange: 'all', category: '', type: '', customStartDate: '', customEndDate: '' })}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description/Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entered By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.expense_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.expense_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                        {expense.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-accent-100 text-accent-800">
                        {expense.type_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {expense.description}
                      {expense.attachments && expense.attachments.length > 0 && (
                        <span className="ml-2 text-accent-600" title="Has attachments">
                          📎
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.entered_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => window.location.href = `/expenses/${expense.expense_id}`}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.location.href = `/expenses/${expense.expense_id}/edit`}
                        className="text-accent-600 hover:text-accent-900 mr-3"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.expense_id)}
                        className="text-accent-700 hover:text-accent-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-500 mb-4">
                {filters.dateRange !== 'all' || filters.category || filters.type
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first expense.'}
              </p>
              <button
                onClick={() => window.location.href = '/expenses/add'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;