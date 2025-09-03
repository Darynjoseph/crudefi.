import React, { useState, useEffect } from 'react';
import { X, Apple } from 'lucide-react';
import type { FruitFormModalProps, FruitFormData } from './types';

const FruitFormModal: React.FC<FruitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title,
  initialData
}) => {
  const [formData, setFormData] = useState<FruitFormData>({
    fruit_name: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FruitFormData, string>>>({});

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        fruit_name: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Handle input changes
  const handleChange = (field: keyof FruitFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FruitFormData, string>> = {};

    if (!formData.fruit_name.trim()) {
      newErrors.fruit_name = 'Fruit name is required';
    }

    if (formData.fruit_name && formData.fruit_name.length > 100) {
      newErrors.fruit_name = 'Fruit name must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({
        fruit_name: formData.fruit_name.trim()
      });
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
              <Apple className="h-5 w-5 text-primary-600" />
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
          {/* Fruit Name */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Apple className="h-4 w-4" />
              <span>Fruit Name</span>
            </label>
            <input
              type="text"
              value={formData.fruit_name}
              onChange={(e) => handleChange('fruit_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.fruit_name ? 'border-accent-300' : 'border-gray-300'
              }`}
              placeholder="Enter fruit name (e.g., Avocado, Mango, Coconut)"
              disabled={loading}
              required
            />
            {errors.fruit_name && (
              <p className="mt-1 text-sm text-accent-600">{errors.fruit_name}</p>
            )}
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
              {loading ? 'Saving...' : initialData ? 'Update Fruit' : 'Add Fruit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FruitFormModal;
