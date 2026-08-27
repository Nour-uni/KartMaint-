"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      // Password changed — send them to login again so a fresh token/role redirect happens cleanly.
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err) {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#14181f] flex items-center justify-center overflow-hidden p-6">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1376 768"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="1376" height="768" fill="#14181f" />
        <circle cx="688" cy="384" r="520" fill="none" stroke="#1f2530" strokeWidth="60" />
        <circle cx="688" cy="384" r="380" fill="none" stroke="#1b2028" strokeWidth="90" />
      </svg>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#1b2028]/85 backdrop-blur-sm p-8"
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#1f2530] border border-[#EF9F27] flex items-center justify-center">
            <SteeringWheelIcon className="w-6 h-6 text-[#EF9F27]" />
          </div>
          <h1 className="text-xl font-medium text-white">Set a new password</h1>
          <p className="text-sm text-white/50 text-center">
            This is your first login. Choose a new password to continue.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 mb-2">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-[#EF9F27] focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 pr-10 text-sm text-white placeholder-white/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.75} />
              )}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 text-sm text-white placeholder-white/40"
          />
        </div>

        <p className="text-xs text-white/40 mb-4">Must be at least 8 characters.</p>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] disabled:opacity-60 py-2.5 text-sm font-medium text-[#412402] transition-colors"
        >
          {loading ? "Saving…" : "Set new password"}
        </button>
      </form>
    </div>
  );
}