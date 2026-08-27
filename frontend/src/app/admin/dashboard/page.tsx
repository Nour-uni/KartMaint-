"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Users, Car, Package, FileText, Bell, LogOut, Plus, Trash2 } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";
import NotificationBell from "@/components/NotificationBell";

interface Kart {
  id: string;
  kartNumber: string;
  status: "functional" | "out_of_order" | "in_repair";
  reportedIssue: string | null;
}

const navItems = [
  { label: "Accounts", icon: Users, path: "/admin/accounts" },
  { label: "Fleet", icon: Car, path: "/admin/dashboard" },
  { label: "Stock", icon: Package, path: "/admin/stock" },
  { label: "Reports", icon: FileText, path: "/admin/reports" },
];

const statusStyles: Record<Kart["status"], string> = {
  functional: "bg-emerald-500/10 text-emerald-400",
  out_of_order: "bg-red-500/10 text-red-400",
  in_repair: "bg-[#EF9F27]/10 text-[#EF9F27]",
};

const statusLabel: Record<Kart["status"], string> = {
  functional: "FUNCTIONAL",
  out_of_order: "OUT OF ORDER",
  in_repair: "IN REPAIR",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName] = useState("Admin");
  const [karts, setKarts] = useState<Kart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newKartNumber, setNewKartNumber] = useState("");
  const [adding, setAdding] = useState(false);

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
      if (!res.ok) throw new Error("Failed to load fleet.");
      const data = await res.json();
      setKarts(data);
    } catch (err) {
      setError("Couldn't load the fleet. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddKart(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setAdding(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/karts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kartNumber: newKartNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Couldn't add kart.");
        return;
      }

      setKarts((prev) => [...prev, data].sort((a, b) => a.kartNumber.localeCompare(b.kartNumber)));
      setNewKartNumber("");
    } catch (err) {
      setError("Couldn't reach the server.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteKart(id: string) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/karts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setKarts((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      setError("Couldn't remove that kart.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#14181f] p-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#181c24]/90 overflow-hidden">
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
              Hello, Admin <span className="font-medium text-white">{adminName}</span>
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

        <div className="flex">
          {/* Sidebar */}
          <nav className="w-40 shrink-0 border-r border-white/10 py-6 px-3 flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon, path }) => {
              const isActive = path === "/admin/dashboard"; // this page IS the Fleet page
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
          <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-white">Fleet</h2>
              <button
                onClick={() => router.push("/admin/create-account")}
                className="rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors"
              >
                + Create account
              </button>
            </div>
            <p className="text-sm text-white/50 mb-6">
              {karts.length} kart{karts.length !== 1 ? "s" : ""} in the fleet ·{" "}
              {karts.filter((k) => k.status === "functional").length} functional
            </p>

            {/* Add kart form */}
            <form onSubmit={handleAddKart} className="flex gap-2 mb-6">
              <input
                type="text"
                required
                placeholder="Kart number (e.g. 07)"
                value={newKartNumber}
                onChange={(e) => setNewKartNumber(e.target.value)}
                className="flex-1 rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 text-sm text-white placeholder-white/40"
              />
              <button
                type="submit"
                disabled={adding}
                className="flex items-center gap-1.5 rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] disabled:opacity-60 px-4 py-2.5 text-sm font-medium text-[#412402] transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                {adding ? "Adding…" : "Add kart"}
              </button>
            </form>

            {error && (
              <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Fleet list */}
            {loading ? (
              <p className="text-sm text-white/50">Loading fleet…</p>
            ) : karts.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-white/50">
                  No karts yet. Add your first one above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {karts.map((kart) => (
                  <div
                    key={kart.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-white">Kart #{kart.kartNumber}</p>
                      <button
                        onClick={() => handleDeleteKart(kart.id)}
                        aria-label="Delete kart"
                        className="text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${statusStyles[kart.status]}`}
                    >
                      {statusLabel[kart.status]}
                    </span>
                    {kart.reportedIssue && (
                      <p className="text-xs text-white/40 mt-2">Issue: {kart.reportedIssue}</p>
                    )}
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