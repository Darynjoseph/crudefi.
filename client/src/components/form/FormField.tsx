import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  icon: LucideIcon;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  type?: 'text' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  step?: string;
  rows?: number;
}

const FormField = ({
  label,
  icon: Icon,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  disabled = false,
  min,
  step,
  rows = 3
}: FormFieldProps) => {
  const inputClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
    error ? 'border-red-300' : 'border-gray-300'
  }`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (type === 'number') {
      if (val === '') {
        onChange(0);
      } else {
        onChange(parseFloat(val) || 0);
      }
    } else {
      onChange(val);
    }
  };

  const getInputValue = () => {
    if (type === 'number' && value === 0) {
      return '';
    }
    return value.toString();
  };

  return (
    <div>
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </label>
      {type === 'textarea' ? (
        <textarea
          value={getInputValue()}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          className={`${inputClassName} resize-none`}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={getInputValue()}
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClassName}
          disabled={disabled}
          min={min}
          step={step}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;