import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseApi } from "../../api/warehouses";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  MapPin,
  AlertCircle,
  X,
  Building,
} from "lucide-react";

export const WarehousesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New warehouse form state
  const [name, setName] = useState("");
  const [locationCode, setLocationCode] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [postalCode, setPostalCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const canManage = user?.role === "ADMIN" || user?.role === "WAREHOUSE_MANAGER";

  const { data, isLoading } = useQuery({
    queryKey: ["warehouses", statusFilter, search],
    queryFn: () =>
      warehouseApi.getWarehouses({
        status: statusFilter || undefined,
        search: search || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: warehouseApi.createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to create warehouse");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" }) =>
      warehouseApi.updateWarehouseStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });

  const resetForm = () => {
    setName("");
    setLocationCode("");
    setStreet("");
    setCity("");
    setState("");
    setCountry("India");
    setPostalCode("");
    setFormError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    createMutation.mutate({
      name,
      locationCode,
      address: { street, city, state, country, postalCode },
    });
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            Warehouses & Storage Hubs
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Manage your physical distribution facilities, fulfilment nodes, and stock reception locations.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Warehouse Hub</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#697381] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-[#9AA3AE] font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#7C83FF] transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Warehouse Grid */}
      {isLoading ? (
        <SkeletonLoader variant="card" count={3} />
      ) : data?.warehouses && data.warehouses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.warehouses.map((wh) => (
            <div
              key={wh._id}
              className="bg-[#11151C] rounded-xl border border-white/[0.06] hover:border-white/[0.12] p-5 flex flex-col justify-between transition-colors group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#171C24] border border-white/[0.06] text-[#7C83FF] flex items-center justify-center flex-shrink-0 group-hover:border-[#7C83FF]/30 transition-colors">
                      <WarehouseIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#E6E8EB] text-sm">
                        {wh.name}
                      </h3>
                      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#171C24] text-[#9AA3AE] border border-white/[0.06]">
                        {wh.locationCode}
                      </span>
                    </div>
                  </div>
                  <Badge status={wh.status} size="sm" />
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.04] text-xs text-[#9AA3AE] space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-[#697381] mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">
                      {wh.address?.street
                        ? `${wh.address.street}, ${wh.address.city || ""}, ${
                            wh.address.state || ""
                          } ${wh.address.postalCode || ""}`
                        : "No physical address specified"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-[#697381] font-mono text-[11px] tabular-nums">
                  Registered: {new Date(wh.createdAt).toLocaleDateString()}
                </span>
                {canManage && (
                  <button
                    onClick={() =>
                      statusMutation.mutate({
                        id: wh._id,
                        status: wh.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                      })
                    }
                    className={`font-semibold text-xs transition-colors px-2 py-0.5 rounded ${
                      wh.status === "ACTIVE"
                        ? "text-[#F87171] hover:bg-[#F87171]/10"
                        : "text-[#4ADE80] hover:bg-[#4ADE80]/10"
                    }`}
                  >
                    {wh.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={WarehouseIcon}
          title="No warehouses found"
          description={
            canManage
              ? "Create your first storage facility to start receiving inventory."
              : "No warehouses are configured for your organization yet."
          }
          action={
            canManage
              ? {
                  label: "Add Warehouse",
                  onClick: () => setIsCreateModalOpen(true),
                }
              : undefined
          }
        />
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#E6E8EB] text-sm tracking-tight">
                  Add New Warehouse Hub
                </h3>
                <p className="text-[11px] text-[#9AA3AE]">
                  Register a physical facility for inventory storage
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#697381] hover:text-[#E6E8EB] p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-lg flex items-center space-x-2 text-[#F87171] text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pune Central Depot"
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Location Code * (e.g. WH-PUN-01)
                  </label>
                  <input
                    type="text"
                    required
                    value={locationCode}
                    onChange={(e) => setLocationCode(e.target.value)}
                    placeholder="WH-01"
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Plot 42, Industrial Area Phase II"
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Pune"
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="411001"
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] tabular-nums"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? "Creating..." : "Save Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
