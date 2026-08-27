'use client';

import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, CheckCircle, ArrowDown, ArrowUp } from 'lucide-react';
import { PartItem } from '@/lib/api';

export default function InventoryPage() {
  const [parts, setParts] = useState<PartItem[]>([
    {
      id: 'part-1',
      partNumber: 'BRK-PAD-01',
      name: 'Ceramic Racing Brake Pads',
      quantityInStock: 24,
      minStockAlert: 8,
      unitPrice: 35.50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'part-2',
      partNumber: 'TYR-RNG-02',
      name: 'Soft Compound Slick Tires (Set)',
      quantityInStock: 12,
      minStockAlert: 4,
      unitPrice: 120.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'part-3',
      partNumber: 'ENG-OIL-5W30',
      name: 'Synthetic Racing Engine Oil (1L)',
      quantityInStock: 50,
      minStockAlert: 15,
      unitPrice: 18.99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'part-4',
      partNumber: 'DRV-BLT-04',
      name: 'Kevlar Torque Converter Belt',
      quantityInStock: 3,
      minStockAlert: 5,
      unitPrice: 42.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [partNumber, setPartNumber] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [minAlert, setMinAlert] = useState('5');
  const [unitPrice, setUnitPrice] = useState('25.00');

  const adjustStock = (id: string, delta: number) => {
    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantityInStock: Math.max(0, p.quantityInStock + delta) } : p))
    );
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    const newPart: PartItem = {
      id: `part-${Date.now()}`,
      partNumber,
      name,
      quantityInStock: parseInt(quantity, 10),
      minStockAlert: parseInt(minAlert, 10),
      unitPrice: parseFloat(unitPrice),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setParts([newPart, ...parts]);
    setShowModal(false);
    setPartNumber('');
    setName('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-cyan-400" />
            Spare Parts & Stock Inventory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track spare parts stock levels, minimum threshold alerts, unit costs, and automated reorder triggers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Spare Part</span>
        </button>
      </div>

      {/* Parts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {parts.map((part) => {
          const isLow = part.quantityInStock <= part.minStockAlert;
          return (
            <div
              key={part.id}
              className={`glass-card p-6 rounded-2xl border flex flex-col justify-between space-y-4 ${
                isLow ? 'border-rose-500/40 bg-rose-500/5' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">{part.partNumber}</span>
                  {isLow ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3" /> Low Stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3" /> In Stock
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-base mt-2">{part.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Unit Price: <span className="font-semibold text-slate-200">${part.unitPrice.toFixed(2)}</span>
                </p>
              </div>

              {/* Stock Quantity Control */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">In Stock:</span>
                  <span className={`text-xl font-extrabold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {part.quantityInStock} units
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Min Alert Threshold:</span>
                  <span>{part.minStockAlert} units</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => adjustStock(part.id, -1)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-rose-400" /> -1
                  </button>
                  <button
                    onClick={() => adjustStock(part.id, 1)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-400" /> +1
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Part Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-cyan-400" />
              Add Spare Part to Inventory
            </h2>

            <form onSubmit={handleAddPart} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Part Number Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPK-PLG-05"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Part Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NGK Iridium Spark Plug"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Min Alert</label>
                  <input
                    type="number"
                    required
                    value={minAlert}
                    onChange={(e) => setMinAlert(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
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
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20"
                >
                  Save Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
