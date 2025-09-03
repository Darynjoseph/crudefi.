import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Folder, Tag, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { SummaryCard } from '../../components/premium/SummaryCard';

// Types
interface Category {
  id: number;
  name: string;
  type_count: number;
  created_by: string;
}

interface ExpenseType {
  type_id: number;
  type_name: string;
  category_id: number;
  category_name: string;
  expense_count: number;
  status: 'Active' | 'Inactive';
}

// Mock data based on your database structure
const mockCategories: Category[] = [
  { id: 3, name: 'People', type_count: 2, created_by: 'Admin' },
  { id: 4, name: 'Operations', type_count: 9, created_by: 'Admin' },
  { id: 5, name: 'Utilities', type_count: 2, created_by: 'Finance' },
  { id: 6, name: 'Assets', type_count: 1, created_by: 'Admin' },
  { id: 7, name: 'Overheads', type_count: 3, created_by: 'Admin' }
];

const mockTypes: ExpenseType[] = [
  { type_id: 14, type_name: 'Payroll', category_id: 3, category_name: 'People', expense_count: 25, status: 'Active' },
  { type_id: 15, type_name: 'Casual Labourers', category_id: 3, category_name: 'People', expense_count: 18, status: 'Active' },
  { type_id: 16, type_name: 'Waste', category_id: 4, category_name: 'Operations', expense_count: 13, status: 'Active' },
  { type_id: 17, type_name: 'Firewood', category_id: 4, category_name: 'Operations', expense_count: 22, status: 'Active' },
  { type_id: 18, type_name: 'Fuel', category_id: 4, category_name: 'Operations', expense_count: 31, status: 'Active' },
  { type_id: 19, type_name: 'Laboratory', category_id: 4, category_name: 'Operations', expense_count: 8, status: 'Active' },
  { type_id: 20, type_name: 'Maintenance', category_id: 4, category_name: 'Operations', expense_count: 15, status: 'Active' },
  { type_id: 21, type_name: 'Forklift Expenses', category_id: 4, category_name: 'Operations', expense_count: 12, status: 'Active' },
  { type_id: 22, type_name: 'Shipment', category_id: 4, category_name: 'Operations', expense_count: 19, status: 'Active' },
  { type_id: 23, type_name: 'Material Cost', category_id: 4, category_name: 'Operations', expense_count: 27, status: 'Active' },
  { type_id: 24, type_name: 'Hired Machines', category_id: 4, category_name: 'Operations', expense_count: 6, status: 'Active' },
  { type_id: 25, type_name: 'Water', category_id: 5, category_name: 'Utilities', expense_count: 12, status: 'Active' },
  { type_id: 26, type_name: 'Electricity Bill', category_id: 5, category_name: 'Utilities', expense_count: 7, status: 'Active' },
  { type_id: 27, type_name: 'Machine Depreciation', category_id: 6, category_name: 'Assets', expense_count: 4, status: 'Active' },
  { type_id: 28, type_name: 'Insurance', category_id: 7, category_name: 'Overheads', expense_count: 11, status: 'Active' },
  { type_id: 29, type_name: 'Rent', category_id: 7, category_name: 'Overheads', expense_count: 12, status: 'Active' },
  { type_id: 30, type_name: 'Miscellaneous', category_id: 7, category_name: 'Overheads', expense_count: 23, status: 'Active' }
];

