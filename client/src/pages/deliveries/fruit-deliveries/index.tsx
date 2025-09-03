import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { deliveryApi } from '../../../lib/utils/deliveryApi_normalized';
import { FruitDelivery, CreateDeliveryRequest, UpdateDeliveryRequest, DeliveryFilters } from '../../../lib/types/delivery_normalized';
import AddDeliveryForm from '../../../components/delivery/AddDeliveryForm_normalized';
import EditDeliveryForm from '../../../components/delivery/EditDeliveryForm_normalized';
import ViewDeliveryModal from '../../../components/delivery/ViewDeliveryModal';
import DeliveryTable from '../../../components/delivery/DeliveryTable';
import DashboardCard from '../../../components/common/DashboardCard';
import ErrorBoundary from '../../../components/common/ErrorBoundary';

const FruitDeliveries = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State management
  const [deliveries, setDeliveries] = useState<FruitDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<FruitDelivery | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState<DeliveryFilters>({});

  // Statistics
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalWeight: 0,
    totalCost: 0,
    averageCostPerKg: 0,
    deliveriesToday: 0,
    deliveriesThisWeek: 0
  });

  // Load deliveries on component mount and when filters change
  useEffect(() => {
    loadDeliveries();
  }, [filters]);

  // Load statistics
  useEffect(() => {
    loadStats();
  }, [deliveries]);

  // Load deliveries from API
  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading deliveries with filters:', filters);
      
      const response = await deliveryApi.getDeliveries(filters);
      console.log('📥 API Response:', response);
      
      if (response && response.success) {
        setDeliveries(response.data || []);
        console.log('✅ Deliveries loaded:', response.data?.length || 0);
      } else {
        const errorMessage = (response && 'error' in response && typeof response.error === 'string')
          ? response.error
          : 'Failed to load deliveries';
        setError(errorMessage);
        showError('Loading Error', errorMessage);
        console.log('❌ API Error:', errorMessage);
      }
    } catch (err) {
      console.error('💥 Error loading deliveries:', err);
      let errorMessage = 'Failed to load deliveries. Please check backend connection.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific error cases
        if (err.message.includes('Authentication failed')) {
          errorMessage = 'Session expired. Please log in again.';
          showError('Authentication Error', errorMessage);
          // Redirect to login or handle auth failure
          return;
        } else if (err.message.includes('permission')) {
          errorMessage = 'You don\'t have permission to view deliveries.';
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
      const response = await deliveryApi.getDeliveryStats();
      if (response.success && response.data?.overview) {
        // Map the API response to our stats format
        const overview = response.data.overview;
        setStats({
          totalDeliveries: Number(overview.total_deliveries) || 0,
          totalWeight: Number(overview.total_weight) || 0,
          totalCost: Number(overview.total_cost) || 0,
          averageCostPerKg: Number(overview.average_cost_per_kg) || 0,
          deliveriesToday: Number(overview.deliveries_today) || 0,
          deliveriesThisWeek: Number(overview.deliveries_this_week) || 0
        });
      } else {
        throw new Error('Invalid stats response');
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      // Calculate basic stats from loaded deliveries as fallback
      const totalWeight = deliveries.reduce((sum, d) => sum + parseFloat(d.weight_kg?.toString() || "0"), 0);
      const totalCost = deliveries.reduce((sum, d) => {
        const weight = parseFloat(d.weight_kg?.toString() || "0");
        const pricePerKg = parseFloat(d.price_per_kg?.toString() || "0");
        const totalCost = parseFloat(d.total_cost?.toString() || "0");
        return sum + (totalCost || (weight * pricePerKg));
      }, 0);
      const averageCostPerKg = totalWeight > 0 ? totalCost / totalWeight : 0;
      
      setStats({
        totalDeliveries: deliveries.length,
        totalWeight,
        totalCost,
        averageCostPerKg,
        deliveriesToday: deliveries.filter(d => 
          new Date(d.date).toDateString() === new Date().toDateString()
        ).length,
        deliveriesThisWeek: deliveries.filter(d => {
          const deliveryDate = new Date(d.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return deliveryDate >= weekAgo;
        }).length
      });
    }
  };

  // Handle add delivery
  const handleAddDelivery = async (deliveryData: CreateDeliveryRequest) => {
    try {
      setFormLoading(true);
      const response = await deliveryApi.createDelivery(deliveryData);
      
      if (response.success) {
        setIsAddFormOpen(false);
        showSuccess('Delivery Added', response.message || 'Fruit delivery has been successfully added.');
        // Reload data from API like oil logs
        loadDeliveries();
        loadStats();
      } else {
        throw new Error(response.message || 'Failed to create delivery');
      }
    } catch (err) {
      console.error('Error adding delivery:', err);
      showError('Failed to Add Delivery', err instanceof Error ? err.message : 'An unexpected error occurred');
      throw err; // Re-throw to let form handle the error
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit delivery
  const handleEditDelivery = (delivery: FruitDelivery) => {
    setSelectedDelivery(delivery);
    setIsEditFormOpen(true);
  };

  // Handle delete delivery - copying oil logs pattern
  const handleDeleteDelivery = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this delivery?')) return;
    
    try {
      console.log('🔄 Deleting delivery:', id);
      const response = await deliveryApi.deleteDelivery(id);
      if (response.success) {
        showSuccess('Delivery Deleted', response.message || 'Delivery has been successfully deleted.');
        // Reload data from API like oil logs
        loadDeliveries();
        loadStats();
      }
    } catch (err) {
      console.error('Error deleting delivery:', err);
      showError('Failed to Delete Delivery', err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  // Handle view delivery details
  const handleViewDelivery = (delivery: FruitDelivery) => {
    setSelectedDelivery(delivery);
    setIsViewModalOpen(true);
  };

  // Handle update delivery
  const handleUpdateDelivery = async (deliveryData: UpdateDeliveryRequest) => {
    try {
      setFormLoading(true);
      const response = await deliveryApi.updateDelivery(deliveryData);
      
      if (response.success) {
        setIsEditFormOpen(false);
        setSelectedDelivery(null);
        showSuccess('Delivery Updated', response.message || 'Fruit delivery has been successfully updated.');
        // Reload data from API like oil logs
        loadDeliveries();
        loadStats();
      } else {
        throw new Error(response.message || 'Failed to update delivery');
      }
    } catch (err) {
      console.error('Error updating delivery:', err);
      showError('Failed to Update Delivery', err instanceof Error ? err.message : 'An unexpected error occurred');
      throw err; // Re-throw to let form handle the error
    } finally {
      setFormLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: DeliveryFilters) => {
    setFilters(newFilters);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Daily Fruit Deliveries
              </h1>
              <p className="text-gray-600 text-lg">
                Track and manage daily fruit deliveries from various sources.
              </p>
            </div>
            
            {hasRole(['admin', 'manager', 'staff']) && (
              <div className="mt-6 lg:mt-0">
                <button
                  onClick={() => setIsAddFormOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl flex items-center space-x-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Delivery</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Deliveries" 
          value={(stats.totalDeliveries || 0).toString()}
          icon={<Package className="h-6 w-6" />}
          color="blue"
        />
        <DashboardCard 
          title="Total Weight" 
          value={`${(stats.totalWeight || 0).toLocaleString()} kg`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <DashboardCard 
          title="Total Value" 
          value={`KES ${(stats.totalCost || 0).toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6" />}
          color="amber"
        />
        <DashboardCard 
          title="This Week" 
          value={(stats.deliveriesThisWeek || 0).toString()}
          icon={<Calendar className="h-6 w-6" />}
          color="purple"
        />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">Unable to Load Deliveries</h3>
                <p className="font-medium mb-3">{error}</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={loadDeliveries}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {loading ? 'Retrying...' : 'Retry'}
                  </button>
                  <button 
                    onClick={() => setError(null)}
                    className="text-red-800 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deliveries Table */}
        <DeliveryTable
          deliveries={deliveries}
          loading={loading}
          onEdit={handleEditDelivery}
          onDelete={handleDeleteDelivery}
          onView={handleViewDelivery}
          onFilterChange={handleFilterChange}
        />

        {/* Add Delivery Form Modal */}
        <AddDeliveryForm
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
          onSubmit={handleAddDelivery}
          loading={formLoading}
        />

        {/* Edit Delivery Form Modal */}
        <EditDeliveryForm
          isOpen={isEditFormOpen}
          onClose={() => {
            setIsEditFormOpen(false);
            setSelectedDelivery(null);
          }}
          onSubmit={handleUpdateDelivery}
          delivery={selectedDelivery}
          loading={formLoading}
        />

        {/* View Delivery Modal */}
        <ViewDeliveryModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDelivery(null);
          }}
          delivery={selectedDelivery}
        />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FruitDeliveries;