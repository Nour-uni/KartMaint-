"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";

interface Me {
  fullName: string;
  email: string;
  role: "admin" | "controller" | "mechanic";
}

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadMe(token);
  }, [router]);

  async function loadMe(token: string) {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data: Me = await res.json();
      setMe(data);
      setFullName(data.fullName);
    } catch (err) {
      setError("Couldn't load your profile.");
    } finally {
      setLoading(false);
    }
  }

  function dashboardPathFor(role: Me["role"]) {
    if (role === "admin") return "/admin/dashboard";
    if (role === "controller") return "/controller/dashboard";
    return "/mechanic-dashboard";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword && !currentPassword) {
      setError("Enter your current password to set a new one.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Couldn't update your profile.");
        return;
      }

      setSuccess("Profile updated.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError("Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#14181f] flex items-center justify-center">
        <p className="text-sm text-white/50">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14181f] p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        {me && (
          <button
            onClick={() => router.push(dashboardPathFor(me.role))}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Back to dashboard
          </button>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-[#1b2028]/85 p-8"
        >
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-14 h-14 rounded-full bg-[#1f2530] border border-[#EF9F27] flex items-center justify-center">
              <SteeringWheelIcon className="w-6 h-6 text-[#EF9F27]" />
            </div>
            <h1 className="text-xl font-medium text-white">My profile</h1>
            {me && <p className="text-sm text-white/50 capitalize">{me.role} · {me.email}</p>}
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="mb-4 text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs text-white/60">Full name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 text-sm text-white"
            />
          </div>

          <div className="border-t border-white/10 pt-4 mb-4">
            <p className="text-xs text-white/40 mb-3">Leave blank to keep your current password.</p>

            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 pr-10 text-sm text-white placeholder-white/40"
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
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 text-sm text-white placeholder-white/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] disabled:opacity-60 py-2.5 text-sm font-medium text-[#412402] transition-colors"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}