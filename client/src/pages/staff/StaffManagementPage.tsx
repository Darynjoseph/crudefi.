// Staff Management Page
import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, UserCheck, TrendingUp } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { staffApi } from '../../lib/services/staffApi';
import { SummaryCard } from '../../components/premium/SummaryCard';
import StaffTable from './StaffTable';
import StaffFormModal from './StaffFormModal';
import DeleteStaffModal from './DeleteStaffModal';
import type { Staff, StaffFormData, StaffStats } from './types';

const StaffManagementPage: React.FC = () => {
  // State management
  const [staff, setStaff] = useState<Staff[]>([]);
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    activeShifts: 0,
    newThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Delete validation states
  const [canDelete, setCanDelete] = useState(true);
  const [deleteReason, setDeleteReason] = useState('');

  const { showSuccess, showError } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadStaff();
    loadStaffStats();
  }, []);

  // Load staff data - copied from fruit deliveries pattern
  const loadStaff = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading staff with search:', searchTerm);
      
      const response = await staffApi.getStaff({
        search: searchTerm,
        sortBy: 'full_name',
        sortOrder: 'asc'
      });
      console.log('📥 API Response:', response);
      
      if (response && response.success) {
        setStaff(response.data || []);
        console.log('✅ Staff loaded:', response.data?.length || 0);
      } else {
        const errorMessage = (response && 'error' in response && typeof response.error === 'string')
          ? response.error
          : 'Failed to load staff';
        showError('Loading Error', errorMessage);
        console.log('❌ API Error:', errorMessage);
      }
    } catch (err) {
      console.error('💥 Error loading staff:', err);
      let errorMessage = 'Failed to load staff. Please check backend connection.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        if (err.message.includes('Authentication failed')) {
          errorMessage = 'Session expired. Please log in again.';
        }
      }
      
      showError('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load staff statistics - copied from fruit deliveries pattern
  const loadStaffStats = async () => {
    try {
      console.log('🔄 Loading staff stats');
      const response = await staffApi.getStaffStats();
      console.log('📊 Stats Response:', response);
      
      if (response && response.success) {
        setStats(response.data);
        console.log('✅ Stats loaded:', response.data);
      } else {
        console.log('❌ Stats Error:', response);
      }
    } catch (error) {
      console.error('💥 Error loading staff stats:', error);
    }
  };

  // Handle add staff
  const handleAddStaff = async (formData: StaffFormData) => {
    setModalLoading(true);
    try {
      const response = await staffApi.createStaff(formData);
      
      if (response.success) {
        setStaff(prev => [...prev, response.data]);
        setShowAddModal(false);
        showSuccess('Staff Added', response.message || 'Staff member has been successfully added.');
        loadStaffStats(); // Reload stats
      } else {
        throw new Error('Failed to add staff member');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      showError('Failed to add staff member');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle edit staff
  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (formData: StaffFormData) => {
    if (!selectedStaff) return;

    setModalLoading(true);
    try {
      const response = await staffApi.updateStaff(selectedStaff.staff_id, formData);
      
      if (response.success) {
        setStaff(prev => prev.map(s => 
          s.staff_id === selectedStaff.staff_id ? response.data : s
        ));
        setShowEditModal(false);
        setSelectedStaff(null);
        showSuccess('Staff Updated', response.message || 'Staff member has been successfully updated.');
      } else {
        throw new Error('Failed to update staff member');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      showError('Failed to update staff member');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete staff
  const handleDeleteStaff = async (staff: Staff) => {
    setSelectedStaff(staff);
    
    // Check if staff can be deleted
    const checkCanDeleteStaff = async (staff: Staff) => {
      try {
        const response = await staffApi.canDeleteStaff(staff.staff_id);
        if (response.success) {
          setCanDelete(response.data.canDelete);
          setDeleteReason(response.data.reason || '');
        }
      } catch (error) {
        console.error('Error checking staff deletion:', error);
        setCanDelete(false);
        setDeleteReason('Unable to verify deletion status');
      }
    };
    checkCanDeleteStaff(staff);
    
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStaff) return;

    setModalLoading(true);
    try {
      const response = await staffApi.deleteStaff(selectedStaff.staff_id);
      
      if (response.success) {
        setStaff(prev => prev.filter(s => s.staff_id !== selectedStaff.staff_id));
        setShowDeleteModal(false);
        setSelectedStaff(null);
        showSuccess('Staff Deleted', response.message || 'Staff member has been successfully deleted.');
        loadStaffStats(); // Reload stats
      } else {
        throw new Error('Failed to delete staff member');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      showError('Failed to delete staff member');
    } finally {
      setModalLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800">
                Staff Management
              </h1>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Manage staff members and track employee information efficiently.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Staff"
            value={stats.totalStaff.toString()}
            change="+5%"
            changeType="positive"
            icon={Users}
            description="All employees"
            className="col-span-1"
          />
          <SummaryCard
            title="Active Shifts"
            value={stats.activeShifts.toString()}
            change="+2"
            changeType="positive"
            icon={UserCheck}
            description="Currently working"
            className="col-span-1"
          />
          <SummaryCard
            title="New This Month"
            value={stats.newThisMonth.toString()}
            change="+12%"
            changeType="positive"
            icon={TrendingUp}
            description="Recent hires"
            className="col-span-1"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Search Staff</h3>
          </div>
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, ID, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <StaffTable
          staff={staff}
          loading={loading}
          onEdit={handleEditStaff}
          onDelete={handleDeleteStaff}
          searchTerm={searchTerm}
        />

        {/* Add Staff Modal */}
        <StaffFormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddStaff}
          loading={modalLoading}
        />

        {/* Edit Staff Modal */}
        <StaffFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStaff(null);
          }}
          onSave={handleUpdateStaff}
          staff={selectedStaff}
          loading={modalLoading}
        />

        {/* Delete Staff Modal */}
        <DeleteStaffModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedStaff(null);
            setCanDelete(true);
            setDeleteReason('');
          }}
          onConfirm={handleConfirmDelete}
          staff={selectedStaff}
          loading={modalLoading}
          canDelete={canDelete}
          deleteReason={deleteReason}
        />
      </div>
    </div>
  );
};

export default StaffManagementPage;
