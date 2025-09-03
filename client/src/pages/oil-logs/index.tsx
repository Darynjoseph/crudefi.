// Oil Extraction Logs Management Page
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Droplets, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { SummaryCard } from '../../components/premium/SummaryCard';
import FruitSelect from '../../components/form/FruitSelect_normalized';
import { oilLogsApi } from '../../lib/services/oilLogsApi';

// Simple types for now - copying staff pattern
interface OilLog {
  id: number;
  date: string;
  fruit_id: number;
  fruit_name: string;
  input_quantity_kg: number;
  oil_extracted_l: number;
  supplied_oil_l: number;
  waste_kg: number;
  efficiency_percent: number;
  yield_percent: number;
  notes?: string;
  created_by: string;
  created_at: string;
  is_locked: boolean;
}

interface OilLogFormData {
  date: string;
  fruit_id: number;
  input_quantity_kg: string;
  oil_extracted_l: string;
  supplied_oil_l: string;
  waste_kg: string;
  notes: string;
}

interface OilLogStats {
  totalLogs: number;
  totalInput: number;
  totalOil: number;
  avgYield: number;
}

const OilLogsPage: React.FC = () => {
  // State management - copying staff pattern exactly
  const [logs, setLogs] = useState<OilLog[]>([]);
  const [stats, setStats] = useState<OilLogStats>({
    totalLogs: 0,
    totalInput: 0,
    totalOil: 0,
    avgYield: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states - copying staff pattern
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OilLog | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  // Load data on component mount - copying staff pattern
  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  // Reload logs when search term changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadLogs();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Load logs - using real API like staff management
  const loadLogs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading oil logs with search:', searchTerm);
      
      const response = await oilLogsApi.getOilLogs({
        search: searchTerm
      });
      
      if (response.success) {
        setLogs(response.data);
        console.log('✅ Loaded oil logs:', response.data.length);
      } else {
        console.error('❌ Failed to load oil logs');
        showError('Failed to load oil extraction logs');
      }
    } catch (error) {
      console.error('❌ Error loading oil logs:', error);
      showError('Failed to load oil extraction logs');
    } finally {
      setLoading(false);
    }
  };

  // Load stats - using real API like staff management
  const loadStats = async () => {
    try {
      console.log('🔄 Loading oil extraction stats');
      
      const response = await oilLogsApi.getOilLogStats();
      
      if (response.success) {
        const overview = response.data.overview;
        setStats({
          totalLogs: parseInt(overview.total_logs) || 0,
          totalInput: parseFloat(overview.total_input_kg) || 0,
          totalOil: parseFloat(overview.total_oil_extracted_l) || 0,
          avgYield: parseFloat(overview.avg_yield_percent) || 0
        });
        console.log('✅ Loaded oil extraction stats');
      } else {
        console.error('❌ Failed to load stats');
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  // CRUD operations - copying staff pattern
  const handleAddLog = () => {
    setShowAddModal(true);
  };

  const handleEditLog = (log: OilLog) => {
    setSelectedLog(log);
    setShowEditModal(true);
  };

  const handleDeleteLog = (log: OilLog) => {
    setSelectedLog(log);
    setShowDeleteModal(true);
  };

  const handleSubmitLog = async (formData: OilLogFormData) => {
    try {
      setModalLoading(true);
      console.log('🔄 Submitting oil log:', formData);
      
      // Convert form data to API format
      const apiData = {
        date: formData.date,
        fruit_id: formData.fruit_id,
        input_quantity: parseFloat(formData.input_quantity_kg),
        oil_extracted: parseFloat(formData.oil_extracted_l),
        supplied_oil: parseFloat(formData.supplied_oil_l) || 0,
        waste: parseFloat(formData.waste_kg) || 0,
        notes: formData.notes
      };

      let response;
      if (selectedLog) {
        // Update existing log
        response = await oilLogsApi.updateOilLog(selectedLog.id, apiData);
      } else {
        // Create new log
        response = await oilLogsApi.createOilLog(apiData);
      }
      
      if (response.success) {
        showSuccess(`Oil extraction log ${selectedLog ? 'updated' : 'created'} successfully`);
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedLog(null);
        loadLogs(); // Reload data
        loadStats(); // Reload stats
      } else {
        showError(response.message || 'Failed to save oil extraction log');
      }
    } catch (error) {
      console.error('❌ Error saving log:', error);
      showError('Failed to save oil extraction log');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedLog) return;
    
    try {
      setModalLoading(true);
      console.log('🔄 Deleting log:', selectedLog.id);
      
      const response = await oilLogsApi.deleteOilLog(selectedLog.id);
      
      if (response.success) {
        showSuccess('Oil extraction log deleted successfully');
        setShowDeleteModal(false);
        setSelectedLog(null);
        loadLogs(); // Reload data
        loadStats(); // Reload stats
      } else {
        showError(response.message || 'Failed to delete oil extraction log');
      }
    } catch (error) {
      console.error('❌ Error deleting log:', error);
      showError('Failed to delete oil extraction log');
    } finally {
      setModalLoading(false);
    }
  };

  // Client-side filtering (in addition to backend search) - mirror Fruit page
  const filteredLogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) => {
      const fields = [
        log.fruit_type?.toString(),
        log.fruit_name?.toString(),
        log.notes?.toString(),
        log.created_by?.toString(),
        log.date ? new Date(log.date).toLocaleDateString() : ''
      ];
      return fields.some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [logs, searchTerm]);

  // Client-side pagination (15/page) mirroring Suppliers table
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);

  // Clamp/reset page on data change (e.g., after search)
  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
    if (page > newTotal) setPage(newTotal);
    if (page < 1) setPage(1);
  }, [filteredLogs.length, page]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section - copying staff pattern */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span>Dashboard</span>
                <span>→</span>
                <span className="text-gray-900 font-medium">Oil Logs</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800">
                Oil Extraction Logs
              </h1>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Track production efficiency and monitor input vs output vs waste.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddLog}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Log
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards - copying staff pattern */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Logs"
            value={stats.totalLogs.toString()}
            change="+8%"
            changeType="positive"
            icon={Droplets}
            description="Oil extraction records"
            className="col-span-1"
          />
          <SummaryCard
            title="Total Input"
            value={`${stats.totalInput.toLocaleString()} kg`}
            change="+12%"
            changeType="positive"
            icon={Package}
            description="Raw materials processed"
            className="col-span-1"
          />
          <SummaryCard
            title="Total Oil"
            value={`${stats.totalOil.toLocaleString()} L`}
            change="+15%"
            changeType="positive"
            icon={Droplets}
            description="Oil extracted"
            className="col-span-1"
          />
          <SummaryCard
            title="Avg Yield"
            value={`${stats.avgYield.toFixed(1)}%`}
            change="+2.3%"
            changeType="positive"
            icon={TrendingUp}
            description="Extraction efficiency"
            className="col-span-1"
          />
        </div>

        {/* Search and Filters - copying staff pattern */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Logs Table with pagination */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Oil Extraction Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="max-h-[560px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fruit Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Input (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oil (L)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yield %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No oil extraction logs found
                      </td>
                    </tr>
                  ) : (
                    paginated.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                            {log.fruit_type || log.fruit_name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {(log.input_quantity || log.input_quantity_kg || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {(log.oil_extracted || log.oil_extracted_l || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className="text-primary-600">
                            {((log.oil_extracted || 0) * 0.92 / (log.input_quantity || 1) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditLog(log)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Edit Log"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLog(log)}
                              className="text-accent-600 hover:text-accent-900"
                              title="Delete Log"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 px-6 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>Showing {paginated.length} of {filteredLogs.length} logs</span>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <span>Page {page} of {totalPages}</span>
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

        {/* Simple Modals for now - will enhance later */}
        {showAddModal && (
          <SimpleModal
            title="Add Oil Extraction Log"
            onClose={() => setShowAddModal(false)}
            onSubmit={handleSubmitLog}
            loading={modalLoading}
          />
        )}

        {showEditModal && selectedLog && (
          <SimpleModal
            title="Edit Oil Extraction Log"
            onClose={() => setShowEditModal(false)}
            onSubmit={handleSubmitLog}
            loading={modalLoading}
            initialData={selectedLog}
          />
        )}

        {showDeleteModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Oil Log</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this oil extraction log? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={modalLoading}
                  className="px-4 py-2 bg-accent-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-50"
                >
                  {modalLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple modal component - copying basic pattern
const SimpleModal = ({ title, onClose, onSubmit, loading, initialData }: {
  title: string;
  onClose: () => void;
  onSubmit: (data: OilLogFormData) => Promise<void>;
  loading: boolean;
  initialData?: OilLog;
}) => {
  const [formData, setFormData] = useState<OilLogFormData>({
    date: initialData?.date.split('T')[0] || new Date().toISOString().split('T')[0],
    fruit_id: initialData?.fruit_id || 0,
    input_quantity_kg: (initialData?.input_quantity || initialData?.input_quantity_kg || '').toString(),
    oil_extracted_l: (initialData?.oil_extracted || initialData?.oil_extracted_l || '').toString(),
    supplied_oil_l: (initialData?.supplied_oil || initialData?.supplied_oil_l || '').toString(),
    waste_kg: (initialData?.waste || initialData?.waste_kg || '').toString(),
    notes: initialData?.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <FruitSelect
                value={formData.fruit_id}
                onChange={(value) => setFormData(prev => ({ ...prev, fruit_id: value }))}
                error=""
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Quantity (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.input_quantity_kg}
                onChange={(e) => setFormData(prev => ({ ...prev, input_quantity_kg: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Oil Extracted (L)</label>
              <input
                type="number"
                step="0.1"
                value={formData.oil_extracted_l}
                onChange={(e) => setFormData(prev => ({ ...prev, oil_extracted_l: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OilLogsPage;