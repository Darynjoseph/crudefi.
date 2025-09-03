import React from 'react';
import { X, AlertTriangle, Apple } from 'lucide-react';
import type { DeleteFruitModalProps } from './types';

const DeleteFruitModal: React.FC<DeleteFruitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fruit,
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
            <h2 className="text-xl font-semibold text-gray-900">Delete Fruit</h2>
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
              <strong>Warning:</strong> You are about to permanently delete this fruit type from the system.
            </p>
          </div>

          {/* Fruit Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Apple className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{fruit.fruit_name}</p>
                <p className="text-sm text-gray-500">ID: #{fruit.fruit_id}</p>
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
                This fruit type is being used in deliveries or oil extraction logs.
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
              {loading ? 'Deleting...' : 'Delete Fruit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteFruitModal;
