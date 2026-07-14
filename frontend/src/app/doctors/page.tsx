'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Star,
  Loader2,
  Stethoscope,
  Filter,
  X,
} from 'lucide-react';
import { User } from '@/types';

export default function FindDoctorPage() {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [day, setDay] = useState('');

  // Sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params: Record<string, string | number> = {};
      if (search) params.search = search;
      if (specialization) params.specialization = specialization;
      if (city) params.city = city;
      if (maxFee) params.maxFee = Number(maxFee);
      if (minExperience) params.minExperience = Number(minExperience);
      if (day) params.day = day;

      const response = await api.get('/doctors', { params });
      setDoctors(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to retrieve doctors. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, specialization, city, maxFee, minExperience, day]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleClearFilters = () => {
    setSearch('');
    setSpecialization('');
    setCity('');
    setMaxFee('');
    setMinExperience('');
    setDay('');
  };

  const SidebarFilters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Filter Search
        </h3>
        <button
          onClick={handleClearFilters}
          className="text-xs text-primary hover:underline font-semibold"
        >
          Clear All
        </button>
      </div>

      {/* Specialization */}
      <div className="space-y-2">
        <Label htmlFor="specialization">Specialization</Label>
        <select
          id="specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">All Specialties</option>
          {[
            'Cardiologist',
            'Neurologist',
            'Orthopedic',
            'Ophthalmologist',
            'General Physician',
            'Pediatrician',
          ].map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-10"
            placeholder="e.g. Lahore"
          />
        </div>
      </div>

      {/* Consultation Fee */}
      <div className="space-y-2">
        <Label htmlFor="maxFee">Maximum Fee (Rs.)</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="maxFee"
            type="number"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            className="pl-10"
            placeholder="e.g. 3000"
            min="0"
          />
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <Label htmlFor="minExperience">Min Experience (Years)</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="minExperience"
            type="number"
            value={minExperience}
            onChange={(e) => setMinExperience(e.target.value)}
            className="pl-10"
            placeholder="e.g. 5"
            min="0"
          />
        </div>
      </div>

      {/* Availability Day */}
      <div className="space-y-2">
        <Label htmlFor="day">Availability Day</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            id="day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Any Day</option>
            {[
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-teal-500 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Find the Right Doctor for You
          </h1>
          <p className="mt-3 text-white/80 text-base md:text-lg leading-relaxed">
            Search across verified healthcare specialists, compare credentials, check availability, and book appointments instantly.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar Desktop */}
        <aside className="hidden lg:block bg-card border border-border rounded-2xl p-6 shadow-sm h-fit sticky top-24">
          <SidebarFilters />
        </aside>

        {/* Search Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Search bar & Mobile Filter Button */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctors by name, clinic, or keywords..."
                className="pl-11 h-12 shadow-sm rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden shrink-0 rounded-xl h-12 border-border"
            >
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </Button>
          </div>

          {/* Active Filters Row */}
          {(specialization || city || maxFee || minExperience || day) && (
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <span className="text-muted-foreground font-medium">Active Filters:</span>
              {specialization && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-xs">
                  {specialization}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSpecialization('')} />
                </span>
              )}
              {city && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-xs">
                  {city}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setCity('')} />
                </span>
              )}
              {maxFee && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-xs">
                  Fee &le; Rs.{maxFee}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setMaxFee('')} />
                </span>
              )}
              {minExperience && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-xs">
                  {minExperience}+ Yrs Exp
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setMinExperience('')} />
                </span>
              )}
              {day && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-xs">
                  Active on {day}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setDay('')} />
                </span>
              )}
            </div>
          )}

          {/* Content Area */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl">
              {error}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg">No Doctors Found</h3>
              <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                We couldn&apos;t find any doctors matching your search filters. Try clearing some criteria.
              </p>
              <Button onClick={handleClearFilters} className="mt-4" variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {doctors.map((doctor) => {
                const initials = `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`.toUpperCase();
                return (
                  <div
                    key={doctor._id}
                    className="flex flex-col rounded-2xl bg-card border border-border overflow-hidden card-hover shadow-sm"
                  >
                    {/* Card Header Info */}
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-base leading-tight">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h3>
                          <p className="text-sm font-medium text-primary mt-1">
                            {doctor.specialization}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {doctor.education}
                          </p>
                        </div>
                      </div>

                      {/* Detail row */}
                      <div className="space-y-2 border-t border-border pt-4 text-sm">
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <Briefcase className="h-4 w-4 text-primary shrink-0" />
                          <span>{doctor.experience} years experience</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <DollarSign className="h-4 w-4 text-teal-600 shrink-0" />
                          <span className="font-semibold text-foreground">
                            Rs. {doctor.consultationFee?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="truncate">
                            {doctor.clinicAddress}, {doctor.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-foreground">4.9</span>
                        <span className="text-xs text-muted-foreground">(20+ reviews)</span>
                      </div>
                      <Button size="sm" variant="gradient" asChild className="rounded-lg">
                        <Link href={`/doctors/${doctor._id}`} id={`view-doc-${doctor._id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Slide-out Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-full bg-card h-full p-6 overflow-y-auto z-10 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Filters</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-full h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SidebarFilters />
            </div>
            <Button
              className="w-full mt-6"
              variant="gradient"
              onClick={() => setIsSidebarOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
