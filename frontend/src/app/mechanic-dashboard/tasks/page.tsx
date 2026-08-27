"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, ClipboardList, Car, Settings, LogOut, Clock, Wrench } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";
import NotificationBell from "@/components/NotificationBell";

interface RepairReport {
  id: string;
  kartNumber: string;
  cause: string | null;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  equipmentUsed: { itemName: string; quantity: number }[];
}
const navItems = [
  { label: "Dashboard", icon: Home, path: "/mechanic-dashboard" },
  { label: "Tasks", icon: ClipboardList, path: "/mechanic-dashboard/tasks" },
  { label: "Fleet", icon: Car, path: "/mechanic-dashboard/fleet" },
  { label: "Settings", icon: Settings, path: "/profile" },
];

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
}

export default function MechanicTasksPage() {
  const router = useRouter();
  const [reports, setReports] = useState<RepairReport[]>([]);
  const [mechanicName, setMechanicName] = useState("Mechanic");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadReports(token);
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setMechanicName(data.fullName))
      .catch(() => {});
  }, [router]);

  async function loadReports(token: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/repair-reports/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setReports(await res.json());
    } catch (err) {
      setError("Couldn't load your repair reports.");
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
              const isActive = path === "/mechanic-dashboard/tasks";
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
            <h2 className="text-lg font-medium text-white mb-1">Tasks</h2>
            <p className="text-sm text-white/50 mb-6">
              Your completed repair reports — cause, duration, and equipment used. These are visible to your admin.
            </p>

            {error && (
              <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
            )}

            {loading ? (
              <p className="text-sm text-white/50">Loading…</p>
            ) : reports.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-white/50">
                  No completed repairs yet. Once you finish a repair, it&apos;ll show up here as a report.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reports.map((report) => (
                  <div key={report.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-white">Kart #{report.kartNumber}</p>
                      <div className="flex items-center gap-1.5 text-xs text-white/50">
                        <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                        {formatDuration(report.durationMinutes)}
                      </div>
                    </div>

                    {report.cause && (
                      <p className="text-xs text-white/60 mb-2">
                        <span className="text-white/40">Cause:</span> {report.cause}
                      </p>
                    )}

                    {report.equipmentUsed && report.equipmentUsed.length > 0 && (
                      <div className="flex items-start gap-1.5 mb-2">
                        <Wrench className="w-3.5 h-3.5 text-white/40 mt-0.5" strokeWidth={1.75} />
                        <p className="text-xs text-white/60">
                          {report.equipmentUsed.map((e) => `${e.quantity}× ${e.itemName}`).join(", ")}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-white/30 mt-2">
                      Taken in {new Date(report.startedAt).toLocaleString()} · Completed {new Date(report.completedAt).toLocaleString()}
                    </p>
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