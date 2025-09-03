import React from 'react';
import { X, AlertTriangle, Truck } from 'lucide-react';
import type { DeleteSupplierModalProps } from './types';

const DeleteSupplierModal: React.FC<DeleteSupplierModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  supplier,
  loading,
  canDelete,
  reason
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-accent-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Delete Supplier</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-accent-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
              <p className="text-sm text-gray-600">This action cannot be undone.</p>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-4">
            <p className="text-accent-800 text-sm">
              <strong>Warning:</strong> You are about to permanently delete this supplier from the system.
            </p>
          </div>

          {/* Supplier Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Truck className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{supplier.supplier_name}</p>
                <p className="text-sm text-gray-500">ID: #{supplier.supplier_id}</p>
                {supplier.contact_info && (
                  <p className="text-sm text-gray-500">Contact: {supplier.contact_info}</p>
                )}
                {supplier.location && (
                  <p className="text-sm text-gray-500">Location: {supplier.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cannot Delete Warning */}
          {!canDelete && reason && (
            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-4">
              <p className="text-accent-800 text-sm">
                <strong>Cannot delete:</strong> {reason}
              </p>
              <p className="text-accent-700 text-sm mt-1">
                Consider marking this supplier as inactive instead.
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !canDelete}
              className="px-4 py-2 bg-accent-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-50 flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Deleting...' : 'Delete Supplier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSupplierModal;
