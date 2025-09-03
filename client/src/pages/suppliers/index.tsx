// Supplier Management Page
import React, { useState, useEffect } from 'react';
import { Plus, Search, Truck, TrendingUp, MapPin, Phone } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { supplierApi } from '../../lib/services/supplierApi';
import { SummaryCard } from '../../components/premium/SummaryCard';
import SupplierTable from './SupplierTable';
import SupplierFormModal from './SupplierFormModal';
import DeleteSupplierModal from './DeleteSupplierModal';
import ViewSupplierModal from './ViewSupplierModal';
import type { Supplier, SupplierFormData, SupplierStats } from './types';

const SupplierManagementPage: React.FC = () => {
  // State management
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    newThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Delete validation states
  const [canDelete, setCanDelete] = useState(true);
  const [deleteReason, setDeleteReason] = useState('');

  const { showSuccess, showError } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadSuppliers();
    loadSupplierStats();
  }, []);

  // Reload suppliers when search term changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadSuppliers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Load suppliers data
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading suppliers with search:', searchTerm);
      
      const response = await supplierApi.getSuppliers({
        search: searchTerm
      });
      
      if (response.success) {
        setSuppliers(response.data);
        console.log('✅ Loaded suppliers:', response.data.length);
      } else {
        throw new Error('Failed to load suppliers');
      }
    } catch (error) {
      console.error('❌ Error loading suppliers:', error);
      showError('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  // Load supplier statistics
  const loadSupplierStats = async () => {
    try {
      const response = await supplierApi.getSupplierStats();
      if (response.success) {
        setStats({
          totalSuppliers: response.data.overview.total_suppliers,
          activeSuppliers: response.data.overview.active_suppliers,
          newThisMonth: 0 // TODO: Add this to backend
        });
      }
    } catch (error) {
      console.error('❌ Error loading supplier stats:', error);
    }
  };

  // Handle add supplier
  const handleAddSupplier = async (formData: SupplierFormData) => {
    try {
      setModalLoading(true);
      console.log('➕ Adding supplier:', formData);
      
      const response = await supplierApi.createSupplier(formData);
      
      if (response.success) {
        showSuccess('Supplier added successfully');
        setShowAddModal(false);
        loadSuppliers();
        loadSupplierStats();
      } else {
        throw new Error(response.message || 'Failed to add supplier');
      }
    } catch (error: any) {
      console.error('❌ Error adding supplier:', error);
      showError(error.message || 'Failed to add supplier');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle edit supplier
  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowEditModal(true);
  };

  // Handle update supplier
  const handleUpdateSupplier = async (formData: SupplierFormData) => {
    if (!selectedSupplier) return;

    try {
      setModalLoading(true);
      console.log('✏️ Updating supplier:', selectedSupplier.supplier_id, formData);
      
      const response = await supplierApi.updateSupplier(selectedSupplier.supplier_id, formData);
      
      if (response.success) {
        showSuccess('Supplier updated successfully');
        setShowEditModal(false);
        setSelectedSupplier(null);
        loadSuppliers();
        loadSupplierStats();
      } else {
        throw new Error(response.message || 'Failed to update supplier');
      }
    } catch (error: any) {
      console.error('❌ Error updating supplier:', error);
      showError(error.message || 'Failed to update supplier');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle view supplier
  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };

  // Handle delete supplier
  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setCanDelete(true); // TODO: Add logic to check if supplier has deliveries
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return;

    try {
      setModalLoading(true);
      console.log('🗑️ Deleting supplier:', selectedSupplier.supplier_id);
      
      const response = await supplierApi.deleteSupplier(selectedSupplier.supplier_id);
      
      if (response.success) {
        showSuccess('Supplier deleted successfully');
        setShowDeleteModal(false);
        setSelectedSupplier(null);
        loadSuppliers();
        loadSupplierStats();
      } else {
        throw new Error(response.message || 'Failed to delete supplier');
      }
    } catch (error: any) {
      console.error('❌ Error deleting supplier:', error);
      showError(error.message || 'Failed to delete supplier');
    } finally {
      setModalLoading(false);
    }
  };

  // Calculate filtered suppliers
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact_info && supplier.contact_info.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.location && supplier.location.toLowerCase().includes(searchTerm.toLowerCase()))
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
                <span className="text-gray-900 font-medium">Suppliers</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800">
                Supplier Management
              </h1>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Manage your fruit suppliers and their contact information.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Suppliers"
            value={stats.totalSuppliers.toString()}
            change="+12%"
            changeType="positive"
            icon={Truck}
            description="All registered suppliers"
            className="col-span-1"
          />
          <SummaryCard
            title="Active Suppliers"
            value={stats.activeSuppliers.toString()}
            change="+8%"
            changeType="positive"
            icon={TrendingUp}
            description="Currently active suppliers"
            className="col-span-1"
          />
          <SummaryCard
            title="Locations"
            value={new Set(suppliers.filter(s => s.location).map(s => s.location)).size.toString()}
            change="+3%"
            changeType="positive"
            icon={MapPin}
            description="Unique supplier locations"
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
                    placeholder="Search suppliers by name, contact, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Suppliers</h3>
          </div>
          <SupplierTable
            suppliers={filteredSuppliers}
            loading={loading}
            onEdit={handleEditSupplier}
            onView={handleViewSupplier}
            onDelete={handleDeleteSupplier}
          />
        </div>

        {/* Modals */}
        {showAddModal && (
          <SupplierFormModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddSupplier}
            loading={modalLoading}
            title="Add New Supplier"
          />
        )}

        {showEditModal && selectedSupplier && (
          <SupplierFormModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedSupplier(null);
            }}
            onSubmit={handleUpdateSupplier}
            loading={modalLoading}
            title="Edit Supplier"
            initialData={{
              supplier_name: selectedSupplier.supplier_name,
              contact_info: selectedSupplier.contact_info || '',
              location: selectedSupplier.location || '',
              status: selectedSupplier.status
            }}
          />
        )}

        {showViewModal && selectedSupplier && (
          <ViewSupplierModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedSupplier(null);
            }}
            supplier={selectedSupplier}
          />
        )}

        {showDeleteModal && selectedSupplier && (
          <DeleteSupplierModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedSupplier(null);
            }}
            onConfirm={handleConfirmDelete}
            supplier={selectedSupplier}
            loading={modalLoading}
            canDelete={canDelete}
            reason={deleteReason}
          />
        )}
      </div>
    </div>
  );
};

export default SupplierManagementPage;
