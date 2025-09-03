import { useState } from 'react';
import { Search, Filter, Calendar, Truck, Edit, Trash2, Eye, Package } from 'lucide-react';
import { FruitDelivery, DeliveryFilters, FRUIT_SUPPLIERS, FRUIT_TYPES } from '../../lib/types/delivery';
import { useAuth } from '../../contexts/AuthContext';

interface DeliveryTableProps {
  deliveries: FruitDelivery[];
  loading?: boolean;
  onEdit?: (delivery: FruitDelivery) => void;
  onDelete?: (id: number) => void;
  onView?: (delivery: FruitDelivery) => void;
  onFilterChange?: (filters: DeliveryFilters) => void;
}

const ROWS_PER_PAGE = 15;

const DeliveryTable = ({ 
  deliveries, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onFilterChange 
}: DeliveryTableProps) => {
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<DeliveryFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pagination logic
  const totalPages = Math.ceil(deliveries.length / ROWS_PER_PAGE) || 1;
  const paginatedDeliveries = deliveries.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof DeliveryFilters, value: string) => {
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

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount: number | null) => {
    return `KES ${(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-t-lg"></div>
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
              placeholder="Search deliveries..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-4">
            {/* Supplier Filter */}
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-gray-500" />
              <select
                value={filters.supplier_name || ''}
                onChange={(e) => handleFilterChange('supplier_name', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Suppliers</option>
                {FRUIT_SUPPLIERS.map((supplier) => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>

            {/* Fruit Type Filter */}
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-500" />
              <select
                value={filters.fruit_type || ''}
                onChange={(e) => handleFilterChange('fruit_type', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Fruits</option>
                {FRUIT_TYPES.map((fruit) => (
                  <option key={fruit} value={fruit}>
                    {fruit}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fruit Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price per kg (KES)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost (KES)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {(hasRole(['admin', 'manager', 'staff'])) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No deliveries found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-lg mr-3">
                          <Truck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {delivery.supplier_name}
                          </div>
                          {delivery.supplier_contact && (
                            <div className="text-xs text-gray-500">
                              {delivery.supplier_contact}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-accent/10 text-accent">
                        {delivery.fruit_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(delivery.weight || 0).toLocaleString()} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      KES {parseFloat(delivery.price_per_kg || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(parseFloat(delivery.total_cost || 0) || (parseFloat(delivery.weight || 0) * parseFloat(delivery.price_per_kg || 0)))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(delivery.date)}
                    </td>
                    {(hasRole(['admin', 'manager', 'staff'])) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          {onView && (
                            <button
                              onClick={() => onView(delivery)}
                              className="text-primary hover:text-primary/80 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          
                          {onEdit && hasRole(['admin', 'manager', 'staff']) && (
                            <button
                              onClick={() => onEdit(delivery)}
                              className="text-accent hover:text-accent/80 transition-colors"
                              title="Edit Delivery"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          
                          {onDelete && hasRole(['admin']) && (
                            <button
                              onClick={() => onDelete(delivery.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete Delivery"
                            >
                              <Trash2 className="h-4 w-4" />
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
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4">
          <button
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 rounded border border-gray-300 ${currentPage === page ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
              onClick={() => handlePageChange(page)}
              disabled={currentPage === page}
            >
              {page}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}


      {/* Summary Footer */}
      {deliveries.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div>
              Showing {deliveries.length} deliveries
            </div>
            <div className="flex space-x-6">
              <span>
                Total Weight: <span className="font-semibold text-gray-900">
                  {deliveries.reduce((sum, d) => sum + parseFloat(d.weight || 0), 0).toLocaleString()} kg
                </span>
              </span>
              <span>
                Total Value: <span className="font-semibold text-primary">
                  {formatCurrency(deliveries.reduce((sum, d) => {
                    const weight = parseFloat(d.weight || 0);
                    const pricePerKg = parseFloat(d.price_per_kg || 0);
                    const totalCost = parseFloat(d.total_cost || 0);
                    return sum + (totalCost || (weight * pricePerKg));
                  }, 0))}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTable;