"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Users,
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  UserCheck,
  UserX,
  X,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Plus,
  Check,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  settingsService,
  User,
  Role,
  Permissions,
  USER_MODULES,
  USER_PERMISSION_ACTIONS,
} from "@/services/settings.service";

// Status Badge
const StatusBadge = ({ status }: { status: "active" | "inactive" }) => {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
        status === "active"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
};

// Role Badge
const RoleBadge = ({ role }: { role: string }) => {
  const styles: Record<string, string> = {
    Admin: "bg-red-50 text-red-600",
    Manager: "bg-blue-50 text-blue-600",
    Accountant: "bg-green-50 text-green-600",
    "Support Staff": "bg-gray-100 text-gray-600",
    "Viewer / Auditor": "bg-purple-50 text-purple-600",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${styles[role] || "bg-gray-50 text-gray-600"}`}
    >
      {role}
    </span>
  );
};

// Action Dropdown
const ActionDropdown = ({ onEdit, onDelete, onToggleStatus, status }: any) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-[var(--color-surface-soft)] transition-all"
      >
        <MoreVertical size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-8 z-50 w-40 bg-white border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden"
          >
            <button
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-[var(--color-surface-soft)] flex items-center gap-2"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={() => {
                onToggleStatus();
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-[var(--color-surface-soft)] flex items-center gap-2"
            >
              {status === "active" ? (
                <UserX size={14} />
              ) : (
                <UserCheck size={14} />
              )}
              {status === "active" ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Permission Checkbox
const PermissionCheckbox = ({ checked, onChange, disabled }: any) => (
  <label className="flex justify-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] disabled:opacity-50"
    />
  </label>
);

export const UsersRolesSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "Support Staff",
    status: "active" as "active" | "inactive",
  });

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: {} as Permissions,
  });

  const [showPassword, setShowPassword] = useState(false);
  const itemsPerPage = 10;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, rolesRes] = await Promise.all([
          settingsService.getUsers(),
          settingsService.getRoles(),
        ]);
        setUsers(usersRes);
        setRoles(rolesRes);
        if (rolesRes.length > 0 && !selectedRole) {
          setSelectedRole(rolesRes[0]);
          setRoleForm({
            name: rolesRes[0].name,
            description: rolesRes[0].description,
            permissions: rolesRes[0].permissions,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load users and roles");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // User handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: "",
      email: "",
      role: "Support Staff",
      status: "active",
    });
    setIsUserDrawerOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsUserDrawerOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    try {
      const response = await settingsService.deleteUser(user.id);
      toast.success(response.message);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const response = await settingsService.toggleUserStatus(
        user.id,
        user.status,
      );
      toast.success(response.message);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: response.newStatus } : u,
        ),
      );
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setSaving(true);
      if (editingUser) {
        const response = await settingsService.updateUser(
          editingUser.id,
          userForm,
        );
        toast.success(response.message);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id ? { ...u, ...userForm } : u,
          ),
        );
      } else {
        const response = await settingsService.createUser(userForm);
        toast.success(response.message);
        setUsers((prev) => [response.user, ...prev]);
      }
      setIsUserDrawerOpen(false);
    } catch (error) {
      toast.error("Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  // Role handlers
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: JSON.parse(JSON.stringify(role.permissions)),
    });
  };

  const handleAddRole = () => {
    setEditingRole(null);
    const emptyPermissions = {} as Permissions;
    USER_MODULES.forEach((module) => {
      emptyPermissions[module.id] = {
        view: false,
        create: false,
        edit: false,
        delete: false,
        export: false,
        settings: false,
      };
    });
    setRoleForm({ name: "", description: "", permissions: emptyPermissions });
    setIsRoleDrawerOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: JSON.parse(JSON.stringify(role.permissions)),
    });
    setIsRoleDrawerOpen(true);
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isDefault) {
      toast.error("Cannot delete default roles!");
      return;
    }
    if (!confirm(`Are you sure you want to delete ${role.name}?`)) return;
    try {
      const response = await settingsService.deleteRole(role.id);
      toast.success(response.message);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      if (selectedRole?.id === role.id) {
        setSelectedRole(roles[0]);
      }
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  const handlePermissionChange = (
    moduleId: string,
    actionId: string,
    value: boolean,
  ) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: {
          ...prev.permissions[moduleId],
          [actionId]: value,
        },
      },
    }));
  };

  const handleSaveRole = async () => {
    if (!roleForm.name) {
      toast.error("Please enter role name");
      return;
    }
    try {
      setSaving(true);
      if (editingRole) {
        const response = await settingsService.updateRole(editingRole.id, {
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions,
        });
        toast.success(response.message);
        setRoles((prev) =>
          prev.map((r) =>
            r.id === editingRole.id
              ? { ...r, ...roleForm, permissions: roleForm.permissions }
              : r,
          ),
        );
        if (selectedRole?.id === editingRole.id) {
          setSelectedRole({
            ...selectedRole,
            ...roleForm,
            permissions: roleForm.permissions,
          });
        }
      } else {
        const response = await settingsService.createRole(roleForm);
        toast.success(response.message);
        setRoles((prev) => [...prev, response.role]);
      }
      setIsRoleDrawerOpen(false);
    } catch (error) {
      toast.error("Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      const response = await settingsService.updateRolePermissions(
        selectedRole.id,
        roleForm.permissions,
      );
      toast.success(response.message);
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id
            ? { ...r, permissions: roleForm.permissions }
            : r,
        ),
      );
      setSelectedRole({ ...selectedRole, permissions: roleForm.permissions });
    } catch (error) {
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  const TableSkeleton = () => (
    <div className="space-y-3">
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-28 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-surface)] p-8 md:p-10 rounded-[28px] border border-[var(--color-border)] shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <Users className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-[var(--color-text-primary)]">
                Users & Roles
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Manage admin office users and their access permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "users"
                ? "bg-[var(--color-primary)] text-white shadow-md"
                : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)]"
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "roles"
                ? "bg-[var(--color-primary)] text-white shadow-md"
                : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)]"
            }`}
          >
            <Shield size={16} className="inline mr-2" />
            Roles & Permissions
          </button>
        </div>

        {/* USERS TAB */}
        {activeTab === "users" && (
          <>
            {/* Search and Add */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input w-full pl-10 py-2.5 text-sm"
                />
              </div>
              <button
                onClick={handleAddUser}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
              >
                <UserPlus size={18} />
                Add User
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <TableSkeleton />
              ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-16">
                  <Users size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-semibold text-gray-400">
                    No users found
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-[var(--color-surface-soft)] rounded-xl">
                    <tr className="text-[11px] uppercase font-black text-[var(--color-text-muted)] tracking-wider">
                      <th className="px-4 py-4 rounded-l-xl">User Name</th>
                      <th className="px-4 py-4">Email / Login</th>
                      <th className="px-4 py-4">Role</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Last Login</th>
                      <th className="px-4 py-4 rounded-r-xl text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-[var(--color-surface-soft)]/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-[var(--color-text-primary)]">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                          {user.lastLogin}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ActionDropdown
                            onEdit={() => handleEditUser(user)}
                            onDelete={() => handleDeleteUser(user)}
                            onToggleStatus={() => handleToggleUserStatus(user)}
                            status={user.status}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {filteredUsers.length > itemsPerPage && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)}{" "}
                  of {filteredUsers.length} users
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="p-2 rounded-lg border border-[var(--color-border)] disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold ${
                        currentPage === page
                          ? "bg-[var(--color-primary)] text-white"
                          : "hover:bg-[var(--color-surface-soft)]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="p-2 rounded-lg border border-[var(--color-border)] disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ROLES & PERMISSIONS TAB */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
            {/* Roles List */}
            <div className="lg:col-span-1 mt-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                  All Roles
                </h4>
                <button
                  onClick={handleAddRole}
                  className="text-[var(--color-primary)] text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Role
                </button>
              </div>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedRole?.id === role.id
                        ? "bg-[var(--color-primary)]/5 border-2 border-[var(--color-primary)]"
                        : "bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[var(--color-text-primary)]">
                          {role.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {role.description}
                        </p>
                      </div>
                      {!role.isDefault && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRole(role);
                            }}
                            className="p-1.5 rounded-lg hover:bg-white"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role);
                            }}
                            className="p-1.5 rounded-lg hover:bg-white text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="lg:col-span-2">
              {selectedRole && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                      Permissions for:{" "}
                      <span className="text-[var(--color-primary)]">
                        {selectedRole.name}
                      </span>
                    </h4>
                    <button
                      onClick={handleSavePermissions}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Permissions
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[var(--color-surface-soft)]">
                          <th className="p-3 text-xs font-bold text-[var(--color-text-primary)]">
                            Module
                          </th>
                          {USER_PERMISSION_ACTIONS.map((action) => (
                            <th
                              key={action.id}
                              className={`p-3 text-center text-[10px] font-bold text-[var(--color-text-muted)] uppercase ${action.width}`}
                            >
                              {action.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {USER_MODULES.map((module) => (
                          <tr
                            key={module.id}
                            className="hover:bg-[var(--color-surface-soft)]/50"
                          >
                            <td className="p-3 font-medium text-sm">
                              {module.name}
                            </td>
                            {USER_PERMISSION_ACTIONS.map((action) => (
                              <td key={action.id} className="p-3 text-center">
                                {action.id === "settings" &&
                                !module.hasSettings ? (
                                  <span className="text-gray-300">—</span>
                                ) : (
                                  <PermissionCheckbox
                                    checked={
                                      roleForm.permissions[module.id]?.[
                                        action.id
                                      ] || false
                                    }
                                    onChange={(val: boolean) =>
                                      handlePermissionChange(
                                        module.id,
                                        action.id,
                                        val,
                                      )
                                    }
                                    disabled={
                                      selectedRole.isDefault &&
                                      selectedRole.name === "Admin"
                                    }
                                  />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit User Drawer */}
      <AnimatePresence>
        {isUserDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-surface)] shadow-2xl z-50 border-l border-[var(--color-border)] overflow-y-auto"
            >
              <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-surface)]">
                <h2 className="text-xl font-bold">
                  {editingUser ? "Edit User" : "Add New User"}
                </h2>
                <button
                  onClick={() => setIsUserDrawerOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--color-bg)]"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase block mb-1">
                    User Name
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    className="input w-full py-2.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase block mb-1">
                    Email / Login
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    placeholder="user@example.com"
                    className="input w-full py-2.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase block mb-1">
                    Role
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) =>
                      setUserForm({ ...userForm, role: e.target.value })
                    }
                    className="input w-full py-2.5"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase block mb-1">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={userForm.status === "active"}
                        onChange={() =>
                          setUserForm({ ...userForm, status: "active" })
                        }
                        className="accent-[var(--color-primary)]"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={userForm.status === "inactive"}
                        onChange={() =>
                          setUserForm({ ...userForm, status: "inactive" })
                        }
                        className="accent-[var(--color-primary)]"
                      />
                      <span className="text-sm">Inactive</span>
                    </label>
                  </div>
                </div>
                {!editingUser && (
                  <div className="pt-4 border-t border-[var(--color-border)]">
                    <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase block mb-3">
                      Password Setup
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]">
                      <input
                        type="radio"
                        name="passwordSetup"
                        defaultChecked
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-bold">
                          Send invite link to email
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          User will create password using email invite
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-[var(--color-border)] flex gap-3 sticky bottom-0 bg-[var(--color-surface)]">
                <button
                  onClick={() => setIsUserDrawerOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-[var(--color-border)] rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={saving}
                  className="flex-1 btn-primary py-2.5 rounded-xl font-bold"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Create User"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add/Edit Role Drawer */}
      <AnimatePresence>
        {isRoleDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRoleDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-[var(--color-surface)] shadow-2xl z-50 border-l border-[var(--color-border)] overflow-y-auto"
            >
              <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-surface)]">
                <h2 className="text-xl font-bold">
                  {editingRole ? "Edit Role" : "Add New Role"}
                </h2>
                <button
                  onClick={() => setIsRoleDrawerOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--color-bg)]"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase block mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, name: e.target.value })
                    }
                    placeholder="e.g., Supervisor, Auditor"
                    className="input w-full py-2.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase block mb-1">
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, description: e.target.value })
                    }
                    placeholder="Brief description of this role"
                    rows={3}
                    className="input w-full py-2.5 resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-[var(--color-border)] flex gap-3 sticky bottom-0 bg-[var(--color-surface)]">
                <button
                  onClick={() => setIsRoleDrawerOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-[var(--color-border)] rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  disabled={saving}
                  className="flex-1 btn-primary py-2.5 rounded-xl font-bold"
                >
                  {saving
                    ? "Saving..."
                    : editingRole
                      ? "Update Role"
                      : "Create Role"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
