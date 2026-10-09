import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { connectionsApi, Connection } from "../../api/connections";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Users,
  Search,
  Check,
  X,
  Building2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export const ConnectionsPage: React.FC = () => {
  const { user, organization } = useAuth();
  const queryClient = useQueryClient();

  const canManageConnections =
    user?.role === "ADMIN" || user?.role === "PROCUREMENT_MANAGER";

  const canCreateRFQ = [
    "ADMIN",
    "PROCUREMENT_MANAGER",
    "PROCUREMENT_OFFICER",
  ].includes(user?.role || "");

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PENDING_IN" | "PENDING_OUT">("ACTIVE");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: () => connectionsApi.getMyConnections(),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => connectionsApi.acceptConnectionRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to accept connection request");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => connectionsApi.rejectConnectionRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to reject connection request");
    },
  });

  const allConnections = data?.connections || [];

  // Group connections
  const activeConnections = allConnections.filter((c) => c.status === "ACCEPTED");

  const pendingReceived = allConnections.filter(
    (c) => c.status === "PENDING" && c.receiverOrganizationId._id === organization?._id
  );

  const pendingSent = allConnections.filter(
    (c) => c.status === "PENDING" && c.requesterOrganizationId._id === organization?._id
  );

  const currentList =
    activeTab === "ACTIVE"
      ? activeConnections
      : activeTab === "PENDING_IN"
      ? pendingReceived
      : pendingSent;

  const filteredList = currentList.filter((conn) => {
    const partner =
      conn.requesterOrganizationId._id === organization?._id
        ? conn.receiverOrganizationId
        : conn.requesterOrganizationId;
    return partner?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            Trading Partner Connections
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Manage authenticated B2B supplier and buyer relationships across the multi-tenant mesh.
          </p>
        </div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C83FF] hover:bg-[#6E76FF] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <span>Discover Partners</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] gap-5 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`pb-3 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "ACTIVE"
              ? "border-[#7C83FF] text-[#7C83FF]"
              : "border-transparent text-[#697381] hover:text-[#E6E8EB]"
          }`}
        >
          <span>Active Partners</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#171C24] text-[#9AA3AE] border border-white/[0.06] tabular-nums">
            {activeConnections.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PENDING_IN")}
          className={`pb-3 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "PENDING_IN"
              ? "border-[#7C83FF] text-[#7C83FF]"
              : "border-transparent text-[#697381] hover:text-[#E6E8EB]"
          }`}
        >
          <span>Requests Received</span>
          {pendingReceived.length > 0 && (
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#F5C76A] text-black font-bold tabular-nums">
              {pendingReceived.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("PENDING_OUT")}
          className={`pb-3 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === "PENDING_OUT"
              ? "border-[#7C83FF] text-[#7C83FF]"
              : "border-transparent text-[#697381] hover:text-[#E6E8EB]"
          }`}
        >
          <span>Requests Sent</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#171C24] text-[#9AA3AE] border border-white/[0.06] tabular-nums">
            {pendingSent.length}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#697381] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search connected partner name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          />
        </div>
      </div>

      {/* List / Cards */}
      {isLoading ? (
        <SkeletonLoader variant="card" count={3} />
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            activeTab === "ACTIVE"
              ? "No active partner connections"
              : activeTab === "PENDING_IN"
              ? "No pending connection requests"
              : "No pending outgoing requests"
          }
          description="Connect with suppliers and buyers via the B2B marketplace to issue RFQs and receive purchase orders."
          action={{
            label: "Explore Marketplace Directory",
            href: "/marketplace",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((conn) => {
            const isRequester = conn.requesterOrganizationId._id === organization?._id;
            const partner = isRequester
              ? conn.receiverOrganizationId
              : conn.requesterOrganizationId;

            return (
              <div
                key={conn._id}
                className="bg-[#11151C] rounded-xl border border-white/[0.06] hover:border-white/[0.12] p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#171C24] border border-white/[0.08] text-[#7C83FF] flex items-center justify-center font-bold text-base flex-shrink-0 group-hover:border-[#7C83FF]/30 transition-colors">
                        {partner?.name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#E6E8EB] text-sm group-hover:text-white transition-colors">
                          {partner?.name}
                        </h3>
                        <span className="text-[11px] text-[#697381]">
                          {partner?.email}
                        </span>
                      </div>
                    </div>
                    <Badge status={conn.status} size="sm" />
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {partner?.capabilities?.map((cap: string) => (
                      <span
                        key={cap}
                        className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#171C24] text-[#9AA3AE] border border-white/[0.06] uppercase tracking-wider"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.04] text-xs text-[#697381]">
                    Connected: {new Date(conn.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[11px] text-[#697381]">
                    {isRequester ? "Initiated by you" : "Inbound request"}
                  </span>

                  {activeTab === "PENDING_IN" && canManageConnections && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => rejectMutation.mutate(conn._id)}
                        disabled={rejectMutation.isPending}
                        className="p-1.5 text-[#F87171] hover:bg-[#F87171]/10 rounded-lg border border-[#F87171]/20 transition-colors"
                        title="Decline"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => acceptMutation.mutate(conn._id)}
                        disabled={acceptMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-black bg-[#4ADE80] hover:bg-[#22C55E] rounded-lg shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                    </div>
                  )}

                  {activeTab === "ACTIVE" && canCreateRFQ && (
                    <Link
                      to="/rfqs"
                      className="text-xs font-semibold text-[#7C83FF] hover:text-white transition-colors"
                    >
                      Issue RFQ Tender →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
