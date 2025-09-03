# 📋 Expense Admin Pages - UI/UX Specification

Following the established **header → KPI cards → tables → forms** pattern from existing pages.

---

## 1. **Expense Categories & Types Setup Page**

**Route:** `/expense-setup`  
**Access:** Admin, Manager roles only  
**Purpose:** Configure the expense structure - categories and types that feed into the main expense system

---

### 🔹 **Header Section**

```tsx
<div className="bg-white shadow-sm border-b border-gray-200">
  <div className="px-6 py-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expense Setup</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure expense categories and types used throughout the system
        </p>
      </div>
      <div className="flex space-x-3">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
        <button
          className={`px-4 py-2 rounded-lg flex items-center ${
            selectedCategory
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!selectedCategory}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Type
        </button>
      </div>
    </div>
  </div>
</div>
```

---

### 🔹 **KPI Summary Cards**

4 cards in a responsive grid:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-2 bg-blue-100 rounded-lg">
        <FolderIcon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Categories</p>
        <p className="text-2xl font-bold text-gray-900">
          {stats.totalCategories}
        </p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-2 bg-green-100 rounded-lg">
        <TagIcon className="w-6 h-6 text-green-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Expense Types</p>
        <p className="text-2xl font-bold text-gray-900">{stats.totalTypes}</p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-2 bg-purple-100 rounded-lg">
        <ReceiptIcon className="w-6 h-6 text-purple-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Active Types</p>
        <p className="text-2xl font-bold text-gray-900">{stats.activeTypes}</p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-2 bg-orange-100 rounded-lg">
        <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Unused Types</p>
        <p className="text-2xl font-bold text-gray-900">{stats.unusedTypes}</p>
      </div>
    </div>
  </div>
</div>
```

---

### 🔹 **Categories Section**

