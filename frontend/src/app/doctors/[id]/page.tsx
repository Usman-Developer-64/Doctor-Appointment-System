'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Star,
  Loader2,
  Stethoscope,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Building,
  Clock,
} from 'lucide-react';
import { User } from '@/types';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function DoctorDetailPage() {
  const params = useParams();
  const doctorId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDoctorDetails = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get(`/doctors/${doctorId}`);
      setDoctor(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to retrieve doctor details. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctorDetails();
  }, [fetchDoctorDetails]);

  // Fetch slots on date change
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setIsSlotsLoading(true);
      setAvailableSlots([]);
      setSelectedSlot('');
      try {
        const response = await api.get(`/appointments/slots`, {
          params: { doctorId, date: selectedDate },
        });
        setAvailableSlots(response.data.data);
      } catch (err: any) {
        console.error('Failed to load slots', err);
      } finally {
        setIsSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, doctorId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center pt-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen pt-24 px-4 max-w-4xl mx-auto space-y-6">
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/doctors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
        <div className="text-center py-12 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl">
          {error || 'Doctor information not found.'}
        </div>
      </div>
    );
  }

  const initials = `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`.toUpperCase();

  // Helper to format 24h string to 12h AM/PM
  const formatTime = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    return `${h}:${minutes} ${ampm}`;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/doctors/${doctorId}`);
      return;
    }
    if (user.role !== 'patient') {
      setBookingMessage({ type: 'error', text: 'Only patients can book appointments.' });
      return;
    }
    if (!selectedSlot) {
      setBookingMessage({ type: 'error', text: 'Please select a time slot.' });
      return;
    }

    setIsBookingLoading(true);
    setBookingMessage(null);

    try {
      await api.post('/appointments', {
        doctorId,
        date: selectedDate,
        slot: selectedSlot,
        symptoms,
      });
      setBookingMessage({
        type: 'success',
        text: 'Appointment request submitted successfully! You can track it on your dashboard.',
      });
      // Clear inputs
      setSelectedSlot('');
      setSymptoms('');
    } catch (err: any) {
      setBookingMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to book appointment. Please try again.',
      });
    } finally {
      setIsBookingLoading(false);
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Button variant="ghost" asChild className="rounded-xl border border-border">
          <Link href="/doctors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Doctors
          </Link>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Profile Credentials */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Info Card */}
          <div className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="h-20 w-20 shrink-0 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shadow-sm">
              {initials}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h1>
                {doctor.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 text-xs font-semibold rounded-full px-2.5 py-0.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Specialist
                  </span>
                )}
              </div>
              <p className="text-lg font-semibold text-primary">{doctor.specialization}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-primary" />
                  {doctor.experience} Years Experience
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  4.9 Rating (20+ reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Professional Bio */}
          {doctor.bio && (
            <div className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-sm space-y-3">
              <h2 className="text-xl font-bold text-foreground">About the Doctor</h2>
              <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                {doctor.bio}
              </p>
            </div>
          )}

          {/* Education & Clinic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-card border border-border p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Education & Credentials
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {doctor.education}
              </p>
            </div>
            <div className="rounded-3xl bg-card border border-border p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-teal-600" />
                Clinic Location
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {doctor.clinicAddress}, {doctor.city}
              </p>
            </div>
          </div>

          {/* Active Work Schedule Timetable */}
          <div className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Weekly Consultation Hours
            </h2>
            <div className="border border-border rounded-2xl overflow-hidden text-sm">
              <div className="grid grid-cols-2 bg-muted/50 px-4 py-3 font-semibold text-muted-foreground border-b border-border">
                <div>Day</div>
                <div>Working Hours</div>
              </div>
              <div className="divide-y divide-border">
                {[
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                  'Sunday',
                ].map((day) => {
                  const daySched = doctor.schedule?.find(
                    (s) => s.day.toLowerCase() === day.toLowerCase()
                  );
                  const isWorking = daySched?.isWorking;

                  return (
                    <div key={day} className="grid grid-cols-2 px-4 py-3 items-center">
                      <div className="font-medium text-foreground">{day}</div>
                      <div>
                        {isWorking ? (
                          <span className="text-primary font-medium">
                            {formatTime(daySched.startTime)} - {formatTime(daySched.endTime)}
                            <span className="text-xs text-muted-foreground ml-2">
                              ({daySched.slotDuration}m slots)
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Closed / Off-day</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Card Sticky */}
        <div>
          <div className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-xl shadow-black/5 sticky top-24 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <span className="text-2xl font-extrabold text-foreground">
                  Rs. {doctor.consultationFee?.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground"> / visit</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                4.9
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Clinic Address</h4>
                  <p className="text-muted-foreground mt-0.5">{doctor.clinicAddress}</p>
                  <p className="text-muted-foreground">{doctor.city}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Availability</h4>
                  <p className="text-muted-foreground mt-0.5">
                    {doctor.schedule?.filter((s) => s.isWorking).length || 0} days a week
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-12 text-base font-semibold"
              variant="gradient"
              onClick={() => setIsModalOpen(true)}
              id="mock-booking-btn"
            >
              Book an Appointment
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Instant confirmation • Secure appointment slot
            </p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl z-10 overflow-y-auto max-h-[90vh] custom-scrollbar animate-fade-in">
            <h3 className="text-xl font-bold border-b border-border pb-3 mb-5">
              Book Appointment — Dr. {doctor.firstName} {doctor.lastName}
            </h3>

            {bookingMessage && (
              <div
                className={`rounded-2xl border p-4 text-sm mb-5 ${
                  bookingMessage.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                }`}
              >
                {bookingMessage.text}
              </div>
            )}

            {!user ? (
              <div className="text-center py-6 space-y-4">
                <p className="text-muted-foreground text-sm">
                  You must be logged in as a patient to book an appointment.
                </p>
                <Button className="w-full" asChild variant="gradient">
                  <Link href={`/login?redirect=/doctors/${doctorId}`}>
                    Sign In to Book
                  </Link>
                </Button>
              </div>
            ) : user.role !== 'patient' ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-destructive font-semibold">Access Restricted</p>
                <p className="text-muted-foreground text-sm">
                  Only accounts registered as **Patients** can book appointments.
                </p>
              </div>
            ) : bookingMessage?.type === 'success' ? (
              <div className="text-center py-6 space-y-4">
                <p className="text-muted-foreground text-sm">
                  Your request is now pending the doctor&apos;s confirmation.
                </p>
                <div className="flex gap-4">
                  <Button className="flex-1" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                  <Button className="flex-1" variant="gradient" asChild>
                    <Link href="/dashboard/appointments">
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                {/* Date Picker */}
                <div className="space-y-2">
                  <Label htmlFor="booking-date">Choose Appointment Date</Label>
                  <input
                    id="booking-date"
                    type="date"
                    min={getTodayDateString()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {/* Slots Grid */}
                {selectedDate && (
                  <div className="space-y-2">
                    <Label>Select Time Slot</Label>
                    {isSlotsLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground ml-2">Loading slots...</span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2 italic text-center">
                        No slots available on this day. The doctor might be off or fully booked.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                        {availableSlots.map((timeSlot) => (
                          <button
                            key={timeSlot}
                            type="button"
                            onClick={() => setSelectedSlot(timeSlot)}
                            className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                              selectedSlot === timeSlot
                                ? 'bg-primary border-primary text-white shadow-md'
                                : 'border-border bg-card hover:bg-primary/5 text-foreground'
                            }`}
                          >
                            {formatTime(timeSlot)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Symptoms */}
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Describe Symptoms / Notes (Optional)</Label>
                  <textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Briefly describe your health concern..."
                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 border-t border-border pt-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isBookingLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="flex-1"
                    disabled={isBookingLoading || !selectedSlot}
                  >
                    {isBookingLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      'Request Appointment'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
