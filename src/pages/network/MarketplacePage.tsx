import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  marketplaceApi,
  MarketplaceOrg,
  MarketplaceProduct,
} from "../../api/marketplace";
import { connectionsApi } from "../../api/connections";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Building2,
  Search,
  MapPin,
  Mail,
  Package,
  UserPlus,
  Check,
  Globe,
  Layers,
  X,
  ExternalLink,
} from "lucide-react";

export const MarketplacePage: React.FC = () => {
  const { user, organization } = useAuth();
  const queryClient = useQueryClient();

  const canConnect = [
    "ADMIN",
    "PROCUREMENT_MANAGER",
    "SALES_MANAGER",
  ].includes(user?.role || "");

  const [search, setSearch] = useState("");
  const [capabilityFilter, setCapabilityFilter] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Queries
  const { data: marketplaceData, isLoading } = useQuery({
    queryKey: ["marketplaceOrgs", search, capabilityFilter],
    queryFn: () =>
      marketplaceApi.searchOrganizations({
        search: search || undefined,
        capability: capabilityFilter || undefined,
      }),
  });

  const { data: connectionsData } = useQuery({
    queryKey: ["connections"],
    queryFn: () => connectionsApi.getMyConnections(),
  });

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["orgProfile", selectedOrgId],
    queryFn: () => marketplaceApi.getOrganizationProfile(selectedOrgId!),
    enabled: !!selectedOrgId,
  });

  // Connection Mutation
  const connectMutation = useMutation({
    mutationFn: (orgId: string) => connectionsApi.sendConnectionRequest(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to send connection request");
    },
  });

  const connections = connectionsData?.connections || [];

  const getConnectionStatus = (orgId: string) => {
    if (orgId === organization?._id) return "SELF";
    const found = connections.find(
      (c) =>
        c.requesterOrganizationId._id === orgId ||
        c.receiverOrganizationId._id === orgId
    );
    return found ? found.status : null;
  };

  const orgs = marketplaceData?.organizations || [];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            B2B Marketplace & Partner Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Discover verified enterprise manufacturers, suppliers, and procurement trading partners.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-3.5 h-3.5 text-[#697381] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search enterprise name, description, industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-[#9AA3AE] font-medium">Capability:</span>
          <select
            value={capabilityFilter}
            onChange={(e) => setCapabilityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          >
            <option value="">All Capabilities</option>
            <option value="SUPPLIER">Suppliers & Distributors</option>
            <option value="MANUFACTURER">Manufacturers & Producers</option>
          </select>
        </div>
      </div>

      {/* Grid of Companies */}
      {isLoading ? (
        <SkeletonLoader variant="card" count={6} />
      ) : orgs.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No organizations found"
          description="Try adjusting your search criteria or capability filters to discover more partners."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org) => {
            const status = getConnectionStatus(org._id);
            const isSelf = status === "SELF";
            return (
              <div
                key={org._id}
                className="bg-[#11151C] rounded-xl border border-white/[0.06] hover:border-white/[0.12] p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-[#171C24] border border-white/[0.08] text-[#7C83FF] flex items-center justify-center font-bold text-base flex-shrink-0 group-hover:border-[#7C83FF]/30 transition-colors">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {org.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#171C24] text-[#9AA3AE] border border-white/[0.06] uppercase tracking-wider"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="font-bold text-[#E6E8EB] text-sm mt-3 group-hover:text-white transition-colors">
                    {org.name}
                  </h3>

                  <p className="text-xs text-[#9AA3AE] mt-1 line-clamp-2 leading-relaxed">
                    {org.description || "Verified enterprise on ProQure B2B Network."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/[0.04] space-y-1.5 text-xs text-[#697381]">
                    {org.address?.city && (
                      <div className="flex items-center space-x-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#697381] flex-shrink-0" />
                        <span>
                          {org.address.city}, {org.address.state || org.address.country}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#697381] flex-shrink-0" />
                      <span>{org.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedOrgId(org._id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C83FF] hover:text-white transition-colors"
                  >
                    <span>View Catalog</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {isSelf ? (
                    <span className="text-[10px] font-semibold text-[#697381] bg-[#171C24] border border-white/[0.06] px-2 py-0.5 rounded">
                      Your Organization
                    </span>
                  ) : status === "ACCEPTED" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4ADE80] bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-2 py-0.5 rounded-md">
                      <Check className="w-3 h-3" />
                      <span>Connected</span>
                    </span>
                  ) : status === "PENDING" ? (
                    <span className="text-[11px] font-semibold text-[#F5C76A] bg-[#F5C76A]/10 border border-[#F5C76A]/20 px-2 py-0.5 rounded-md">
                      Pending Request
                    </span>
                  ) : canConnect ? (
                    <button
                      onClick={() => connectMutation.mutate(org._id)}
                      disabled={connectMutation.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-md shadow-sm transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Organization Profile & Products Modal */}
      {selectedOrgId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#E6E8EB]">
                  {profileData?.organization?.name || "Enterprise Profile"}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  {profileData?.organization?.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#7C83FF]/15 text-[#7C83FF] border border-[#7C83FF]/30 uppercase tracking-wider"
                    >
                      {cap}
                    </span>
                  ))}
                  <span className="text-xs text-[#9AA3AE]">
                    {profileData?.organization?.address?.city}, {profileData?.organization?.address?.country}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrgId(null)}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="bg-[#0F1218] p-3 rounded-lg border border-white/[0.05]">
                <span className="text-[10px] font-semibold text-[#697381] uppercase tracking-wider block">
                  About Company
                </span>
                <p className="text-xs text-[#9AA3AE] mt-1 leading-relaxed">
                  {profileData?.organization?.description || "Verified supply chain operator."}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold text-[#697381] uppercase tracking-wider mb-2">
                  Marketplace Products ({profileData?.products?.length || 0})
                </h4>

                {isLoadingProfile ? (
                  <div className="p-6 text-center text-xs text-[#697381]">
                    Loading catalog listings...
                  </div>
                ) : !profileData?.products || profileData.products.length === 0 ? (
                  <div className="p-4 bg-[#0F1218] border border-white/[0.05] rounded-lg text-center text-[#697381]">
                    No public products cataloged by this partner yet.
                  </div>
                ) : (
                  <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#11151C]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0F1218] border-b border-white/[0.05] font-semibold text-[#697381] text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2.5">Product SKU / Title</th>
                          <th className="px-4 py-2.5">Category</th>
                          <th className="px-4 py-2.5 text-right">Indicative Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {profileData.products.map((p) => (
                          <tr key={p._id} className="hover:bg-[#161B23]">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-[#E6E8EB]">{p.name}</div>
                              <div className="text-[10px] font-mono text-[#697381]">{p.sku}</div>
                            </td>
                            <td className="px-4 py-3 text-[#9AA3AE]">{p.category}</td>
                            <td className="px-4 py-3 text-right font-bold text-[#E6E8EB] tabular-nums">
                              {p.marketplacePrice ? `$${p.marketplacePrice.toFixed(2)}` : "Inquire"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#0F1218] border-t border-white/[0.06] flex items-center justify-end">
              <button
                onClick={() => setSelectedOrgId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#171C24] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
