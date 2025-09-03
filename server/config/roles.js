// Central definition of system roles and their permissions
module.exports = {
  roles: ['admin', 'manager', 'staff', 'viewer'],

  permissions: {
    petty_cash: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager', 'staff'],
      update: ['admin', 'manager', 'staff'],
      delete: ['admin']
    },
    fruit_deliveries: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager', 'staff'],
      update: ['admin', 'manager', 'staff'],
      delete: ['admin']
    },
    misc_expenses: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager', 'staff'],
      update: ['admin', 'manager', 'staff'],
      delete: ['admin']
    },
    casual_staff_salary: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager', 'staff'],
      update: ['admin', 'manager', 'staff'],
      delete: ['admin']
    },
    oil_extraction_logs: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager', 'staff'],
      update: ['admin', 'manager', 'staff'],
      delete: ['admin']
    },
    staff: {
      read: ['admin', 'manager'],
      create: ['admin', 'manager'],
      update: ['admin', 'manager'],
      delete: ['admin']
    },
    // Roles management (used by server/routes/rolesRoutes.js)
    roles: {
      read: ['admin', 'manager'],
      create: ['admin', 'manager'],
      update: ['admin', 'manager'],
      delete: ['admin']
    },
    shifts: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager'],
      update: ['admin', 'manager'],
      delete: ['admin']
    },
    approvers: {
      read: ['admin'],
      create: ['admin'],
      update: ['admin'],
      delete: ['admin']
    },
    expense_categories: {
      read: ['admin'],
      create: ['admin'],
      update: ['admin'],
      delete: ['admin']
    },
    reports: {
      view: ['admin', 'manager', 'viewer']
    },
    expense_categories: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager'],
      update: ['admin', 'manager'],
      delete: ['admin']
    },
    expense_types: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager'],
      update: ['admin', 'manager'],
      delete: ['admin']
    },
    expenses: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager', 'staff'],
      update: ['admin', 'manager', 'staff'],
      delete: ['admin', 'manager']
    },
    assets: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager'],
      update: ['admin', 'manager'],
      delete: ['admin']
    },
    suppliers: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager', 'staff'],
      update: ['admin', 'manager', 'staff'],
      delete: ['admin', 'manager']
    },
    fruits: {
      read: ['admin', 'manager', 'staff', 'viewer'],
      create: ['admin', 'manager', 'staff'],
      update: ['admin', 'manager', 'staff'],
      delete: ['admin', 'manager']
    }
  }
};
