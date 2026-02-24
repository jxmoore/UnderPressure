export interface BloodPressureEntry {
  id: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  timestamp: string; // ISO string
  note?: string;
}

export interface UserData {
  name: string;
  entries: BloodPressureEntry[];
}

export type Theme = 'light' | 'dark';
