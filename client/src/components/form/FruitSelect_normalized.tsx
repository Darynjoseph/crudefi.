import { useState, useEffect } from 'react';
import { Apple, Plus } from 'lucide-react';
import { fruitApi } from '../../lib/utils/deliveryApi_normalized';
import { Fruit } from '../../lib/types/delivery_normalized';

interface FruitSelectProps {
  value: number | '';
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  allowAddNew?: boolean;
  onAddNew?: () => void;
}

const FruitSelect = ({ 
  value, 
  onChange, 
  error, 
  disabled = false, 
  allowAddNew = false,
  onAddNew 
}: FruitSelectProps) => {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFruits = async () => {
      try {
        setLoading(true);
        const response = await fruitApi.getFruits();
        if (response.success) {
          setFruits(response.data);
        } else {
          setLoadError('Failed to load fruits');
        }
      } catch (error) {
        console.error('Error fetching fruits:', error);
        setLoadError('Failed to load fruits');
      } finally {
        setLoading(false);
      }
    };

    fetchFruits();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'add_new' && onAddNew) {
      onAddNew();
    } else if (selectedValue) {
      onChange(parseInt(selectedValue, 10));
    }
  };

  return (
    <div>
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
        <Apple className="h-4 w-4" />
        <span>Fruit Type</span>
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
            error ? 'border-accent-300' : 'border-gray-300'
          } ${loading ? 'bg-gray-50' : ''}`}
          disabled={disabled || loading}
        >
          <option value="">
            {loading ? 'Loading fruits...' : 'Select Fruit Type'}
          </option>
          {!loading && !loadError && fruits.map((fruit) => (
            <option key={fruit.fruit_id} value={fruit.fruit_id}>
              {fruit.fruit_name}
            </option>
          ))}
          {!loading && !loadError && allowAddNew && (
            <option value="add_new">+ Add New Fruit Type</option>
          )}
        </select>
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-accent-600">{error}</p>}
      {loadError && <p className="mt-1 text-sm text-accent-600">{loadError}</p>}
    </div>
  );
};

export default FruitSelect;
