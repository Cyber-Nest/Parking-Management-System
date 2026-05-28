"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { resetOfficerPassword } from "@/services/officerAuth.service";

export default function OfficerResetPassword() {
  const params = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(params.get('token') ?? '');
    setId(params.get('id') ?? '');
  }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return toast.error('Missing reset token');
    setLoading(true);
    try {
      await resetOfficerPassword(token, id, password);
      toast.success('Password reset successfully. You can now sign in.');
      router.push('/officer/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-lg border border-slate-200">
          <input required type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border px-4 py-3" />
          <button type="submit" disabled={loading} className="w-full bg-[#1062ff] text-white py-3 rounded-md">Set New Password</button>
        </form>
      </div>
    </div>
  );
}
