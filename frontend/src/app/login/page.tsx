"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Wrench, ClipboardCheck } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";

interface LoginResponse {
  token: string;
  role: "admin" | "controller" | "mechanic";
  mustChangePassword: boolean;
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      localStorage.setItem("token", data.token);

      if (data.mustChangePassword) {
        router.push("/change-password");
      } else if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.role === "controller") {
        router.push("/controller/dashboard");
      } else {
        router.push("/mechanic-dashboard");
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
        <circle
          cx="688"
          cy="384"
          r="380"
          fill="none"
          stroke="#e2e6ea"
          strokeOpacity="0.08"
          strokeWidth="2"
          strokeDasharray="20 16"
        />
        <path
          d="M 260 300 A 380 380 0 0 0 360 560"
          fill="none"
          stroke="#D85A30"
          strokeOpacity="0.35"
          strokeWidth="10"
          strokeDasharray="18 14"
        />
        <g transform="translate(300,260)" opacity="0.12">
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 5 }).map((_, col) =>
              (row + col) % 2 === 0 ? (
                <rect
                  key={`${row}-${col}`}
                  x={col * 44}
                  y={row * 44}
                  width="44"
                  height="44"
                  fill="#e2e6ea"
                />
              ) : null
            )
          )}
        </g>
      </svg>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#1b2028]/85 backdrop-blur-sm p-8"
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#1f2530] border border-[#EF9F27] flex items-center justify-center">
            <SteeringWheelIcon className="w-6 h-6 text-[#EF9F27]" />
          </div>
          <h1 className="text-2xl font-medium text-white">KartMaint</h1>
          <p className="text-sm text-white/50">Fleet maintenance management</p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 mb-2">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-[#EF9F27] focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 text-sm text-white placeholder-white/40"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 text-sm text-white placeholder-white/40"
          />
        </div>

        <div className="text-right mb-4">
          <a href="/forgot-password" className="text-xs text-white/60 hover:text-white/90">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] disabled:opacity-60 py-2.5 text-sm font-medium text-[#412402] transition-colors"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>

        <div className="flex items-center justify-center gap-5 mt-5 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" strokeWidth={1.75} /> Admin
          </span>
          <span className="flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={1.75} /> Controller
          </span>
          <span className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" strokeWidth={1.75} /> Mechanic
          </span>
        </div>
      </form>
    </div>
  );
}