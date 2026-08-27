"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Car, Package, FileText, Bell, LogOut, Lock, Unlock, UserX, UserCheck } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";
import NotificationBell from "@/components/NotificationBell";

interface Account {
  id: string;
  fullName: string;
  email: string;
  role: "controller" | "mechanic";
  isActive: boolean;
  lockedUntil: string | null;
  createdAt: string;
}

const navItems = [
  { label: "Accounts", icon: Users, path: "/admin/accounts" },
  { label: "Fleet", icon: Car, path: "/admin/dashboard" },
  { label: "Stock", icon: Package, path: "/admin/stock" },
  { label: "Reports", icon: FileText, path: "/admin/reports" },
];

export default function AdminAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAccounts(token);
  }, [router]);

  async function fetchAccounts(token: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      setError("Couldn't load accounts. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: "deactivate" | "activate" | "unlock") {
    setBusyId(id);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/accounts/${id}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();

      // Simplest correct approach: refetch the list so state always matches the server.
      await fetchAccounts(token!);
    } catch (err) {
      setError("That action failed. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const isLocked = (acc: Account) => acc.lockedUntil && new Date(acc.lockedUntil) > new Date();

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
              Hello, Admin <span className="font-medium text-white">Admin</span>
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
              const isActive = path === "/admin/accounts"; // this page IS the Accounts page
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
              <h2 className="text-lg font-medium text-white">Accounts</h2>
              <button
                onClick={() => router.push("/admin/create-account")}
                className="rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] px-4 py-2 text-sm font-medium text-[#412402] transition-colors"
              >
                + Create account
              </button>
            </div>
            <p className="text-sm text-white/50 mb-6">
              {accounts.length} controller/mechanic account{accounts.length !== 1 ? "s" : ""}
            </p>

            {error && (
              <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {loading ? (
              <p className="text-sm text-white/50">Loading accounts…</p>
            ) : accounts.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-sm text-white/50">
                  No controller or mechanic accounts yet. Click &quot;Create account&quot; to add
                  your first one.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03] text-left text-white/50 text-xs">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc) => (
                      <tr key={acc.id} className="border-t border-white/5">
                        <td className="px-4 py-3 text-white">{acc.fullName}</td>
                        <td className="px-4 py-3 text-white/60">{acc.email}</td>
                        <td className="px-4 py-3 text-white/60 capitalize">{acc.role}</td>
                        <td className="px-4 py-3">
                          {!acc.isActive ? (
                            <span className="text-xs text-white/40">Deactivated</span>
                          ) : isLocked(acc) ? (
                            <span className="text-xs text-red-400">Locked</span>
                          ) : (
                            <span className="text-xs text-emerald-400">Active</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {isLocked(acc) && (
                              <button
                                onClick={() => handleAction(acc.id, "unlock")}
                                disabled={busyId === acc.id}
                                title="Unlock account"
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-50 transition-colors"
                              >
                                <Unlock className="w-3.5 h-3.5 text-white/70" strokeWidth={1.75} />
                              </button>
                            )}
                            {acc.isActive ? (
                              <button
                                onClick={() => handleAction(acc.id, "deactivate")}
                                disabled={busyId === acc.id}
                                title="Deactivate account"
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 disabled:opacity-50 transition-colors"
                              >
                                <UserX className="w-3.5 h-3.5 text-white/70" strokeWidth={1.75} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(acc.id, "activate")}
                                disabled={busyId === acc.id}
                                title="Reactivate account"
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500/10 hover:border-emerald-500/30 disabled:opacity-50 transition-colors"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-white/70" strokeWidth={1.75} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}