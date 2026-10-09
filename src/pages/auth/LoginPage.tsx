import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";
import { Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await authApi.login({ email, password });
      login(res.token, res.user, res.organization);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to sign in. Please verify your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E13] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#E6E8EB] selection:bg-[#7C83FF]/30 selection:text-white">
      {/* Back to Home Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4 px-4 sm:px-0">
        <Link
          to="/"
          className="inline-flex items-center text-xs text-[#9AA3AE] hover:text-[#E6E8EB] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Overview
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center space-x-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#7C83FF]/15 border border-[#7C83FF]/30 flex items-center justify-center text-[#7C83FF] font-bold text-base shadow-sm">
            P
          </div>
          <h2 className="text-2xl font-extrabold text-[#E6E8EB] tracking-tight">
            ProQure ERP
          </h2>
        </div>
        <p className="text-xs text-[#9AA3AE]">
          Multi-tenant B2B Procurement, Storage & Supply Chain Network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#11151C] py-8 px-6 sm:px-8 rounded-xl border border-white/[0.08] shadow-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-lg flex items-center space-x-2 text-[#F87171] text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                Corporate Email Address
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
                Password
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
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-[#0B0E13] border border-white/[0.08] rounded-lg text-xs text-[#E6E8EB] placeholder-[#697381] focus:outline-none focus:border-[#7C83FF] transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] focus:outline-none disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? "Authenticating..." : "Sign in to Operating Console"}
              </button>
            </div>
          </form>

          {/* Link to Register */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-[#697381]">
            Need a tenant for your organization?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#7C83FF] hover:text-[#6E76FF] transition-colors ml-1"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
