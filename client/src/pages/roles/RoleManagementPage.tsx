// Roles Management Page
import React, { useEffect, useState } from 'react';
import { Plus, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { rolesApi, type Role as ApiRole } from '../../lib/services/rolesApi';
import { SummaryCard } from '../../components/premium/SummaryCard';
import RoleTable from './RoleTable';
import RoleFormModal from './RoleFormModal';
import DeleteRoleModal from './DeleteRoleModal';
import type { Role, RoleFormData } from './types';

const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // KPI stats (basic for now)
  const [totalRoles, setTotalRoles] = useState<number>(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const mapApiRole = (r: ApiRole): Role => ({
    role_name: r.role_name,
    base_daily_rate: Number(r.base_daily_rate),
  });

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await rolesApi.getAllRoles();
      const mapped = (res || []).map(mapApiRole);
      setRoles(mapped);
      setTotalRoles(mapped.length);
    } catch (e) {
      showError('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data: RoleFormData) => {
    setModalLoading(true);
    try {
      await rolesApi.createRole({
        role_name: data.role_name.trim(),
        base_daily_rate: Number(data.base_daily_rate),
      });
      showSuccess('Role created');
      setShowAddModal(false);
      await loadRoles();
    } catch (e: any) {
      showError(e?.message || 'Failed to create role');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleUpdate = async (data: RoleFormData) => {
    if (!selectedRole) return;
    setModalLoading(true);
    try {
      await rolesApi.updateRole(selectedRole.role_name, {
        base_daily_rate: Number(data.base_daily_rate),
      });
      showSuccess('Role updated');
      setShowEditModal(false);
      setSelectedRole(null);
      await loadRoles();
    } catch (e: any) {
      showError(e?.message || 'Failed to update role');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;
    setModalLoading(true);
    try {
      await rolesApi.deleteRole(selectedRole.role_name);
      showSuccess('Role deleted');
      setShowDeleteModal(false);
      setSelectedRole(null);
      await loadRoles();
    } catch (e: any) {
      showError(e?.message || 'Failed to delete role');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-800">
                Roles Management
              </h1>
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Manage roles and base daily rates for shifts and salary calculations.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Roles"
            value={String(totalRoles)}
            change=""
            changeType="neutral"
            icon={Users}
            description="Configured roles"
            className="col-span-1"
          />
          <SummaryCard
            title="Avg Daily Rate"
            value={roles.length ? (roles.reduce((s, r) => s + Number(r.base_daily_rate || 0), 0) / roles.length).toFixed(0) : '0'}
            change=""
            changeType="neutral"
            icon={DollarSign}
            description="Average of base rates"
            className="col-span-1"
          />
          <SummaryCard
            title="Recent Changes"
            value={"-"}
            change=""
            changeType="neutral"
            icon={TrendingUp}
            description="Last 30 days"
            className="col-span-1"
          />
        </div>

        {/* Roles Table */}
        <RoleTable
          roles={roles}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Add Modal */}
        <RoleFormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={modalLoading}
        />

        {/* Edit Modal */}
        <RoleFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          onSave={handleUpdate}
          role={selectedRole}
          loading={modalLoading}
        />

        {/* Delete Modal */}
        <DeleteRoleModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedRole(null);
          }}
          onConfirm={handleConfirmDelete}
          role={selectedRole}
          loading={modalLoading}
        />
      </div>
    </div>
  );
};

export default RoleManagementPage;
