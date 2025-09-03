// Role Form Modal (Add/Edit)
import React, { useEffect, useState } from 'react';
import { X, Type, DollarSign } from 'lucide-react';
import type { Role, RoleFormData } from './types';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RoleFormData) => Promise<void>;
  role?: Role | null;
  loading?: boolean;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ isOpen, onClose, onSave, role = null, loading = false }) => {
  const [formData, setFormData] = useState<RoleFormData>({
    role_name: '',
    base_daily_rate: 0,
  });
  const [errors, setErrors] = useState<Partial<RoleFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!role;

  useEffect(() => {
    if (isOpen) {
      if (role) {
        setFormData({
          role_name: role.role_name,
          base_daily_rate: Number(role.base_daily_rate) || 0,
        });
      } else {
        setFormData({ role_name: '', base_daily_rate: 0 });
      }
      setErrors({});
    }
  }, [isOpen, role]);

  const validate = () => {
    const newErrors: Partial<RoleFormData> = {};

    const name = formData.role_name.trim();
    if (!name) newErrors.role_name = 'Role name is required';
    else if (name.length < 2) newErrors.role_name = 'Must be at least 2 characters';
    else if (name.length > 50) newErrors.role_name = 'Must be 50 characters or less';

    const rate = Number(formData.base_daily_rate);
    if (isNaN(rate)) newErrors.base_daily_rate = 'Base daily rate must be a number';
    else if (rate <= 0) newErrors.base_daily_rate = 'Base daily rate must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSave({
        role_name: formData.role_name.trim(),
        base_daily_rate: Number(formData.base_daily_rate),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Role' : 'Add New Role'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={isSubmitting}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Type size={16} className="inline mr-2" />
              Role Name *
            </label>
            <input
              type="text"
              value={formData.role_name}
              onChange={(e) => setFormData((p) => ({ ...p, role_name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.role_name ? 'border-accent-300' : 'border-gray-300'
              }`}
              placeholder="e.g. Machine Operator"
              disabled={isSubmitting || (isEditing && true)}
            />
            {errors.role_name && <p className="mt-1 text-sm text-accent-600">{errors.role_name}</p>}
            {isEditing && (
              <p className="mt-1 text-xs text-gray-400">Role name cannot be changed (used in historical records)</p>
            )}
          </div>

          {/* Base Daily Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Base Daily Rate *
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={formData.base_daily_rate}
              onChange={(e) => setFormData((p) => ({ ...p, base_daily_rate: Number(e.target.value) }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.base_daily_rate ? 'border-accent-300' : 'border-gray-300'
              }`}
              placeholder="e.g. 1500"
              disabled={isSubmitting}
            />
            {errors.base_daily_rate && (
              <p className="mt-1 text-sm text-accent-600">{errors.base_daily_rate}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Role' : 'Add Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal;
