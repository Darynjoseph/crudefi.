import { Package } from 'lucide-react';
import { FRUIT_TYPES } from '../../lib/types/delivery';

interface FruitSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const FruitSelect = ({ value, onChange, error, disabled = false }: FruitSelectProps) => {
  return (
    <div>
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
        <Package className="h-4 w-4" />
        <span>Fruit Type</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
        disabled={disabled}
      >
        <option value="">Select Fruit Type</option>
        {FRUIT_TYPES.map((fruit) => (
          <option key={fruit} value={fruit}>
            {fruit}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FruitSelect;