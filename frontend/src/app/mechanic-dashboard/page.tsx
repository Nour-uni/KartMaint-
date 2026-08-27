"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, ClipboardList, Car, Settings, Bell, LogOut, CheckCircle2, Package } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";
import NotificationBell from "@/components/NotificationBell";

interface Kart {
  id: string;
  kartNumber: string;
  status: "functional" | "out_of_order" | "in_repair";
  reportedIssue: string | null;
  assignedMechanicId: string | null;
}

interface EquipmentRequest {
  id: string;
  itemName: string;
  quantityRequested: number;
  status: "pending" | "approved" | "rejected";
  kart: { id: string; kartNumber: string } | null;
}

const navItems = [
  { label: "Dashboard", icon: Home, path: "/mechanic-dashboard" },
  { label: "Tasks", icon: ClipboardList, path: "/mechanic-dashboard/tasks" },
  { label: "Fleet", icon: Car, path: "/mechanic-dashboard/fleet" },
  { label: "Settings", icon: Settings, path: "/profile" },
];

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || null;
  } catch {
    return null;
  }
}

const requestStatusStyle: Record<EquipmentRequest["status"], string> = {
  pending: "bg-[#EF9F27]/10 text-[#EF9F27]",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
};

export default function MechanicDashboard() {
  const router = useRouter();
  const [outOfOrderKarts, setOutOfOrderKarts] = useState<Kart[]>([]);
  const [myRepairs, setMyRepairs] = useState<Kart[]>([]);
  const [myRequests, setMyRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedKartId, setExpandedKartId] = useState<string | null>(null);
  const [issueText, setIssueText] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [mechanicName] = useState("Alex R.");

  // Equipment request form state, per kart
  const [requestingForKartId, setRequestingForKartId] = useState<string | null>(null);
  const [requestItemName, setRequestItemName] = useState("");
  const [requestQuantity, setRequestQuantity] = useState("1");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadEverything(token);
  }, [router]);

  async function loadEverything(token: string) {
    setLoading(true);
    setError("");
    try {
      const userId = getUserIdFromToken(token);

      const [outOfOrderRes, inRepairRes, requestsRes] = await Promise.all([
        fetch("/api/karts?status=out_of_order", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/karts?status=in_repair", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/equipment-requests/mine", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!outOfOrderRes.ok || !inRepairRes.ok || !requestsRes.ok) throw new Error();

      const outOfOrderData: Kart[] = await outOfOrderRes.json();
      const inRepairData: Kart[] = await inRepairRes.json();
      const requestsData: EquipmentRequest[] = await requestsRes.json();

      setOutOfOrderKarts(outOfOrderData);
      setMyRepairs(inRepairData.filter((k) => k.assignedMechanicId === userId));
      setMyRequests(requestsData);
    } catch (err) {
      setError("Couldn't load your data. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTakeCharge(kartId: string) {
    setBusyId(kartId);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/karts/${kartId}/take-charge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reportedIssue: issueText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Couldn't take charge of that kart.");
        return;
      }
      setOutOfOrderKarts((prev) => prev.filter((k) => k.id !== kartId));
      setMyRepairs((prev) => [...prev, data]);
      setExpandedKartId(null);
      setIssueText("");
    } catch (err) {
      setError("Couldn't reach the server.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCompleteRepair(kartId: string) {
    setBusyId(kartId);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/karts/${kartId}/complete-repair`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Couldn't complete that repair.");
        return;
      }
      setMyRepairs((prev) => prev.filter((k) => k.id !== kartId));
    } catch (err) {
      setError("Couldn't reach the server.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRequestEquipment(kartId: string) {
    if (!requestItemName.trim()) return;
    setBusyId(`request-${kartId}`);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/equipment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          itemName: requestItemName,
          quantityRequested: Number(requestQuantity) || 1,
          kartId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Couldn't submit that request.");
        return;
      }

      setMyRequests((prev) => [{ ...data, kart: null }, ...prev]);
      setRequestingForKartId(null);
      setRequestItemName("");
      setRequestQuantity("1");
    } catch (err) {
      setError("Couldn't reach the server.");
    } finally {
      setBusyId(null);
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
              Hello, Mechanic <span className="font-medium text-white">{mechanicName}</span>
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
          <nav className="w-40 shrink-0 border-r border-white/10 py-6 px-3 flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon, path }) => {
              const isActive = path === "/mechanic-dashboard";
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

          <main className="flex-1 p-6">
            {error && (
              <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* My active repairs */}
            {myRepairs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-medium text-white/70 mb-3">My active repairs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myRepairs.map((kart) => (
                    <div
                      key={kart.id}
                      className="rounded-xl border border-[#EF9F27]/30 bg-[#EF9F27]/5 overflow-hidden"
                    >
                      <div className="p-3">
                        <p className="text-sm font-medium text-white">Kart #{kart.kartNumber}</p>
                        {kart.reportedIssue && (
                          <p className="text-xs text-white/50 mt-0.5">Issue: {kart.reportedIssue}</p>
                        )}

                        {requestingForKartId === kart.id ? (
                          <div className="mt-3 flex flex-col gap-2">
                            <input
                              type="text"
                              placeholder="Equipment needed (e.g. front tire)"
                              value={requestItemName}
                              onChange={(e) => setRequestItemName(e.target.value)}
                              className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-3 py-2 text-xs text-white placeholder-white/40"
                            />
                            <input
                              type="number"
                              min="1"
                              placeholder="Quantity"
                              value={requestQuantity}
                              onChange={(e) => setRequestQuantity(e.target.value)}
                              className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-3 py-2 text-xs text-white placeholder-white/40"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRequestEquipment(kart.id)}
                                disabled={busyId === `request-${kart.id}`}
                                className="flex-1 rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] disabled:opacity-60 py-2 text-xs font-medium text-[#412402] transition-colors"
                              >
                                {busyId === `request-${kart.id}` ? "Sending…" : "Send request"}
                              </button>
                              <button
                                onClick={() => setRequestingForKartId(null)}
                                className="rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleCompleteRepair(kart.id)}
                              disabled={busyId === kart.id}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 disabled:opacity-60 py-2 text-xs font-medium text-[#0a1f14] transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                              {busyId === kart.id ? "Saving…" : "Complete repair"}
                            </button>
                            <button
                              onClick={() => setRequestingForKartId(kart.id)}
                              title="Request equipment"
                              className="rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 px-3 py-2 text-xs text-white/70 transition-colors"
                            >
                              <Package className="w-3.5 h-3.5" strokeWidth={1.75} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My equipment requests */}
            {myRequests.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-medium text-white/70 mb-3">My equipment requests</h2>
                <div className="flex flex-col gap-2">
                  {myRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5"
                    >
                      <p className="text-sm text-white/80">
                        {req.quantityRequested}× {req.itemName}
                      </p>
                      <span
                        className={`text-[11px] font-medium tracking-wide px-2 py-1 rounded-full ${requestStatusStyle[req.status]}`}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Out of order karts */}
            <h2 className="text-sm font-medium text-white/70 mb-3">Out of order</h2>
            {loading ? (
              <p className="text-sm text-white/50">Loading fleet…</p>
            ) : outOfOrderKarts.length === 0 ? (
              <p className="text-sm text-white/50">No out-of-order karts right now.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {outOfOrderKarts.map((kart) => (
                  <div
                    key={kart.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
                  >
                    <div className="relative h-24 bg-[#1b2028] flex items-center justify-center">
                      <Car className="w-10 h-10 text-[#EF9F27]" strokeWidth={1.5} />
                      <span className="absolute top-2 right-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white">
                        OUT OF ORDER
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-white">Kart #{kart.kartNumber}</p>

                      {expandedKartId === kart.id ? (
                        <div className="mt-2">
                          <textarea
                            placeholder="What's wrong with it?"
                            value={issueText}
                            onChange={(e) => setIssueText(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-3 py-2 text-xs text-white placeholder-white/40 mb-2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTakeCharge(kart.id)}
                              disabled={busyId === kart.id}
                              className="flex-1 rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] disabled:opacity-60 py-2 text-xs font-medium text-[#412402] transition-colors"
                            >
                              {busyId === kart.id ? "Saving…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => {
                                setExpandedKartId(null);
                                setIssueText("");
                              }}
                              className="rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setExpandedKartId(kart.id)}
                          className="mt-3 w-full rounded-lg bg-[#EF9F27] py-2 text-sm font-medium text-[#412402] hover:bg-[#e2921c] transition-colors"
                        >
                          Take charge
                        </button>
                      )}
                    </div>
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