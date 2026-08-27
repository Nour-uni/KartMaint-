"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Car, Home, Settings, History } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";
import NotificationBell from "@/components/NotificationBell";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/controller/dashboard" },
  { label: "History", icon: History, path: "/controller/history" },
  { label: "Settings", icon: Settings, path: "/profile" },
];

type KartStatus = "functional" | "out_of_order" | "in_repair";

interface Kart {
  id: string;
  kartNumber: string;
  status: KartStatus;
}

const flagColor: Record<KartStatus, string> = {
  functional: "#3DDC84",
  out_of_order: "#E5484D",
  in_repair: "#EF9F27",
};

const statusLabel: Record<KartStatus, string> = {
  functional: "Functional",
  out_of_order: "Out of order",
  in_repair: "In repair",
};

function KartFlag({ status }: { status: KartStatus }) {
  const color = flagColor[status];
  return (
    <svg width="28" height="34" viewBox="0 0 28 34" aria-hidden="true">
      <line x1="4" y1="2" x2="4" y2="32" stroke="#5A5F6A" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 3 L24 8 L4 15 Z" fill={color} />
    </svg>
  );
}

export default function ControllerDashboard() {
  const router = useRouter();
  const [karts, setKarts] = useState<Kart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [controllerName] = useState("Controller");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchKarts(token);
  }, [router]);

  async function fetchKarts(token: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/karts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKarts(data);
    } catch (err) {
      setError("Couldn't load the fleet. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(kart: Kart) {
    // Karts currently with a mechanic aren't editable here — that's system-controlled.
    if (kart.status === "in_repair") return;

    const newStatus: KartStatus = kart.status === "functional" ? "out_of_order" : "functional";
    setUpdatingId(kart.id);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/karts/${kart.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Couldn't update that kart.");
        return;
      }

      setKarts((prev) => prev.map((k) => (k.id === kart.id ? data : k)));
    } catch (err) {
      setError("Couldn't reach the server.");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#14181f] p-6">
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#181c24]/90 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#1f2530] border border-[#EF9F27] flex items-center justify-center">
              <SteeringWheelIcon className="w-5 h-5 text-[#EF9F27]" />
            </div>
            <div>
              <p className="text-lg font-medium text-white leading-tight">KartMaint</p>
              <p className="text-xs text-white/50 leading-tight">Fleet maintenance management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/profile")}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Hello, <span className="font-medium text-white">{controllerName}</span>
            </button>
            <NotificationBell />
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-white/70" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex">
          <nav className="w-40 shrink-0 border-r border-white/10 py-6 px-3 flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon, path }) => {
              const isActive = path === "/controller/dashboard";
              return (
                <button
                  key={label}
                  onClick={() => router.push(path)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg py-3 text-xs transition-colors ${
                    isActive
                      ? "text-[#EF9F27] border-l-2 border-[#EF9F27] bg-white/[0.03]"
                      : "text-white/50 border-l-2 border-transparent hover:text-white/80"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Main content */}
          <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-white">Daily fleet check</h2>
            <p className="text-xs text-white/40">
              {karts.filter((k) => k.status === "functional").length} / {karts.length} functional
            </p>
          </div>
          <p className="text-sm text-white/50 mb-6">
            Tap a kart to flip its status once you&apos;ve checked it. Karts currently with a
            mechanic can&apos;t be changed here.
          </p>

          {error && (
            <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-white/50">Loading fleet…</p>
          ) : karts.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-sm text-white/50">
                No karts in the fleet yet. Ask an admin to add some.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {karts.map((kart) => (
                <button
                  key={kart.id}
                  onClick={() => toggleStatus(kart)}
                  disabled={kart.status === "in_repair" || updatingId === kart.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col items-center gap-2 hover:bg-white/[0.06] transition-colors disabled:cursor-not-allowed disabled:hover:bg-white/[0.03]"
                >
                  <KartFlag status={kart.status} />
                  <Car className="w-8 h-8 text-white/70" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-white">Kart #{kart.kartNumber}</p>
                  <span
                    className="text-[11px] font-medium tracking-wide"
                    style={{ color: flagColor[kart.status] }}
                  >
                    {updatingId === kart.id ? "UPDATING…" : statusLabel[kart.status].toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-8 border-t border-white/10 pt-5">
            {(Object.keys(flagColor) as KartStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <svg width="18" height="22" viewBox="0 0 28 34" aria-hidden="true">
                  <line x1="4" y1="2" x2="4" y2="32" stroke="#5A5F6A" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 3 L24 8 L4 15 Z" fill={flagColor[status]} />
                </svg>
                <span className="text-xs text-white/60">{statusLabel[status]}</span>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}