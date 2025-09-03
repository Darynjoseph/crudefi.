// src/pages/shifts/ShiftManagementPage.tsx

import { useState, useEffect } from 'react';
import { Plus, Users, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { SummaryCard } from '../../components/premium/SummaryCard';
import type { Shift, Staff, ShiftFilters, ShiftStats } from './types';
import ShiftTable from './ShiftTable';
import OpenShiftModal from './OpenShiftModal';
import CloseShiftModal from './CloseShiftModal';
import ViewShiftModal from './ViewShiftModal';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { shiftApi } from '../../lib/services/shiftApi';
import { rolesApi } from '../../lib/services/rolesApi';

const ShiftManagementPage = () => {
  const { hasRole, user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State management
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [closingShift, setClosingShift] = useState<Shift | null>(null);
  const [viewingShift, setViewingShift] = useState<Shift | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState<ShiftFilters>({});
  const [roleOptions, setRoleOptions] = useState<string[]>([]);

  // Statistics
  const [stats, setStats] = useState<ShiftStats>({
    totalShifts: 0,
    activeShifts: 0,
    shiftsToday: 0,
    averageHours: 0,
    totalHours: 0
  });

  // Load shifts on component mount and when filters change
  useEffect(() => {
    loadShifts();
  }, [filters]);

  // Load statistics
  useEffect(() => {
    loadStats();
  }, [shifts]);

  // Load roles once (for open shift modal dropdown)
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await rolesApi.getAllRoles();
        setRoleOptions(roles.map(r => r.role_name));
      } catch (err) {
        console.error('Error loading roles:', err);
        // Non-blocking: just show toast
        showError('Failed to load roles');
      }
    };
    loadRoles();
  }, []);

  // Load shifts from API
  const loadShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading shifts with filters:', filters);
      
      const response = await shiftApi.getShifts(filters);
      console.log('📥 API Response:', response);
      
      if (response && response.success) {
        setShifts(response.data || []);
        console.log('✅ Shifts loaded:', response.data?.length || 0);
      } else {
        const errorMessage = 'Failed to load shifts';
        setError(errorMessage);
        showError('Loading Error', errorMessage);
        console.log('❌ API Error:', errorMessage);
      }
    } catch (err) {
      console.error('💥 Error loading shifts:', err);
      let errorMessage = 'Failed to load shifts. Please check backend connection.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific error cases
        if (err.message.includes('Authentication failed')) {
          errorMessage = 'Session expired. Please log in again.';
          showError('Authentication Error', errorMessage);
          return;
        } else if (err.message.includes('permission')) {
          errorMessage = 'You don\'t have permission to view shifts.';
        } else if (err.message.includes('Network error')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        }
      }
      
      setError(errorMessage);
      showError('Loading Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await shiftApi.getShiftStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      // Don't show error for stats as it's not critical
    }
  };

  // Load staff data
  const loadStaff = async () => {
    try {
      const response = await shiftApi.getStaff();
      if (response.success) {
        setStaff(response.data);
      }
    } catch (err) {
      console.error('Error loading staff:', err);
      showError('Loading Error', 'Failed to load staff data');
    }
  };

  // Load staff when opening modal
  useEffect(() => {
    if (openModal && staff.length === 0) {
      loadStaff();
    }
  }, [openModal]);

  // Handle opening a shift
  const handleOpenShift = async (staffId: number, startTime: string, role: string) => {
    try {
      setFormLoading(true);
      const loginTime = new Date(startTime).toISOString();
      
      const response = await shiftApi.openShift({
        staff_id: staffId,
        manager_id: user?.id ?? 1, // fallback to 1 for dev mock
        login_time: loginTime,
        role: role
      });
      
      if (response.success) {
        showSuccess('Success', response.message || 'Shift opened successfully');
        await loadShifts(); // Refresh data
        await loadStats(); // Refresh statistics
        setOpenModal(false);
      } else {
        showError('Error', 'Failed to open shift');
      }
    } catch (error) {
      console.error('Error opening shift:', error);
      showError('Error', 'Failed to open shift');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle closing a shift
  const handleCloseShift = async (shift: Shift, logoutTime: string, deductionReason?: string) => {
    try {
      setFormLoading(true);
      const logoutTimeISO = new Date(logoutTime).toISOString();
      
      const response = await shiftApi.closeShift(shift.shift_id!, {
        manager_id: user?.id ?? 1, // fallback to 1 for dev mock
        logout_time: logoutTimeISO,
        deduction_reason: deductionReason
      });
      
      if (response.success) {
        showSuccess('Success', response.message || 'Shift closed successfully');
        await loadShifts(); // Refresh data
        await loadStats(); // Refresh statistics
        setClosingShift(null);
      } else {
        showError('Error', 'Failed to close shift');
      }
    } catch (error) {
      console.error('Error closing shift:', error);
      showError('Error', 'Failed to close shift');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle viewing a shift
  const handleViewShift = (shift: Shift) => {
    setViewingShift(shift);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: ShiftFilters) => {
    setFilters(newFilters);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
          {/* Header Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800">
                  Shift Management
                </h1>
                <p className="text-gray-600 text-base md:text-lg font-medium">
                  Manage staff shifts and track working hours efficiently.
                </p>
              </div>
              {hasRole(['admin', 'manager']) && (
                <button
                  onClick={() => setOpenModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Open Shift
                </button>
              )}
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              title="Total Shifts"
              value={stats.totalShifts.toString()}
              change="+8%"
              changeType="positive"
              icon={Clock}
              description="All time shifts"
              className="col-span-1"
            />
            <SummaryCard
              title="Active Now"
              value={stats.activeShifts.toString()}
              change="+3"
              changeType="positive"
              icon={Users}
              description="Currently working"
              className="col-span-1"
            />
            <SummaryCard
              title="Today's Shifts"
              value={stats.shiftsToday.toString()}
              change="+2"
              changeType="positive"
              icon={Calendar}
              description="Scheduled today"
              className="col-span-1"
            />
            <SummaryCard
              title="Hours Today"
              value={stats.totalHours > 0 ? `${stats.totalHours.toFixed(1)}h` : '0h'}
              change="+12%"
              changeType="positive"
              icon={TrendingUp}
              description="Total hours worked"
              className="col-span-1"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-accent-50 border border-accent-300 text-accent-700 px-6 py-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="bg-accent-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-accent-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-accent-800 mb-1">Unable to Load Shifts</h3>
                  <p className="font-medium mb-3">{error}</p>
                  <div className="flex space-x-3">
                    <button 
                      onClick={loadShifts}
                      disabled={loading}
                      className="bg-accent-600 text-white px-4 py-2 rounded-md hover:bg-accent-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      {loading ? 'Retrying...' : 'Retry'}
                    </button>
                    <button 
                      onClick={() => setError(null)}
                      className="text-accent-800 px-4 py-2 rounded-md hover:bg-accent-100 transition-colors font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shifts Table */}
          <ShiftTable
            shifts={shifts}
            loading={loading}
            onCloseClick={setClosingShift}
            onViewClick={handleViewShift}
            onFilterChange={handleFilterChange}
          />

          {/* Modals */}
          {openModal && (
            <OpenShiftModal
              staff={staff}
              onClose={() => setOpenModal(false)}
              onSave={handleOpenShift}
              loading={formLoading}
              roles={roleOptions}
            />
          )}

          {closingShift && (
            <CloseShiftModal
              shift={closingShift}
              onClose={() => setClosingShift(null)}
              onSave={handleCloseShift}
              loading={formLoading}
            />
          )}

          {viewingShift && (
            <ViewShiftModal
              shift={viewingShift}
              onClose={() => setViewingShift(null)}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ShiftManagementPage;
