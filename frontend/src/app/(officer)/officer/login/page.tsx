"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { loginOfficer } from "@/services/officerAuth.service";

export default function OfficerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await loginOfficer({ email, password });
      toast.success(data.message || "Login successful");
      const accessToken = data?.data?.accessToken;
      const refreshToken = data?.data?.refreshToken;

      if (accessToken) {
        document.cookie = `token=${encodeURIComponent(accessToken)}; path=/; samesite=lax`;
        window.localStorage.setItem("token", accessToken);
      }
      if (refreshToken) {
        document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; samesite=lax`;
        window.localStorage.setItem("refreshToken", refreshToken);
      }

      const officer = data?.data?.officer;
      if (officer) {
        window.localStorage.setItem("officerProfile", JSON.stringify(officer));
      }

      try {
        const { officerPortalService } = await import("@/services/officer-portal.service");
        await officerPortalService.startShift();
      } catch {
        /* shift may start on shell if this fails */
      }

      router.push("/officer");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-4 flex rotate-[-5deg] items-center justify-center rounded-2xl bg-[#1062ff] shadow-lg shadow-blue-900/20">
            <span className="px-10 py-1 text-3xl font-black italic text-white">Parks-Smart</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Officer Portal</h2>
          <p className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">
            Secure access to Parks-Smart enforcement
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)] backdrop-blur-sm">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#1062ff] via-[#6ca0ff] to-[#1062ff] opacity-0 transition-opacity group-focus-within:opacity-100" />

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="ml-1 text-sm font-bold text-[var(--color-text-secondary)]">Email Address</label>
              <div className="relative mt-2">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  required
                  type="email"
                  placeholder="officer@dept.gov"
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] py-3.5 pl-12 pr-4 font-medium outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#9bbcff]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-[var(--color-text-secondary)]">Password</label>
              <div className="relative mt-2">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] py-3.5 pl-12 pr-12 font-medium outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#9bbcff]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <a href="/officer/forgot-password" className="text-sm text-[#1062ff]">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1062ff] py-4 font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#0b4fd0] active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
