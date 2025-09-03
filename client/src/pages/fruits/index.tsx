// Fruit Management Page
import React, { useState, useEffect } from 'react';
import { Plus, Search, Apple, TrendingUp, Package, BarChart3 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { fruitApi } from '../../lib/services/fruitApi';
import { SummaryCard } from '../../components/premium/SummaryCard';
import FruitTable from './FruitTable';
import FruitFormModal from './FruitFormModal';
import DeleteFruitModal from './DeleteFruitModal';
import ViewFruitModal from './ViewFruitModal';
import type { Fruit, FruitFormData, FruitStats } from './types';

const FruitManagementPage: React.FC = () => {
  // State management
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [stats, setStats] = useState<FruitStats>({
    totalFruits: 0,
    deliveryCount: 0,
    extractionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Delete validation states
  const [canDelete, setCanDelete] = useState(true);
  const [deleteReason, setDeleteReason] = useState('');

  const { showSuccess, showError } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadFruits();
    loadFruitStats();
  }, []);

  // Reload fruits when search term changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadFruits();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Load fruits data
  const loadFruits = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading fruits with search:', searchTerm);
      
      const response = await fruitApi.getFruits({
        search: searchTerm
      });
      
      if (response.success) {
        setFruits(response.data);
        console.log('✅ Loaded fruits:', response.data.length);
      } else {
        throw new Error('Failed to load fruits');
      }
    } catch (error) {
      console.error('❌ Error loading fruits:', error);
      showError('Failed to load fruits');
    } finally {
      setLoading(false);
    }
  };

  // Load fruit statistics
  const loadFruitStats = async () => {
    try {
      const response = await fruitApi.getFruitStats();
      if (response.success) {
        const deliveryCount = response.data.delivery_stats.reduce((sum, fruit) => sum + fruit.delivery_count, 0);
        const extractionCount = response.data.oil_extraction_stats.reduce((sum, fruit) => sum + fruit.extraction_count, 0);
        
        setStats({
          totalFruits: response.data.overview.total_fruits,
          deliveryCount,
          extractionCount
        });
      }
    } catch (error) {
      console.error('❌ Error loading fruit stats:', error);
    }
  };

  // Handle add fruit
  const handleAddFruit = async (formData: FruitFormData) => {
    try {
      setModalLoading(true);
      console.log('➕ Adding fruit:', formData);
      
      const response = await fruitApi.createFruit(formData);
      
      if (response.success) {
        showSuccess('Fruit added successfully');
        setShowAddModal(false);
        loadFruits();
        loadFruitStats();
      } else {
        throw new Error(response.message || 'Failed to add fruit');
      }
    } catch (error: any) {
      console.error('❌ Error adding fruit:', error);
      showError(error.message || 'Failed to add fruit');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle edit fruit
  const handleEditFruit = (fruit: Fruit) => {
    setSelectedFruit(fruit);
    setShowEditModal(true);
  };

  // Handle update fruit
  const handleUpdateFruit = async (formData: FruitFormData) => {
    if (!selectedFruit) return;

    try {
      setModalLoading(true);
      console.log('✏️ Updating fruit:', selectedFruit.fruit_id, formData);
      
      const response = await fruitApi.updateFruit(selectedFruit.fruit_id, formData);
      
      if (response.success) {
        showSuccess('Fruit updated successfully');
        setShowEditModal(false);
        setSelectedFruit(null);
        loadFruits();
        loadFruitStats();
      } else {
        throw new Error(response.message || 'Failed to update fruit');
      }
    } catch (error: any) {
      console.error('❌ Error updating fruit:', error);
      showError(error.message || 'Failed to update fruit');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle view fruit
  const handleViewFruit = (fruit: Fruit) => {
    setSelectedFruit(fruit);
    setShowViewModal(true);
  };

  // Handle delete fruit
  const handleDeleteFruit = (fruit: Fruit) => {
    setSelectedFruit(fruit);
    setCanDelete(true); // TODO: Add logic to check if fruit has deliveries/extractions
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedFruit) return;

    try {
      setModalLoading(true);
      console.log('🗑️ Deleting fruit:', selectedFruit.fruit_id);
      
      const response = await fruitApi.deleteFruit(selectedFruit.fruit_id);
      
      if (response.success) {
        showSuccess('Fruit deleted successfully');
        setShowDeleteModal(false);
        setSelectedFruit(null);
        loadFruits();
        loadFruitStats();
      } else {
        throw new Error(response.message || 'Failed to delete fruit');
      }
    } catch (error: any) {
      console.error('❌ Error deleting fruit:', error);
      showError(error.message || 'Failed to delete fruit');
    } finally {
      setModalLoading(false);
    }
  };

  // Calculate filtered fruits
  const filteredFruits = fruits.filter(fruit =>
    fruit.fruit_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span>Operations</span>
                <span>→</span>
                <span className="text-gray-900 font-medium">Fruits</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800">
                Fruit Management
              </h1>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Manage fruit types available for deliveries and oil extraction.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fruit
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Fruits"
            value={stats.totalFruits.toString()}
            change="+5%"
            changeType="positive"
            icon={Apple}
            description="Available fruit types"
            className="col-span-1"
          />
          <SummaryCard
            title="Deliveries"
            value={stats.deliveryCount.toString()}
            change="+15%"
            changeType="positive"
            icon={Package}
            description="Total fruit deliveries"
            className="col-span-1"
          />
          <SummaryCard
            title="Oil Extractions"
            value={stats.extractionCount.toString()}
            change="+8%"
            changeType="positive"
            icon={BarChart3}
            description="Oil extraction logs"
            className="col-span-1"
          />
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search fruits by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fruits Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Fruit Types</h3>
          </div>
          <FruitTable
            fruits={filteredFruits}
            loading={loading}
            onEdit={handleEditFruit}
            onView={handleViewFruit}
            onDelete={handleDeleteFruit}
          />
        </div>

        {/* Modals */}
        {showAddModal && (
          <FruitFormModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddFruit}
            loading={modalLoading}
            title="Add New Fruit"
          />
        )}

        {showEditModal && selectedFruit && (
          <FruitFormModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedFruit(null);
            }}
            onSubmit={handleUpdateFruit}
            loading={modalLoading}
            title="Edit Fruit"
            initialData={{
              fruit_name: selectedFruit.fruit_name
            }}
          />
        )}

        {showViewModal && selectedFruit && (
          <ViewFruitModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedFruit(null);
            }}
            fruit={selectedFruit}
          />
        )}

        {showDeleteModal && selectedFruit && (
          <DeleteFruitModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedFruit(null);
            }}
            onConfirm={handleConfirmDelete}
            fruit={selectedFruit}
            loading={modalLoading}
            canDelete={canDelete}
            reason={deleteReason}
          />
        )}
      </div>
    </div>
  );
};

export default FruitManagementPage;
