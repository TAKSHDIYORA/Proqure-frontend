import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  usersApi,
  UserItem,
  UserRole,
  CreateUserInput,
} from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  X,
  AlertCircle,
  Edit2,
} from "lucide-react";

export const TeamPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("EMPLOYEE");

  const isAdmin = currentUser?.role === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["teamUsers"],
    queryFn: () => usersApi.getUsers(),
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamUsers"] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to create user");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateUser(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamUsers"] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to update user");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamUsers"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to toggle status");
    },
  });

  const closeModal = () => {
    setIsAddOpen(false);
    setEditingUser(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("EMPLOYEE");
    setFormError(null);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("EMPLOYEE");
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setRole(u.role);
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (editingUser) {
      updateMutation.mutate({
        id: editingUser._id || editingUser.id!,
        role,
      });
    } else {
      if (!password || password.length < 6) {
        setFormError("Password must be at least 6 characters");
        return;
      }
      createMutation.mutate({
        fullName,
        email,
        password,
        role,
      });
    }
  };

  const usersList = data?.users || [];

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case "ADMIN":
        return <Badge variant="primary" size="sm">Admin</Badge>;
      case "PROCUREMENT_MANAGER":
        return <Badge variant="info" size="sm">Procurement Manager</Badge>;
      case "PROCUREMENT_OFFICER":
        return <Badge variant="info" size="sm">Procurement Officer</Badge>;
      case "WAREHOUSE_MANAGER":
        return <Badge variant="warning" size="sm">Warehouse Manager</Badge>;
      case "SALES_MANAGER":
        return <Badge variant="success" size="sm">Sales Manager</Badge>;
      case "FINANCE_MANAGER":
        return <Badge variant="default" size="sm">Finance Manager</Badge>;
      default:
        return <Badge variant="default" size="sm">Employee</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-[#11151C] p-12 rounded-xl border border-white/[0.06] text-center max-w-lg mx-auto">
        <ShieldAlert className="w-12 h-12 text-[#F87171] mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#E6E8EB]">Administrator Access Required</h2>
        <p className="text-xs text-[#9AA3AE] mt-1 max-w-md mx-auto">
          Team role allocations and RBAC policy controls are restricted to tenant administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            Team & User Management
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Manage staff accounts, department assignments, and Role-Based Access Control (RBAC).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C83FF] hover:bg-[#6E76FF] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#697381] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-[#9AA3AE] font-medium">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PROCUREMENT_MANAGER">Procurement Manager</option>
            <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
            <option value="WAREHOUSE_MANAGER">Warehouse Manager</option>
            <option value="SALES_MANAGER">Sales Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#11151C] rounded-xl border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <SkeletonLoader variant="table-row" count={5} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members found"
            description="Add department staff and assign operational roles to collaborate on ProQure."
            action={{
              label: "Add Member",
              onClick: openAddModal,
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1218] border-b border-white/[0.05] text-[11px] font-semibold uppercase text-[#697381] tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3">Member Name</th>
                  <th className="px-5 py-3">Email Address</th>
                  <th className="px-5 py-3">Assigned Role</th>
                  <th className="px-5 py-3">Account Status</th>
                  <th className="px-5 py-3">Created Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.map((u) => {
                  const userId = u._id || u.id!;
                  const isCurrent = userId === currentUser?.id;
                  return (
                    <tr
                      key={userId}
                      className="hover:bg-[#161B23] transition-colors group"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#171C24] border border-white/[0.08] text-[#7C83FF] flex items-center justify-center font-bold text-xs">
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[#E6E8EB]">
                              {u.fullName} {isCurrent && <span className="text-[10px] text-[#7C83FF]">(You)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[#9AA3AE]">
                        {u.email}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {u.isActive ? (
                          <Badge variant="success" size="sm">Active</Badge>
                        ) : (
                          <Badge variant="danger" size="sm">Suspended</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[#697381] font-mono tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-[#9AA3AE] hover:text-[#7C83FF] hover:bg-[#171C24] rounded transition-colors"
                          title="Edit Role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!isCurrent && (
                          <button
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: userId,
                                isActive: !u.isActive,
                              })
                            }
                            className={`p-1.5 rounded transition-colors ${
                              u.isActive
                                ? "text-[#697381] hover:text-[#F87171] hover:bg-[#171C24]"
                                : "text-[#4ADE80] hover:bg-[#171C24]"
                            }`}
                            title={u.isActive ? "Suspend Member" : "Activate Member"}
                          >
                            {u.isActive ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Member Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#7C83FF]" />
                <h3 className="font-bold text-[#E6E8EB] text-sm">
                  {editingUser ? "Edit User Permissions" : "Add Organization Member"}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {!editingUser && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                      Initial Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                    />
                  </div>
                </>
              )}

              {editingUser && (
                <div className="bg-[#0F1218] p-3 rounded-lg border border-white/[0.05] text-xs">
                  <div className="font-semibold text-[#E6E8EB]">{editingUser.fullName}</div>
                  <div className="text-[#697381] text-[11px]">{editingUser.email}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Assigned RBAC Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                >
                  <option value="EMPLOYEE">Employee (Base Access)</option>
                  <option value="PROCUREMENT_OFFICER">Procurement Officer (Requisitions & RFQs)</option>
                  <option value="PROCUREMENT_MANAGER">Procurement Manager (Approve PRs & RFQs)</option>
                  <option value="WAREHOUSE_MANAGER">Warehouse Manager (Stock & GRN Receipts)</option>
                  <option value="SALES_MANAGER">Sales Manager (B2B Quotations)</option>
                  <option value="FINANCE_MANAGER">Finance Manager (Audits & Orders)</option>
                  <option value="ADMIN">Organization Administrator (Full Control)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {editingUser
                    ? updateMutation.isPending
                      ? "Saving..."
                      : "Save Role"
                    : createMutation.isPending
                    ? "Adding..."
                    : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
