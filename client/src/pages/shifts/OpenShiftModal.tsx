// src/pages/shifts/OpenShiftModal.tsx

import React, { useState, useEffect } from 'react';
import { Staff } from './types';

interface Props {
  staff: Staff[];
  onClose: () => void;
  onSave: (staffId: number, startTime: string, role: string) => void;
  loading?: boolean;
  roles: string[];
}

const OpenShiftModal = ({ staff, onClose, onSave, loading = false, roles }: Props) => {
  const [selectedStaffId, setSelectedStaffId] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState('');
  const [startTime, setStartTime] = useState('');

  // Set default start time to current time
  useEffect(() => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setStartTime(localDateTime);
  }, []);

  const handleSubmit = () => {
    if (selectedStaffId && startTime && selectedRole) {
      onSave(selectedStaffId as number, startTime, selectedRole);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
        <h3 className="text-lg font-bold mb-6 text-gray-800">Open Shift</h3>
        
        {/* Staff Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Staff</label>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="">Select a staff member...</option>
            {staff.map((member) => (
              <option key={member.staff_id} value={member.staff_id}>
                {member.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Role (Dropdown Selection) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="">Select role for this shift...</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Start Time */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedStaffId || !startTime || !selectedRole || loading}
            className="bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Starting...' : 'Start Shift'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenShiftModal;
