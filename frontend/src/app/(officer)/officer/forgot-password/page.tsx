"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { forgotOfficerPassword } from "@/services/officerAuth.service";

export default function OfficerForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotOfficerPassword(email);
      toast.success('If this email is registered, you will receive a reset link shortly.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <p className="text-sm text-slate-500 mb-6">Enter your officer email to receive a reset link.</p>
        <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-lg border border-slate-200">
          <input required type="email" placeholder="officer@dept.gov" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border px-4 py-3" />
          <button type="submit" disabled={loading} className="w-full bg-[#1062ff] text-white py-3 rounded-md">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
}
