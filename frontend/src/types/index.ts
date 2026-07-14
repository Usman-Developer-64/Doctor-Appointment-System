export interface DaySchedule {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  avatar: string | null;
  phone: string | null;
  isBlocked: boolean;
  isVerified: boolean;
  // Patient fields
  age: number | null;
  bloodGroup: string | null;
  medicalHistory: string | null;
  gender: string | null;
  emergencyContact: {
    name: string | null;
    phone: string | null;
    relation: string | null;
  } | null;
  // Doctor fields
  specialization: string | null;
  experience: number | null;
  clinicAddress: string | null;
  consultationFee: number | null;
  education: string | null;
  city: string | null;
  bio: string | null;
  schedule: DaySchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'patient' | 'doctor';
  specialization?: string;
  education?: string;
  city?: string;
  phone?: string;
}
