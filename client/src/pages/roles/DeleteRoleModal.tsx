// Delete Role Confirmation Modal
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Role } from './types';

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  role: Role | null;
  loading?: boolean;
}

const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({ isOpen, onClose, onConfirm, role, loading = false }) => {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Delete Role</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={loading}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start">
            <AlertTriangle className="text-accent-600 mr-3 mt-0.5" size={20} />
            <div>
              <p className="text-gray-800">
                Are you sure you want to delete the role <span className="font-semibold">{role.role_name}</span>?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This action cannot be undone. Roles that are assigned to existing shifts cannot be deleted.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Deleting...' : 'Delete Role'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoleModal;
