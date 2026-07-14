'use client';

import React, { useState } from 'react';
import { Pill, Plus, Calendar, Clock, CheckCircle2, Circle, Trash2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PillReminder {
  id: string;
  name: string;
  dosage: string;
  time: string;
  takenToday: boolean;
}

export default function MedicineRemindersPage() {
  const [reminders, setReminders] = useState<PillReminder[]>([]);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !time) return;

    // Convert 24h to 12h formatted time
    let formattedTime = time;
    try {
      const [h, m] = time.split(':');
      const hr = Number(h);
      const ampm = hr >= 12 ? 'PM' : 'AM';
      const hours12 = hr % 12 || 12;
      formattedTime = `${String(hours12).padStart(2, '0')}:${m} ${ampm}`;
    } catch (e) {}

    const newReminder: PillReminder = {
      id: String(Date.now()),
      name,
      dosage: dosage || '1 pill',
      time: formattedTime,
      takenToday: false,
    };
    setReminders([...reminders, newReminder]);
    setName('');
    setDosage('');
    setTime('');
    alert('Medication reminder added!');
  };

  const handleToggleTaken = (id: string) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, takenToday: !r.takenToday } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Pill className="h-8 w-8 text-primary" />
          Pill Tracker & Reminders
        </h1>
        <p className="text-muted-foreground mt-1">
          Set schedules and tick off medication logs so you never skip a dose.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Form log */}
        <div className="md:col-span-4">
          <form onSubmit={handleAddReminder} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
              <Plus className="h-5 w-5 text-primary" />
              Add Pill Schedule
            </h2>

            <div className="space-y-2">
              <Label>Medicine Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paracetamol" required />
            </div>

            <div className="space-y-2">
              <Label>Dosage / Strength</Label>
              <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 500mg, 1 Capsule" required />
            </div>

            <div className="space-y-2">
              <Label>Reminder Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>

            <Button type="submit" variant="gradient" className="w-full h-10 font-bold">
              Save Medication Alert
            </Button>
          </form>
        </div>

        {/* Right Column: Alerts list */}
        <div className="md:col-span-8 space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-1">
            <Bell className="h-4.5 w-4.5" />
            Today's Dose Schedule
          </h3>

          <div className="space-y-3">
            {reminders.map((rem) => (
              <div key={rem.id} className="rounded-3xl border border-border bg-card p-5 flex justify-between items-center hover:border-primary/20 transition-all shadow-sm">
                <div className="flex gap-4 items-center min-w-0">
                  <button onClick={() => handleToggleTaken(rem.id)} className="shrink-0 p-1">
                    {rem.takenToday ? (
                      <CheckCircle2 className="h-7 w-7 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <Circle className="h-7 w-7 text-slate-300 hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <h4 className={`font-bold text-xs truncate ${rem.takenToday ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {rem.name}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {rem.time}</span>
                      <span>Dosage: {rem.dosage}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive" onClick={() => handleDeleteReminder(rem.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
