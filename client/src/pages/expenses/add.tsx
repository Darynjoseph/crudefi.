import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Upload, Calendar, DollarSign, FileText, User, Truck, Zap, Building, Settings, Save } from 'lucide-react';
import { staffApi } from '../../lib/services/staffApi';
import { expenseApi } from '../../lib/services/expenseApi';
import { expenseTypeApi } from '../../lib/services/expenseTypeApi';
import { expenseCategoryApi } from '../../lib/services/expenseCategoryApi';
import { assetApi } from '../../lib/services/assetApi';
import type { Staff } from '../staff/types';
import type { ExpenseType } from '../../lib/services/expenseTypeApi';
import type { ExpenseCategory } from '../../lib/services/expenseCategoryApi';
import type { Asset } from '../../lib/services/assetApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

// Types
interface ExpenseBasics {
  date: string;
  category: string;
  type: string;
  notes: string;
  files: File[];
}

interface PayrollItem {
  staff_id: string;
  staff_name: string;
  days_worked: number;
  rate_per_day: number;
  gross_amount: number;
  deductions: number;
  net_amount: number;
}

interface TripItem {
  trip_date: string;
  trip_type: string;
  cost_per_trip: number;
  trips_count: number;
  total: number;
}

interface LineItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

interface FuelItem {
  item: string;
  quantity: number;
  unit_cost: number;
  total: number;
}

interface UtilityData {
  provider: string;
  period_from: string;
  period_to: string;
  amount: number;
}

interface OverheadData {
  period_from: string;
  period_to: string;
  amount: number;
  description: string;
}

interface DepreciationData {
  asset_id: string;
  depreciation_period: string;
  depreciation_amount: number;
}

