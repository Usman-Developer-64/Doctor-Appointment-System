'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  UserCheck,
  ShieldAlert,
  Loader2,
  Check,
  X,
  GraduationCap,
  MapPin,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { User } from '@/types';

export default function VerificationPage() {
  const { user: currentUser } = useAuth();
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUnverifiedDoctors = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch all unverified doctors
      const response = await api.get('/users', {
        params: { role: 'doctor' },
      });
      // Filter unverified doctors on client side
      const unverified = response.data.data.filter(
        (u: User) => !u.isVerified && !u.isBlocked
      );
      setDoctors(unverified);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to retrieve unverified doctor list.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUnverifiedDoctors();
    }
  }, [currentUser, fetchUnverifiedDoctors]);

  if (!currentUser) return null;

  if (currentUser.role !== 'admin') {
    return (
      <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          Only administrators are allowed to verify doctor credentials.
        </p>
      </div>
    );
  }

  const handleVerify = async (doctorId: string) => {
    setActionLoadingId(doctorId);
    try {
      await api.patch(`/users/${doctorId}/verify`);
      // Remove from list locally
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify doctor.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (doctorId: string) => {
    if (!confirm('Are you sure you want to reject and block this doctor?')) return;
    
    setActionLoadingId(doctorId);
    try {
      await api.patch(`/users/${doctorId}/block`);
      // Remove from list locally
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject user.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-primary" />
          Credentials Verification
        </h1>
        <p className="text-muted-foreground mt-1">
          Review credentials of doctors requesting registration on the platform before verifying their profile.
        </p>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-700 dark:text-blue-400">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          Unverified doctors will not show up in the public &quot;Find a Doctor&quot; discovery page and cannot be booked by patients. Check their educational credentials and experience details thoroughly.
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center justify-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          {error}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <UserCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-lg">No Pending Verifications</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            All registered doctors have been verified. There are no pending reviews.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {doctors.map((doctor) => {
            const initials = `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`.toUpperCase();
            return (
              <div
                key={doctor._id}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div className="space-y-4">
                  {/* Doctor Info Header */}
                  <div className="flex gap-4 items-center border-b border-border pb-4">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-sm text-primary font-medium mt-0.5">
                        {doctor.specialization}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{doctor.email}</p>
                    </div>
                  </div>

                  {/* Credentials detail rows */}
                  <div className="space-y-2.5 text-sm text-muted-foreground pt-1">
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span>
                        <strong className="text-foreground">Education: </strong>
                        {doctor.education}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span>
                        <strong className="text-foreground">Experience: </strong>
                        {doctor.experience} Years
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span className="truncate">
                        <strong className="text-foreground">Location: </strong>
                        {doctor.clinicAddress}, {doctor.city}
                      </span>
                    </div>
                  </div>

                  {/* Bio block */}
                  {doctor.bio && (
                    <div className="text-xs bg-muted/60 p-3 rounded-xl border border-border text-muted-foreground leading-relaxed mt-4 max-h-24 overflow-y-auto custom-scrollbar">
                      <strong className="text-foreground block mb-1">Professional Bio:</strong>
                      {doctor.bio}
                    </div>
                  )}
                </div>

                {/* Accept/Reject Action row */}
                <div className="flex gap-3 mt-6 border-t border-border pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 rounded-xl"
                    onClick={() => handleReject(doctor._id)}
                    disabled={actionLoadingId === doctor._id}
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Reject/Block
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1 rounded-xl"
                    onClick={() => handleVerify(doctor._id)}
                    disabled={actionLoadingId === doctor._id}
                  >
                    <Check className="h-4 w-4 mr-1.5" />
                    Verify Doctor
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
