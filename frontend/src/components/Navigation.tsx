'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Gauge,
  Wrench,
  Package,
  ShieldCheck,
  Activity,
  Database,
  UserCheck,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard Overview', href: '/', icon: LayoutDashboard },
  { name: 'Kart Fleet Management', href: '/karts', icon: Gauge },
  { name: 'Maintenance Operations', href: '/maintenance', icon: Wrench },
  { name: 'Spare Parts Inventory', href: '/inventory', icon: Package },
  { name: 'System Audit Trail', href: '/audit', icon: ShieldCheck },
];

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 glass-panel border-r border-slate-800/80 flex flex-col fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Gauge className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              KartMaint
            </h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Enterprise v2.0
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Database & Security Status Card */}
        <div className="p-4 m-4 rounded-xl glass-card border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Database className="w-4 h-4" />
              <span>PostgreSQL Live</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Sequelize ORM & SSL Pool Active</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-16 glass-panel border-b border-slate-800/80 sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-mono text-slate-400">
              ENV: <span className="text-slate-200">PRODUCTION</span> | SCHEMA: <span className="text-slate-200">PARANOID_UUID</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">admin@kartmaint.com</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">ADMIN</span>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
