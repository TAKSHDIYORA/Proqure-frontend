import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  procurementApi,
  PurchaseRequisition,
} from "../../api/procurement";
import { productsApi } from "../../api/products";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Send,
  Calendar,
  User,
  AlertCircle,
  X,
  Trash2,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";

export const RequisitionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisition | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionComments, setActionComments] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // New Requisition form state
  const [title, setTitle] = useState("");
  const [justification, setJustification] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [items, setItems] = useState<
    { productId: string; quantity: number; estimatedUnitPrice: number }[]
  >([{ productId: "", quantity: 1, estimatedUnitPrice: 0 }]);

  const isApprover =
    user?.role === "ADMIN" || user?.role === "PROCUREMENT_MANAGER";

  const canCreatePR = [
    "ADMIN",
    "EMPLOYEE",
    "PROCUREMENT_MANAGER",
    "PROCUREMENT_OFFICER",
  ].includes(user?.role || "");

  const canCreateRFQ = [
    "ADMIN",
    "PROCUREMENT_MANAGER",
    "PROCUREMENT_OFFICER",
  ].includes(user?.role || "");

  // Queries
  const { data: prData, isLoading } = useQuery({
    queryKey: ["purchaseRequisitions"],
    queryFn: () => procurementApi.getPurchaseRequisitions(),
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getProducts(),
    enabled: isCreateOpen,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => procurementApi.createPurchaseRequisition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRequisitions"] });
      closeCreateModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to create requisition");
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      procurementApi.approvePurchaseRequisition(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRequisitions"] });
      setSelectedPR(null);
      setActionComments("");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      procurementApi.rejectPurchaseRequisition(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRequisitions"] });
      setSelectedPR(null);
      setActionComments("");
    },
  });

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setTitle("");
    setJustification("");
    setRequiredDate("");
    setItems([{ productId: "", quantity: 1, estimatedUnitPrice: 0 }]);
    setFormError(null);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, estimatedUnitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const handleItemChange = (
    index: number,
    field: "productId" | "quantity" | "estimatedUnitPrice",
    val: any
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };

    if (field === "productId") {
      const prod = productsData?.products.find((p) => p._id === val);
      if (prod && prod.marketplacePrice) {
        updated[index].estimatedUnitPrice = prod.marketplacePrice;
      }
    }
    setItems(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const hasInvalidItem = items.some((it) => !it.productId || it.quantity <= 0);
    if (hasInvalidItem) {
      setFormError("Please select a valid product and quantity for each item line.");
      return;
    }

    createMutation.mutate({
      title,
      justification,
      requiredDate,
      items: items.map((it) => ({
        productId: it.productId,
        quantity: Number(it.quantity),
        estimatedUnitPrice: Number(it.estimatedUnitPrice || 0),
      })),
    });
  };

  const prList = prData?.prs || [];

  const filteredPRs = prList.filter((pr) => {
    const matchesStatus = !statusFilter || pr.status === statusFilter;
    const matchesSearch =
      pr.prNumber.toLowerCase().includes(search.toLowerCase()) ||
      pr.title.toLowerCase().includes(search.toLowerCase()) ||
      pr.requestedBy?.fullName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            Purchase Requisitions (PR)
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Internal procurement requests, managerial approvals, and demand aggregation.
          </p>
        </div>
        {canCreatePR && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C83FF] hover:bg-[#6E76FF] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Requisition</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#697381] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by PR#, Title, Requester..."
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
            className="px-2.5 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Requisitions Table */}
      <div className="bg-[#11151C] rounded-xl border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <SkeletonLoader variant="table-row" count={5} />
          </div>
        ) : filteredPRs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No requisitions found"
            description="Submit an internal purchase requisition to initiate the procurement approval workflow."
            action={
              canCreatePR
                ? {
                    label: "New Requisition",
                    onClick: () => setIsCreateOpen(true),
                  }
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1218] border-b border-white/[0.05] text-[11px] font-semibold uppercase text-[#697381] tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3">PR Number</th>
                  <th className="px-5 py-3">Title & Justification</th>
                  <th className="px-5 py-3">Requested By</th>
                  <th className="px-5 py-3">Required By</th>
                  <th className="px-5 py-3">Line Items</th>
                  <th className="px-5 py-3">Approval Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredPRs.map((pr) => (
                  <tr
                    key={pr._id}
                    className="hover:bg-[#161B23] transition-colors group"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-[#7C83FF] font-mono">
                        {pr.prNumber}
                      </div>
                      <div className="text-[10px] text-[#697381] font-mono tabular-nums">
                        {new Date(pr.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#E6E8EB]">{pr.title}</div>
                      <div className="text-[11px] text-[#9AA3AE] truncate max-w-xs mt-0.5">
                        {pr.justification}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#9AA3AE]">
                      {pr.requestedBy?.fullName || "Employee"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#697381] font-mono tabular-nums">
                      {pr.requiredDate
                        ? new Date(pr.requiredDate).toLocaleDateString()
                        : "ASAP"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#E6E8EB] tabular-nums font-medium">
                      {pr.items.length} item{pr.items.length > 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge status={pr.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedPR(pr)}
                        className="px-2.5 py-1 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] rounded-md transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PR Details Modal */}
      {selectedPR && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#E6E8EB] font-mono">
                    {selectedPR.prNumber}
                  </h3>
                  <Badge status={selectedPR.status} size="sm" />
                </div>
                <p className="text-[11px] text-[#697381] mt-0.5">
                  Requisition submitted by {selectedPR.requestedBy?.fullName || "User"}
                </p>
              </div>
              <button
                onClick={() => setSelectedPR(null)}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-[#0F1218] p-3.5 rounded-lg border border-white/[0.05] text-xs space-y-2">
                <div>
                  <span className="text-[10px] font-semibold text-[#697381] uppercase tracking-wider block">
                    Title & Objective
                  </span>
                  <div className="text-sm font-semibold text-[#E6E8EB] mt-0.5">
                    {selectedPR.title}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-[#697381] uppercase tracking-wider block">
                    Business Justification
                  </span>
                  <div className="text-xs text-[#9AA3AE] mt-0.5 leading-relaxed">
                    {selectedPR.justification || "None specified"}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold text-[#697381] uppercase tracking-wider mb-2">
                  Requested Line Items
                </h4>
                <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#11151C]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0F1218] border-b border-white/[0.05] font-semibold text-[#697381] text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5">Product SKU / Name</th>
                        <th className="px-4 py-2.5 text-right">Quantity</th>
                        <th className="px-4 py-2.5 text-right">Est. Unit Price</th>
                        <th className="px-4 py-2.5 text-right">Est. Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {selectedPR.items.map((it, idx) => {
                        const total = (it.quantity || 0) * (it.estimatedUnitPrice || 0);
                        return (
                          <tr key={idx} className="hover:bg-[#161B23]">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-[#E6E8EB]">
                                {it.productId?.name || "Product"}
                              </div>
                              <div className="text-[10px] font-mono text-[#697381]">
                                {it.productId?.sku}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-[#E6E8EB] tabular-nums">
                              {it.quantity} {it.productId?.unitOfMeasure || "units"}
                            </td>
                            <td className="px-4 py-3 text-right text-[#9AA3AE] tabular-nums">
                              ${it.estimatedUnitPrice?.toFixed(2) || "0.00"}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-[#E6E8EB] tabular-nums">
                              ${total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedPR.status === "PENDING_APPROVAL" && isApprover && (
                <div className="bg-[#0F1218] border border-white/[0.06] p-4 rounded-lg space-y-3">
                  <div className="text-xs font-semibold text-[#E6E8EB]">
                    Manager Review & Sign-Off
                  </div>
                  <input
                    type="text"
                    placeholder="Approval / Rejection audit comments (optional)..."
                    value={actionComments}
                    onChange={(e) => setActionComments(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-md focus:outline-none focus:border-[#7C83FF]"
                  />
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() =>
                        approveMutation.mutate({
                          id: selectedPR._id,
                          comments: actionComments,
                        })
                      }
                      disabled={approveMutation.isPending}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4ADE80] hover:bg-[#22C55E] text-black rounded-md shadow-sm transition-colors"
                    >
                      Approve Requisition
                    </button>
                    <button
                      onClick={() =>
                        rejectMutation.mutate({
                          id: selectedPR._id,
                          comments: actionComments,
                        })
                      }
                      disabled={rejectMutation.isPending}
                      className="px-3.5 py-1.5 text-xs font-semibold text-[#F87171] bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/20 rounded-md transition-colors"
                    >
                      Reject Requisition
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#0F1218] border-t border-white/[0.06] flex items-center justify-between">
              <div>
                {selectedPR.status === "APPROVED" && canCreateRFQ && (
                  <button
                    onClick={() => {
                      const id = selectedPR._id;
                      setSelectedPR(null);
                      navigate(`/rfqs?prId=${id}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors"
                  >
                    <span>Proceed to RFQ Bidding</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedPR(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#171C24] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Requisition Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-[#7C83FF]" />
                <h3 className="font-bold text-[#E6E8EB] text-sm">
                  New Purchase Requisition
                </h3>
              </div>
              <button
                onClick={closeCreateModal}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              {formError && (
                <div className="p-3 text-xs bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Requisition Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Raw Material Restock - Hub 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Operational Justification *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain the requirement, department usage, or stockout risk..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Required By Date
                </label>
                <input
                  type="date"
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              {/* Items Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#E6E8EB]">
                    Line Items
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7C83FF] hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#0F1218] border border-white/[0.05] rounded-lg flex flex-col sm:flex-row gap-2.5 items-end sm:items-center"
                    >
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] text-[#697381] uppercase font-semibold mb-1">
                          Product SKU *
                        </label>
                        <select
                          required
                          value={it.productId}
                          onChange={(e) =>
                            handleItemChange(idx, "productId", e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                        >
                          <option value="">Select Catalog Product...</option>
                          {productsData?.products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.sku}) - {p.unitOfMeasure}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-28">
                        <label className="block text-[10px] text-[#697381] uppercase font-semibold mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={it.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, "quantity", Number(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] tabular-nums"
                        />
                      </div>

                      <div className="w-full sm:w-32">
                        <label className="block text-[10px] text-[#697381] uppercase font-semibold mb-1">
                          Est. Unit Price ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={it.estimatedUnitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              "estimatedUnitPrice",
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] tabular-nums"
                        />
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-[#697381] hover:text-[#F87171] transition-colors rounded"
                          title="Remove Line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {createMutation.isPending ? "Submitting..." : "Submit Requisition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
