import React from 'react';
import { X, Truck, Phone, MapPin, Activity, Calendar } from 'lucide-react';
import type { ViewSupplierModalProps } from './types';

const ViewSupplierModal: React.FC<ViewSupplierModalProps> = ({
  isOpen,
  onClose,
  supplier
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Truck className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Supplier Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Supplier Name */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Truck className="h-4 w-4" />
              <span>Supplier Name</span>
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {supplier.supplier_name}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4" />
              <span>Contact Information</span>
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {supplier.contact_info || (
                <span className="text-gray-400 italic">No contact information</span>
              )}
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {supplier.location || (
                <span className="text-gray-400 italic">No location specified</span>
              )}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Activity className="h-4 w-4" />
              <span>Status</span>
            </label>
            <div className="flex items-center">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  supplier.status === 'active'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-accent-100 text-accent-800'
                }`}
              >
                {supplier.status}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4" />
                <span>Created</span>
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {new Date(supplier.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4" />
                <span>Updated</span>
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {new Date(supplier.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Supplier ID */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Supplier ID
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md font-mono">
              #{supplier.supplier_id}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSupplierModal;
