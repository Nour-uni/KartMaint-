'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Gauge,
  Wrench,
  PackageX,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { fetchKarts, fetchHealth, KartItem } from '@/lib/api';

export default function DashboardPage() {
  const [karts, setKarts] = useState<KartItem[]>([]);
  const [health, setHealth] = useState<{ status: string; database: string }>({
    status: 'CHECKING',
    database: 'CHECKING',
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [kartsData, healthData] = await Promise.all([fetchKarts(), fetchHealth()]);
    setKarts(kartsData);
    setHealth(healthData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalKarts = karts.length;
  const availableKarts = karts.filter((k) => k.status === 'available').length;
  const maintenanceKarts = karts.filter((k) => k.status === 'in_maintenance').length;
  const totalHours = karts.reduce((acc, curr) => acc + (curr.operatingHours || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Fleet Operations Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry, maintenance scheduling, and spare parts stock management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Data</span>
          </button>
          <Link
            href="/maintenance"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Maintenance</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Fleet */}
        <div className="glass-card p-6 rounded-2xl glow-emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Fleet Status
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{availableKarts} / {totalKarts}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {totalKarts ? Math.round((availableKarts / totalKarts) * 100) : 0}% Operational
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Karts ready for track deployment</p>
        </div>

        {/* In Maintenance */}
        <div className="glass-card p-6 rounded-2xl glow-amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              In Maintenance
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{maintenanceKarts}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Active Service
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Engine overhauls & tire replacements</p>
        </div>

        {/* Fleet Operating Hours */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Fleet Hours
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{totalHours.toFixed(1)} hrs</span>
            <span className="text-xs font-semibold text-blue-400">Avg {(totalHours / (totalKarts || 1)).toFixed(1)} hrs/kart</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Cumulative engine runtime telemetry</p>
        </div>

        {/* Stock Alerts */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Parts Stock Alerts
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <PackageX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">1 Alert</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Reorder Needed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Torque converter belts low stock</p>
        </div>
      </div>

      {/* Fleet Grid Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Live Kart Fleet Inventory</h2>
            <p className="text-xs text-slate-400">UUID tracked entities with paranoid soft delete protection.</p>
          </div>
          <Link
            href="/karts"
            className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            <span>View Full Fleet</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {karts.map((kart) => (
            <div key={kart.id} className="p-4 rounded-xl glass-card border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-lg text-white">Kart #{kart.kartNumber}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
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

              <div className="text-xs space-y-1">
                <div className="text-slate-400 flex justify-between">
                  <span>VIN / Serial:</span>
                  <span className="font-mono text-slate-200">{kart.vinSerial}</span>
                </div>
                <div className="text-slate-400 flex justify-between">
                  <span>Operating Hours:</span>
                  <span className="font-semibold text-slate-200">{kart.operatingHours} hrs</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>PK: {kart.id.substring(0, 8)}...</span>
                <Link href="/karts" className="text-blue-400 hover:underline">
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
