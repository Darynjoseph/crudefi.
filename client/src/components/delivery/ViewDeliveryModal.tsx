import { X, Package, DollarSign, Calendar, FileText, Truck, User, Phone, MapPin } from 'lucide-react';
import { FruitDelivery } from '../../lib/types/delivery';

interface ViewDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: FruitDelivery | null;
}

const ViewDeliveryModal = ({ isOpen, onClose, delivery }: ViewDeliveryModalProps) => {
  if (!isOpen || !delivery) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number | null) => {
    return `KES ${(amount || 0).toLocaleString()}`;
  };

  // Calculate total cost
  const totalCost = parseFloat(delivery.total_cost || 0) || (parseFloat(delivery.weight || 0) * parseFloat(delivery.price_per_kg || 0));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Delivery Details</h2>
              <p className="text-sm text-gray-500">Delivery ID: #{delivery.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-gray-900">Delivery Date</h3>
              </div>
              <p className="text-gray-700 text-lg">{formatDate(delivery.date)}</p>
            </div>

            {/* Supplier */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-gray-900">Supplier</h3>
              </div>
              <p className="text-gray-700 text-lg font-medium">{delivery.supplier_name}</p>
              {delivery.supplier_contact && (
                <div className="flex items-center space-x-2 mt-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <p className="text-gray-600 text-sm">{delivery.supplier_contact}</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-xl p-6 border border-accent/20">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Package className="h-6 w-6 text-accent" />
              <span>Product Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Fruit Type</p>
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-accent/10 text-accent">
                    {delivery.fruit_type}
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Weight</p>
                  <p className="text-2xl font-bold text-gray-900">{parseFloat(delivery.weight || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">kg</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Price per kg</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(delivery.price_per_kg)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold text-primary">Total Cost</span>
              </div>
              <span className="text-3xl font-bold text-primary">{formatCurrency(totalCost)}</span>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {delivery.weight} kg × {formatCurrency(delivery.price_per_kg)} = {formatCurrency(totalCost)}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {delivery.vehicle_number && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Vehicle Number</h3>
                </div>
                <p className="text-gray-700 font-mono text-lg">{delivery.vehicle_number}</p>
              </div>
            )}

            {delivery.ticket_number && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Ticket Number</h3>
                </div>
                <p className="text-gray-700 font-mono text-lg">{delivery.ticket_number}</p>
              </div>
            )}

            {delivery.approved_by && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Approved By</h3>
                </div>
                <p className="text-gray-700 text-lg">{delivery.approved_by}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {delivery.notes && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center space-x-3 mb-2">
                <FileText className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Notes</h3>
              </div>
              <p className="text-amber-800 leading-relaxed">{delivery.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-200">
            {delivery.created_at && (
              <p>Created: {new Date(delivery.created_at).toLocaleString()}</p>
            )}
            {delivery.updated_at && (
              <p>Last Updated: {new Date(delivery.updated_at).toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDeliveryModal;