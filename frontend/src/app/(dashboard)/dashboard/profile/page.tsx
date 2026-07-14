'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, User as UserIcon, ShieldAlert, Heart, Clipboard, PhoneCall, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    // Patient fields
    age: '',
    gender: '',
    bloodGroup: '',
    medicalHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    // Doctor fields
    specialization: '',
    experience: '',
    clinicAddress: '',
    consultationFee: '',
    education: '',
    city: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        age: user.age ? String(user.age) : '',
        gender: user.gender || '',
        bloodGroup: user.bloodGroup || '',
        medicalHistory: user.medicalHistory || '',
        emergencyContactName: user.emergencyContact?.name || '',
        emergencyContactPhone: user.emergencyContact?.phone || '',
        emergencyContactRelation: user.emergencyContact?.relation || '',
        specialization: user.specialization || '',
        experience: user.experience ? String(user.experience) : '',
        clinicAddress: user.clinicAddress || '',
        consultationFee: user.consultationFee ? String(user.consultationFee) : '',
        education: user.education || '',
        city: user.city || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Build the request body matching the backend schema/DTO
    const updateData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
    };

    if (user.role === 'patient') {
      updateData.age = formData.age ? Number(formData.age) : undefined;
      updateData.gender = formData.gender || undefined;
      updateData.bloodGroup = formData.bloodGroup || undefined;
      updateData.medicalHistory = formData.medicalHistory || undefined;
      updateData.emergencyContact = {
        name: formData.emergencyContactName || null,
        phone: formData.emergencyContactPhone || null,
        relation: formData.emergencyContactRelation || null,
      };
    } else if (user.role === 'doctor') {
      updateData.specialization = formData.specialization || undefined;
      updateData.experience = formData.experience ? Number(formData.experience) : undefined;
      updateData.clinicAddress = formData.clinicAddress || undefined;
      updateData.consultationFee = formData.consultationFee ? Number(formData.consultationFee) : undefined;
      updateData.education = formData.education || undefined;
      updateData.city = formData.city || undefined;
      updateData.bio = formData.bio || undefined;
    }

    try {
      const response = await api.patch('/users/profile', updateData);
      updateUser(response.data.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information, credentials, and settings.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-2xl border p-4 text-sm flex items-start gap-3 transition-all ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {message.type === 'error' && <ShieldAlert className="h-5 w-5 shrink-0" />}
          <div>{message.text}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details Card */}
        <div className="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-border pb-3">
            <UserIcon className="h-5 w-5 text-primary" />
            Personal Details
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Read-only)</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
              />
            </div>
          </div>
        </div>

        {/* Patient Profile Section */}
        {user.role === 'patient' && (
          <>
            <div className="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-border pb-3">
                <Heart className="h-5 w-5 text-red-500" />
                Medical Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    min="0"
                    max="150"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="medicalHistory">Medical History / Chronic Conditions</Label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    placeholder="Specify any details regarding prior surgeries, allergies, ongoing medications, etc."
                    className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-border pb-3">
                <PhoneCall className="h-5 w-5 text-amber-500" />
                Emergency Contact
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="+92 300 0000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelation">Relationship</Label>
                  <Input
                    id="emergencyContactRelation"
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleChange}
                    placeholder="Spouse / Parent / Sibling"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Doctor Profile Section */}
        {user.role === 'doctor' && (
          <div className="rounded-2xl bg-card border border-border p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Briefcase className="h-5 w-5 text-teal-500" />
              Professional Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Specialization</option>
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
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education / Credentials</Label>
                <Input
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="MBBS, FCPS, MD"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee (Rs.)</Label>
                <Input
                  id="consultationFee"
                  name="consultationFee"
                  type="number"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  min="0"
                  placeholder="2000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Lahore, Karachi, Islamabad"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Clinic Address</Label>
                <Input
                  id="clinicAddress"
                  name="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={handleChange}
                  placeholder="123 Hospital Road, Sector G-8"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Describe your credentials, medical approach, and clinical specializations."
                  className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full sm:w-auto min-w-[150px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
