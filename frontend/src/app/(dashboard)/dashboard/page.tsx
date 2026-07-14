'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Stethoscope,
  Activity,
  UserCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<{
    totalUsers: number;
    totalPatients: number;
    totalDoctors: number;
    totalBookings: number;
    pendingVerifications: number;
  } | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      setIsStatsLoading(true);
      api.get('/appointments/admin/stats')
        .then((res) => {
          setStatsData(res.data.data);
        })
        .catch((err) => console.error('Failed to fetch admin stats', err))
        .finally(() => setIsStatsLoading(false));
    }
  }, [user]);

  if (!user) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderAdminDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[
        {
          label: 'Total Users',
          value: isStatsLoading ? '...' : statsData?.totalUsers ?? '0',
          icon: Users,
          color: 'bg-blue-500',
          change: 'Patients & Doctors',
        },
        {
          label: 'Total Doctors',
          value: isStatsLoading ? '...' : statsData?.totalDoctors ?? '0',
          icon: Stethoscope,
          color: 'bg-teal-500',
          change: 'Verified on platform',
        },
        {
          label: 'Total Bookings',
          value: isStatsLoading ? '...' : statsData?.totalBookings ?? '0',
          icon: Calendar,
          color: 'bg-purple-500',
          change: 'All appointments',
        },
        {
          label: 'Pending Verifications',
          value: isStatsLoading ? '...' : statsData?.pendingVerifications ?? '0',
          icon: UserCheck,
          color: 'bg-amber-500',
          change: 'Credentials review',
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl bg-card border border-border p-6 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`h-11 w-11 rounded-xl ${stat.color} flex items-center justify-center`}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{stat.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
        </div>
      ))}
    </div>
  );

  const renderDoctorDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[
        {
          label: "Today's Appointments",
          value: '—',
          icon: Calendar,
          color: 'bg-blue-500',
          subtitle: 'Scheduled for today',
        },
        {
          label: 'Pending Requests',
          value: '—',
          icon: Clock,
          color: 'bg-amber-500',
          subtitle: 'Awaiting confirmation',
        },
        {
          label: 'Total Patients',
          value: '—',
          icon: Users,
          color: 'bg-teal-500',
          subtitle: 'All-time patients',
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl bg-card border border-border p-6 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`h-11 w-11 rounded-xl ${stat.color} flex items-center justify-center`}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stat.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>
        </div>
      ))}
    </div>
  );

  const renderPatientDashboard = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[
        {
          label: 'Upcoming Appointments',
          value: '—',
          icon: Calendar,
          color: 'bg-blue-500',
          subtitle: 'Next appointment',
        },
        {
          label: 'Completed Visits',
          value: '—',
          icon: Activity,
          color: 'bg-green-500',
          subtitle: 'Past appointments',
        },
        {
          label: 'Pending',
          value: '—',
          icon: Clock,
          color: 'bg-amber-500',
          subtitle: 'Awaiting confirmation',
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl bg-card border border-border p-6 card-hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`h-11 w-11 rounded-xl ${stat.color} flex items-center justify-center`}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold">{stat.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()},{' '}
          <span className="text-gradient">{user.firstName}</span>! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {user.role === 'admin'
            ? 'Here\'s an overview of the platform.'
            : user.role === 'doctor'
              ? 'Here\'s your schedule for today.'
              : 'Manage your health appointments.'}
        </p>
      </div>

      {/* Role-based stats */}
      {user.role === 'admin' && renderAdminDashboard()}
      {user.role === 'doctor' && renderDoctorDashboard()}
      {user.role === 'patient' && renderPatientDashboard()}

      {/* Quick Links Menu */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {user.role === 'admin' && (
            <>
              <Button asChild variant="outline" className="justify-start h-12 rounded-xl">
                <Link href="/dashboard/users">Manage Platform Users</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-12 rounded-xl">
                <Link href="/dashboard/verification">Pending Verifications</Link>
              </Button>
            </>
          )}
          {user.role === 'doctor' && (
            <>
              <Button asChild variant="outline" className="justify-start h-12 rounded-xl">
                <Link href="/dashboard/appointments">Manage Incoming Bookings</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-12 rounded-xl">
                <Link href="/dashboard/schedule">Configure Working Timings</Link>
              </Button>
            </>
          )}
          {user.role === 'patient' && (
            <>
              <Button asChild variant="gradient" className="justify-start h-12 rounded-xl">
                <Link href="/doctors">Find & Book a Doctor</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start h-12 rounded-xl">
                <Link href="/dashboard/appointments">My Upcoming Visits</Link>
              </Button>
            </>
          )}
          <Button asChild variant="outline" className="justify-start h-12 rounded-xl">
            <Link href="/dashboard/profile">Edit Profile Settings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