const ExpenseSetup: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingType, setEditingType] = useState<ExpenseType | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [typeForm, setTypeForm] = useState({ type_name: '', category_id: '' });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      setCategories(mockCategories);
      setTypes(mockTypes);
    } catch (error) {
      showError('Failed to load expense setup data');
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        // Update category
        const updatedCategories = categories.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: categoryForm.name }
            : cat
        );
        setCategories(updatedCategories);
        showSuccess('Category updated successfully');
      } else {
        // Add new category
        const newCategory: Category = {
          id: Math.max(...categories.map(c => c.id)) + 1,
          name: categoryForm.name,
          type_count: 0,
          created_by: 'Admin'
        };
        setCategories([...categories, newCategory]);
        showSuccess('Category added successfully');
      }
      resetCategoryModal();
    } catch (error) {
      showError('Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.type_count > 0) {
      showError('Cannot delete category with existing types');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setCategories(categories.filter(cat => cat.id !== categoryId));
        showSuccess('Category deleted successfully');
      } catch (error) {
        showError('Failed to delete category');
      }
    }
  };

  // Type handlers
  const handleSaveType = async () => {
    try {
      if (editingType) {
        // Update type
        const updatedTypes = types.map(type => 
          type.type_id === editingType.type_id 
            ? { 
                ...type, 
                type_name: typeForm.type_name, 
                category_id: parseInt(typeForm.category_id),
                category_name: categories.find(c => c.id === parseInt(typeForm.category_id))?.name || ''
              }
            : type
        );
        setTypes(updatedTypes);
        showSuccess('Expense type updated successfully');
      } else {
        // Add new type
        const newType: ExpenseType = {
          type_id: Math.max(...types.map(t => t.type_id)) + 1,
          type_name: typeForm.type_name,
          category_id: parseInt(typeForm.category_id),
          category_name: categories.find(c => c.id === parseInt(typeForm.category_id))?.name || '',
          expense_count: 0,
          status: 'Active'
        };
        setTypes([...types, newType]);
        
        // Update category type count
        setCategories(categories.map(cat => 
          cat.id === parseInt(typeForm.category_id)
            ? { ...cat, type_count: cat.type_count + 1 }
            : cat
        ));
        
        showSuccess('Expense type added successfully');
      }
      resetTypeModal();
    } catch (error) {
      showError('Failed to save expense type');
    }
  };

  const handleDeleteType = async (typeId: number) => {
    const type = types.find(t => t.type_id === typeId);
    if (type && type.expense_count > 0) {
      showError('Cannot delete type with logged expenses');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this expense type?')) {
      try {
        const typeToDelete = types.find(t => t.type_id === typeId);
        setTypes(types.filter(type => type.type_id !== typeId));
        
        // Update category type count
        if (typeToDelete) {
          setCategories(categories.map(cat => 
            cat.id === typeToDelete.category_id
              ? { ...cat, type_count: cat.type_count - 1 }
              : cat
          ));
        }
        
        showSuccess('Expense type deleted successfully');
      } catch (error) {
        showError('Failed to delete expense type');
      }
    }
  };

  const handleToggleTypeStatus = async (typeId: number) => {
    try {
      setTypes(types.map(type => 
        type.type_id === typeId 
          ? { ...type, status: type.status === 'Active' ? 'Inactive' : 'Active' }
          : type
      ));
      showSuccess('Type status updated successfully');
    } catch (error) {
      showError('Failed to update type status');
    }
  };

  // Modal helpers
  const resetCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ name: '' });
  };

  const resetTypeModal = () => {
    setShowTypeModal(false);
    setEditingType(null);
    setTypeForm({ type_name: '', category_id: '' });
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name });
    setShowCategoryModal(true);
  };

  const openEditType = (type: ExpenseType) => {
    setEditingType(type);
    setTypeForm({ 
      type_name: type.type_name, 
      category_id: type.category_id.toString() 
    });
    setShowTypeModal(true);
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
                Expense Categories & Types
              </h1>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Configure expense categories and types for organized financial tracking.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
              <button
                onClick={() => setShowTypeModal(true)}
                disabled={categories.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Tag className="h-4 w-4 mr-2" />
                Add Type
              </button>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Categories"
            value={categories.length.toString()}
            change="+1"
            changeType="positive"
            icon={Folder}
            description="Active categories"
            className="col-span-1"
          />
          <SummaryCard
            title="Total Types"
            value={types.length.toString()}
            change="+3"
            changeType="positive"
            icon={Tag}
            description="Expense types"
            className="col-span-1"
          />
          <SummaryCard
            title="Active Types"
            value={types.filter(t => t.status === 'Active').length.toString()}
            change="0"
            changeType="neutral"
            icon={TrendingUp}
            description="Currently active"
            className="col-span-1"
          />
          <SummaryCard
            title="Total Expenses"
            value={types.reduce((sum, type) => sum + type.expense_count, 0).toString()}
            change="+15"
            changeType="positive"
            icon={Users}
            description="All recorded"
            className="col-span-1"
          />
        </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Categories</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  # of Types
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <Folder className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.type_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.created_by}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditCategory(category)}
                      className="text-accent-600 hover:text-accent-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={category.type_count > 0}
                      className="text-accent-700 hover:text-accent-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Types Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Types</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  # Expenses Logged
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {types.map((type) => (
                <tr key={type.type_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-accent-100 rounded-lg flex items-center justify-center mr-3">
                        <Tag className="h-4 w-4 text-accent-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{type.type_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {type.expense_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      type.status === 'Active' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {type.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditType(type)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleTypeStatus(type.type_id)}
                      className="text-accent-600 hover:text-accent-900 mr-3"
                      title={type.status === 'Active' ? 'Deactivate' : 'Activate'}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteType(type.type_id)}
                      disabled={type.expense_count > 0}
                      className="text-accent-700 hover:text-accent-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={resetCategoryModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter category name"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={resetCategoryModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingType ? 'Edit Expense Type' : 'Add New Expense Type'}
              </h3>
              <button onClick={resetTypeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type Name
                </label>
                <input
                  type="text"
                  value={typeForm.type_name}
                  onChange={(e) => setTypeForm({ ...typeForm, type_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter expense type name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Category
                </label>
                <select
                  value={typeForm.category_id}
                  onChange={(e) => setTypeForm({ ...typeForm, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={resetTypeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveType}
                className="px-4 py-2 bg-accent border border-transparent rounded-md text-sm font-medium text-white hover:bg-accent-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ExpenseSetup;