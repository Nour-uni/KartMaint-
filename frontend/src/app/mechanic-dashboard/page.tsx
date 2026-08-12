"use client";

import { useState } from "react";
import { Home, ClipboardList, Car, Settings, Bell } from "lucide-react";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";

interface Kart {
  id: number;
  kartNumber: string;
  sprint: string;
  issue: string;
}

// Mock data — replace with a real fetch to your backend, e.g.:
// const karts: Kart[] = await fetch('/api/karts?status=out_of_order').then(r => r.json());
const outOfOrderKarts: Kart[] = [
  { id: 1, kartNumber: "03", sprint: "200", issue: "Worn tires" },
  { id: 2, kartNumber: "03", sprint: "200", issue: "Worn tires" },
  { id: 3, kartNumber: "04", sprint: "200", issue: "Worn tires" },
  { id: 4, kartNumber: "04", sprint: "200", issue: "Worn tires" },
  { id: 5, kartNumber: "05", sprint: "200", issue: "Worn tires" },
  { id: 6, kartNumber: "06", sprint: "200", issue: "Worn tires" },
  { id: 7, kartNumber: "03", sprint: "200", issue: "Worn tires" },
  { id: 8, kartNumber: "03", sprint: "200", issue: "Worn tires" },
  { id: 9, kartNumber: "03", sprint: "200", issue: "Worn tires" },
];

const navItems = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Tasks", icon: ClipboardList, active: false },
  { label: "Fleet", icon: Car, active: false },
  { label: "Settings", icon: Settings, active: false },
];

function KartCard({
  kart,
  onTakeCharge,
}: {
  kart: Kart;
  onTakeCharge: (id: number) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="relative h-24 bg-[#1b2028] flex items-center justify-center">
        <Car className="w-10 h-10 text-[#EF9F27]" strokeWidth={1.5} />
        <span className="absolute top-2 right-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white">
          OUT OF ORDER
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-white">
          Kart #{kart.kartNumber} - Sprint {kart.sprint}
        </p>
        <p className="text-xs text-white/50 mt-0.5">Reported issue: {kart.issue}</p>
        <button
          onClick={() => onTakeCharge(kart.id)}
          className="mt-3 w-full rounded-lg bg-[#EF9F27] py-2 text-sm font-medium text-[#412402] hover:bg-[#e2921c] transition-colors"
        >
          Take charge
        </button>
      </div>
    </div>
  );
}

export default function MechanicDashboard() {
  const [karts, setKarts] = useState<Kart[]>(outOfOrderKarts);
  const mechanicName = "Alex R."; // replace with the logged-in user's name from auth context

  async function handleTakeCharge(kartId: number) {
    // Replace with a real API call, e.g.:
    // await fetch(`/api/repairs`, { method: 'POST', body: JSON.stringify({ kartId }) });
    setKarts((prev) => prev.filter((k) => k.id !== kartId));
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
            <p className="text-sm text-white/70">
              Hello, Mechanic <span className="font-medium text-white">{mechanicName}</span>
            </p>
            <button
              aria-label="Notifications"
              className="w-9 h-9 rounded-lg bg-[#EF9F27] flex items-center justify-center hover:bg-[#e2921c] transition-colors"
            >
              <Bell className="w-4 h-4 text-[#412402]" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <nav className="w-40 shrink-0 border-r border-white/10 py-6 px-3 flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex flex-col items-center gap-1.5 rounded-lg py-3 text-xs transition-colors ${
                  active
                    ? "text-[#EF9F27] border-l-2 border-[#EF9F27] bg-white/[0.03]"
                    : "text-white/50 border-l-2 border-transparent hover:text-white/80"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </nav>

          {/* Main content */}
          <main className="flex-1 p-6">
            {karts.length === 0 ? (
              <p className="text-white/50 text-sm">No out-of-order karts right now.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {karts.map((kart) => (
                  <KartCard key={kart.id} kart={kart} onTakeCharge={handleTakeCharge} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}