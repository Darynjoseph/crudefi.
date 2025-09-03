// Role Table Component
import React, { useMemo, useState } from 'react';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import type { Role } from './types';

interface RoleTableProps {
  roles: Role[];
  loading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const RoleTable: React.FC<RoleTableProps> = ({ roles, loading, onEdit, onDelete }) => {
  // Pagination state
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(roles.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return roles.slice(start, start + PAGE_SIZE);
  }, [roles, page]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading roles...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!roles.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center text-gray-500">No roles found. Add your first role to get started.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-6">Role Name</div>
          <div className="col-span-4">Base Daily Rate</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 max-h-[560px] overflow-y-auto">
        {paginated.map((r) => (
          <div key={r.role_name} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6">
                <div className="font-medium text-gray-900">{r.role_name}</div>
                <div className="text-sm text-gray-500">Configured</div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center text-gray-700">
                  <DollarSign size={16} className="mr-2 text-gray-400" />
                  <span className="font-mono">{Number(r.base_daily_rate).toFixed(0)}</span>
                </div>
              </div>
              <div className="col-span-2 flex justify-center space-x-2">
                <button
                  onClick={() => onEdit(r)}
                  className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                  title="Edit role"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(r)}
                  className="p-2 text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-md transition-colors"
                  title="Delete role"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {paginated.length} of {roles.length} roles</span>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border text-gray-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleTable;
