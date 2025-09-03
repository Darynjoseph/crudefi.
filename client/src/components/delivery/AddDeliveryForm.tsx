import { useState } from 'react';
import { Package, DollarSign, Calendar, FileText, Truck, User, Phone } from 'lucide-react';
import { CreateDeliveryRequest } from '../../lib/types/delivery';
import {
  FormHeader,
  FormField,
  FruitSelect,
  SupplierSelect,
  CostDisplay,
  FormButtons
} from '../form';

interface AddDeliveryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (delivery: CreateDeliveryRequest) => Promise<void>;
  loading?: boolean;
}

const AddDeliveryForm = ({ isOpen, onClose, onSubmit, loading = false }: AddDeliveryFormProps) => {
  const [formData, setFormData] = useState<CreateDeliveryRequest>({
    date: '',
    supplier_name: '',
    supplier_contact: '',
    vehicle_number: '',
    fruit_type: '',
    weight: 0,
    price_per_kg: 0,
    ticket_number: '',
    approved_by: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CreateDeliveryRequest, string>>>({});

  // Calculate total cost automatically
  const totalCost = formData.weight * formData.price_per_kg;

  // Handle form input changes
  const handleChange = (field: keyof CreateDeliveryRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateDeliveryRequest, string>> = {};

    if (!formData.supplier_name) newErrors.supplier_name = 'Supplier is required';
    if (!formData.fruit_type) newErrors.fruit_type = 'Fruit type is required';
    const weight = Number(formData.weight);
    if (isNaN(weight) || weight <= 0) newErrors.weight = 'Weight must be greater than 0';
    const pricePerKg = Number(formData.price_per_kg);
    if (isNaN(pricePerKg) || pricePerKg <= 0) newErrors.price_per_kg = 'Price per kg must be greater than 0';
    if (!formData.date) newErrors.date = 'Delivery date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        date: '',
        supplier_name: '',
        supplier_contact: '',
        vehicle_number: '',
        fruit_type: '',
        weight: 0,
        price_per_kg: 0,
        ticket_number: '',
        approved_by: '',
        notes: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to add delivery:', error);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({
      date: '',
      supplier_name: '',
      supplier_contact: '',
      vehicle_number: '',
      fruit_type: '',
      weight: 0,
      price_per_kg: 0,
      ticket_number: '',
      approved_by: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <FormHeader
          title="Add New Fruit Delivery"
          icon={Truck}
          onClose={handleClose}
          loading={loading}
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <FormField
            label="Delivery Date"
            icon={Calendar}
            type="date"
            value={formData.date}
            onChange={(value) => handleChange('date', value)}
            error={errors.date}
            disabled={loading}
          />

          <SupplierSelect
            value={formData.supplier_name}
            onChange={(value) => handleChange('supplier_name', value)}
            error={errors.supplier_name}
            disabled={loading}
          />

          <FormField
            label="Supplier Contact (Optional)"
            icon={Phone}
            type="text"
            value={formData.supplier_contact || ''}
            onChange={(value) => handleChange('supplier_contact', value)}
            placeholder="Phone number or contact person"
            disabled={loading}
          />

          <FruitSelect
            value={formData.fruit_type}
            onChange={(value) => handleChange('fruit_type', value)}
            error={errors.fruit_type}
            disabled={loading}
          />

          <FormField
            label="Weight (kg)"
            icon={Package}
            type="number"
            value={formData.weight}
            onChange={(value) => handleChange('weight', value)}
            placeholder="Enter Weight"
            error={errors.weight}
            disabled={loading}
            min="0"
            step="0.1"
          />

          <FormField
            label="Price per kg (KES)"
            icon={DollarSign}
            type="number"
            value={formData.price_per_kg}
            onChange={(value) => handleChange('price_per_kg', value)}
            placeholder="Enter Price per kg"
            error={errors.price_per_kg}
            disabled={loading}
            min="0"
            step="0.01"
          />

          <FormField
            label="Vehicle Number (Optional)"
            icon={Truck}
            type="text"
            value={formData.vehicle_number || ''}
            onChange={(value) => handleChange('vehicle_number', value)}
            placeholder="e.g., KBA 123A"
            disabled={loading}
          />

          <FormField
            label="Ticket Number (Optional)"
            icon={FileText}
            type="text"
            value={formData.ticket_number || ''}
            onChange={(value) => handleChange('ticket_number', value)}
            placeholder="Delivery ticket number"
            disabled={loading}
          />

          <FormField
            label="Approved By (Optional)"
            icon={User}
            type="text"
            value={formData.approved_by || ''}
            onChange={(value) => handleChange('approved_by', value)}
            placeholder="Approver name"
            disabled={loading}
          />

          <CostDisplay totalCost={totalCost} />

          <FormField
            label="Notes (Optional)"
            icon={FileText}
            type="textarea"
            value={formData.notes || ''}
            onChange={(value) => handleChange('notes', value)}
            placeholder="Add any additional notes"
            disabled={loading}
            rows={3}
          />

          <FormButtons
            onCancel={handleClose}
            loading={loading}
            submitText="Add Delivery"
            loadingText="Adding..."
          />
        </form>
      </div>
    </div>
  );
};

export default AddDeliveryForm;