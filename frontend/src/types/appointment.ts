import { User } from './index';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  _id: string;
  patient: string | User;
  doctor: string | User;
  date: string; // ISO date string
  slot: string; // "HH:MM" format
  status: AppointmentStatus;
  symptoms: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
