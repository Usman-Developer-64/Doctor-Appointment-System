'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Download, Pill, Calendar, Clock, ClipboardList } from 'lucide-react';

interface Prescription {
  id: string;
  doctorName: string;
  patientName: string;
  date: string;
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  notes: string;
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Form states for doctors to write prescriptions
  const [patientName, setPatientName] = useState('');
  const [notes, setNotes] = useState('');
  const [meds, setMeds] = useState<{ name: string; dosage: string; frequency: string; duration: string }[]>([
    { name: '', dosage: '', frequency: '', duration: '' },
  ]);

  if (!user) return null;

  const handleAddMedRow = () => {
    setMeds([...meds, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleMedChange = (index: number, field: string, value: string) => {
    const updated = [...meds];
    updated[index] = { ...updated[index], [field]: value };
    setMeds(updated);
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const newRx: Prescription = {
      id: `RX-${Math.floor(10000 + Math.random() * 90000)}`,
      doctorName: `Dr. ${user.firstName} ${user.lastName}`,
      patientName,
      date: new Date().toISOString().split('T')[0],
      medications: meds.filter((m) => m.name),
      notes,
    };
    setPrescriptions([newRx, ...prescriptions]);
    setPatientName('');
    setNotes('');
    setMeds([{ name: '', dosage: '', frequency: '', duration: '' }]);
    alert('Prescription created successfully!');
  };

  const downloadMockPdf = (id: string) => {
    alert(`Downloading PDF copy of Prescription: ${id} ...`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Prescriptions
        </h1>
        <p className="text-muted-foreground mt-1">
          {user.role === 'doctor'
            ? 'Issue and manage medical prescriptions for your consulting patients.'
            : 'View and download prescriptions issued to you by specialists.'}
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Create Form for Doctor / List view */}
        <div className={`md:col-span-7 space-y-6`}>
          {user.role === 'doctor' && (
            <form onSubmit={handleCreatePrescription} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
                <Plus className="h-5 w-5 text-primary" />
                Issue New Rx
              </h2>

              <div className="space-y-2">
                <Label>Patient Full Name</Label>
                <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g. Evan Leblanc" required />
              </div>

              <div className="space-y-3">
                <Label>Medications</Label>
                {meds.map((med, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Input placeholder="Med Name" value={med.name} onChange={(e) => handleMedChange(index, 'name', e.target.value)} required />
                    <Input placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedChange(index, 'dosage', e.target.value)} />
                    <Input placeholder="Frequency" value={med.frequency} onChange={(e) => handleMedChange(index, 'frequency', e.target.value)} />
                    <Input placeholder="Duration" value={med.duration} onChange={(e) => handleMedChange(index, 'duration', e.target.value)} />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddMedRow} className="text-xs">
                  + Add Medication Row
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Additional Guidelines / Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Avoid dairy products while taking antibiotics." />
              </div>

              <Button type="submit" variant="gradient" className="w-full h-10 font-bold">
                Submit & Issue Rx
              </Button>
            </form>
          )}

          {/* List layout */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5" />
              Prescription Logs
            </h3>
            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="rounded-3xl border border-border bg-card p-5 space-y-3 shadow-sm hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {rx.id}
                      </span>
                      <h4 className="font-bold text-sm mt-1.5">
                        {user.role === 'doctor' ? `Patient: ${rx.patientName}` : rx.doctorName}
                      </h4>
                    </div>
                    <button onClick={() => downloadMockPdf(rx.id)} className="h-9 w-9 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Download PDF copy">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="border-t border-border/50 pt-3 space-y-2.5">
                    {rx.medications.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <Pill className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div>
                          <span className="font-bold text-foreground">{m.name}</span>
                          <span className="text-muted-foreground"> • {m.dosage} • {m.frequency} ({m.duration})</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted-foreground bg-muted/30 p-2.5 rounded-xl italic">
                    Note: {rx.notes}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1.5 border-t border-border/30">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Issued on {rx.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Information panel / Quick Guidelines */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-card p-6 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-primary">
              <Pill className="h-5 w-5" />
              E-Prescription Rules
            </h3>
            <ul className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
              <li>• digital prescriptions can be presented directly to pharmacy gates in PDF formats.</li>
              <li>• Always cross-verify prescription durations with your primary physician before continuing refills.</li>
              <li>• If experiencing any allergy shocks or side-effects, stop medication and initiate a live video call consultation immediately.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
