'use client';

import React, { useState } from 'react';
import { ShieldCheck, Terminal, User, Clock, FileJson, Search } from 'lucide-react';
import { AuditItem } from '@/lib/api';

export default function AuditPage() {
  const [logs] = useState<AuditItem[]>([
    {
      id: 'audit-001',
      userId: '9e136281-784c-4b98-a4bd-37b6ce679a68',
      action: 'SYSTEM_SEED_EXECUTION',
      entity: 'SystemDatabase',
      entityId: 'postgres-supabase-pool',
      ipAddress: '127.0.0.1',
      changes: {
        status: 'SUCCESS',
        seededAt: new Date().toISOString(),
        tables: ['users', 'karts', 'maintenance_logs', 'part_inventories', 'audit_logs'],
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'audit-002',
      userId: 'a7162fb1-ceb2-47ee-9ddc-23fd772a5305',
      action: 'MAINTENANCE_JOB_LOGGED',
      entity: 'MaintenanceLog',
      entityId: '91773ed9-fe6b-4479-b77b-4c311ad92b0f',
      ipAddress: '192.168.1.45',
      changes: {
        kartNumber: 103,
        serviceType: '100-Hour Engine Overhaul',
        laborHours: 3.5,
        totalCost: 155.50,
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'audit-003',
      userId: '9e136281-784c-4b98-a4bd-37b6ce679a68',
      action: 'USER_AUTHENTICATED',
      entity: 'User',
      entityId: 'admin@kartmaint.com',
      ipAddress: '192.168.1.10',
      changes: {
        role: 'admin',
        jwtIssued: true,
      },
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  const [selectedLog, setSelectedLog] = useState<AuditItem | null>(null);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-indigo-400" />
          System Audit Trail & Security Logs
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Immutable change history, user authentication logs, administrative actions, and JSONB payloads.
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity & ID</th>
                <th className="px-6 py-4">User ID / IP</th>
                <th className="px-6 py-4">Payload Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-200">
                    <div>{log.entity}</div>
                    <div className="text-[10px] font-mono text-slate-400">{log.entityId || 'N/A'}</div>
                  </td>

                  <td className="px-6 py-4 space-y-0.5">
                    <div className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{log.userId?.substring(0, 12)}...</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{log.ipAddress}</div>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700 transition"
                    >
                      <FileJson className="w-3.5 h-3.5 text-blue-400" />
                      <span>Inspect JSON Payload</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                Audit Payload Inspector
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-400">
                Action: <span className="font-mono text-indigo-300 font-bold">{selectedLog.action}</span>
              </div>
              <div className="text-slate-400">
                Entity: <span className="font-semibold text-slate-200">{selectedLog.entity}</span>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72">
              {JSON.stringify(selectedLog.changes, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
