import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  organizationApi,
  UpdateOrganizationInput,
} from "../../api/organization";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import {
  Building2,
  Globe,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [marketplaceVisible, setMarketplaceVisible] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["myOrganization"],
    queryFn: () => organizationApi.getMyOrganization(),
  });

  const org = data?.organization;

  useEffect(() => {
    if (org) {
      setName(org.name || "");
      setDescription(org.description || "");
      setPhone(org.phone || "");
      setCity(org.address?.city || "");
      setState(org.address?.state || "");
      setCountry(org.address?.country || "");
      setPostalCode(org.address?.postalCode || "");
      setMarketplaceVisible(org.marketplaceVisible ?? true);
    }
  }, [org]);

  const updateMutation = useMutation({
    mutationFn: (input: UpdateOrganizationInput) =>
      organizationApi.updateMyOrganization(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOrganization"] });
      setSuccessMessage("Organization profile updated successfully.");
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(
        err.response?.data?.message || "Failed to update organization profile"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    updateMutation.mutate({
      name,
      description,
      phone,
      marketplaceVisible,
      address: {
        city,
        state,
        country,
        postalCode,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <SkeletonLoader variant="card" count={2} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
          Organization Profile & Tenant Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
          Configure corporate identity, commercial operating address, and public B2B marketplace discovery.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-[#4ADE80]/[0.08] text-[#4ADE80] border border-[#4ADE80]/20 rounded-xl flex items-center space-x-2 text-xs">
          <CheckCircle className="w-4 h-4 text-[#4ADE80] flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-[#F87171]/[0.08] text-[#F87171] border border-[#F87171]/20 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-[#F87171] flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tenant Card */}
      <div className="bg-[#11151C] p-5 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#171C24] border border-white/[0.08] text-[#7C83FF] flex items-center justify-center font-bold text-xl shadow-sm">
            {org?.name?.charAt(0) || "P"}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#E6E8EB]">{org?.name}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[10px] font-mono text-[#697381] bg-[#171C24] border border-white/[0.06] px-1.5 py-0.5 rounded">
                Code: {org?.businessRegistrationCode}
              </span>
              <div className="flex space-x-1">
                {org?.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#7C83FF]/15 text-[#7C83FF] border border-[#7C83FF]/30 uppercase tracking-wider"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right text-[11px] text-[#697381]">
          Tenant Node: <span className="font-mono text-[#9AA3AE]">{org?._id}</span>
        </div>
      </div>

      {/* Settings Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#11151C] rounded-xl border border-white/[0.06] p-5 sm:p-6 space-y-5"
      >
        <div>
          <h3 className="text-sm font-bold text-[#E6E8EB] mb-3">
            Enterprise Legal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                Organization Legal Name *
              </label>
              <input
                type="text"
                required
                disabled={!isAdmin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                Business Registration Code (CIN/GST)
              </label>
              <input
                type="text"
                disabled
                value={org?.businessRegistrationCode || ""}
                className="w-full px-3 py-1.5 text-xs bg-[#0F1218] border border-white/[0.05] rounded-lg text-[#697381] font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                Primary Contact Email
              </label>
              <input
                type="email"
                disabled
                value={org?.email || ""}
                className="w-full px-3 py-1.5 text-xs bg-[#0F1218] border border-white/[0.05] rounded-lg text-[#697381] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                Primary Telephone
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] disabled:opacity-50 tabular-nums"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
            Enterprise Description & Capabilities
          </label>
          <textarea
            rows={3}
            disabled={!isAdmin}
            placeholder="Describe your manufacturing capacities, certifications, or procurement requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] disabled:opacity-50 leading-relaxed"
          />
        </div>

        {/* Operating Address */}
        <div className="pt-4 border-t border-white/[0.04]">
          <h3 className="text-sm font-bold text-[#E6E8EB] mb-3">
            Registered Facility & Operating Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                City
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="e.g. Pune"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                State / Province
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="e.g. Maharashtra"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                Country
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                Postal Code
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                placeholder="411001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] disabled:opacity-50 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Directory Visibility */}
        <div className="pt-4 border-t border-white/[0.04]">
          <div className="p-3 bg-[#0F1218] rounded-lg border border-white/[0.05] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#E6E8EB] block">
                Public B2B Marketplace Discovery
              </span>
              <span className="text-[10px] text-[#697381]">
                Allow other verified organizations on ProQure to discover your profile and send connection requests
              </span>
            </div>
            <input
              type="checkbox"
              disabled={!isAdmin}
              checked={marketplaceVisible}
              onChange={(e) => setMarketplaceVisible(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0B0E13] border-white/[0.12] text-[#7C83FF] focus:ring-0 disabled:opacity-50"
            />
          </div>
        </div>

        {isAdmin && (
          <div className="pt-3 border-t border-white/[0.04] flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updateMutation.isPending ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
