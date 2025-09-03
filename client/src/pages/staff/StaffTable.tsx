// Staff Table Component
import React, { useMemo, useState } from 'react';
import { Edit, Trash2, Phone, IdCard } from 'lucide-react';
import type { Staff } from './types';

interface StaffTableProps {
  staff: Staff[];
  loading: boolean;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
  searchTerm: string;
}

const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  loading,
  onEdit,
  onDelete,
  searchTerm
}) => {
  // Filter staff based on search term
  const filteredStaff = staff.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.national_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.phone_number && member.phone_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE));

  // Ensure page stays in range when filter results change
  if (page > totalPages) {
    setPage(totalPages);
  }

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredStaff.slice(start, start + PAGE_SIZE);
  }, [filteredStaff, page]);
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NZ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading staff...</span>
          </div>
        </div>
      </div>
    );
  }

  if (filteredStaff.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-gray-500 mb-2">
            {searchTerm ? 'No staff found matching your search' : 'No staff members found'}
          </div>
          <div className="text-sm text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first staff member to get started'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div className="col-span-4">Full Name</div>
          <div className="col-span-3">National ID</div>
          <div className="col-span-3">Phone Number</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100 max-h-[560px] overflow-y-auto">
        {paginated.map((member) => (
          <div
            key={member.staff_id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Full Name */}
              <div className="col-span-4">
                <div className="font-medium text-gray-900">{member.full_name}</div>
                <div className="text-sm text-gray-500">
                  Added {formatDate(member.created_at)}
                </div>
              </div>

              {/* National ID */}
              <div className="col-span-3">
                <div className="flex items-center text-gray-600">
                  <IdCard size={14} className="mr-2 text-gray-400" />
                  <span className="font-mono text-sm">{member.national_id}</span>
                </div>
              </div>

              {/* Phone Number */}
              <div className="col-span-3">
                <div className="flex items-center text-gray-600">
                  <Phone size={14} className="mr-2 text-gray-400" />
                  <span>{member.phone_number || '-'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-center space-x-2">
                <button
                  onClick={() => onEdit(member)}
                  className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                  title="Edit staff member"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(member)}
                  className="p-2 text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-md transition-colors"
                  title="Delete staff member"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {paginated.length} of {filteredStaff.length} filtered (total {staff.length})
          </span>
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

export default StaffTable;
