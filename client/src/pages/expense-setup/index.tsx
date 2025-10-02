import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Folder, Tag, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { SummaryCard } from '../../components/premium/SummaryCard';
import { expenseCategoryApi } from '../../lib/services/expenseCategoryApi';
import { expenseTypeApi } from '../../lib/services/expenseTypeApi';
interface ExpenseTypeStats {
  totalTypes: number;
  categoriesUsed: number;
  totalExpensesUsingTypes: number;
}

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
  category_id: number; // Foreign key to category.id
  expense_count: number;
  status: 'Active' | 'Inactive'; // Required for API payloads and UI
}


const ExpenseSetup: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ExpenseTypeStats | null>(null);
  // Pagination state for types
  const [typePage, setTypePage] = useState(1);
  const typesPerPage = 10;
  const totalTypePages = Math.ceil(types.length / typesPerPage);
  const paginatedTypes = types.slice((typePage - 1) * typesPerPage, typePage * typesPerPage);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingType, setEditingType] = useState<ExpenseType | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [typeForm, setTypeForm] = useState({ type_name: '', category_id: '', status: 'Active' });
  // Track if user has interacted with the Save button for validation
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [typeTouched, setTypeTouched] = useState(false);
  // Validation states
  const [categoryError, setCategoryError] = useState('');
  const [typeError, setTypeError] = useState('');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch categories, types, and stats from API
      const [catRes, typeRes, statsRes] = await Promise.all([
        expenseCategoryApi.getCategories(),
        expenseTypeApi.getExpenseTypes(),
        expenseTypeApi.getExpenseTypeStats()
      ]);
      console.log('[expense-setup] API results:', { catRes, typeRes, statsRes });
      if (catRes.success) {
        setCategories(
          catRes.data.map((cat: any) => ({
            ...cat,
            type_count: 0, // Will be updated below
            created_by: cat.created_by || 'Unknown'
          }))
        );
      }
      if (typeRes.success) {
        setTypes(
          typeRes.data.map((type: any) => ({
            ...type,
            status: type.status || 'Active',
            expense_count: Number(type.expense_count) || 0,
            category_name: type.category_name || '',
          }))
        );
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
      // Update type_count for each category
      setCategories(prevCats =>
        prevCats.map(cat => ({
          ...cat,
          type_count: typeRes.data.filter((type: any) => type.category_id === cat.id).length
        }))
      );
    } catch (error) {
      console.error('[expense-setup] loadData error:', error);
      showError('Failed to load expense setup data');
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleSaveCategory = async () => {
    setCategoryError('');
    const nameTrimmed = categoryForm.name.trim();
    if (!nameTrimmed) {
      setCategoryError('Category name is required');
      return;
    }
    // Frontend duplicate check
    if (categories.some(cat => cat.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      setCategoryError('Category name already exists');
      showError('Category name already exists');
      return;
    }
    try {
      if (editingCategory) {
        await expenseCategoryApi.updateCategory(editingCategory.id, { id: editingCategory.id, name: nameTrimmed });
        showSuccess('Category updated successfully');
      } else {
        await expenseCategoryApi.createCategory({ id: 0, name: nameTrimmed });
        showSuccess('Category added successfully');
      }
      resetCategoryModal();
      await loadData();
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
        await expenseCategoryApi.deleteCategory(categoryId);
        showSuccess('Category deleted successfully');
        await loadData();
      } catch (error) {
        showError('Failed to delete category');
      }
    }
  };

  // Type handlers
  const handleSaveType = async () => {
    setTypeError('');
    if (!typeForm.type_name.trim()) {
      setTypeError('Type name is required');
      return;
    }
    if (!typeForm.category_id) {
      setTypeError('Please select a category');
      return;
    }
    // Check for duplicate type name in the same category
    const duplicate = types.find(
      t =>
        t.type_name.trim().toLowerCase() === typeForm.type_name.trim().toLowerCase() &&
        t.category_id === parseInt(typeForm.category_id) &&
        (!editingType || t.type_id !== editingType.type_id)
    );
    if (duplicate) {
      setTypeError('A type with this name already exists in the selected category');
      return;
    }
    try {
      if (editingType) {
        await expenseTypeApi.updateExpenseType(editingType.type_id, {
          type_id: editingType.type_id,
          type_name: typeForm.type_name,
          category_id: parseInt(typeForm.category_id),
          status: typeForm.status
        });
        showSuccess('Expense type updated successfully');
      } else {
        await expenseTypeApi.createExpenseType({
          type_name: typeForm.type_name,
          category_id: parseInt(typeForm.category_id),
          status: typeForm.status
        });
        showSuccess('Expense type added successfully');
      }
      resetTypeModal();
      await loadData();
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
        await expenseTypeApi.deleteExpenseType(typeId);
        showSuccess('Expense type deleted successfully');
        await loadData();
      } catch (error) {
        showError('Failed to delete expense type');
      }
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
  setTypeForm({ type_name: '', category_id: '', status: 'Active' });
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
      category_id: type.category_id.toString(),
      status: type.status || 'Active'
    });
    setTypeTouched(false); // Disable save button until user interacts
    setShowTypeModal(true);
  };

  // Toggle type status handler (correct location)
  const handleToggleTypeStatus = async (typeId: number) => {
    try {
      const type = types.find(t => t.type_id === typeId);
      if (!type) return;
      const newStatus = type.status === 'Active' ? 'Inactive' : 'Active';
      await expenseTypeApi.updateExpenseType(typeId, {
        type_name: type.type_name,
        category_id: type.category_id
        // status: newStatus, // Removed invalid property
      });
      showSuccess('Type status updated successfully');
      await loadData();
    } catch (error) {
      showError('Failed to update type status');
    }
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
              <div className="relative group">
                <button
                  onClick={() => setShowTypeModal(true)}
                  disabled={categories.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Add Type
                </button>
                {categories.length === 0 && (
                  <span className="absolute left-0 mt-1 w-40 text-xs text-red-600 bg-white border border-red-200 rounded shadow-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Add a category first
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Categories"
            value={categories.length.toString()}
            description="Number of categories"
            icon={Folder}
            className="col-span-1"
          />
          <SummaryCard
            title="Total Types"
            value={types.length.toString()}
            description="Number of types"
            icon={Tag}
            className="col-span-1"
          />
          <SummaryCard
            title="Active Types"
            value={types.filter(t => t.status === 'Active').length.toString()}
            description="Types in use"
            icon={TrendingUp}
            className="col-span-1"
          />
          <SummaryCard
            title="Total Expenses (All Types)"
            value={types.reduce((acc, t) => acc + (t.expense_count || 0), 0).toString()}
            description="Expenses linked to types"
            icon={Users}
            className="col-span-1"
          />
        </div>
        {/* Help text for new users */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-2 rounded text-blue-900 text-sm">
          <b>Tip:</b> Add categories first, then add types under each category. Types cannot be created until at least one category exists.
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

      {/* Types Table with Pagination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Types</h3>
        </div>
        <div className="overflow-x-auto">
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Expenses Logged</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTypes.map((type) => (
                  <tr key={type.type_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-accent-100 rounded-lg flex items-center justify-center mr-3">
                          <Tag className="h-4 w-4 text-accent-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{type.type_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.category_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{type.expense_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          String(type.status).toLowerCase() === 'active'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        {String(type.status).charAt(0).toUpperCase() + String(type.status).slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openEditType(type)} className="text-primary-600 hover:text-primary-900 mr-3"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleToggleTypeStatus(type.type_id)} className="text-accent-600 hover:text-accent-900 mr-3" title={type.status === 'Active' ? 'Deactivate' : 'Activate'}><TrendingUp className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteType(type.type_id)} disabled={type.expense_count > 0} className="text-accent-700 hover:text-accent-900 disabled:text-gray-400 disabled:cursor-not-allowed"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination Controls */}
        {totalTypePages > 1 && (
          <div className="flex justify-center items-center py-4 space-x-2">
            <button
              onClick={() => setTypePage(typePage - 1)}
              disabled={typePage === 1}
              className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 text-sm font-medium">Page {typePage} of {totalTypePages}</span>
            <button
              onClick={() => setTypePage(typePage + 1)}
              disabled={typePage === totalTypePages}
              className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
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
                  onChange={(e) => {
                    const value = (e.target as HTMLInputElement).value;
                    setCategoryForm({ name: value });
                    setCategoryTouched(true);
                    const trimmed = value.trim();
                    if (!trimmed) {
                      setCategoryError('Category name is required');
                    } else {
                      setCategoryError('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter category name"
                />
                {categoryError && (
                  <div className="text-red-600 text-xs mt-1">{categoryError}</div>
                )}
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
                disabled={
                  !categoryForm.name.trim() ||
                  categoryError !== '' ||
                  !categoryTouched
                }
                onFocus={() => setCategoryTouched(true)}
                className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                  onChange={(e) => {
                    const value = (e.target as HTMLInputElement).value;
                    setTypeForm({ ...typeForm, type_name: value });
                    setTypeTouched(true);
                    const trimmed = value.trim();
                    if (!trimmed) {
                      setTypeError('Type name is required');
                    } else if (trimmed.length < 2) {
                      setTypeError('Type name must be at least 2 characters');
                    } else if (trimmed.length > 100) {
                      setTypeError('Type name must be at most 100 characters');
                    } else {
                      setTypeError('');
                    }
                  }}
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
                  onChange={(e) => {
                    setTypeForm({ ...typeForm, category_id: e.target.value });
                    setTypeTouched(true);
                  }}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={typeForm.status || 'active'}
                  onChange={(e) => {
                    setTypeForm({ ...typeForm, status: e.target.value.toLowerCase() });
                    setTypeTouched(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {typeError && (
                <div className="text-red-600 text-xs mt-1">{typeError}</div>
              )}
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
                disabled={
                  !typeForm.type_name.trim() ||
                  !typeForm.category_id ||
                  typeError !== '' ||
                  !typeTouched ||
                  (
                    editingType &&
                    typeForm.type_name.trim() === editingType.type_name.trim() &&
                    typeForm.category_id === editingType.category_id.toString() &&
                    typeForm.status === (editingType.status || 'Active')
                  )
                }
                onFocus={() => setTypeTouched(true)}
                className="px-4 py-2 bg-accent border border-transparent rounded-md text-sm font-medium text-white hover:bg-accent-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    {/* Add closing tag for main container */}
    </div>
  );
};

export default ExpenseSetup;