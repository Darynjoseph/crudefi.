import { useState, useEffect } from 'react';
import { Package, DollarSign, Calendar, FileText, User, Phone, Truck } from 'lucide-react';
import { FruitDelivery, UpdateDeliveryRequest } from '../../lib/types/delivery_normalized';
import {
  FormHeader,
  FormField,
  CostDisplay,
  FormButtons
} from '../form';
import SupplierSelect from '../form/SupplierSelect_normalized';
import FruitSelect from '../form/FruitSelect_normalized';

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
    supplier_id: 0,
    supplier_contact: '',
    vehicle_number: '',
    fruit_id: 0,
    weight_kg: 0,
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
        supplier_id: delivery.supplier_id,
        supplier_contact: delivery.supplier_contact || '',
        vehicle_number: delivery.vehicle_number || '',
        fruit_id: delivery.fruit_id,
        weight_kg: delivery.weight_kg,
        price_per_kg: delivery.price_per_kg,
        ticket_number: delivery.ticket_number || '',
        approved_by: delivery.approved_by || '',
        notes: delivery.notes || ''
      });
    }
  }, [delivery]);

  // Calculate total cost automatically
  const totalCost = formData.weight_kg * formData.price_per_kg;

  // Handle form input changes
  const handleChange = (field: keyof UpdateDeliveryRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateDeliveryRequest, string>> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.supplier_id || formData.supplier_id === 0) newErrors.supplier_id = 'Please select a supplier';
    if (!formData.fruit_id || formData.fruit_id === 0) newErrors.fruit_id = 'Please select a fruit type';
    if (!formData.weight_kg || formData.weight_kg <= 0) newErrors.weight_kg = 'Weight must be greater than 0';
    if (!formData.price_per_kg || formData.price_per_kg <= 0) newErrors.price_per_kg = 'Price per kg must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        weight_kg: Number(formData.weight_kg),
        price_per_kg: Number(formData.price_per_kg)
      });
      
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (!isOpen || !delivery) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormHeader 
          title="Edit Fruit Delivery" 
          icon={Truck}
          onClose={onClose} 
        />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Supplier Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Delivery Date"
              type="date"
              value={formData.date}
              onChange={(value) => handleChange('date', value)}
              error={errors.date}
              icon={Calendar}
              required
            />
            
            <FormField
              label="Ticket Number"
              type="text"
              value={formData.ticket_number}
              onChange={(value) => handleChange('ticket_number', value)}
              error={errors.ticket_number}
              icon={FileText}
              placeholder="Enter ticket number"
            />
          </div>

          {/* Supplier Selection */}
          <SupplierSelect
            value={formData.supplier_id}
            onChange={(value) => handleChange('supplier_id', value)}
            error={errors.supplier_id}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Supplier Contact"
              type="text"
              value={formData.supplier_contact}
              onChange={(value) => handleChange('supplier_contact', value)}
              error={errors.supplier_contact}
              icon={Phone}
              placeholder="Contact number or email"
            />
            
            <FormField
              label="Vehicle Number"
              type="text"
              value={formData.vehicle_number}
              onChange={(value) => handleChange('vehicle_number', value)}
              error={errors.vehicle_number}
              icon={Truck}
              placeholder="Vehicle registration number"
            />
          </div>

          {/* Fruit and Quantity */}
          <FruitSelect
            value={formData.fruit_id}
            onChange={(value) => handleChange('fruit_id', value)}
            error={errors.fruit_id}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Weight (kg)"
              type="number"
              value={formData.weight_kg}
              onChange={(value) => handleChange('weight_kg', Number(value))}
              error={errors.weight_kg}
              icon={Package}
              placeholder="0.00"
              step="0.01"
              required
            />
            
            <FormField
              label="Price per Kg (KES)"
              type="number"
              value={formData.price_per_kg}
              onChange={(value) => handleChange('price_per_kg', Number(value))}
              error={errors.price_per_kg}
              icon={DollarSign}
              placeholder="0.00"
              step="0.01"
              required
            />
            
            <CostDisplay totalCost={totalCost} />
          </div>

          {/* Additional Info */}
          <FormField
            label="Approved By"
            type="text"
            value={formData.approved_by}
            onChange={(value) => handleChange('approved_by', value)}
            error={errors.approved_by}
            icon={User}
            placeholder="Staff member name"
          />
          
          <FormField
            label="Notes"
            type="textarea"
            value={formData.notes}
            onChange={(value) => handleChange('notes', value)}
            error={errors.notes}
            icon={FileText}
            placeholder="Any additional notes or observations"
          />

          <FormButtons
            onCancel={onClose}
            loading={loading}
            submitText="Update Delivery"
          />
        </form>
      </div>
    </div>
  );
};

export default EditDeliveryForm;
