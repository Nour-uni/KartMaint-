"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, ClipboardList, Car, Settings, LogOut } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";
import NotificationBell from "@/components/NotificationBell";

type KartStatus = "functional" | "out_of_order" | "in_repair";

interface Kart {
  id: string;
  kartNumber: string;
  status: KartStatus;
}

const navItems = [
  { label: "Dashboard", icon: Home, path: "/mechanic-dashboard" },
  { label: "Tasks", icon: ClipboardList, path: "/mechanic-dashboard/tasks" },
  { label: "Fleet", icon: Car, path: "/mechanic-dashboard/fleet" },
  { label: "Settings", icon: Settings, path: "/profile" },
];

const statusStyles: Record<KartStatus, string> = {
  functional: "bg-emerald-500/10 text-emerald-400",
  out_of_order: "bg-red-500/10 text-red-400",
  in_repair: "bg-[#EF9F27]/10 text-[#EF9F27]",
};

const statusLabel: Record<KartStatus, string> = {
  functional: "FUNCTIONAL",
  out_of_order: "OUT OF ORDER",
  in_repair: "IN REPAIR",
};

export default function MechanicFleetPage() {
  const router = useRouter();
  const [karts, setKarts] = useState<Kart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mechanicName, setMechanicName] = useState("Mechanic");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadKarts(token);
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setMechanicName(data.fullName))
      .catch(() => {});
  }, [router]);

  async function loadKarts(token: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/karts", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setKarts(await res.json());
    } catch (err) {
      setError("Couldn't load the fleet.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#14181f] p-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#181c24]/90 overflow-hidden">
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
            <button onClick={() => router.push("/profile")} className="text-sm text-white/70 hover:text-white transition-colors">
              Hello, Mechanic <span className="font-medium text-white">{mechanicName}</span>
            </button>
            <NotificationBell />
            <button onClick={handleLogout} aria-label="Log out" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4 text-white/70" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="flex">
          <nav className="w-40 shrink-0 border-r border-white/10 py-6 px-3 flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon, path }) => {
              const isActive = path === "/mechanic-dashboard/fleet";
              return (
                <button
                  key={label}
                  onClick={() => router.push(path)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg py-3 text-xs transition-colors ${
                    isActive ? "text-[#EF9F27] border-l-2 border-[#EF9F27] bg-white/[0.03]" : "text-white/50 border-l-2 border-transparent hover:text-white/80"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                  {label}
                </button>
              );
            })}
          </nav>

          <main className="flex-1 p-6">
            <h2 className="text-lg font-medium text-white mb-1">Fleet</h2>
            <p className="text-sm text-white/50 mb-6">
              Full fleet status, read-only. Only controllers can update these.
            </p>

            {error && (
              <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
            )}

            {loading ? (
              <p className="text-sm text-white/50">Loading…</p>
            ) : karts.length === 0 ? (
              <p className="text-sm text-white/50">No karts in the fleet yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {karts.map((kart) => (
                  <div key={kart.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-white mb-2">Kart #{kart.kartNumber}</p>
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${statusStyles[kart.status]}`}>
                      {statusLabel[kart.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}