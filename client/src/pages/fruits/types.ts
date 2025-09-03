import { Fruit } from '../../lib/types/delivery_normalized';

export type { Fruit };

export interface FruitFormData {
  fruit_name: string;
}

export interface FruitStats {
  totalFruits: number;
  deliveryCount: number;
  extractionCount: number;
}

export interface FruitTableProps {
  fruits: Fruit[];
  loading: boolean;
  onEdit: (fruit: Fruit) => void;
  onView: (fruit: Fruit) => void;
  onDelete: (fruit: Fruit) => void;
}

export interface FruitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FruitFormData) => Promise<void>;
  loading: boolean;
  title: string;
  initialData?: FruitFormData;
}

export interface ViewFruitModalProps {
  isOpen: boolean;
  onClose: () => void;
  fruit: Fruit;
}

export interface DeleteFruitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  fruit: Fruit;
  loading: boolean;
  canDelete: boolean;
  reason: string;
}
