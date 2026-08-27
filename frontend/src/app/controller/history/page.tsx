"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, History as HistoryIcon, Settings, LogOut } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";
import NotificationBell from "@/components/NotificationBell";

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

const navItems = [
  { label: "Dashboard", icon: Home, path: "/controller/dashboard" },
  { label: "History", icon: HistoryIcon, path: "/controller/history" },
  { label: "Settings", icon: Settings, path: "/profile" },
];

export default function ControllerHistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("Controller");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadActivity(token);
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setName(data.fullName))
      .catch(() => {});
  }, [router]);

  async function loadActivity(token: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/notifications/my-activity", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data: ActivityLog[] = await res.json();
      setLogs(data.filter((log) => log.action === "kart_status_changed"));
    } catch (err) {
      setError("Couldn't load your history.");
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
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#181c24]/90 overflow-hidden">
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
              Hello, <span className="font-medium text-white">{name}</span>
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
              const isActive = path === "/controller/history";
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
            <h2 className="text-lg font-medium text-white mb-1">History</h2>
            <p className="text-sm text-white/50 mb-6">Every status change you&apos;ve made.</p>

            {error && (
              <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
            )}

            {loading ? (
              <p className="text-sm text-white/50">Loading…</p>
            ) : logs.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-white/50">No status changes yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="text-sm text-white/90">{log.details}</p>
                    <p className="text-xs text-white/40 mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
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