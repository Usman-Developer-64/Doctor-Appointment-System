'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus, Calendar, CheckCircle2, Circle, Eye, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Vaccine {
  id: string;
  name: string;
  doses: string;
  date: string;
  status: 'completed' | 'scheduled';
}

export default function VaccinationsPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);

  const [name, setName] = useState('');
  const [doses, setDoses] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'completed' | 'scheduled'>('completed');

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;

    const newVaccine: Vaccine = {
      id: String(Date.now()),
      name,
      doses: doses || '1 Dose',
      date,
      status,
    };
    setVaccines([...vaccines, newVaccine]);
    setName('');
    setDoses('');
    setDate('');
    alert('Vaccination log successfully added!');
  };

  const handleToggleStatus = (id: string) => {
    setVaccines(
      vaccines.map((v) => (v.id === id ? { ...v, status: v.status === 'completed' ? 'scheduled' : 'completed' } : v))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Vaccination Tracker
        </h1>
        <p className="text-muted-foreground mt-1">
          Keep track of completed immunizations, boosters, and upcoming dose schedules.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Form log */}
        <div className="md:col-span-4">
          <form onSubmit={handleAddVaccine} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
              <Plus className="h-5 w-5 text-primary" />
              Log Vaccine Dose
            </h2>

            <div className="space-y-2">
              <Label>Vaccine Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tetanus Shot" required />
            </div>

            <div className="space-y-2">
              <Label>Doses Detail</Label>
              <Input value={doses} onChange={(e) => setDoses(e.target.value)} placeholder="e.g. Dose 1 of 2" required />
            </div>

            <div className="space-y-2">
              <Label>Immunization Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Immunization Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled / Pending</option>
              </select>
            </div>

            <Button type="submit" variant="gradient" className="w-full h-10 font-bold">
              Save Immunization Log
            </Button>
          </form>
        </div>

        {/* Right Column: VACCINES logs */}
        <div className="md:col-span-8 space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-1">
            <Award className="h-4.5 w-4.5" />
            Your Immunization Logs
          </h3>

          <div className="space-y-3">
            {vaccines.map((v) => (
              <div key={v.id} className="rounded-3xl border border-border bg-card p-5 flex justify-between items-center hover:border-primary/20 transition-all shadow-sm">
                <div className="flex gap-4 items-center min-w-0">
                  <button onClick={() => handleToggleStatus(v.id)} className="shrink-0 p-1">
                    {v.status === 'completed' ? (
                      <CheckCircle2 className="h-7 w-7 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <Circle className="h-7 w-7 text-slate-300 hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs truncate text-foreground">{v.name}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Date: {v.date}</span>
                      <span>Dose: {v.doses}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    v.status === 'completed' ? 'text-emerald-600 bg-emerald-500/10' : 'text-blue-600 bg-blue-500/10'
                  }`}>
                    {v.status === 'completed' ? 'Completed' : 'Scheduled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
