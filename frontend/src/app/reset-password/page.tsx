"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid. Request a new one.");
      return;
    }

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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "This reset link is invalid or expired.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
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

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#1b2028]/85 backdrop-blur-sm p-8">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#1f2530] border border-[#EF9F27] flex items-center justify-center">
            <SteeringWheelIcon className="w-6 h-6 text-[#EF9F27]" />
          </div>
          <h1 className="text-xl font-medium text-white">Reset your password</h1>
        </div>

        {success ? (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-3 text-center">
            Password reset. Redirecting you to login…
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
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
              {loading ? "Saving…" : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// useSearchParams requires a Suspense boundary in Next.js
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}