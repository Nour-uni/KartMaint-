"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // The backend always responds the same way whether or not the email exists,
      // so we don't reveal which emails are registered.
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong.");
      }
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
          <h1 className="text-xl font-medium text-white">Forgot password?</h1>
          <p className="text-sm text-white/50 text-center">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-3 mb-4">
              If that email exists in our system, a reset link has been sent. Check your inbox.
            </p>
            <Link href="/login" className="text-sm text-[#EF9F27] hover:text-[#e2921c]">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-[#EF9F27] focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 text-sm text-white placeholder-white/40 mb-4"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] disabled:opacity-60 py-2.5 text-sm font-medium text-[#412402] transition-colors mb-4"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <p className="text-center">
              <Link href="/login" className="text-xs text-white/50 hover:text-white/80">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}