```tsx
<div className="bg-white rounded-lg shadow mb-8">
  <div className="px-6 py-4 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
    <p className="text-sm text-gray-600">
      Organize your expense types into logical groups
    </p>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Category Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            # of Types
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Created By
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Created Date
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {categories.map((category) => (
          <tr
            key={category.id}
            className={`hover:bg-gray-50 ${
              selectedCategory?.id === category.id ? "bg-blue-50" : ""
            }`}
          >
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="text-sm font-medium text-gray-900">
                  {category.name}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {category.typeCount} types
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {category.createdBy || "System"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDate(category.created_at)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onClick={() => selectCategory(category)}
                className="text-blue-600 hover:text-blue-900 mr-4"
              >
                Select
              </button>
              <button
                onClick={() => editCategory(category)}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCategory(category)}
                className={`${
                  category.typeCount > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-600 hover:text-red-900"
                }`}
                disabled={category.typeCount > 0}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

---

### 🔹 **Expense Types Section**

```tsx
<div className="bg-white rounded-lg shadow">
  <div className="px-6 py-4 border-b border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Expense Types</h3>
        <p className="text-sm text-gray-600">
          {selectedCategory
            ? `Types in "${selectedCategory.name}" category`
            : "Select a category to view types"}
        </p>
      </div>
      {selectedCategory && (
        <div className="flex items-center space-x-2">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      )}
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Category
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Detail Table
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            # Expenses Logged
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredTypes.map((type) => (
          <tr key={type.type_id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {type.type_name}
              </div>
              <div className="text-sm text-gray-500">{type.description}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {type.category_name}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                {type.detail_table}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {type.expense_count || 0}
              </div>
              {type.expense_count > 0 && (
                <div className="text-xs text-gray-500">
                  Last used {type.last_used}
                </div>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  type.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {type.status || "active"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onClick={() => editType(type)}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                Edit
              </button>
              <button
                onClick={() => toggleTypeStatus(type)}
                className="text-orange-600 hover:text-orange-900 mr-4"
              >
                {type.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => deleteType(type)}
                className={`${
                  type.expense_count > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-600 hover:text-red-900"
                }`}
                disabled={type.expense_count > 0}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {!selectedCategory && (
    <div className="px-6 py-12 text-center">
      <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No category selected
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Select a category from above to view and manage its expense types.
      </p>
    </div>
  )}
</div>
```

---

### 🔹 **Add/Edit Category Modal**

```tsx
<Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
  <div className="bg-white px-6 py-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {editingCategory ? "Edit Category" : "Add New Category"}
      </h3>
      <button onClick={() => setShowCategoryModal(false)}>
        <XMarkIcon className="w-6 h-6 text-gray-400" />
      </button>
    </div>

    <form onSubmit={handleCategorySubmit}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            value={categoryForm.name}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, name: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Operations, Utilities"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={categoryForm.description}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Brief description of this category..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <button
          type="button"
          onClick={() => setShowCategoryModal(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!categoryForm.name.trim() || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : editingCategory ? "Update" : "Create"}{" "}
          Category
        </button>
      </div>
    </form>
  </div>
</Modal>
```

---

### 🔹 **Add/Edit Type Modal**

```tsx
<Modal isOpen={showTypeModal} onClose={() => setShowTypeModal(false)}>
  <div className="bg-white px-6 py-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {editingType ? "Edit Expense Type" : "Add New Expense Type"}
      </h3>
      <button onClick={() => setShowTypeModal(false)}>
        <XMarkIcon className="w-6 h-6 text-gray-400" />
      </button>
    </div>

    <form onSubmit={handleTypeSubmit}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type Name *
          </label>
          <input
            type="text"
            value={typeForm.type_name}
            onChange={(e) =>
              setTypeForm({ ...typeForm, type_name: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Fuel, Laboratory, Payroll"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={typeForm.category_id}
            onChange={(e) =>
              setTypeForm({
                ...typeForm,
                category_id: parseInt(e.target.value),
              })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={typeForm.description}
            onChange={(e) =>
              setTypeForm({ ...typeForm, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="What this expense type covers..."
          />
        </div>

        {/* Detail Table Preview */}
        {typeForm.type_name && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Detail Table Mapping
            </h4>
            <div className="text-sm text-gray-600">
              This expense type will use:{" "}
              <span className="font-mono bg-white px-2 py-1 rounded">
                {getDetailTableForType(typeForm.type_name)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <button
          type="button"
          onClick={() => setShowTypeModal(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            !typeForm.type_name.trim() || !typeForm.category_id || loading
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : editingType ? "Update" : "Create"} Type
        </button>
      </div>
    </form>
  </div>
</Modal>
```

---

## 2. **Assets Management Page**

**Route:** `/assets`  
**Access:** Admin, Manager, Staff (read-only for Staff)  
**Purpose:** Manage company assets for depreciation tracking

---

### 🔹 **Header Section**

```tsx
<div className="bg-white shadow-sm border-b border-gray-200">
  <div className="px-6 py-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assets Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Track company assets and calculate depreciation automatically
        </p>
      </div>
      <div className="flex space-x-3">
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
          <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
          Export CSV
        </button>
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
          <DocumentTextIcon className="w-4 h-4 mr-2" />
          Export PDF
        </button>
        <button
          onClick={() => setShowAddAssetModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </button>
      </div>
    </div>
  </div>
</div>
```

---

### 🔹 **KPI Summary Cards**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-2 bg-blue-100 rounded-lg">
        <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Total Assets</p>
        <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
        <p className="text-xs text-gray-500 mt-1">
          {stats.activeAssets} active, {stats.disposedAssets} disposed
        </p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-2 bg-green-100 rounded-lg">
        <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Total Asset Value</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(stats.totalCost)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Original purchase cost</p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-2 bg-purple-100 rounded-lg">
        <TrendingDownIcon className="w-6 h-6 text-purple-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Current Book Value</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(stats.totalBookValue)}
        </p>
        <p className="text-xs text-gray-500 mt-1">After depreciation</p>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="p-2 bg-orange-100 rounded-lg">
        <CalendarIcon className="w-6 h-6 text-orange-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">
          This Month Depreciation
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(stats.monthlyDepreciation)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {stats.fullyDepreciatedCount} fully depreciated
        </p>
      </div>
    </div>
  </div>
</div>
```

---

### 🔹 **Assets Table**

```tsx
<div className="bg-white rounded-lg shadow">
  <div className="px-6 py-4 border-b border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Company Assets</h3>
        <p className="text-sm text-gray-600">
          Manage and track asset depreciation
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Assets</option>
            <option value="active">Active Only</option>
            <option value="disposed">Disposed</option>
            <option value="fully_depreciated">Fully Depreciated</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <SearchIcon className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-64"
          />
        </div>
      </div>
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Asset Details
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Purchase Info
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Depreciation
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Current Value
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredAssets.map((asset) => (
          <tr key={asset.asset_id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {asset.asset_name}
                  </div>
                  {asset.asset_code && (
                    <div className="text-sm text-gray-500">
                      Code: {asset.asset_code}
                    </div>
                  )}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-900">
                {formatCurrency(asset.cost)}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(asset.purchase_date)}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-900">
                {asset.useful_life_years} years
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {asset.depreciation_method.replace("_", " ")}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(asset.book_value)}
              </div>
              <div className="text-sm text-gray-500">
                {formatCurrency(asset.total_depreciation)} depreciated
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(asset.total_depreciation / asset.cost) * 100}%`,
                  }}
                ></div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  asset.status === "active"
                    ? "bg-green-100 text-green-800"
                    : asset.status === "disposed"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {asset.status}
              </span>
              {asset.book_value <= 0 && (
                <div className="text-xs text-orange-600 mt-1">
                  Fully depreciated
                </div>
              )}
            </td>
            <td className="px-6 py-4 text-right text-sm font-medium">
              <button
                onClick={() => viewAssetDetails(asset)}
                className="text-blue-600 hover:text-blue-900 mr-4"
              >
                View
              </button>
              <button
                onClick={() => editAsset(asset)}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                Edit
              </button>
              <button
                onClick={() => calculateDepreciation(asset)}
                className="text-green-600 hover:text-green-900 mr-4"
              >
                Depreciate
              </button>
              <button
                onClick={() => deleteAsset(asset)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {filteredAssets.length === 0 && (
    <div className="px-6 py-12 text-center">
      <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No assets found
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by adding your first company asset.
      </p>
      <button
        onClick={() => setShowAddAssetModal(true)}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Add Asset
      </button>
    </div>
  )}
</div>
```

---

### 🔹 **Add/Edit Asset Modal**

```tsx
<Modal
  isOpen={showAssetModal}
  onClose={() => setShowAssetModal(false)}
  size="large"
>
  <div className="bg-white px-6 py-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {editingAsset ? "Edit Asset" : "Add New Asset"}
      </h3>
      <button onClick={() => setShowAssetModal(false)}>
        <XMarkIcon className="w-6 h-6 text-gray-400" />
      </button>
    </div>

    <form onSubmit={handleAssetSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Name *
          </label>
          <input
            type="text"
            value={assetForm.asset_name}
            onChange={(e) =>
              setAssetForm({ ...assetForm, asset_name: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Forklift, Generator, Office Building"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Code
          </label>
          <input
            type="text"
            value={assetForm.asset_code}
            onChange={(e) =>
              setAssetForm({ ...assetForm, asset_code: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., FLT-001, GEN-002"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Date *
          </label>
          <input
            type="date"
            value={assetForm.purchase_date}
            onChange={(e) =>
              setAssetForm({ ...assetForm, purchase_date: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Cost (UGX) *
          </label>
          <input
            type="number"
            value={assetForm.cost}
            onChange={(e) =>
              setAssetForm({ ...assetForm, cost: parseFloat(e.target.value) })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Useful Life (Years) *
          </label>
          <input
            type="number"
            value={assetForm.useful_life_years}
            onChange={(e) =>
              setAssetForm({
                ...assetForm,
                useful_life_years: parseInt(e.target.value),
              })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="5"
            min="1"
            max="50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Depreciation Method *
          </label>
          <select
            value={assetForm.depreciation_method}
            onChange={(e) =>
              setAssetForm({
                ...assetForm,
                depreciation_method: e.target.value,
              })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="straight_line">Straight Line</option>
            <option value="declining_balance">Declining Balance</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={assetForm.notes}
          onChange={(e) =>
            setAssetForm({ ...assetForm, notes: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Additional notes about this asset..."
        />
      </div>

      {/* Depreciation Preview */}
      {assetForm.cost > 0 && assetForm.useful_life_years > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Depreciation Preview
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Annual Depreciation:</span>
              <div className="font-medium">
                {formatCurrency(assetForm.cost / assetForm.useful_life_years)}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Monthly Depreciation:</span>
              <div className="font-medium">
                {formatCurrency(
                  assetForm.cost / assetForm.useful_life_years / 12
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Salvage Value:</span>
              <div className="font-medium">UGX 0</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-8">
        <button
          type="button"
          onClick={() => setShowAssetModal(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            !assetForm.asset_name.trim() ||
            !assetForm.cost ||
            !assetForm.useful_life_years ||
            loading
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : editingAsset ? "Update" : "Create"} Asset
        </button>
      </div>
    </form>
  </div>
</Modal>
```

---

### 🔹 **Asset Detail Page/Modal**

```tsx
<Modal
  isOpen={showAssetDetails}
  onClose={() => setShowAssetDetails(false)}
  size="extra-large"
>
  <div className="bg-white px-6 py-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Asset Details: {selectedAsset?.asset_name}
      </h3>
      <button onClick={() => setShowAssetDetails(false)}>
        <XMarkIcon className="w-6 h-6 text-gray-400" />
      </button>
    </div>

    {selectedAsset && (
      <div className="space-y-8">
        {/* Asset Summary Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600">Purchase Cost</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(selectedAsset.cost)}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(selectedAsset.purchase_date)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Book Value</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(selectedAsset.book_value)}
              </div>
              <div className="text-sm text-gray-500">
                {(
                  (selectedAsset.book_value / selectedAsset.cost) *
                  100
                ).toFixed(1)}
                % remaining
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Depreciation</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(selectedAsset.total_depreciation)}
              </div>
              <div className="text-sm text-gray-500">
                {selectedAsset.useful_life_years} year life
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAsset.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedAsset.status}
              </span>
              <div className="text-sm text-gray-500 capitalize">
                {selectedAsset.depreciation_method.replace("_", " ")}
              </div>
            </div>
          </div>
        </div>

        {/* Depreciation Schedule */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">
              Depreciation Schedule
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Opening Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Depreciation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Closing Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedAsset.depreciation_schedule?.map((year) => (
                  <tr
                    key={year.year}
                    className={year.is_current ? "bg-blue-50" : ""}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {year.year}
                      {year.is_current && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(year.opening_value)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(year.depreciation)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(year.closing_value)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          year.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : year.status === "current"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {year.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Depreciation Entries */}
        {selectedAsset.recent_depreciation?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">
                Recent Depreciation Entries
              </h4>
            </div>
            <div className="divide-y divide-gray-200">
              {selectedAsset.recent_depreciation.map((entry) => (
                <div
                  key={entry.dep_id}
                  className="px-6 py-4 flex justify-between items-center"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(entry.depreciation_amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Period: {formatDate(entry.period)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(entry.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => calculateDepreciation(selectedAsset)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Calculate Depreciation
          </button>
          <button
            onClick={() => editAsset(selectedAsset)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Asset
          </button>
        </div>
      </div>
    )}
  </div>
</Modal>
```

---

## 🎯 **Integration Points**

### **With Main Expense System:**

1. **Expense Types Dropdown** → Pulls from `expense_types` table
2. **Category Filtering** → Uses `expense_categories` relationships
3. **Depreciation Expenses** → Links to `assets` table via `expense_depreciation`

### **API Endpoints Used:**

- `GET /api/expense-categories` → Categories table
- `GET /api/expense-types` → Types table with stats
- `GET /api/assets` → Assets table with depreciation
- `GET /api/assets/:id/depreciation` → Calculate depreciation

### **Key Features:**

- **Real-time validation** → Prevent deletion of categories/types in use
- **Automatic mapping** → Show which detail table each type uses
- **Depreciation automation** → Calculate and create expense entries
- **Export functionality** → CSV/PDF reports for auditing
- **Role-based permissions** → Admin setup, staff read-only

This completes the expense management ecosystem with proper admin configuration and asset tracking! 🎉
