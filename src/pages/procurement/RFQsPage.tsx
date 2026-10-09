import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  procurementApi,
  RFQ,
  Quotation,
} from "../../api/procurement";
import { connectionsApi } from "../../api/connections";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Send,
  Plus,
  Search,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  Award,
  Users,
  X,
  AlertCircle,
  ArrowRight,
  ShoppingCart,
  FileText,
} from "lucide-react";

export const RFQsPage: React.FC = () => {
  const { user, organization } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isQuotesOpen, setIsQuotesOpen] = useState(false);
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [targetRFQ, setTargetRFQ] = useState<RFQ | null>(null);

  // Form states
  const [prId, setPrId] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [terms, setTerms] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Supplier invitation state
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);

  // Supplier quote submission state
  const [bidItems, setBidItems] = useState<
    { productId: string; name: string; offeredQuantity: number; unitPrice: number; taxRate: number }[]
  >([]);
  const [bidLeadTime, setBidLeadTime] = useState(7);
  const [bidValidUntil, setBidValidUntil] = useState("");

  const canCreateRFQ = [
    "ADMIN",
    "PROCUREMENT_MANAGER",
    "PROCUREMENT_OFFICER",
  ].includes(user?.role || "");

  // Check URL query param for prId to auto-open modal
  useEffect(() => {
    const paramPrId = searchParams.get("prId");
    if (paramPrId && canCreateRFQ) {
      setPrId(paramPrId);
      setIsCreateOpen(true);
    }
  }, [searchParams, canCreateRFQ]);

  // Queries
  const { data: rfqData, isLoading } = useQuery({
    queryKey: ["rfqs"],
    queryFn: () => procurementApi.getRFQs(),
  });

  const { data: prData } = useQuery({
    queryKey: ["purchaseRequisitions"],
    queryFn: () => procurementApi.getPurchaseRequisitions(),
    enabled: isCreateOpen,
  });

  const { data: connectionsData, isLoading: isLoadingConnections } = useQuery({
    queryKey: ["connections"],
    queryFn: () => connectionsApi.getMyConnections(),
    enabled: isCreateOpen || isInviteOpen,
  });

  const { data: quotesData, isLoading: isLoadingQuotes } = useQuery({
    queryKey: ["rfqQuotes", targetRFQ?._id],
    queryFn: () => procurementApi.getRFQQuotations(targetRFQ!._id),
    enabled: isQuotesOpen && !!targetRFQ,
  });

  // Mutations
  const createRFQMutation = useMutation({
    mutationFn: (data: any) => procurementApi.createRFQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      closeCreateModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to create RFQ");
    },
  });

  const openRFQMutation = useMutation({
    mutationFn: (id: string) => procurementApi.openRFQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      setSelectedRFQ(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to open RFQ");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ rfqId, supplierOrganizationId }: { rfqId: string; supplierOrganizationId: string }) =>
      procurementApi.inviteSupplier(rfqId, supplierOrganizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      setIsInviteOpen(false);
      setSelectedSupplierId("");
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to invite supplier");
    },
  });

  const submitBidMutation = useMutation({
    mutationFn: (data: any) => procurementApi.submitQuotation(targetRFQ!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      setIsBidOpen(false);
      setTargetRFQ(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to submit quote");
    },
  });

  const awardMutation = useMutation({
    mutationFn: (quotationId: string) =>
      procurementApi.awardQuotation(quotationId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["rfqs"] });
      if (targetRFQ) {
        queryClient.invalidateQueries({ queryKey: ["rfqQuotes", targetRFQ._id] });
      }
      if (data?.rfq) {
        setTargetRFQ(data.rfq);
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to award quotation");
    },
  });

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setPrId("");
    setDeliveryLocation("");
    setClosingDate("");
    setTerms("");
    setSelectedSupplierIds([]);
    setFormError(null);
  };

  const toggleSupplierSelection = (supplierId: string) => {
    setSelectedSupplierIds((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const toggleAllSuppliers = () => {
    if (selectedSupplierIds.length === allConnectedSuppliers.length) {
      setSelectedSupplierIds([]);
    } else {
      setSelectedSupplierIds(allConnectedSuppliers.map((s) => s._id));
    }
  };

  const openBidModal = (rfq: RFQ) => {
    setTargetRFQ(rfq);
    setBidItems(
      rfq.items.map((it) => ({
        productId: it.productId?._id,
        name: it.productId?.name || "Item",
        offeredQuantity: it.quantity,
        unitPrice: 0,
        taxRate: 0,
      }))
    );
    setBidLeadTime(7);
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    setBidValidUntil(in30Days.toISOString().split("T")[0]);
    setFormError(null);
    setIsBidOpen(true);
  };

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!prId) {
      setFormError("Please select an approved Purchase Requisition");
      return;
    }
    if (!deliveryLocation.trim()) {
      setFormError("Please enter a delivery destination");
      return;
    }
    if (!closingDate) {
      setFormError("Please enter a closing date");
      return;
    }
    createRFQMutation.mutate({
      prId,
      deliveryLocation,
      closingDate,
      terms,
      invitedSuppliers: selectedSupplierIds,
      status: "DRAFT",
    });
  };

  const handleCreateAndOpen = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!prId) {
      setFormError("Please select an approved Purchase Requisition");
      return;
    }
    if (!deliveryLocation.trim()) {
      setFormError("Please enter a delivery destination");
      return;
    }
    if (!closingDate) {
      setFormError("Please enter a closing date");
      return;
    }
    if (new Date(closingDate) <= new Date()) {
      setFormError("Closing date must be in the future");
      return;
    }
    if (selectedSupplierIds.length === 0) {
      setFormError(
        "Please select at least one supplier from your network to open the RFQ for bidding, or save as Draft."
      );
      return;
    }
    createRFQMutation.mutate({
      prId,
      deliveryLocation,
      closingDate,
      terms,
      invitedSuppliers: selectedSupplierIds,
      status: "OPEN",
    });
  };

  const rfqs = rfqData?.rfqs || [];

  const filteredRFQs = rfqs.filter((rfq) => {
    const matchesStatus = !statusFilter || rfq.status === statusFilter;
    const matchesSearch =
      rfq.rfqNumber.toLowerCase().includes(search.toLowerCase()) ||
      rfq.title.toLowerCase().includes(search.toLowerCase()) ||
      rfq.prId?.prNumber?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const approvedPRs = prData?.prs.filter((pr) => pr.status === "APPROVED") || [];

  // All connected partners with ACCEPTED status
  const myOrgId = organization?._id || user?.tenantId;
  const allConnectedSuppliers = (connectionsData?.connections || [])
    .filter((c) => c.status === "ACCEPTED")
    .map((c) => {
      const reqId =
        typeof c.requesterOrganizationId === "object"
          ? c.requesterOrganizationId?._id
          : c.requesterOrganizationId;
      const partner =
        reqId === myOrgId ? c.receiverOrganizationId : c.requesterOrganizationId;
      return partner;
    })
    .filter((partner): partner is NonNullable<typeof partner> => !!partner && !!partner._id);

  // Filter connected suppliers that aren't already invited for the invite modal
  const inviteableSuppliers = allConnectedSuppliers.filter((partner) => {
    if (!targetRFQ) return true;
    return !targetRFQ.invitedSuppliers?.some(
      (s: any) => (s._id || s) === partner._id
    );
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            Requests for Quotation (RFQ)
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Publish tenders, solicit competitive vendor bids, evaluate quotes, and award supply contracts.
          </p>
        </div>
        {canCreateRFQ && (
          <button
            onClick={() => {
              setPrId("");
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C83FF] hover:bg-[#6E76FF] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New RFQ Tender</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#697381] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search RFQ#, Title, PR#..."
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
            <option value="DRAFT">Draft</option>
            <option value="OPEN">Open (Active Bidding)</option>
            <option value="AWARDED">Awarded</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* RFQ Table */}
      <div className="bg-[#11151C] rounded-xl border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <SkeletonLoader variant="table-row" count={5} />
          </div>
        ) : filteredRFQs.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No RFQs found"
            description="Convert an approved Purchase Requisition into an RFQ to solicit competitive supplier quotations."
            action={
              canCreateRFQ
                ? {
                    label: "New RFQ Tender",
                    onClick: () => {
                      setPrId("");
                      setIsCreateOpen(true);
                    },
                  }
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1218] border-b border-white/[0.05] text-[11px] font-semibold uppercase text-[#697381] tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3">RFQ Number</th>
                  <th className="px-5 py-3">Title & Linked PR</th>
                  <th className="px-5 py-3">Delivery Location</th>
                  <th className="px-5 py-3">Closing Date</th>
                  <th className="px-5 py-3">Invited Suppliers</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredRFQs.map((rfq) => {
                  const isInvitedSupplier = rfq.invitedSuppliers?.some(
                    (s) => s._id === organization?._id
                  );
                  const isBuyer =
                    rfq.tenantId === organization?._id ||
                    (typeof rfq.tenantId === "object" &&
                      (rfq.tenantId as any)?._id === organization?._id);
                  const myQuote = rfq.myQuotation;
                  const buyerOrgName =
                    typeof rfq.tenantId === "object"
                      ? (rfq.tenantId as any)?.name
                      : undefined;

                  return (
                    <tr
                      key={rfq._id}
                      className="hover:bg-[#161B23] transition-colors group"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-[#7C83FF] font-mono">
                          {rfq.rfqNumber}
                        </div>
                        <div className="text-[10px] text-[#697381] font-mono tabular-nums">
                          {new Date(rfq.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-[#E6E8EB]">{rfq.title}</div>
                        {isBuyer ? (
                          <div className="text-[11px] text-[#60A5FA] font-mono mt-0.5">
                            PR: {rfq.prId?.prNumber || "N/A"}
                          </div>
                        ) : (
                          <div className="text-[11px] text-[#9AA3AE] mt-0.5">
                            Buyer: {buyerOrgName || "Enterprise Partner"}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[#9AA3AE] whitespace-nowrap">
                        {rfq.deliveryLocation}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#697381] font-mono tabular-nums">
                        {new Date(rfq.closingDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#E6E8EB] tabular-nums font-medium">
                        {rfq.invitedSuppliers?.length || 0} invited
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Badge status={rfq.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-1.5">
                        {/* Buyer actions */}
                        {isBuyer && (
                          <>
                            {rfq.status === "DRAFT" && (
                              <>
                                <button
                                  onClick={() => {
                                    setTargetRFQ(rfq);
                                    setSelectedSupplierId("");
                                    setIsInviteOpen(true);
                                  }}
                                  className="px-2 py-1 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] rounded-md transition-colors"
                                  title="Invite suppliers from your network"
                                >
                                  Invite
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      !rfq.invitedSuppliers ||
                                      rfq.invitedSuppliers.length === 0
                                    ) {
                                      alert(
                                        "Please invite at least one supplier before opening the RFQ.",
                                      );
                                      return;
                                    }
                                    openRFQMutation.mutate(rfq._id);
                                  }}
                                  disabled={openRFQMutation.isPending}
                                  className="px-2 py-1 text-xs font-semibold text-[#4ADE80] hover:text-white bg-[#4ADE80]/10 hover:bg-[#4ADE80]/25 border border-[#4ADE80]/20 rounded-md transition-colors disabled:opacity-50"
                                  title="Open RFQ for active bidding"
                                >
                                  Open RFQ
                                </button>
                              </>
                            )}

                            {rfq.status === "OPEN" && (
                              <>
                                <button
                                  onClick={() => {
                                    setTargetRFQ(rfq);
                                    setSelectedSupplierId("");
                                    setIsInviteOpen(true);
                                  }}
                                  className="px-2 py-1 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] rounded-md transition-colors"
                                  title="Invite more suppliers"
                                >
                                  Invite
                                </button>
                                <button
                                  onClick={() => {
                                    setTargetRFQ(rfq);
                                    setIsQuotesOpen(true);
                                  }}
                                  className="px-2 py-1 text-xs font-semibold text-[#7C83FF] hover:text-white bg-[#7C83FF]/10 hover:bg-[#7C83FF]/25 border border-[#7C83FF]/20 rounded-md transition-colors"
                                >
                                  Quotes
                                </button>
                              </>
                            )}

                            {(rfq.status === "AWARDED" ||
                              rfq.status === "CLOSED") && (
                              <button
                                onClick={() => {
                                  setTargetRFQ(rfq);
                                  setIsQuotesOpen(true);
                                }}
                                className="px-2 py-1 text-xs font-semibold text-[#7C83FF] hover:text-white bg-[#7C83FF]/10 hover:bg-[#7C83FF]/25 border border-[#7C83FF]/20 rounded-md transition-colors"
                              >
                                Quotes
                              </button>
                            )}
                          </>
                        )}

                        {/* Supplier actions */}
                        {isInvitedSupplier && !isBuyer && (
                          <>
                            {myQuote ? (
                              <Badge status={myQuote.status} size="sm" />
                            ) : (
                              rfq.status === "OPEN" && (
                                <button
                                  onClick={() => openBidModal(rfq)}
                                  className="px-2 py-1 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-md shadow-sm transition-colors"
                                >
                                  Submit Bid
                                </button>
                              )
                            )}
                          </>
                        )}

                        <button
                          onClick={() => setSelectedRFQ(rfq)}
                          className="px-2 py-1 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] rounded-md transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quotes & Bids Modal */}
      {isQuotesOpen && targetRFQ && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#E6E8EB] font-mono">
                    Quotations for {targetRFQ.rfqNumber}
                  </h3>
                  <Badge status={targetRFQ.status} size="sm" />
                </div>
                <p className="text-[11px] text-[#697381] mt-0.5">
                  Evaluate competitive supplier bids and award winning contract
                </p>
              </div>
              <button
                onClick={() => {
                  setIsQuotesOpen(false);
                  setTargetRFQ(null);
                }}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {isLoadingQuotes ? (
                <div className="p-8 text-center text-xs text-[#697381]">
                  Loading received quotation bids...
                </div>
              ) : !quotesData?.quotations || quotesData.quotations.length === 0 ? (
                <EmptyState
                  icon={DollarSign}
                  title="No bids received yet"
                  description="Invited suppliers will submit item pricing, tax rates, and delivery lead times."
                />
              ) : (
                <div className="space-y-3">
                  {quotesData.quotations.map((quote) => {
                    const isWinning = quote.status === "ACCEPTED";
                    const isTargetRFQBuyer =
                      targetRFQ.tenantId === organization?._id ||
                      targetRFQ.tenantId === user?.tenantId ||
                      (typeof targetRFQ.tenantId === "object" &&
                        ((targetRFQ.tenantId as any)?._id === organization?._id ||
                          (targetRFQ.tenantId as any)?._id === user?.tenantId));

                    return (
                      <div
                        key={quote._id}
                        className={`p-4 rounded-xl border transition-all ${
                          isWinning
                            ? "bg-[#4ADE80]/[0.05] border-[#4ADE80]/30"
                            : "bg-[#11151C] border-white/[0.06]"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-[#E6E8EB] text-sm">
                                {quote.supplierTenantId?.name || "Supplier"}
                              </span>
                              <Badge status={quote.status} size="sm" />
                              {isWinning && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#4ADE80] text-black">
                                  <Award className="w-3 h-3" />
                                  <span>Awarded Winner</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#697381] mt-0.5">
                              Submitted by {quote.supplierUserId?.fullName} ({quote.supplierUserId?.email})
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-[#E6E8EB] tabular-nums">
                              ${quote.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[11px] text-[#9AA3AE]">
                              Lead Time: <span className="font-semibold text-[#E6E8EB] tabular-nums">{quote.leadTimeDays} days</span>
                            </div>
                          </div>
                        </div>

                        {/* Items breakdown */}
                        <div className="mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {quote.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="bg-[#0F1218] p-2 rounded border border-white/[0.04] flex justify-between"
                            >
                              <span className="font-medium text-[#9AA3AE] truncate mr-2">
                                {it.productId?.name} ({it.offeredQuantity} {it.productId?.unitOfMeasure || "units"})
                              </span>
                              <span className="font-semibold text-[#E6E8EB] tabular-nums flex-shrink-0">
                                ${it.unitPrice.toFixed(2)}/unit (+{it.taxRate}% tax)
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between">
                          <span className="text-[10px] text-[#697381] font-mono tabular-nums">
                            Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                          </span>

                          <div>
                            {isTargetRFQBuyer &&
                              (quote.status === "SUBMITTED" ||
                                quote.status === "UNDER_REVIEW") &&
                              targetRFQ.status === "OPEN" && (
                                <button
                                  onClick={() => awardMutation.mutate(quote._id)}
                                  disabled={awardMutation.isPending}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  <span>
                                    {awardMutation.isPending
                                      ? "Awarding..."
                                      : "Award This Quotation"}
                                  </span>
                                </button>
                              )}

                            {isTargetRFQBuyer && isWinning && (
                              <button
                                onClick={() => {
                                  setIsQuotesOpen(false);
                                  navigate(`/orders?quotationId=${quote._id}`);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#4ADE80] hover:bg-[#22C55E] rounded-lg shadow-sm transition-colors"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Generate Purchase Order</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-[#0F1218] border-t border-white/[0.06] flex items-center justify-end">
              <button
                onClick={() => {
                  setIsQuotesOpen(false);
                  setTargetRFQ(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#171C24] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Supplier Modal */}
      {isInviteOpen && targetRFQ && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#7C83FF]" />
                <h3 className="font-bold text-[#E6E8EB] text-sm">
                  Invite Supplier to RFQ
                </h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <p className="text-xs text-[#9AA3AE]">
                Invite verified trading partners connected to your organization to bid on this tender.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Select Connected Partner *
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                >
                  <option value="">Choose Supplier...</option>
                  {inviteableSuppliers.map((supp) => (
                    <option key={supp._id} value={supp._id}>
                      {supp.name} ({supp.capabilities?.join(", ")})
                    </option>
                  ))}
                </select>
                {inviteableSuppliers.length === 0 && (
                  <p className="text-[11px] text-[#F5C76A] mt-1">
                    No available uninvited connected partners. Connect with suppliers on the Marketplace first.
                  </p>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedSupplierId || inviteMutation.isPending}
                  onClick={() =>
                    inviteMutation.mutate({
                      rfqId: targetRFQ._id,
                      supplierOrganizationId: selectedSupplierId,
                    })
                  }
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {inviteMutation.isPending ? "Inviting..." : "Send Invitation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Submit Bid Modal */}
      {isBidOpen && targetRFQ && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-[#7C83FF]" />
                <h3 className="font-bold text-[#E6E8EB] text-sm">
                  Submit Quotation Bid
                </h3>
              </div>
              <button
                onClick={() => setIsBidOpen(false)}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitBidMutation.mutate({
                  items: bidItems,
                  leadTimeDays: Number(bidLeadTime),
                  validUntil: bidValidUntil,
                });
              }}
              className="p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              {formError && (
                <div className="p-3 text-xs bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-[#9AA3AE]">
                  Item Price Quotations *
                </label>
                {bidItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0F1218] p-3 rounded-lg border border-white/[0.05] space-y-2"
                  >
                    <div className="font-semibold text-xs text-[#E6E8EB]">
                      {item.name}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-[#697381] uppercase font-semibold">
                          Offered Qty
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.offeredQuantity}
                          onChange={(e) => {
                            const updated = [...bidItems];
                            updated[idx].offeredQuantity = Number(e.target.value);
                            setBidItems(updated);
                          }}
                          className="w-full px-2 py-1 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#697381] uppercase font-semibold">
                          Unit Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={0.01}
                          required
                          value={item.unitPrice || ""}
                          onChange={(e) => {
                            const updated = [...bidItems];
                            updated[idx].unitPrice = Number(e.target.value);
                            setBidItems(updated);
                          }}
                          className="w-full px-2 py-1 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#697381] uppercase font-semibold">
                          Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.taxRate}
                          onChange={(e) => {
                            const updated = [...bidItems];
                            updated[idx].taxRate = Number(e.target.value);
                            setBidItems(updated);
                          }}
                          className="w-full px-2 py-1 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded tabular-nums"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Lead Time (Days) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={bidLeadTime}
                    onChange={(e) => setBidLeadTime(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    required
                    value={bidValidUntil}
                    onChange={(e) => setBidValidUntil(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsBidOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitBidMutation.isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors"
                >
                  {submitBidMutation.isPending ? "Submitting..." : "Submit Quote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create RFQ Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 text-[#7C83FF]" />
                <h3 className="font-bold text-[#E6E8EB] text-sm">
                  Create Request for Quotation (RFQ)
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
              onSubmit={handleCreateAndOpen}
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
                  Source Purchase Requisition *
                </label>
                <select
                  required
                  value={prId}
                  onChange={(e) => setPrId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                >
                  <option value="">Select Approved Requisition...</option>
                  {approvedPRs.map((pr) => (
                    <option key={pr._id} value={pr._id}>
                      {pr.prNumber} - {pr.title} ({pr.items?.length} items)
                    </option>
                  ))}
                </select>
                {approvedPRs.length === 0 && (
                  <p className="text-[11px] text-[#F5C76A] mt-1">
                    No approved requisitions available. Approve a Purchase Requisition first.
                  </p>
                )}
              </div>

              {/* Network Suppliers Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#9AA3AE]">
                      Select Suppliers from Network
                    </label>
                    <p className="text-[11px] text-[#697381]">
                      Choose connected trading partners to invite to this tender
                    </p>
                  </div>
                  {allConnectedSuppliers.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleAllSuppliers}
                      className="text-[11px] font-semibold text-[#7C83FF] hover:text-[#9AA3AE] transition-colors"
                    >
                      {selectedSupplierIds.length === allConnectedSuppliers.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                </div>

                {isLoadingConnections ? (
                  <div className="p-3 text-center text-xs text-[#697381] bg-[#0B0E13] rounded-lg border border-white/[0.08]">
                    Loading connected suppliers...
                  </div>
                ) : allConnectedSuppliers.length === 0 ? (
                  <div className="p-3 bg-[#0B0E13] rounded-lg border border-dashed border-white/[0.1] text-center">
                    <p className="text-xs text-[#9AA3AE]">
                      No connected suppliers found in your network.
                    </p>
                    <p className="text-[11px] text-[#697381] mt-0.5">
                      You can save this RFQ as a Draft now, connect with suppliers on the Marketplace, and invite them later.
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#0B0E13] rounded-lg border border-white/[0.08] max-h-44 overflow-y-auto divide-y divide-white/[0.04]">
                    {allConnectedSuppliers.map((supplier) => {
                      const isSelected = selectedSupplierIds.includes(supplier._id);
                      return (
                        <label
                          key={supplier._id}
                          className={`flex items-center justify-between p-2.5 hover:bg-[#161B23] cursor-pointer transition-colors ${
                            isSelected ? "bg-[#7C83FF]/[0.08]" : ""
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSupplierSelection(supplier._id)}
                              className="w-4 h-4 rounded border-white/[0.2] text-[#7C83FF] focus:ring-0 focus:ring-offset-0 bg-[#11151C]"
                            />
                            <span className="text-xs font-medium text-[#E6E8EB] truncate">
                              {supplier.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            {supplier.capabilities?.map((cap: string, cIdx: number) => (
                              <span
                                key={cIdx}
                                className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/[0.06] text-[#9AA3AE]"
                              >
                                {cap}
                              </span>
                            ))}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-[#697381] mt-1.5 px-0.5">
                  <span>
                    {selectedSupplierIds.length} of {allConnectedSuppliers.length} supplier{allConnectedSuppliers.length === 1 ? "" : "s"} selected
                  </span>
                  {selectedSupplierIds.length === 0 && (
                    <span className="text-[#F5C76A]">
                      (Save as Draft if no suppliers selected)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Delivery Destination / Warehouse Hub *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Central Warehouse Dock #3"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Bidding Closing Date & Time *
                </label>
                <input
                  type="date"
                  required
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Commercial Terms & Quality Standards
                </label>
                <textarea
                  rows={2}
                  placeholder="Payment within 30 days net; ISO 9001 quality certificates required..."
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={createRFQMutation.isPending || !prId}
                  onClick={handleCreateDraft}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] rounded-lg transition-colors disabled:opacity-50"
                  title="Save RFQ as draft without opening for bidding yet"
                >
                  {createRFQMutation.isPending ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  type="submit"
                  disabled={createRFQMutation.isPending || !prId || selectedSupplierIds.length === 0}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  title="Create RFQ and immediately open for bidding to selected suppliers"
                >
                  {createRFQMutation.isPending ? "Publishing..." : "Publish & Open RFQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRFQ && (() => {
        const myOrgId = organization?._id || user?.tenantId;
        const buyerId =
          typeof selectedRFQ.tenantId === "object"
            ? (selectedRFQ.tenantId as any)?._id
            : selectedRFQ.tenantId;
        const isDetailsBuyer = Boolean(buyerId && myOrgId && buyerId === myOrgId);
        const isDetailsSupplier = Boolean(
          selectedRFQ.invitedSuppliers?.some(
            (s: any) => (s._id || s) === myOrgId
          )
        );
        const myDetailsQuote = selectedRFQ.myQuotation;
        const buyerOrgName =
          typeof selectedRFQ.tenantId === "object"
            ? (selectedRFQ.tenantId as any)?.name
            : undefined;

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-[#E6E8EB] font-mono">
                      {selectedRFQ.rfqNumber}
                    </h3>
                    <Badge status={selectedRFQ.status} size="sm" />
                    {isDetailsSupplier && myDetailsQuote && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#7C83FF]/15 text-[#7C83FF] border border-[#7C83FF]/25">
                        My Bid: {myDetailsQuote.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#697381] mt-0.5 font-mono tabular-nums">
                    Issued on {new Date(selectedRFQ.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRFQ(null)}
                  className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <div>
                  <span className="font-semibold text-[#697381] uppercase text-[10px] tracking-wider block">
                    RFQ Tender Title
                  </span>
                  <div className="font-bold text-[#E6E8EB] text-sm mt-0.5">
                    {selectedRFQ.title}
                  </div>
                  {!isDetailsBuyer && buyerOrgName && (
                    <div className="text-[11px] text-[#9AA3AE] mt-0.5">
                      Buyer: <span className="font-semibold text-[#E6E8EB]">{buyerOrgName}</span>
                    </div>
                  )}
                  {isDetailsBuyer && selectedRFQ.prId?.prNumber && (
                    <div className="text-[11px] text-[#60A5FA] font-mono mt-0.5">
                      PR: {selectedRFQ.prId.prNumber}
                    </div>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-[#697381] uppercase text-[10px] tracking-wider block">
                    Delivery Destination
                  </span>
                  <div className="text-[#9AA3AE] font-medium mt-0.5">
                    {selectedRFQ.deliveryLocation}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-[#697381] uppercase text-[10px] tracking-wider block">
                    Closing Date
                  </span>
                  <div className="text-[#9AA3AE] font-medium mt-0.5 font-mono tabular-nums">
                    {new Date(selectedRFQ.closingDate).toLocaleDateString()}
                  </div>
                </div>

                {selectedRFQ.terms && (
                  <div>
                    <span className="font-semibold text-[#697381] uppercase text-[10px] tracking-wider block">
                      Terms & Specifications
                    </span>
                    <div className="text-[#9AA3AE] bg-[#0F1218] p-2.5 rounded-lg border border-white/[0.05] mt-0.5 leading-relaxed">
                      {selectedRFQ.terms}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-semibold text-[#697381] uppercase text-[10px] tracking-wider mb-1 block">
                    Requested Items Breakdown:
                  </span>
                  <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#11151C]">
                    <table className="w-full text-left">
                      <thead className="bg-[#0F1218] border-b border-white/[0.05] font-semibold text-[#697381] text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2">Item Product</th>
                          <th className="px-3 py-2 text-right">Required Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {selectedRFQ.items?.map((it, idx) => (
                          <tr key={idx} className="hover:bg-[#161B23]">
                            <td className="px-3 py-2">
                              <span className="font-semibold text-[#E6E8EB]">
                                {it.productId?.name || "Item"}
                              </span>
                              {it.productId?.sku && (
                                <span className="text-[10px] font-mono text-[#697381] ml-1">
                                  ({it.productId.sku})
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-[#E6E8EB] tabular-nums">
                              {it.quantity} {it.productId?.unitOfMeasure || "units"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Invited Suppliers Breakdown */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#697381] uppercase text-[10px] tracking-wider block">
                      Invited Network Suppliers ({selectedRFQ.invitedSuppliers?.length || 0})
                    </span>
                    {isDetailsBuyer && (selectedRFQ.status === "DRAFT" || selectedRFQ.status === "OPEN") && (
                      <button
                        onClick={() => {
                          setTargetRFQ(selectedRFQ);
                          setSelectedSupplierId("");
                          setIsInviteOpen(true);
                        }}
                        className="text-[11px] font-semibold text-[#7C83FF] hover:text-[#9AA3AE] transition-colors"
                      >
                        + Invite More
                      </button>
                    )}
                  </div>
                  {selectedRFQ.invitedSuppliers && selectedRFQ.invitedSuppliers.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedRFQ.invitedSuppliers.map((supp: any, sIdx: number) => (
                        <div
                          key={supp._id || sIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0F1218] border border-white/[0.06] rounded-md text-xs text-[#E6E8EB]"
                        >
                          <Building2 className="w-3 h-3 text-[#7C83FF]" />
                          <span>{supp.name || "Supplier Organization"}</span>
                          {supp.capabilities?.map((cap: string, cIdx: number) => (
                            <span
                              key={cIdx}
                              className="text-[9px] uppercase px-1 py-0.2 rounded bg-white/[0.06] text-[#9AA3AE]"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#697381] italic mt-0.5">
                      No suppliers invited yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-[#0F1218] border-t border-white/[0.06] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Buyer action buttons */}
                  {isDetailsBuyer && selectedRFQ.status === "DRAFT" && (
                    <button
                      onClick={() => {
                        if (!selectedRFQ.invitedSuppliers || selectedRFQ.invitedSuppliers.length === 0) {
                          alert("Please invite at least one supplier before opening the RFQ.");
                          return;
                        }
                        openRFQMutation.mutate(selectedRFQ._id);
                      }}
                      disabled={openRFQMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#4ADE80] hover:bg-[#22C55E] rounded-lg shadow-sm transition-colors disabled:opacity-50"
                    >
                      <span>Open RFQ for Bidding</span>
                    </button>
                  )}
                  {isDetailsBuyer && (selectedRFQ.status === "OPEN" || selectedRFQ.status === "AWARDED" || selectedRFQ.status === "CLOSED") && (
                    <button
                      onClick={() => {
                        setTargetRFQ(selectedRFQ);
                        setSelectedRFQ(null);
                        setIsQuotesOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#7C83FF] hover:text-white bg-[#7C83FF]/10 hover:bg-[#7C83FF]/25 border border-[#7C83FF]/20 rounded-lg transition-colors"
                    >
                      <span>View Quotations</span>
                    </button>
                  )}

                  {/* Supplier action buttons */}
                  {isDetailsSupplier && !isDetailsBuyer && selectedRFQ.status === "OPEN" && !myDetailsQuote && (
                    <button
                      onClick={() => {
                        const rfqToBid = selectedRFQ;
                        setSelectedRFQ(null);
                        openBidModal(rfqToBid);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Submit Quotation Bid</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedRFQ(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#171C24] rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
