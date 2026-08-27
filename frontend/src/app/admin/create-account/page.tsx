"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";

export default function CreateAccountPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"controller" | "mechanic">("mechanic");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, email, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      setSuccess(`Account created for ${fullName}. A temporary password was emailed to ${email}.`);
      setFullName("");
      setEmail("");
      setRole("mechanic");
    } catch (err) {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#14181f] p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Back to dashboard
        </button>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-[#1b2028]/85 p-8"
        >
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-14 h-14 rounded-full bg-[#1f2530] border border-[#EF9F27] flex items-center justify-center">
              <SteeringWheelIcon className="w-6 h-6 text-[#EF9F27]" />
            </div>
            <h1 className="text-xl font-medium text-white">Create account</h1>
            <p className="text-sm text-white/50 text-center">
              A temporary password will be generated and emailed automatically.
            </p>
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

          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/60">Full name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Rahmani"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 text-sm text-white placeholder-white/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/60">Email address</label>
              <input
                type="email"
                required
                placeholder="name@kartmaint.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 text-sm text-white placeholder-white/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/60">Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("controller")}
                  className={`rounded-lg py-2.5 text-sm font-medium border transition-colors ${
                    role === "controller"
                      ? "bg-[#EF9F27] text-[#412402] border-[#EF9F27]"
                      : "bg-white/5 text-white/60 border-white/15 hover:bg-white/10"
                  }`}
                >
                  Controller
                </button>
                <button
                  type="button"
                  onClick={() => setRole("mechanic")}
                  className={`rounded-lg py-2.5 text-sm font-medium border transition-colors ${
                    role === "mechanic"
                      ? "bg-[#EF9F27] text-[#412402] border-[#EF9F27]"
                      : "bg-white/5 text-white/60 border-white/15 hover:bg-white/10"
                  }`}
                >
                  Mechanic
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] disabled:opacity-60 py-2.5 text-sm font-medium text-[#412402] transition-colors"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}