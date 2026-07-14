'use client';

import React, { useState } from 'react';
import { Activity, Plus, Heart, Eye, Trash2, Calendar, Scale, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VitalLog {
  id: string;
  date: string;
  heartRate: number;
  bloodPressure: string;
  weight: number;
  temperature: number;
}

export default function HealthTrackerPage() {
  const [logs, setLogs] = useState<VitalLog[]>([]);

  // Form states
  const [heartRate, setHeartRate] = useState<number | ''>('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [weight, setWeight] = useState<number | ''>('');
  const [temperature, setTemperature] = useState<number | ''>('');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: VitalLog = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      heartRate: Number(heartRate) || 72,
      bloodPressure: bloodPressure || '120/80',
      weight: Number(weight) || 70,
      temperature: Number(temperature) || 36.7,
    };
    setLogs([newLog, ...logs]);
    setHeartRate('');
    setBloodPressure('');
    setWeight('');
    setTemperature('');
    alert('Vitals logged successfully!');
  };

  const handleDeleteLog = (id: string) => {
    setRecords(logs.filter((l) => l.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary animate-pulse" />
          Health Tracker & Vitals
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your key daily health metrics and log vitals to share with your specialist.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Form log */}
        <div className="md:col-span-4">
          <form onSubmit={handleAddLog} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
              <Plus className="h-5 w-5 text-primary" />
              Log Daily Vitals
            </h2>

            <div className="space-y-2">
              <Label>Heart Rate (BPM)</Label>
              <Input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 72" required />
            </div>

            <div className="space-y-2">
              <Label>Blood Pressure (systolic/diastolic)</Label>
              <Input value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="e.g. 120/80" required />
            </div>

            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 70" />
            </div>

            <div className="space-y-2">
              <Label>Body Temperature (°C)</Label>
              <Input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 36.7" />
            </div>

            <Button type="submit" variant="gradient" className="w-full h-10 font-bold">
              Record Vital Metrics
            </Button>
          </form>
        </div>

        {/* Right Column: Vitals List Feed */}
        <div className="md:col-span-8 space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-1">
            <Activity className="h-4.5 w-4.5" />
            Recorded Vital Logs
          </h3>
          
          <div className="grid gap-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-3xl border border-border bg-card p-5 hover:border-primary/20 transition-all shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Calendar className="h-4 w-4" />
                    Logged on: {log.date}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <Heart className="h-5 w-5 text-red-500 mx-auto" />
                    <div className="text-sm font-extrabold text-foreground">{log.heartRate} BPM</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">Pulse</div>
                  </div>
                  <div className="space-y-1">
                    <Activity className="h-5 w-5 text-blue-500 mx-auto" />
                    <div className="text-sm font-extrabold text-foreground">{log.bloodPressure}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">Blood Pres.</div>
                  </div>
                  <div className="space-y-1">
                    <Scale className="h-5 w-5 text-orange-500 mx-auto" />
                    <div className="text-sm font-extrabold text-foreground">{log.weight} kg</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">Weight</div>
                  </div>
                  <div className="space-y-1">
                    <Thermometer className="h-5 w-5 text-purple-500 mx-auto" />
                    <div className="text-sm font-extrabold text-foreground">{log.temperature} °C</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">Temp</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
