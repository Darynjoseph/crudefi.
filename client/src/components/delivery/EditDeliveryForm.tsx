import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { FruitDelivery, UpdateDeliveryRequest } from '../../lib/types/delivery';
import {
  FormHeader,
  FormField,
  FruitSelect,
  SupplierSelect,
  CostDisplay,
  FormButtons
} from '../form';
import { Package, DollarSign, Calendar, FileText, User, Phone } from 'lucide-react';

interface EditDeliveryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (delivery: UpdateDeliveryRequest) => Promise<void>;
  delivery: FruitDelivery | null;
  loading?: boolean;
}

const EditDeliveryForm = ({ isOpen, onClose, onSubmit, delivery, loading = false }: EditDeliveryFormProps) => {
  const [formData, setFormData] = useState<UpdateDeliveryRequest>({
    id: 0,
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
  
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateDeliveryRequest, string>>>({});

  // Populate form when delivery changes
  useEffect(() => {
    if (delivery) {
      setFormData({
        id: delivery.id,
        date: delivery.date.split('T')[0], // Format date for input
        supplier_name: delivery.supplier_name,
        supplier_contact: delivery.supplier_contact || '',
        vehicle_number: delivery.vehicle_number || '',
        fruit_type: delivery.fruit_type,
        weight: delivery.weight,
        price_per_kg: delivery.price_per_kg,
        ticket_number: delivery.ticket_number || '',
        approved_by: delivery.approved_by || '',
        notes: delivery.notes || ''
      });
      setErrors({});
    }
  }, [delivery]);

  // Calculate total cost automatically
  const totalCost = formData.weight * formData.price_per_kg;

  // Handle form input changes
  const handleChange = (field: keyof UpdateDeliveryRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateDeliveryRequest, string>> = {};

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
      onClose();
    } catch (error) {
      console.error('Failed to update delivery:', error);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    if (delivery) {
      setFormData({
        id: delivery.id,
        date: delivery.date.split('T')[0],
        supplier_name: delivery.supplier_name,
        supplier_contact: delivery.supplier_contact || '',
        vehicle_number: delivery.vehicle_number || '',
        fruit_type: delivery.fruit_type,
        weight: delivery.weight,
        price_per_kg: delivery.price_per_kg,
        ticket_number: delivery.ticket_number || '',
        approved_by: delivery.approved_by || '',
        notes: delivery.notes || ''
      });
    }
    setErrors({});
    onClose();
  };

  if (!isOpen || !delivery) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <FormHeader
          title="Edit Fruit Delivery"
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
            submitText="Update Delivery"
            loadingText="Updating..."
          />
        </form>
      </div>
    </div>
  );
};

export default EditDeliveryForm;