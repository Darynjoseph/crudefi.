interface FormButtonsProps {
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  loadingText?: string;
}

const FormButtons = ({ 
  onCancel, 
  loading = false, 
  submitText = "Add Delivery",
  loadingText = "Adding..."
}: FormButtonsProps) => {
  return (
    <div className="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{loadingText}</span>
          </>
        ) : (
          <span>{submitText}</span>
        )}
      </button>
    </div>
  );
};

export default FormButtons;