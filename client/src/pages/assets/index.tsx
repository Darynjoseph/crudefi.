import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, X, Building, Calendar, DollarSign, TrendingDown, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { SummaryCard } from '../../components/premium/SummaryCard';

// Types
interface Asset {
  asset_id: number;
  asset_name: string;
  purchase_date: string;
  cost: number;
  useful_life_years: number;
  depreciation_method: string;
  current_value: number;
  depreciation_this_year: number;
  status: 'Active' | 'Fully Depreciated';
}

interface DepreciationSchedule {
  year: number;
  opening_value: number;
  depreciation: number;
  closing_value: number;
}

// Helper function to determine asset status
const getAssetStatus = (currentValue: number): 'Active' | 'Fully Depreciated' => {
  return currentValue <= 0 ? 'Fully Depreciated' : 'Active';
};

// Mock data
const mockAssets: Asset[] = [
  {
    asset_id: 1,
    asset_name: 'Forklift',
    purchase_date: '2020-04-12',
    cost: 85000000,
    useful_life_years: 5,
    depreciation_method: 'Straight-line',
    current_value: 34000000,
    depreciation_this_year: 17000000,
    status: 'Active'
  },
  {
    asset_id: 2,
    asset_name: 'Generator',
    purchase_date: '2021-01-05',
    cost: 45000000,
    useful_life_years: 8,
    depreciation_method: 'Declining balance',
    current_value: 28125000,
    depreciation_this_year: 8200000,
    status: 'Active'
  },
  {
    asset_id: 3,
    asset_name: 'Oil Press Machine #1',
    purchase_date: '2019-08-15',
    cost: 120000000,
    useful_life_years: 10,
    depreciation_method: 'Straight-line',
    current_value: 60000000,
    depreciation_this_year: 12000000,
    status: 'Active'
  },
  {
    asset_id: 4,
    asset_name: 'Office Computer System',
    purchase_date: '2018-03-20',
    cost: 8000000,
    useful_life_years: 4,
    depreciation_method: 'Straight-line',
    current_value: 0,
    depreciation_this_year: 0,
    status: 'Fully Depreciated'
  }
].map(asset => ({ ...asset, status: getAssetStatus(asset.current_value) }));

const AssetsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  
  // Form state
  const [assetForm, setAssetForm] = useState({
    asset_name: '',
    purchase_date: '',
    cost: '',
    useful_life_years: '',
    depreciation_method: 'Straight-line',
    notes: ''
  });

  // Load data
  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setAssets(mockAssets);
    } catch (error) {
      showError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.cost, 0);
  const depreciationThisMonth = assets.reduce((sum, asset) => sum + asset.depreciation_this_year, 0) / 12; // Approximate monthly
  const fullyDepreciatedCount = assets.filter(asset => asset.status === 'Fully Depreciated').length;

  // Asset handlers
  const handleSaveAsset = async () => {
    try {
      const assetData = {
        ...assetForm,
        cost: parseFloat(assetForm.cost),
        useful_life_years: parseInt(assetForm.useful_life_years)
      };

      if (editingAsset) {
        // Update asset
        const newCurrentValue = assetData.cost; // For simplicity, reset to original cost on edit
        const updatedAssets = assets.map(asset => 
          asset.asset_id === editingAsset.asset_id 
            ? { 
                ...asset, 
                asset_name: assetData.asset_name,
                purchase_date: assetData.purchase_date,
                cost: assetData.cost,
                useful_life_years: assetData.useful_life_years,
                depreciation_method: assetData.depreciation_method,
                current_value: newCurrentValue,
                depreciation_this_year: assetData.cost / assetData.useful_life_years,
                status: getAssetStatus(newCurrentValue)
              }
            : asset
        );
        setAssets(updatedAssets);
        showSuccess('Asset updated successfully');
      } else {
        // Add new asset
        const currentValue = assetData.cost; // New assets start with full value
        const newAsset: Asset = {
          asset_id: Math.max(...assets.map(a => a.asset_id)) + 1,
          asset_name: assetData.asset_name,
          purchase_date: assetData.purchase_date,
          cost: assetData.cost,
          useful_life_years: assetData.useful_life_years,
          depreciation_method: assetData.depreciation_method,
          current_value: currentValue,
          depreciation_this_year: assetData.cost / assetData.useful_life_years,
          status: getAssetStatus(currentValue)
        };
        setAssets([...assets, newAsset]);
        showSuccess('Asset added successfully');
      }
      resetAssetModal();
    } catch (error) {
      showError('Failed to save asset');
    }
  };

  const handleDeleteAsset = async (assetId: number) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        setAssets(assets.filter(asset => asset.asset_id !== assetId));
        showSuccess('Asset deleted successfully');
      } catch (error) {
        showError('Failed to delete asset');
      }
    }
  };

  const handleExportAssets = () => {
    // TODO: Implement actual Excel export functionality
    showSuccess('Assets exported to Excel successfully');
  };

  // Modal helpers
  const resetAssetModal = () => {
    setShowAssetModal(false);
    setEditingAsset(null);
    setAssetForm({
      asset_name: '',
      purchase_date: '',
      cost: '',
      useful_life_years: '',
      depreciation_method: 'Straight-line',
      notes: ''
    });
  };

  const openEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetForm({
      asset_name: asset.asset_name,
      purchase_date: asset.purchase_date,
      cost: asset.cost.toString(),
      useful_life_years: asset.useful_life_years.toString(),
      depreciation_method: asset.depreciation_method,
      notes: ''
    });
    setShowAssetModal(true);
  };

  const openViewAsset = (asset: Asset) => {
    setViewingAsset(asset);
    setShowDetailModal(true);
  };

  // Generate depreciation schedule for viewing asset
  const generateDepreciationSchedule = (asset: Asset): DepreciationSchedule[] => {
    const schedule: DepreciationSchedule[] = [];
    const annualDepreciation = asset.cost / asset.useful_life_years;
    let currentValue = asset.cost;
    
    const purchaseYear = new Date(asset.purchase_date).getFullYear();
    
    for (let i = 0; i < asset.useful_life_years; i++) {
      const year = purchaseYear + i;
      const openingValue = currentValue;
      const depreciation = Math.min(annualDepreciation, currentValue);
      const closingValue = currentValue - depreciation;
      
      schedule.push({
        year,
        opening_value: openingValue,
        depreciation,
        closing_value: closingValue
      });
      
      currentValue = closingValue;
    }
    
    return schedule;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-primary-100 text-primary-800';
      case 'Fully Depreciated':
        return 'bg-accent-100 text-accent-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                Assets Management
              </h1>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Manage fixed assets and track depreciation for better financial control.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAssetModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </button>
              <button
                onClick={handleExportAssets}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Assets Registered"
            value={totalAssets.toString()}
            change="+2"
            changeType="positive"
            icon={Building}
            description="Total assets"
            className="col-span-1"
          />
          <SummaryCard
            title="Total Asset Value"
            value={formatCurrency(totalValue)}
            change="+5%"
            changeType="positive"
            icon={DollarSign}
            description="Current portfolio"
            className="col-span-1"
          />
          <SummaryCard
            title="Monthly Depreciation"
            value={formatCurrency(depreciationThisMonth)}
            change="-3%"
            changeType="positive"
            icon={TrendingDown}
            description="This month"
            className="col-span-1"
          />
          <SummaryCard
            title="Fully Depreciated"
            value={fullyDepreciatedCount.toString()}
            change="0"
            changeType="neutral"
            icon={Calendar}
            description="Completed assets"
            className="col-span-1"
          />
        </div>

      {/* Assets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Assets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Useful Life (yrs)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depreciation This Year
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
              {assets.map((asset) => (
                <tr key={asset.asset_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <Building className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{asset.asset_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(asset.purchase_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(asset.cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.useful_life_years}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.depreciation_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(asset.depreciation_this_year)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openViewAsset(asset)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditAsset(asset)}
                      className="text-accent-600 hover:text-accent-900 mr-3"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.asset_id)}
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
      </div>

      {/* Add/Edit Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h3>
              <button onClick={resetAssetModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={assetForm.asset_name}
                  onChange={(e) => setAssetForm({ ...assetForm, asset_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter asset name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={assetForm.purchase_date}
                  onChange={(e) => setAssetForm({ ...assetForm, purchase_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost (UGX)</label>
                <input
                  type="number"
                  value={assetForm.cost}
                  onChange={(e) => setAssetForm({ ...assetForm, cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter purchase cost"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Useful Life (Years)</label>
                <input
                  type="number"
                  value={assetForm.useful_life_years}
                  onChange={(e) => setAssetForm({ ...assetForm, useful_life_years: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter useful life in years"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Method</label>
                <select
                  value={assetForm.depreciation_method}
                  onChange={(e) => setAssetForm({ ...assetForm, depreciation_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Straight-line">Straight-line</option>
                  <option value="Declining balance">Declining balance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={assetForm.notes}
                  onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={resetAssetModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsset}
                className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
              >
                {editingAsset ? 'Update' : 'Add'} Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Detail Modal */}
      {showDetailModal && viewingAsset && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Asset Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Header Card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{viewingAsset.asset_name}</h4>
                  <p className="text-sm text-gray-600">
                    Purchased: {new Date(viewingAsset.purchase_date).toLocaleDateString()} ({formatCurrency(viewingAsset.cost)})
                  </p>
                  <p className="text-sm text-gray-600">
                    Useful Life: {viewingAsset.useful_life_years} years, Method: {viewingAsset.depreciation_method}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(viewingAsset.status)}`}>
                    {viewingAsset.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    Current Value: {formatCurrency(viewingAsset.current_value)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Depreciation Schedule */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Depreciation Schedule</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depreciation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generateDepreciationSchedule(viewingAsset).map((schedule, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {schedule.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(schedule.opening_value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(schedule.depreciation)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(schedule.closing_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AssetsPage;