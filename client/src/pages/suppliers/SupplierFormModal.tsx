import React, { useState, useEffect } from 'react';
import { X, Truck, Phone, MapPin, Activity } from 'lucide-react';
import type { SupplierFormModalProps, SupplierFormData } from './types';

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title,
  initialData
}) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    supplier_name: '',
    contact_info: '',
    location: '',
    status: 'active'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFormData, string>>>({});

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        supplier_name: '',
        contact_info: '',
        location: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Handle input changes
  const handleChange = (field: keyof SupplierFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SupplierFormData, string>> = {};

    if (!formData.supplier_name.trim()) {
      newErrors.supplier_name = 'Supplier name is required';
    }

    if (formData.contact_info && formData.contact_info.length > 255) {
      newErrors.contact_info = 'Contact info must be less than 255 characters';
    }

    if (formData.location && formData.location.length > 255) {
      newErrors.location = 'Location must be less than 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Truck className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Supplier Name */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Truck className="h-4 w-4" />
              <span>Supplier Name</span>
            </label>
            <input
              type="text"
              value={formData.supplier_name}
              onChange={(e) => handleChange('supplier_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.supplier_name ? 'border-accent-300' : 'border-gray-300'
              }`}
              placeholder="Enter supplier name"
              disabled={loading}
              required
            />
            {errors.supplier_name && (
              <p className="mt-1 text-sm text-accent-600">{errors.supplier_name}</p>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4" />
              <span>Contact Information</span>
            </label>
            <input
              type="text"
              value={formData.contact_info}
              onChange={(e) => handleChange('contact_info', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.contact_info ? 'border-accent-300' : 'border-gray-300'
              }`}
              placeholder="Phone number, email, or contact person"
              disabled={loading}
            />
            {errors.contact_info && (
              <p className="mt-1 text-sm text-accent-600">{errors.contact_info}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.location ? 'border-accent-300' : 'border-gray-300'
              }`}
              placeholder="City, region, or address"
              disabled={loading}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-accent-600">{errors.location}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Activity className="h-4 w-4" />
              <span>Status</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Saving...' : initialData ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierFormModal;
