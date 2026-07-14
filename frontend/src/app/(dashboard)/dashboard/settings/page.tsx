'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, User, Shield, Briefcase, Heart } from 'lucide-react';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile fields state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');

  // Patient details state
  const [age, setAge] = useState<number | ''>('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Doctor details state
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState<number | ''>('');
  const [consultationFee, setConsultationFee] = useState<number | ''>('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [education, setEducation] = useState('');
  const [bio, setBio] = useState('');

  // Load profile values on enter
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setGender(user.gender || '');

      if (user.role === 'patient') {
        setAge(user.age ?? '');
        setBloodGroup(user.bloodGroup || '');
        setMedicalHistory(user.medicalHistory || '');
      } else if (user.role === 'doctor') {
        setSpecialization(user.specialization || '');
        setExperience(user.experience ?? '');
        setConsultationFee(user.consultationFee ?? '');
        setClinicAddress(user.clinicAddress || '');
        setEducation(user.education || '');
        setBio(user.bio || '');
      }
    }
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: any = {
      firstName,
      lastName,
      phone,
      gender,
    };

    if (user.role === 'patient') {
      payload.age = age !== '' ? Number(age) : undefined;
      payload.bloodGroup = bloodGroup;
      payload.medicalHistory = medicalHistory;
    } else if (user.role === 'doctor') {
      payload.specialization = specialization;
      payload.experience = experience !== '' ? Number(experience) : undefined;
      payload.consultationFee = consultationFee !== '' ? Number(consultationFee) : undefined;
      payload.clinicAddress = clinicAddress;
      payload.education = education;
      payload.bio = bio;
    }

    try {
      const res = await api.patch('/users/profile', payload);
      
      // Update local storage / state context
      if (res.data.success) {
        // Re-authenticate user context to sync name changes immediately on navbar
        const profileRes = await api.get('/users/profile');
        const token = localStorage.getItem('token') || '';
        login(token, profileRes.data.data);

        alert('Your profile has been updated successfully.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile details, health logs, and credentials immediately.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Card 1: Basic Information */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
            <User className="h-5 w-5 text-primary" />
            Personal Profile Details
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Role-Based Information */}
        {user.role === 'patient' ? (
          /* Patient Profile Fields */
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
              <Heart className="h-5 w-5 text-primary" />
              Patient Health Logs
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 28"
                  min="0"
                  max="150"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood-group">Blood Group</Label>
                <select
                  id="blood-group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical-history">Medical History / Allergies</Label>
              <textarea
                id="medical-history"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="List any past surgeries, chronic illnesses, or drug allergies..."
                rows={4}
                className="w-full rounded-xl border border-input bg-card p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>
        ) : (
          /* Doctor Profile Fields */
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
              <Briefcase className="h-5 w-5 text-primary" />
              Professional Practice Details
            </h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Cardiologist"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 12"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Consultation Fee ($)</Label>
                <Input
                  id="fee"
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 50"
                  min="0"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="education">Education & Degrees</Label>
                <Input
                  id="education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. MBBS, MD, FACC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-address">Clinic / Hospital Address</Label>
                <Input
                  id="clinic-address"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="e.g. 101 Medical Center Drive, Suite A"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your medical approach, achievements, and patient care philosophies..."
                rows={4}
                className="w-full rounded-xl border border-input bg-card p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 shrink-0">
          <Button
            type="submit"
            variant="gradient"
            disabled={isSaving}
            className="px-8 rounded-2xl h-11 font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
