"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { loginUser } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (email === "admin@dummy.com" && password === "12345678") {
        document.cookie = "auth=true; path=/";
        toast.success("Welcome back, Admin!");
        router.push("/dashboard");
      } else {
        toast.error("Invalid email or password");
        setIsLoading(false);
      }
    }, 1000);
  };

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     setIsLoading(true);

  //     const data = await loginUser({
  //       email,
  //       password,
  //     });

  //     toast.success(data.message || "Login successful");

  //     router.push("/dashboard");
  //   } catch (error: any) {
  //     toast.error(error?.response?.data?.message || "Login failed");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary)] opacity-[0.03] blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-accent)] opacity-[0.03] blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-[var(--color-primary)] rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/20 mb-4 rotate-[-5deg]">
            <span className="text-white text-3xl px-10 py-1 font-black italic ">
              ParkSmart
            </span>
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
            Admin Portal
          </h2>
          <p className="text-[var(--color-text-secondary)] font-medium mt-1">
            Secure access to ParkSmart panel
          </p>
        </div>

        <div className="bg-[var(--color-surface)] p-8 rounded-[2rem] shadow-[var(--shadow-soft)] border border-[var(--color-border)] backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary)] opacity-0 group-focus-within:opacity-100 transition-opacity" />

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                  required
                  type="email"
                  placeholder="admin@dummy.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-[var(--color-text-secondary)]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-transparent font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-900/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-8 text-xs text-[var(--color-text-muted)] font-medium">
          &copy; 2026 ParkSmart Systems. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
