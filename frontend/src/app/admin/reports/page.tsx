"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Car, Package, FileText, Bell, LogOut, Download } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";
import NotificationBell from "@/components/NotificationBell";

interface Summary {
  fleetStatus: { functional: number; out_of_order: number; in_repair: number; total: number };
  lowStockItems: { name: string; quantity: number; threshold: number }[];
  requestStats: { pending: number; approved: number; rejected: number; total: number };
  repairsCompletedCount: number;
  recentActivity: { id: string; actorName: string; action: string; details: string; createdAt: string }[];
}

interface RepairReport {
  id: string;
  kartNumber: string;
  cause: string | null;
  startedAt: string;
  durationMinutes: number;
  completedAt: string;
  equipmentUsed: { itemName: string; quantity: number }[];
  mechanic: { id: string; fullName: string };
}

const navItems = [
  { label: "Accounts", icon: Users, path: "/admin/accounts" },
  { label: "Fleet", icon: Car, path: "/admin/dashboard" },
  { label: "Stock", icon: Package, path: "/admin/stock" },
  { label: "Reports", icon: FileText, path: "/admin/reports" },
];

export default function AdminReportsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [repairReports, setRepairReports] = useState<RepairReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadSummary(token);
  }, [router]);

  async function loadSummary(token: string) {
    setLoading(true);
    setError("");
    try {
      const [summaryRes, reportsRes] = await Promise.all([
        fetch("/api/reports/summary", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/repair-reports", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!summaryRes.ok || !reportsRes.ok) throw new Error();
      setSummary(await summaryRes.json());
      setRepairReports(await reportsRes.json());
    } catch (err) {
      setError("Couldn't load reports.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(type: "pdf" | "excel") {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/reports/export/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError("Export failed.");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kartmaint-fleet-report.${type === "pdf" ? "pdf" : "xlsx"}`;
    a.click();
    window.URL.revokeObjectURL(url);
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
              Hello, Admin <span className="font-medium text-white">Admin</span>
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
              const isActive = path === "/admin/reports";
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-white">Reports</h2>
              <div className="flex gap-2">
                <button onClick={() => handleExport("pdf")} className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 px-3 py-2 text-xs text-white/80 transition-colors">
                  <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Export PDF
                </button>
                <button onClick={() => handleExport("excel")} className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 px-3 py-2 text-xs text-white/80 transition-colors">
                  <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Export Excel
                </button>
              </div>
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
            )}

            {loading || !summary ? (
              <p className="text-sm text-white/50">Loading…</p>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/50 mb-1">Fleet</p>
                    <p className="text-2xl text-white font-medium">{summary.fleetStatus.total}</p>
                    <p className="text-xs text-emerald-400 mt-1">{summary.fleetStatus.functional} functional</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/50 mb-1">Out of order</p>
                    <p className="text-2xl text-white font-medium">{summary.fleetStatus.out_of_order}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/50 mb-1">Repairs completed</p>
                    <p className="text-2xl text-white font-medium">{summary.repairsCompletedCount}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/50 mb-1">Pending requests</p>
                    <p className="text-2xl text-white font-medium">{summary.requestStats.pending}</p>
                  </div>
                </div>

                {summary.lowStockItems.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-white/70 mb-3">Low stock</h3>
                    <div className="flex flex-col gap-2">
                      {summary.lowStockItems.map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5">
                          <span className="text-sm text-white">{item.name}</span>
                          <span className="text-xs text-red-400">{item.quantity} left (threshold {item.threshold})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-sm font-medium text-white/70 mb-3">Repair reports</h3>
                  {repairReports.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
                      <p className="text-sm text-white/50">No completed repairs yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {repairReports.map((report) => (
                        <div key={report.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-white">
                              Kart #{report.kartNumber} · <span className="text-white/60">{report.mechanic.fullName}</span>
                            </p>
                            <p className="text-xs text-white/40">{report.durationMinutes} min</p>
                          </div>
                          {report.cause && (
                            <p className="text-xs text-white/50">Cause: {report.cause}</p>
                          )}
                          {report.equipmentUsed && report.equipmentUsed.length > 0 && (
                            <p className="text-xs text-white/50">
                              Equipment: {report.equipmentUsed.map((e) => `${e.quantity}× ${e.itemName}`).join(", ")}
                            </p>
                          )}
                          <p className="text-xs text-white/30 mt-1">Taken in {new Date(report.startedAt).toLocaleString()} · Completed {new Date(report.completedAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white/70 mb-3">Recent activity</h3>
                  <div className="flex flex-col gap-2">
                    {summary.recentActivity.map((log) => (
                      <div key={log.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5">
                        <p className="text-sm text-white/80">{log.details}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {log.actorName} · {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}