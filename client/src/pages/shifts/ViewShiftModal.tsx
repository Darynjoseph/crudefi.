// src/pages/shifts/ViewShiftModal.tsx

import React from 'react';
import type { Shift } from './types';

interface Props {
  shift: Shift;
  onClose: () => void;
}

const ViewShiftModal = ({ shift, onClose }: Props) => {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-[450px]">
        <h3 className="text-lg font-bold mb-4">View Shift Details</h3>
        <div className="space-y-2">
          <p><strong>Staff:</strong> {shift.staff_name || shift.staffName}</p>
          <p><strong>Role:</strong> {shift.role}</p>
          <p><strong>Date:</strong> {shift.date || 'N/A'}</p>
          <p><strong>Login Time:</strong> {formatDateTime(shift.login_time || shift.startTime)}</p>
          <p><strong>Logout Time:</strong> {formatDateTime(shift.logout_time || shift.endTime)}</p>
          <p><strong>Hours Worked:</strong> {shift.actual_hours || shift.computedHours || 'N/A'}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              (shift.shift_status || shift.status) === 'Open' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {shift.shift_status || shift.status}
            </span>
          </p>
          <p><strong>Deduction Reason:</strong> {shift.deduction_reason || shift.deductionReason || '-'}</p>
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewShiftModal;
