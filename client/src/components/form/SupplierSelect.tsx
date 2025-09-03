import { Truck } from 'lucide-react';
import { FRUIT_SUPPLIERS } from '../../lib/types/delivery';

interface SupplierSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const SupplierSelect = ({ value, onChange, error, disabled = false }: SupplierSelectProps) => {
  return (
    <div>
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
        <Truck className="h-4 w-4" />
        <span>Supplier</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
        disabled={disabled}
      >
        <option value="">Select Supplier</option>
        {FRUIT_SUPPLIERS.map((supplier) => (
          <option key={supplier} value={supplier}>
            {supplier}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default SupplierSelect;