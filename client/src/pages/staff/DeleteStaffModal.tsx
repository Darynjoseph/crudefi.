// Delete Staff Confirmation Modal
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Staff } from './types';

interface DeleteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  staff: Staff | null;
  loading?: boolean;
  canDelete?: boolean;
  deleteReason?: string;
}

const DeleteStaffModal: React.FC<DeleteStaffModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  staff,
  loading = false,
  canDelete = true,
  deleteReason
}) => {
  if (!isOpen || !staff) return null;

  const handleConfirm = async () => {
    if (canDelete) {
      await onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center">
            <AlertTriangle className="text-accent-500 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Delete Staff Member
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {canDelete ? (
            <>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <strong>{staff.full_name}</strong>?
              </p>
              <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-4">
                <p className="text-accent-800 text-sm">
                  <strong>Warning:</strong> This action cannot be undone. All staff information will be permanently removed.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <p><strong>Staff ID:</strong> {staff.national_id}</p>
                <p><strong>Phone:</strong> {staff.phone_number}</p>
                <p><strong>Daily Rate:</strong> ${staff.base_daily_rate}</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                Cannot delete <strong>{staff.full_name}</strong>
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Reason:</strong> {deleteReason || 'Staff member has associated records that prevent deletion.'}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>To delete this staff member, you must first:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Close any open shifts</li>
                  <li>Remove or transfer salary records (if applicable)</li>
                  <li>Ensure no other system dependencies exist</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            {canDelete ? 'Cancel' : 'Close'}
          </button>
          {canDelete && (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Deleting...' : 'Delete Staff'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteStaffModal;
