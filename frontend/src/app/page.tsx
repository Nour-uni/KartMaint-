"use client";

import Link from "next/link";
import SteeringWheelIcon from "@/components/SteeringWheelIcon";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#14181f] flex items-center justify-center overflow-hidden p-6">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1376 768"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="1376" height="768" fill="#14181f" />
        <circle cx="688" cy="384" r="520" fill="none" stroke="#1f2530" strokeWidth="60" />
        <circle cx="688" cy="384" r="380" fill="none" stroke="#1b2028" strokeWidth="90" />
        <circle
          cx="688"
          cy="384"
          r="380"
          fill="none"
          stroke="#e2e6ea"
          strokeOpacity="0.08"
          strokeWidth="2"
          strokeDasharray="20 16"
        />
        <path
          d="M 260 300 A 380 380 0 0 0 360 560"
          fill="none"
          stroke="#D85A30"
          strokeOpacity="0.35"
          strokeWidth="10"
          strokeDasharray="18 14"
        />
      </svg>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#1b2028]/85 backdrop-blur-sm p-10 text-center">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1f2530] border border-[#EF9F27] flex items-center justify-center">
            <SteeringWheelIcon className="w-7 h-7 text-[#EF9F27]" />
          </div>
          <h1 className="text-3xl font-medium text-white">KartMaint</h1>
          <p className="text-sm text-white/50">Fleet maintenance management</p>
        </div>

        <p className="text-sm text-white/60 mb-8 leading-relaxed">
          Track karts, manage repairs, and keep the fleet running — built for
          admins, controllers, and mechanics.
        </p>

        <Link
          href="/login"
          className="inline-block w-full rounded-lg bg-[#EF9F27] hover:bg-[#e2921c] py-2.5 text-sm font-medium text-[#412402] transition-colors"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}