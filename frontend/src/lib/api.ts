export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface KartItem {
  id: string;
  kartNumber: number;
  vinSerial: string;
  status: 'available' | 'in_maintenance' | 'decommissioned';
  operatingHours: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  maintenanceLogs?: MaintenanceLogItem[];
}

export interface MaintenanceLogItem {
  id: string;
  kartId: string;
  technicianId?: string | null;
  serviceType: string;
  description: string;
  laborHours: number;
  totalCost: number;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  kart?: KartItem;
  technician?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface PartItem {
  id: string;
  partNumber: string;
  name: string;
  quantityInStock: number;
  minStockAlert: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditItem {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  changes?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export async function fetchKarts(): Promise<KartItem[]> {
  try {
    const res = await fetch(`${API_BASE}/karts`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch karts');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching karts:', err);
    // Fallback demo data if backend is offline
    return [
      {
        id: 'kart-101',
        kartNumber: 101,
        vinSerial: 'KM-2026-0101',
        status: 'available',
        operatingHours: 42.5,
        notes: 'Standard GX270 9HP Racing Kart',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'kart-102',
        kartNumber: 102,
        vinSerial: 'KM-2026-0102',
        status: 'available',
        operatingHours: 38.0,
        notes: 'Standard GX270 9HP Racing Kart',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'kart-103',
        kartNumber: 103,
        vinSerial: 'KM-2026-0103',
        status: 'in_maintenance',
        operatingHours: 115.2,
        notes: 'Standard GX270 9HP Racing Kart',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        maintenanceLogs: [
          {
            id: 'mlog-1',
            kartId: 'kart-103',
            serviceType: '100-Hour Engine Overhaul',
            description: 'Replaced brake pads & oil flush',
            laborHours: 3.5,
            totalCost: 155.5,
            status: 'in_progress',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'kart-104',
        kartNumber: 104,
        vinSerial: 'KM-2026-0104',
        status: 'available',
        operatingHours: 18.7,
        notes: 'Standard GX270 9HP Racing Kart',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

export async function fetchHealth(): Promise<{ status: string; database: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'OFFLINE', database: 'DISCONNECTED' };
  }
}