const AddExpensePage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // State for dynamic data from APIs
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Staff data state
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Load categories and assets on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        setLoadingCategories(true);
        const categoryResponse = await expenseCategoryApi.getCategories();
        if (categoryResponse.success) {
          setCategories(categoryResponse.data);
        } else {
          console.error('Failed to load categories');
        }

        // Load active assets for depreciation
        setLoadingAssets(true);
        const assetResponse = await assetApi.getAssets({ status: 'active' });
        if (assetResponse.success) {
          setAssets(assetResponse.data);
        } else {
          console.error('Failed to load assets');
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoadingCategories(false);
        setLoadingAssets(false);
      }
    };

    loadData();
  }, []);

  // Load expense types when category changes
  useEffect(() => {
    const loadExpenseTypes = async () => {
      if (!expenseBasics.category) {
        setExpenseTypes([]);
        return;
      }

      try {
        setLoadingTypes(true);
        const foundCategory = categories.find(cat => cat.name === expenseBasics.category);
        if (foundCategory) {
          const typeResponse = await expenseTypeApi.getExpenseTypes({ category_id: foundCategory.id });
          if (typeResponse.success) {
            setExpenseTypes(typeResponse.data);
          }
        }
      } catch (error) {
        console.error('Error loading expense types:', error);
      } finally {
        setLoadingTypes(false);
      }
    };

    loadExpenseTypes();
  }, [expenseBasics.category, categories]);

  // Load staff data on component mount
  useEffect(() => {
    const loadStaff = async () => {
      try {
        setLoadingStaff(true);
        const response = await staffApi.getStaff();
        if (response.success) {
          setStaffList(response.data);
        } else {
          showError('Failed to load staff data');
        }
      } catch (error) {
        console.error('Error loading staff:', error);
        showError('Error loading staff data');
      } finally {
        setLoadingStaff(false);
      }
    };

    loadStaff();
  }, [showError]);
  
  // State
  // State
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
    date: new Date().toISOString().split('T')[0],
    category: '',
    type: '',
    notes: '',
    files: []
  });

  // Type-specific data
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [tripItems, setTripItems] = useState<TripItem[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [fuelItems, setFuelItems] = useState<FuelItem[]>([]);
  const [utilityData, setUtilityData] = useState<UtilityData>({
    provider: '',
    period_from: '',
    period_to: '',
    amount: 0
  });
  const [overheadData, setOverheadData] = useState<OverheadData>({
    period_from: '',
    period_to: '',
    amount: 0,
    description: ''
  });
  const [depreciationData, setDepreciationData] = useState<DepreciationData>({
    asset_id: '',
    depreciation_period: '',
    depreciation_amount: 0
  });

  // Get available types based on selected category
  const getAvailableTypes = () => {
    return expenseTypes.map(type => type.type_name);
  };

  // Helper function to get type_id for backend
  const getTypeId = (category: string, type: string): number => {
    const foundType = expenseTypes.find(t => t.type_name === type);
    return foundType?.type_id || 1;
  };

  // Calculate totals
  const calculateTotalAmount = (): number => {
    const { category, type } = expenseBasics;
    
    if (category === 'People' && (type === 'Payroll' || type === 'Casual Labourers')) {
      return payrollItems.reduce((sum, item) => sum + item.net_amount, 0);
    }
    
    if (category === 'Operations') {
      if (type === 'Waste' || type === 'Shipment' || type === 'Hired Machines') {
        return tripItems.reduce((sum, item) => sum + item.total, 0);
      }
      if (type === 'Laboratory' || type === 'Material Cost') {
        return lineItems.reduce((sum, item) => sum + item.total, 0);
      }
      if (type === 'Fuel' || type === 'Maintenance' || type === 'Firewood' || type === 'Forklift Expenses') {
        return fuelItems.reduce((sum, item) => sum + item.total, 0);
      }
    }
    
    if (category === 'Utilities') {
      return utilityData.amount;
    }
    
    if (category === 'Overheads') {
      return overheadData.amount;
    }
    
    if (category === 'Assets') {
      return depreciationData.depreciation_amount;
    }
    
    return 0;
  };

  // Handlers
  const handleBasicsChange = (field: keyof ExpenseBasics, value: any) => {
    setExpenseBasics(prev => {
      const updated = { ...prev, [field]: value };
      // Reset type when category changes
      if (field === 'category') {
        updated.type = '';
      }
      return updated;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setExpenseBasics(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index: number) => {
    setExpenseBasics(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Payroll handlers
  const addPayrollItem = () => {
    setPayrollItems([...payrollItems, {
      staff_id: '',
      staff_name: '',
      days_worked: 0,
      rate_per_day: 0,
      gross_amount: 0,
      deductions: 0,
      net_amount: 0
    }]);
  };

  const updatePayrollItem = (index: number, field: keyof PayrollItem, value: any) => {
    const updated = [...payrollItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate amounts
    if (field === 'staff_id') {
      const staff = staffList.find(s => s.staff_id.toString() === value);
      if (staff) {
        updated[index].staff_name = staff.full_name;
        // Note: Using a default rate since staff table doesn't have rate field
        // This should be configured based on role or separate rate table
        updated[index].rate_per_day = 25000; // Default daily rate
      }
    }
    
    if (field === 'days_worked' || field === 'rate_per_day') {
      updated[index].gross_amount = updated[index].days_worked * updated[index].rate_per_day;
      updated[index].net_amount = updated[index].gross_amount - updated[index].deductions;
    }
    
    if (field === 'deductions') {
      updated[index].net_amount = updated[index].gross_amount - updated[index].deductions;
    }
    
    setPayrollItems(updated);
  };

  const removePayrollItem = (index: number) => {
    setPayrollItems(payrollItems.filter((_, i) => i !== index));
  };

  // Trip handlers
  const addTripItem = () => {
    setTripItems([...tripItems, {
      trip_date: '',
      trip_type: '',
      cost_per_trip: 0,
      trips_count: 1,
      total: 0
    }]);
  };

  const updateTripItem = (index: number, field: keyof TripItem, value: any) => {
    const updated = [...tripItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'cost_per_trip' || field === 'trips_count') {
      updated[index].total = updated[index].cost_per_trip * updated[index].trips_count;
    }
    
    setTripItems(updated);
  };

  const removeTripItem = (index: number) => {
    setTripItems(tripItems.filter((_, i) => i !== index));
  };

  // Line item handlers
  const addLineItem = () => {
    setLineItems([...lineItems, {
      item_name: '',
      quantity: 0,
      unit_price: 0,
      discount: 0,
      total: 0
    }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price' || field === 'discount') {
      const subtotal = updated[index].quantity * updated[index].unit_price;
      updated[index].total = subtotal - updated[index].discount;
    }
    
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Fuel item handlers
  const addFuelItem = () => {
    setFuelItems([...fuelItems, {
      item: '',
      quantity: 0,
      unit_cost: 0,
      total: 0
    }]);
  };

  const updateFuelItem = (index: number, field: keyof FuelItem, value: any) => {
    const updated = [...fuelItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_cost') {
      updated[index].total = updated[index].quantity * updated[index].unit_cost;
    }
    
    setFuelItems(updated);
  };

  const removeFuelItem = (index: number) => {
    setFuelItems(fuelItems.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      // Map frontend data to backend format
      const expenseData = {
        expense_date: expenseBasics.date,
        type_id: getTypeId(expenseBasics.category, expenseBasics.type),
        amount: calculateTotalAmount(),
        description: `${expenseBasics.category} - ${expenseBasics.type}`,
        notes: expenseBasics.notes,
        status: 'pending' as const,
        // Map type-specific data
        payroll: payrollItems.map(item => ({
          staff_id: parseInt(item.staff_id),
          staff_name: item.staff_name,
          days_worked: item.days_worked,
          rate_per_day: item.rate_per_day,
          gross_amount: item.gross_amount,
          deductions: item.deductions,
          net_amount: item.net_amount
        })),
        trips: tripItems,
        line_items: lineItems.map(item => ({
          item_name: item.item_name,
          qty: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount,
          total: item.total
        })),
        fuel: fuelItems,
        depreciation: depreciationData.asset_id ? [{
          asset_id: parseInt(depreciationData.asset_id),
          depreciation_amount: depreciationData.depreciation_amount,
          period: depreciationData.depreciation_period
        }] : []
      };
      
      const response = await expenseApi.createExpense(expenseData);
      
      if (response.success) {
        showSuccess(response.message || 'Expense saved successfully!');
        window.location.href = '/expenses';
      } else {
        showError('Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      showError('Failed to save expense');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const canProceedToStep2 = () => {
    return expenseBasics.date && expenseBasics.category && expenseBasics.type;
  };

  const canProceedToStep3 = () => {
    const { category, type } = expenseBasics;
    
    if (category === 'People') return payrollItems.length > 0;
    if (category === 'Operations') {
      if (type === 'Waste' || type === 'Shipment' || type === 'Hired Machines') return tripItems.length > 0;
      if (type === 'Laboratory' || type === 'Material Cost') return lineItems.length > 0;
      if (type === 'Fuel' || type === 'Maintenance' || type === 'Firewood' || type === 'Forklift Expenses') return fuelItems.length > 0;
    }
    if (category === 'Utilities') return utilityData.amount > 0;
    if (category === 'Overheads') return overheadData.amount > 0;
    if (category === 'Assets') return depreciationData.depreciation_amount > 0;
    
    return false;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/expenses'}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">
                Add New Expense
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Step {currentStep} of 3 - {currentStep === 1 ? 'Basic Information' : currentStep === 2 ? 'Expense Details' : 'Review & Submit'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm font-medium">Basics</span>
          </div>
          <div className={`h-px w-16 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm font-medium">Details</span>
          </div>
          <div className={`h-px w-16 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm font-medium">Review</span>
          </div>
        </div>

        {/* Step 1: Expense Basics */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={expenseBasics.date}
                    onChange={(e) => handleBasicsChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={expenseBasics.category}
                    onChange={(e) => handleBasicsChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.category_id} value={category.category_name}>{category.category_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={expenseBasics.type}
                  onChange={(e) => handleBasicsChange('type', e.target.value)}
                  disabled={!expenseBasics.category}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                >
                  <option value="">Select Type</option>
                  {getAvailableTypes().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={expenseBasics.notes}
                  onChange={(e) => handleBasicsChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add any additional notes about this expense..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="text-primary hover:text-primary-700 font-medium">Upload files</span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-sm mt-1">
                      PDF, JPG, PNG, DOC, XLS up to 10MB each
                    </p>
                  </div>
                </div>
                
                {expenseBasics.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {expenseBasics.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToStep2()}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Type-Specific Forms */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {expenseBasics.category} - {expenseBasics.type}
              </h3>
              <p className="text-gray-600 text-sm">
                Enter the specific details for this expense type
              </p>
            </div>

            {/* Payroll Form */}
            {expenseBasics.category === 'People' && (expenseBasics.type === 'Payroll' || expenseBasics.type === 'Casual Labourers') && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900">Staff Payroll</h4>
                  <button
                    onClick={addPayrollItem}
                    className="inline-flex items-center px-3 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Worked</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate/Day</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payrollItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <select
                              value={item.staff_id}
                              onChange={(e) => updatePayrollItem(index, 'staff_id', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Select Staff</option>
                              {staffList.map((staff: Staff) => (
                                <option key={staff.staff_id} value={staff.staff_id.toString()}>{staff.full_name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.days_worked}
                              onChange={(e) => updatePayrollItem(index, 'days_worked', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.rate_per_day}
                              onChange={(e) => updatePayrollItem(index, 'rate_per_day', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatCurrency(item.gross_amount)}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.deductions}
                              onChange={(e) => updatePayrollItem(index, 'deductions', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(item.net_amount)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removePayrollItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {payrollItems.length > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      Total: {formatCurrency(payrollItems.reduce((sum, item) => sum + item.net_amount, 0))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Trip-based Form */}
            {expenseBasics.category === 'Operations' && (expenseBasics.type === 'Waste' || expenseBasics.type === 'Shipment' || expenseBasics.type === 'Hired Machines') && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900">Trip Details</h4>
                  <button
                    onClick={addTripItem}
                    className="inline-flex items-center px-3 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trip
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost per Trip</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number of Trips</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tripItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <input
                              type="date"
                              value={item.trip_date}
                              onChange={(e) => updateTripItem(index, 'trip_date', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.trip_type}
                              onChange={(e) => updateTripItem(index, 'trip_type', e.target.value)}
                              placeholder="e.g. Waste disposal, Delivery"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.cost_per_trip}
                              onChange={(e) => updateTripItem(index, 'cost_per_trip', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.trips_count}
                              onChange={(e) => updateTripItem(index, 'trips_count', parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeTripItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {tripItems.length > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      Total: {formatCurrency(tripItems.reduce((sum, item) => sum + item.total, 0))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Line Items Form */}
            {expenseBasics.category === 'Operations' && (expenseBasics.type === 'Laboratory' || expenseBasics.type === 'Material Cost') && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900">Item Details</h4>
                  <button
                    onClick={addLineItem}
                    className="inline-flex items-center px-3 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lineItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.item_name}
                              onChange={(e) => updateLineItem(index, 'item_name', e.target.value)}
                              placeholder="Item name"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateLineItem(index, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeLineItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {lineItems.length > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      Total: {formatCurrency(lineItems.reduce((sum, item) => sum + item.total, 0))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fuel/Maintenance Form */}
            {expenseBasics.category === 'Operations' && (expenseBasics.type === 'Fuel' || expenseBasics.type === 'Maintenance' || expenseBasics.type === 'Firewood' || expenseBasics.type === 'Forklift Expenses') && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900">{expenseBasics.type} Details</h4>
                  <button
                    onClick={addFuelItem}
                    className="inline-flex items-center px-3 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fuelItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.item}
                              onChange={(e) => updateFuelItem(index, 'item', e.target.value)}
                              placeholder="e.g. Diesel, Oil, Filter, Repair"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateFuelItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.unit_cost}
                              onChange={(e) => updateFuelItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeFuelItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {fuelItems.length > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      Total: {formatCurrency(fuelItems.reduce((sum, item) => sum + item.total, 0))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Utilities Form */}
            {expenseBasics.category === 'Utilities' && (
              <div className="space-y-6">
                <h4 className="text-md font-medium text-gray-900">Utility Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                    <input
                      type="text"
                      value={utilityData.provider}
                      onChange={(e) => setUtilityData({ ...utilityData, provider: e.target.value })}
                      placeholder="e.g. UMEME, NWSC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      value={utilityData.amount}
                      onChange={(e) => setUtilityData({ ...utilityData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period From</label>
                    <input
                      type="date"
                      value={utilityData.period_from}
                      onChange={(e) => setUtilityData({ ...utilityData, period_from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period To</label>
                    <input
                      type="date"
                      value={utilityData.period_to}
                      onChange={(e) => setUtilityData({ ...utilityData, period_to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    Total: {formatCurrency(utilityData.amount)}
                  </div>
                </div>
              </div>
            )}

            {/* Overheads Form */}
            {expenseBasics.category === 'Overheads' && (
              <div className="space-y-6">
                <h4 className="text-md font-medium text-gray-900">Overhead Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      value={overheadData.amount}
                      onChange={(e) => setOverheadData({ ...overheadData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={overheadData.description}
                      onChange={(e) => setOverheadData({ ...overheadData, description: e.target.value })}
                      placeholder="Brief description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period From</label>
                    <input
                      type="date"
                      value={overheadData.period_from}
                      onChange={(e) => setOverheadData({ ...overheadData, period_from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period To</label>
                    <input
                      type="date"
                      value={overheadData.period_to}
                      onChange={(e) => setOverheadData({ ...overheadData, period_to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    Total: {formatCurrency(overheadData.amount)}
                  </div>
                </div>
              </div>
            )}

            {/* Depreciation Form */}
            {expenseBasics.category === 'Assets' && (
              <div className="space-y-6">
                <h4 className="text-md font-medium text-gray-900">Asset Depreciation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Asset</label>
                    <select
                      value={depreciationData.asset_id}
                      onChange={(e) => setDepreciationData({ ...depreciationData, asset_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Asset</option>
                      {assets.map(asset => (
                        <option key={asset.asset_id} value={asset.asset_id}>
                          {asset.asset_name} (Current Value: {formatCurrency(asset.book_value || asset.cost || 0)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Depreciation Period</label>
                    <input
                      type="text"
                      value={depreciationData.depreciation_period}
                      onChange={(e) => setDepreciationData({ ...depreciationData, depreciation_period: e.target.value })}
                      placeholder="e.g. January 2025"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Depreciation Amount</label>
                    <input
                      type="number"
                      value={depreciationData.depreciation_amount}
                      onChange={(e) => setDepreciationData({ ...depreciationData, depreciation_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    Total: {formatCurrency(depreciationData.depreciation_amount)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Basics
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedToStep3()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Expense</h3>
              
              {/* Summary Card */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Expense Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Date:</span> {new Date(expenseBasics.date).toLocaleDateString()}</div>
                      <div><span className="font-medium">Category:</span> {expenseBasics.category}</div>
                      <div><span className="font-medium">Type:</span> {expenseBasics.type}</div>
                      <div><span className="font-medium">Notes:</span> {expenseBasics.notes || 'None'}</div>
                      <div><span className="font-medium">Attachments:</span> {expenseBasics.files.length} file(s)</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Amount Summary</h4>
                    <div className="text-3xl font-bold text-primary-600">
                      {formatCurrency(calculateTotalAmount())}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Entered by: {user?.name || 'Current User'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Expense Breakdown</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {/* Show relevant breakdown based on type */}
                  {expenseBasics.category === 'People' && payrollItems.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Staff Payroll ({payrollItems.length} staff members)</h5>
                      <div className="text-sm text-gray-600">
                        Total net amount: {formatCurrency(payrollItems.reduce((sum, item) => sum + item.net_amount, 0))}
                      </div>
                    </div>
                  )}
                  
                  {expenseBasics.category === 'Operations' && (expenseBasics.type === 'Waste' || expenseBasics.type === 'Shipment' || expenseBasics.type === 'Hired Machines') && tripItems.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Trip Details ({tripItems.length} trips)</h5>
                      <div className="text-sm text-gray-600">
                        Total amount: {formatCurrency(tripItems.reduce((sum, item) => sum + item.total, 0))}
                      </div>
                    </div>
                  )}
                  
                  {expenseBasics.category === 'Operations' && (expenseBasics.type === 'Laboratory' || expenseBasics.type === 'Material Cost') && lineItems.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Items ({lineItems.length} items)</h5>
                      <div className="text-sm text-gray-600">
                        Total amount: {formatCurrency(lineItems.reduce((sum, item) => sum + item.total, 0))}
                      </div>
                    </div>
                  )}
                  
                  {expenseBasics.category === 'Operations' && (expenseBasics.type === 'Fuel' || expenseBasics.type === 'Maintenance' || expenseBasics.type === 'Firewood' || expenseBasics.type === 'Forklift Expenses') && fuelItems.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">{expenseBasics.type} Items ({fuelItems.length} items)</h5>
                      <div className="text-sm text-gray-600">
                        Total amount: {formatCurrency(fuelItems.reduce((sum, item) => sum + item.total, 0))}
                      </div>
                    </div>
                  )}
                  
                  {expenseBasics.category === 'Utilities' && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Utility Bill - {utilityData.provider}</h5>
                      <div className="text-sm text-gray-600">
                        Period: {utilityData.period_from} to {utilityData.period_to}<br />
                        Amount: {formatCurrency(utilityData.amount)}
                      </div>
                    </div>
                  )}
                  
                  {expenseBasics.category === 'Overheads' && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Overhead Expense</h5>
                      <div className="text-sm text-gray-600">
                        Description: {overheadData.description}<br />
                        Amount: {formatCurrency(overheadData.amount)}
                      </div>
                    </div>
                  )}
                  
                  {expenseBasics.category === 'Assets' && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Asset Depreciation</h5>
                      <div className="text-sm text-gray-600">
                        Asset: {assets.find(a => a.asset_id.toString() === depreciationData.asset_id)?.asset_name}<br />
                        Period: {depreciationData.depreciation_period}<br />
                        Amount: {formatCurrency(depreciationData.depreciation_amount)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Details
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // TODO: Save as draft
                      showSuccess('Expense saved as draft');
                    }}
                    className="px-6 py-2 border border-accent text-accent-700 rounded-lg hover:bg-accent-50 transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Submit Expense
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpensePage;
