// src/pages/shifts/ShiftTable.tsx

import { useMemo, useState } from 'react';
import { Search, Filter, Users, Clock, Edit, Eye, UserCheck } from 'lucide-react';
import type { Shift, ShiftFilters } from './types';
import { useAuth } from '../../contexts/AuthContext';

// Available roles for shift assignment (must match OpenShiftModal)
const AVAILABLE_SHIFT_ROLES = [
  'Sorting',
  'Offloading', 
  'Boiler',
  'Machine Loader',
  'Forklift Driver',
  'Lab',
  'Kitchen',
  'Laundry'
];

interface ShiftTableProps {
  shifts: Shift[];
  loading?: boolean;
  onCloseClick?: (shift: Shift) => void;
  onViewClick?: (shift: Shift) => void;
  onFilterChange?: (filters: ShiftFilters) => void;
}

const ShiftTable = ({ 
  shifts, 
  loading = false, 
  onCloseClick, 
  onViewClick,
  onFilterChange 
}: ShiftTableProps) => {
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<ShiftFilters>({});
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(shifts.length / PAGE_SIZE));
  const paginatedShifts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return shifts.slice(start, start + PAGE_SIZE);
  }, [shifts, page]);
  
  // Handle filter changes
  const handleFilterChange = (field: keyof ShiftFilters, value: string) => {
    const newFilters = { ...filters, [field]: value || undefined };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    onFilterChange?.({});
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value && value.length > 0);

  // Format time for display
  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  // Calculate hours worked
  const calculateHours = (loginTime: string, logoutTime?: string) => {
    if (!loginTime) return 'N/A';
    
    const start = new Date(loginTime);
    const end = logoutTime ? new Date(logoutTime) : new Date();
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return hours > 0 ? `${hours.toFixed(1)}h` : '0h';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-t-xl"></div>
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search shifts..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-4">
            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-gray-500" />
              <select
                value={filters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
              >
                <option value="">All Roles</option>
                {AVAILABLE_SHIFT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value as 'Open' | 'Closed')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {hasRole(['admin', 'manager']) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 max-h-[560px] overflow-y-auto block">
            {shifts.length === 0 ? (
              <tr>
                <td colSpan={hasRole(['admin', 'manager']) ? 7 : 6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <Users className="h-12 w-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No shifts found</h3>
                      <p className="text-gray-500">
                        {hasActiveFilters ? 'Try adjusting your filters' : 'No shifts available for the selected period'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedShifts.map((shift) => (
                <tr key={shift.shift_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {shift.staff_name || 'Unknown Staff'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {shift.staff_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {shift.role || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(shift.date || shift.login_time || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(shift.login_time || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shift.actual_hours ? `${shift.actual_hours}h` : calculateHours(shift.login_time || '', shift.logout_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      shift.shift_status === 'Open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {shift.shift_status}
                    </span>
                  </td>
                  {hasRole(['admin', 'manager']) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-3">
                        {onViewClick && (
                          <button
                            onClick={() => onViewClick(shift)}
                            className="text-primary hover:text-primary/80 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        
                        {onCloseClick && shift.shift_status === 'Open' && (
                          <button
                            onClick={() => onCloseClick(shift)}
                            className="text-accent hover:text-accent/80 transition-colors"
                            title="Close Shift"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary + Pagination Footer */}
      {shifts.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div>
              Showing {paginatedShifts.length} of {shifts.length} shifts
            </div>
            <div className="flex items-center space-x-6">
              <span>
                Active Shifts: <span className="font-semibold text-green-600">
                  {shifts.filter(s => s.shift_status === 'Open').length}
                </span>
              </span>
              <span>
                Total Hours: <span className="font-semibold text-primary">
                  {shifts.reduce((sum, s) => {
                    const hours = Number(s.actual_hours) || 0;
                    return sum + hours;
                  }, 0).toFixed(1)}h
                </span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftTable;
