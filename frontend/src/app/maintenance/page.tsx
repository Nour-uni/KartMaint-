'use client';

import React, { useState } from 'react';
import { Wrench, Plus, Clock, DollarSign, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  kartNumber: number;
  serviceType: string;
  description: string;
  technician: string;
  laborHours: number;
  totalCost: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceRecord[]>([
    {
      id: 'mlog-001',
      kartNumber: 103,
      serviceType: '100-Hour Engine Overhaul & Brake Replacement',
      description: 'Replaced ceramic brake pads, flushed hydraulic fluid, and performed full synthetic oil change.',
      technician: 'Alex Vance (Lead Mechanic)',
      laborHours: 3.5,
      totalCost: 155.50,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mlog-002',
      kartNumber: 101,
      serviceType: 'Tire Compound Replacement',
      description: 'Replaced front left and rear right soft compound slick tires.',
      technician: 'Alex Vance (Lead Mechanic)',
      laborHours: 1.2,
      totalCost: 120.00,
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [kartNumber, setKartNumber] = useState('101');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [laborHours, setLaborHours] = useState('1.5');
  const [totalCost, setTotalCost] = useState('45.00');

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: MaintenanceRecord = {
      id: `mlog-${Date.now()}`,
      kartNumber: parseInt(kartNumber, 10),
      serviceType,
      description,
      technician: 'Alex Vance (Lead Mechanic)',
      laborHours: parseFloat(laborHours),
      totalCost: parseFloat(totalCost),
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    };
    setLogs([newRecord, ...logs]);
    setShowModal(false);
    setServiceType('');
    setDescription('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Wrench className="w-8 h-8 text-amber-400" />
            Maintenance Operations Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track active service jobs, technician hours, labor costs, and completion status.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Service Job</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Kart</th>
                <th className="px-6 py-4">Service Type & Details</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">Labor Hours</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4 font-extrabold text-white text-base">
                    Kart #{log.kartNumber}
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="font-bold text-slate-100">{log.serviceType}</div>
                    <div className="text-slate-400 text-[11px] max-w-md">{log.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>{log.technician}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{log.laborHours} hrs</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-400">
                    ${log.totalCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        log.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : log.status === 'in_progress'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {log.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wrench className="w-6 h-6 text-amber-400" />
              Log Maintenance Service
            </h2>

            <form onSubmit={handleCreateLog} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Kart #</label>
                <select
                  value={kartNumber}
                  onChange={(e) => setKartNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="101">Kart #101</option>
                  <option value="102">Kart #102</option>
                  <option value="103">Kart #103</option>
                  <option value="104">Kart #104</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Service Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine Oil Flush & Spark Plug Check"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detailed repair description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Labor Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={laborHours}
                    onChange={(e) => setLaborHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Submit Service Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
