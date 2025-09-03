import { X, LucideIcon } from 'lucide-react';

interface FormHeaderProps {
  title: string;
  icon: LucideIcon;
  onClose: () => void;
  loading?: boolean;
}

const FormHeader = ({ title, icon: Icon, onClose, loading = false }: FormHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/10 p-2 rounded-xl">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        disabled={loading}
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
};

export default FormHeader;