import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Edit, Trash2, MapPin, Phone } from 'lucide-react';
import type { SupplierTableProps } from './types';

const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  loading,
  onEdit,
  onView,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Pagination (client-side)
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(suppliers.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return suppliers.slice(start, start + PAGE_SIZE);
  }, [suppliers, page]);

  // Ensure page is valid when suppliers list changes (e.g., after search/filter)
  useEffect(() => {
    const newTotal = Math.max(1, Math.ceil(suppliers.length / PAGE_SIZE));
    if (page > newTotal) {
      setPage(newTotal);
    } else if (page < 1) {
      setPage(1);
    }
  }, [suppliers.length, page]);

  if (suppliers.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
        <p className="text-gray-500">Get started by adding your first supplier.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="max-h-[560px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
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
              {paginated.map((supplier, index) => (
                <tr 
                  key={supplier.supplier_id} 
                  className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {supplier.supplier_name}
                        </div>
                        <div className="text-sm text-gray-500">ID: {supplier.supplier_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {supplier.contact_info || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {supplier.location || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(supplier)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(supplier)}
                        className="text-accent-600 hover:text-accent-900"
                        title="Edit Supplier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(supplier)}
                        className="text-accent-600 hover:text-accent-900"
                        title="Delete Supplier"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between bg-gray-50 px-6 py-3 border-t border-gray-100 text-sm text-gray-600">
        <span>Showing {paginated.length} of {suppliers.length} suppliers</span>
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
  );
};

export default SupplierTable;
