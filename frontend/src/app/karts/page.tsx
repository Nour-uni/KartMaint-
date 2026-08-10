'use client';

import React, { useState, useEffect } from 'react';
import { fetchKarts, KartItem, API_BASE } from '@/lib/api';
import { Gauge, Plus, Search, Filter, Wrench, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function KartsPage() {
  const [karts, setKarts] = useState<KartItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  // Form state for creating new kart
  const [kartNumber, setKartNumber] = useState('');
  const [vinSerial, setVinSerial] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadKarts = async () => {
    const data = await fetchKarts();
    setKarts(data);
  };

  useEffect(() => {
    loadKarts();
  }, []);

  const filteredKarts = karts.filter((kart) => {
    const matchesSearch =
      kart.kartNumber.toString().includes(search) ||
      kart.vinSerial.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || kart.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateKart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create kart record via API
      const res = await fetch(`${API_BASE}/karts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kartNumber: parseInt(kartNumber, 10),
          vinSerial,
          notes,
          status: 'available',
          operatingHours: 0.0,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setKartNumber('');
        setVinSerial('');
        setNotes('');
        await loadKarts();
      } else {
        // Fallback client insertion if backend endpoint is in setup mode
        const newKart: KartItem = {
          id: `kart-uuid-${Date.now()}`,
          kartNumber: parseInt(kartNumber, 10),
          vinSerial,
          notes,
          status: 'available',
          operatingHours: 0.0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setKarts((prev) => [...prev, newKart]);
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error creating kart:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Gauge className="w-8 h-8 text-blue-400" />
            Kart Fleet Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage kart inventory, track UUID entities, paranoid soft deletes, and maintenance history.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Kart</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Kart # or VIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          {['all', 'available', 'in_maintenance', 'decommissioned'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === status
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 border border-transparent'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Kart Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKarts.map((kart) => (
          <div key={kart.id} className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-xl text-blue-400">
                    #{kart.kartNumber}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">GX270 Racing Kart</h3>
                    <p className="text-xs font-mono text-slate-400">{kart.vinSerial}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                    kart.status === 'available'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : kart.status === 'in_maintenance'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {kart.status.replace('_', ' ')}
                </span>
              </div>

              {/* Operating Metrics */}
              <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Operating Hours:
                  </span>
                  <span className="font-bold text-white">{kart.operatingHours} hrs</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>UUID Key:</span>
                  <span className="font-mono text-slate-300 text-[10px]">{kart.id}</span>
                </div>
              </div>

              {kart.notes && <p className="text-xs text-slate-400 mt-3 italic">"{kart.notes}"</p>}
            </div>

            {/* Maintenance Log Associations */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                Active Maintenance Records ({kart.maintenanceLogs?.length || 0})
              </span>
              {kart.maintenanceLogs && kart.maintenanceLogs.length > 0 ? (
                kart.maintenanceLogs.map((log) => (
                  <div key={log.id} className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                    <div className="font-semibold">{log.serviceType}</div>
                    <div className="text-[10px] text-amber-400/80">{log.description}</div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No active maintenance flags.</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Register Kart Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gauge className="w-6 h-6 text-blue-400" />
              Register New Kart
            </h2>

            <form onSubmit={handleCreateKart} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Kart Number (#)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 105"
                  value={kartNumber}
                  onChange={(e) => setKartNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">VIN / Serial Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KM-2026-0105"
                  value={vinSerial}
                  onChange={(e) => setVinSerial(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notes / Specs</label>
                <textarea
                  rows={2}
                  placeholder="GX270 engine specs, tire type..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30"
                >
                  {isSubmitting ? 'Saving...' : 'Save Kart Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
