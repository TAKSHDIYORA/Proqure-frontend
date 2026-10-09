import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";
import {
  Building2,
  Mail,
  Lock,
  User,
  Hash,
  AlertCircle,
  ArrowLeft,
  Factory,
  Truck,
  Check,
} from "lucide-react";

export const RegisterPage: React.FC = () => {
  const [organizationName, setOrganizationName] = useState("");
  const [businessRegistrationCode, setBusinessRegistrationCode] = useState("");
  const [organizationEmail, setOrganizationEmail] = useState("");
  const [capabilities, setCapabilities] = useState<("MANUFACTURER" | "SUPPLIER")[]>([
    "MANUFACTURER",
  ]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleCapability = (cap: "MANUFACTURER" | "SUPPLIER") => {
    if (capabilities.includes(cap)) {
      if (capabilities.length === 1) {
        setError("You must select at least one organization capability.");
        return;
      }
      setCapabilities(capabilities.filter((c) => c !== cap));
    } else {
      setError(null);
      setCapabilities([...capabilities, cap]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (capabilities.length === 0) {
      setError("Please select at least one capability (Manufacturer or Supplier).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authApi.register({
        organizationName,
        businessRegistrationCode,
        capabilities,
        organizationEmail,
        fullName,
        email,
        password,
      });

      // Automatically store session and navigate to dashboard
      login(res.token, res.user, res.organization);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to register organization. Please check details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E13] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#E6E8EB] selection:bg-[#7C83FF]/30 selection:text-white">
      {/* Back to Home Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl mb-4">
        <Link
          to="/"
          className="inline-flex items-center text-xs text-[#9AA3AE] hover:text-[#E6E8EB] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Overview
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div className="flex justify-center items-center space-x-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#7C83FF]/15 border border-[#7C83FF]/30 flex items-center justify-center text-[#7C83FF] font-bold text-xl shadow-sm">
            P
          </div>
          <h2 className="text-2xl font-extrabold text-[#E6E8EB] tracking-tight">
            ProQure ERP
          </h2>
        </div>
        <p className="text-xs text-[#9AA3AE]">
          Provision your enterprise tenant node & configure administrator credentials
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-[#11151C] py-8 px-6 sm:px-10 rounded-xl border border-white/[0.08] shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-lg flex items-center space-x-2 text-[#F87171] text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Organization Details */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9AA3AE] border-b border-white/[0.06] pb-2 mb-4 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#7C83FF]" />
                <span>1. Organization & Operational Capability</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Organization Legal Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-[#697381]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Apex Industrial Ltd"
                      className="block w-full pl-9 pr-3 py-2 bg-[#0B0E13] border border-white/[0.08] rounded-lg text-xs text-[#E6E8EB] placeholder-[#697381] focus:outline-none focus:border-[#7C83FF] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Registration Code / Tax ID *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-4 w-4 text-[#697381]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={businessRegistrationCode}
                      onChange={(e) => setBusinessRegistrationCode(e.target.value)}
                      placeholder="e.g. REG-984210"
                      className="block w-full pl-9 pr-3 py-2 bg-[#0B0E13] border border-white/[0.08] rounded-lg text-xs text-[#E6E8EB] placeholder-[#697381] focus:outline-none focus:border-[#7C83FF] transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Corporate Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#697381]" />
                    </div>
                    <input
                      type="email"
                      required
                      value={organizationEmail}
                      onChange={(e) => setOrganizationEmail(e.target.value)}
                      placeholder="procurement@organization.com"
                      className="block w-full pl-9 pr-3 py-2 bg-[#0B0E13] border border-white/[0.08] rounded-lg text-xs text-[#E6E8EB] placeholder-[#697381] focus:outline-none focus:border-[#7C83FF] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Capabilities Selector */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1.5">
                  Business Capabilities (Select all that apply) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCapability("MANUFACTURER")}
                    className={`flex items-start p-3 text-left rounded-lg border transition-all ${
                      capabilities.includes("MANUFACTURER")
                        ? "border-[#7C83FF] bg-[#7C83FF]/10 text-white"
                        : "border-white/[0.06] hover:border-white/[0.12] bg-[#0F1218] text-[#9AA3AE]"
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-[#171C24] border border-white/[0.08] text-[#7C83FF] mr-3 flex-shrink-0">
                      <Factory className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#E6E8EB]">
                          Manufacturer
                        </span>
                        {capabilities.includes("MANUFACTURER") && (
                          <Check className="w-3.5 h-3.5 text-[#7C83FF]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#9AA3AE] mt-0.5 leading-snug">
                        Issues purchase requisitions, launches RFQs, produces goods, and stocks inventory.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCapability("SUPPLIER")}
                    className={`flex items-start p-3 text-left rounded-lg border transition-all ${
                      capabilities.includes("SUPPLIER")
                        ? "border-[#7C83FF] bg-[#7C83FF]/10 text-white"
                        : "border-white/[0.06] hover:border-white/[0.12] bg-[#0F1218] text-[#9AA3AE]"
                    }`}
                  >
                    <div className="p-1.5 rounded-md bg-[#171C24] border border-white/[0.08] text-[#7C83FF] mr-3 flex-shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#E6E8EB]">
                          Supplier
                        </span>
                        {capabilities.includes("SUPPLIER") && (
                          <Check className="w-3.5 h-3.5 text-[#7C83FF]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#9AA3AE] mt-0.5 leading-snug">
                        Submits competitive RFQ bids, fulfills purchase orders, and delivers inventory.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Administrator User Account */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9AA3AE] border-b border-white/[0.06] pb-2 mb-4 flex items-center space-x-2">
                <User className="w-4 h-4 text-[#7C83FF]" />
                <span>2. Organization Administrator Credentials</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Administrator Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[#697381]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="block w-full pl-9 pr-3 py-2 bg-[#0B0E13] border border-white/[0.08] rounded-lg text-xs text-[#E6E8EB] placeholder-[#697381] focus:outline-none focus:border-[#7C83FF] transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Administrator Login Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#697381]" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@organization.com"
                      className="block w-full pl-9 pr-3 py-2 bg-[#0B0E13] border border-white/[0.08] rounded-lg text-xs text-[#E6E8EB] placeholder-[#697381] focus:outline-none focus:border-[#7C83FF] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#697381]" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="block w-full pl-9 pr-3 py-2 bg-[#0B0E13] border border-white/[0.08] rounded-lg text-xs text-[#E6E8EB] placeholder-[#697381] focus:outline-none focus:border-[#7C83FF] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#697381]" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="block w-full pl-9 pr-3 py-2 bg-[#0B0E13] border border-white/[0.08] rounded-lg text-xs text-[#E6E8EB] placeholder-[#697381] focus:outline-none focus:border-[#7C83FF] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] focus:outline-none disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? "Provisioning Tenant..." : "Create Organization & Launch ERP"}
              </button>
            </div>
          </form>

          {/* Link to Login */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-[#697381]">
            Already have an active enterprise tenant?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#7C83FF] hover:text-[#6E76FF] transition-colors ml-1"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
