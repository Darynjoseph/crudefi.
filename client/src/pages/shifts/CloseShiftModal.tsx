// src/pages/shifts/CloseShiftModal.tsx

import React, { useState, useEffect } from 'react';
import type { Shift } from './types';

interface Props {
  shift: Shift;
  onClose: () => void;
  onSave: (shift: Shift, logoutTime: string, deductionReason?: string) => void;
  loading?: boolean;
}

const CloseShiftModal = ({ shift, onClose, onSave, loading = false }: Props) => {
  const [deductionReason, setDeductionReason] = useState('');
  const [logoutTime, setLogoutTime] = useState('');
  const [computedHours, setComputedHours] = useState(0);

  // Set default logout time to current time
  useEffect(() => {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setLogoutTime(localDateTime);
  }, []);

  // Calculate hours dynamically when logout time changes
  useEffect(() => {
    if (logoutTime && shift.login_time) {
      const startTimeStr = shift.login_time;
      const start = new Date(startTimeStr);
      const end = new Date(logoutTime);
      const totalHours = Math.abs(end.getTime() - start.getTime()) / 36e5;
      let hoursWithBreak = Math.max(0, totalHours - 1); // Subtract 1 hour break
      
      // Cap at 10 hours maximum
      if (hoursWithBreak > 10) hoursWithBreak = 10;
      
      // If less than 1 hour, set to 0
      if (hoursWithBreak < 1) hoursWithBreak = 0;
      
      setComputedHours(Number(hoursWithBreak.toFixed(2)));
    }
  }, [logoutTime, shift.login_time]);

  const handleSave = () => {
    if (logoutTime) {
      onSave(shift, logoutTime, computedHours < 10 ? deductionReason : undefined);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[450px]">
        <h3 className="text-lg font-bold mb-6 text-gray-800">Close Shift</h3>
        
        {/* Staff Name (Read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Staff Name</label>
          <input
            type="text"
            value={shift.staff_name || 'Unknown Staff'}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
        </div>

        {/* Logout Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Logout Time</label>
          <input
            type="datetime-local"
            value={logoutTime}
            onChange={(e) => setLogoutTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Computed Hours (Read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Computed Hours</label>
          <input
            type="text"
            value={`${computedHours} hours${computedHours === 10 ? ' (capped at 10)' : computedHours === 0 ? ' (less than 1 hour)' : ''}`}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            (Logout time - Login time) - 1 hour break • Max 10 hours • Less than 1 hour = 0 hours
          </p>
        </div>

        {/* Deduction Reason (visible only if hours < 10) */}
        {computedHours < 10 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deduction Reason <span className="text-accent-500">*</span>
            </label>
            <textarea
              value={deductionReason}
              onChange={(e) => setDeductionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Please explain why the shift is less than 10 hours..."
              required
            />
          </div>
        )}

        {/* Summary Info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Login:</strong> {formatDateTime(shift.login_time || '')}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Logout:</strong> {logoutTime ? formatDateTime(logoutTime) : 'Not set'}
          </p>
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
            onClick={handleSave}
            disabled={!logoutTime || (computedHours < 10 && !deductionReason.trim()) || loading}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Closing...' : 'Close Shift'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseShiftModal;
