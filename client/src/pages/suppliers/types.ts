import { Supplier } from '../../lib/types/delivery_normalized';

export type { Supplier };

export interface SupplierFormData {
  supplier_name: string;
  contact_info: string;
  location: string;
  status: 'active' | 'inactive';
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  newThisMonth: number;
}

export interface SupplierTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onView: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  loading: boolean;
  title: string;
  initialData?: SupplierFormData;
}

export interface ViewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
}

export interface DeleteSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  supplier: Supplier;
  loading: boolean;
  canDelete: boolean;
  reason: string;
}
