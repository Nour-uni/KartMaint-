"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Users, Car, Package, FileText, Bell, LogOut, Plus, Trash2, Check, X } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";
import NotificationBell from "@/components/NotificationBell";

interface StockItem {
  id: string;
  name: string;
  quantity: number;
  lowStockThreshold: number;
}

interface EquipmentRequest {
  id: string;
  itemName: string;
  quantityRequested: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  mechanic: { id: string; fullName: string };
  kart: { id: string; kartNumber: string } | null;
}

const navItems = [
  { label: "Accounts", icon: Users, path: "/admin/accounts" },
  { label: "Fleet", icon: Car, path: "/admin/dashboard" },
  { label: "Stock", icon: Package, path: "/admin/stock" },
  { label: "Reports", icon: FileText, path: "/admin/reports" },
];

export default function AdminStockPage() {
  const router = useRouter();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Add-item form state
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newThreshold, setNewThreshold] = useState("5");
  const [adding, setAdding] = useState(false);

  // Approve-request modal state
  const [approvingRequest, setApprovingRequest] = useState<EquipmentRequest | null>(null);
  const [approveStockItemId, setApproveStockItemId] = useState("");
  const [approveQuantity, setApproveQuantity] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadAll(token);
  }, [router]);

  async function loadAll(token: string) {
    setLoading(true);
    setError("");
    try {
      const [stockRes, requestsRes] = await Promise.all([
        fetch("/api/stock", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/equipment-requests?status=pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!stockRes.ok || !requestsRes.ok) throw new Error();
      setStock(await stockRes.json());
      setRequests(await requestsRes.json());
    } catch (err) {
      setError("Couldn't load stock data. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setAdding(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          quantity: Number(newQuantity) || 0,
          lowStockThreshold: Number(newThreshold) || 5,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Couldn't add stock item.");
        return;
      }

      setStock((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewQuantity("");
      setNewThreshold("5");
    } catch (err) {
      setError("Couldn't reach the server.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteItem(id: string) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/stock/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setStock((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError("Couldn't remove that item.");
    }
  }

  function openApproveModal(request: EquipmentRequest) {
    setApprovingRequest(request);
    setApproveStockItemId("");
    setApproveQuantity(String(request.quantityRequested));
  }

  async function handleApprove() {
    if (!approvingRequest || !approveStockItemId) return;
    setBusyId(approvingRequest.id);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/equipment-requests/${approvingRequest.id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stockItemId: approveStockItemId,
          quantity: Number(approveQuantity) || approvingRequest.quantityRequested,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Couldn't approve that request.");
        return;
      }

      setRequests((prev) => prev.filter((r) => r.id !== approvingRequest.id));
      setStock((prev) =>
        prev.map((item) =>
          item.id === approveStockItemId
            ? { ...item, quantity: item.quantity - (Number(approveQuantity) || approvingRequest.quantityRequested) }
            : item
        )
      );
      setApprovingRequest(null);
    } catch (err) {
      setError("Couldn't reach the server.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/equipment-requests/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError("Couldn't reject that request.");
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
              const isActive = path === "/admin/stock";
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
            {error && (
              <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Pending equipment requests */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-white mb-1">Pending equipment requests</h2>
              <p className="text-sm text-white/50 mb-4">
                Every request needs your approval, even if the item is in stock.
              </p>

              {loading ? (
                <p className="text-sm text-white/50">Loading…</p>
              ) : requests.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
                  <p className="text-sm text-white/50">No pending requests.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm text-white">
                          <span className="font-medium">{req.mechanic.fullName}</span> requested{" "}
                          <span className="font-medium">
                            {req.quantityRequested}× {req.itemName}
                          </span>
                          {req.kart && (
                            <span className="text-white/50"> for Kart #{req.kart.kartNumber}</span>
                          )}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openApproveModal(req)}
                          disabled={busyId === req.id}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 disabled:opacity-60 px-3 py-2 text-xs font-medium text-[#0a1f14] transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={busyId === req.id}
                          className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/15 hover:bg-red-500/10 hover:border-red-500/30 disabled:opacity-60 px-3 py-2 text-xs text-white/70 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stock inventory */}
            <div>
              <h2 className="text-lg font-medium text-white mb-1">Stock inventory</h2>
              <p className="text-sm text-white/50 mb-4">
                Mechanics can never browse this list directly — they only name what they need.
              </p>

              <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
                <input
                  type="text"
                  required
                  placeholder="Item name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-4 py-2.5 text-sm text-white placeholder-white/40"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Qty"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-24 rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-3 py-2.5 text-sm text-white placeholder-white/40"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Low at"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-24 rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-3 py-2.5 text-sm text-white placeholder-white/40"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="flex items-center gap-1.5 rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] disabled:opacity-60 px-4 py-2.5 text-sm font-medium text-[#412402] transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add
                </button>
              </form>

              {stock.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
                  <p className="text-sm text-white/50">No stock items yet.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.03] text-left text-white/50 text-xs">
                        <th className="px-4 py-3 font-medium">Item</th>
                        <th className="px-4 py-3 font-medium">Quantity</th>
                        <th className="px-4 py-3 font-medium"></th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stock.map((item) => {
                        const isLow = item.quantity <= item.lowStockThreshold;
                        return (
                          <tr key={item.id} className="border-t border-white/5">
                            <td className="px-4 py-3 text-white">{item.name}</td>
                            <td className="px-4 py-3 text-white/70">{item.quantity}</td>
                            <td className="px-4 py-3">
                              {isLow && (
                                <span className="text-xs text-red-400">Low stock</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                aria-label="Delete item"
                                className="text-white/30 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Approve modal */}
      {approvingRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1b2028] p-6">
            <h3 className="text-white font-medium mb-1">Approve request</h3>
            <p className="text-sm text-white/50 mb-4">
              {approvingRequest.mechanic.fullName} requested {approvingRequest.quantityRequested}×{" "}
              {approvingRequest.itemName}
            </p>

            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Match to stock item</label>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto rounded-lg border border-white/15 p-1.5">
                  {stock.length === 0 ? (
                    <p className="text-xs text-white/40 px-2 py-2">No stock items yet.</p>
                  ) : (
                    stock.map((item) => {
                      const isSelected = approveStockItemId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setApproveStockItemId(item.id)}
                          className={`text-left rounded-md px-3 py-2 text-sm transition-colors ${
                            isSelected
                              ? "bg-[#EF9F27] text-[#412402] font-medium"
                              : "bg-white/5 text-white/80 hover:bg-white/10"
                          }`}
                        >
                          {item.name} <span className={isSelected ? "text-[#412402]/70" : "text-white/40"}>({item.quantity} available)</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Quantity to deduct</label>
                <input
                  type="number"
                  min="1"
                  value={approveQuantity}
                  onChange={(e) => setApproveQuantity(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-[#EF9F27] px-3 py-2.5 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={!approveStockItemId || busyId === approvingRequest.id}
                className="flex-1 rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] disabled:opacity-60 py-2.5 text-sm font-medium text-[#412402] transition-colors"
              >
                {busyId === approvingRequest.id ? "Approving…" : "Confirm approval"}
              </button>
              <button
                onClick={() => setApprovingRequest(null)}
                className="rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}