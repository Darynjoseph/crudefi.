// Staff Form Modal Component (Add/Edit)
import React, { useState, useEffect } from 'react';
import { X, User, IdCard, Phone } from 'lucide-react';
import type { Staff, StaffFormData } from './types';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StaffFormData) => Promise<void>;
  staff?: Staff | null; // null for add, Staff object for edit
  loading?: boolean;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staff = null,
  loading = false
}) => {
  const [formData, setFormData] = useState<StaffFormData>({
    full_name: '',
    national_id: '',
    phone_number: ''
  });

  const [errors, setErrors] = useState<Partial<StaffFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!staff;

  // Reset form when modal opens/closes or staff changes
  useEffect(() => {
    if (isOpen) {
      if (staff) {
        // Editing existing staff
        setFormData({
          full_name: staff.full_name,
          national_id: staff.national_id,
          phone_number: staff.phone_number
        });
      } else {
        // Adding new staff
        setFormData({
          full_name: '',
          national_id: '',
          phone_number: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, staff]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<StaffFormData> = {};

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    } else if (formData.full_name.trim().length > 100) {
      newErrors.full_name = 'Full name must be 100 characters or less';
    }

    // National ID validation
    if (!formData.national_id.trim()) {
      newErrors.national_id = 'National ID is required';
    } else if (!/^[A-Za-z0-9]{6,20}$/.test(formData.national_id.trim())) {
      newErrors.national_id = 'National ID must be 6-20 alphanumeric characters';
    } else if (formData.national_id.trim().length > 20) {
      newErrors.national_id = 'National ID must be 20 characters or less';
    }

    // Phone number validation (optional)
    if (formData.phone_number && formData.phone_number.trim()) {
      if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone_number.trim())) {
        newErrors.phone_number = 'Please enter a valid phone number';
      } else if (formData.phone_number.trim().length > 15) {
        newErrors.phone_number = 'Phone number must be 15 characters or less';
      }
    }



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof StaffFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle text input changes
  const handleTextChange = (field: keyof StaffFormData, value: string) => {
    handleInputChange(field, value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving staff:', error);
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
            {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleTextChange('full_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.full_name ? 'border-accent-300' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
              disabled={isSubmitting}
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-accent-600">{errors.full_name}</p>
            )}
          </div>

          {/* National ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IdCard size={16} className="inline mr-2" />
              National ID *
            </label>
            <input
              type="text"
              value={formData.national_id}
              onChange={(e) => handleTextChange('national_id', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono ${
                errors.national_id ? 'border-accent-300' : 'border-gray-300'
              }`}
              placeholder="Enter national ID"
              disabled={isSubmitting}
            />
            {errors.national_id && (
              <p className="mt-1 text-sm text-accent-600">{errors.national_id}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleTextChange('phone_number', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.phone_number ? 'border-accent-300' : 'border-gray-300'
              }`}
              placeholder="Enter phone number (optional)"
              disabled={isSubmitting}
            />
            {errors.phone_number && (
              <p className="mt-1 text-sm text-accent-600">{errors.phone_number}</p>
            )}
          </div>



          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;
