'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Upload, Trash2, Eye, Calendar, User, EyeOff } from 'lucide-react';

interface MedicalRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  patientName: string;
  fileSize: string;
}

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lab Report');

  if (!user) return null;

  const handleUploadRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const newRec: MedicalRecord = {
      id: `REC-0${records.length + 1}`,
      title,
      type,
      date: new Date().toISOString().split('T')[0],
      patientName: `${user.firstName} ${user.lastName}`,
      fileSize: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
    };
    setRecords([newRec, ...records]);
    setTitle('');
    alert('Medical record uploaded successfully!');
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const handleViewFile = (title: string) => {
    alert(`Opening File Preview for: "${title}" ...`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Medical Records
        </h1>
        <p className="text-muted-foreground mt-1">
          {user.role === 'patient'
            ? 'Safely store, manage, and share your diagnostic lab reports and medical charts.'
            : 'Access diagnostic records and patient-uploaded health logs.'}
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Upload box (Only for Patient) & Records list */}
        <div className="md:col-span-8 space-y-6">
          {user.role === 'patient' && (
            <form onSubmit={handleUploadRecord} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
                <Upload className="h-5 w-5 text-primary" />
                Upload Diagnostic Report
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Record Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lipid Profile Test" required />
                </div>
                <div className="space-y-2">
                  <Label>Record Category</Label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Imaging">Imaging / X-Ray / MRI</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Certificate">Vaccine / Certificate</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>
              </div>

              <div className="border border-dashed border-border p-8 rounded-2xl text-center space-y-2 bg-muted/20">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">Drag and drop PDF, PNG, JPG files here, or click to browse</p>
                <input type="file" className="hidden" id="file-upload" />
                <Label htmlFor="file-upload" className="inline-flex h-9 items-center justify-center rounded-xl border border-input bg-card px-4 text-xs font-semibold shadow-sm hover:bg-muted cursor-pointer">
                  Browse Files
                </Label>
              </div>

              <Button type="submit" variant="gradient" className="w-full h-10 font-bold">
                Save & Attach to Profile
              </Button>
            </form>
          )}

          {/* List of files */}
          <div className="space-y-3">
            {records.map((rec) => (
              <div key={rec.id} className="rounded-3xl border border-border bg-card p-5 flex justify-between items-center hover:border-primary/20 transition-colors shadow-sm">
                <div className="flex gap-4 items-center min-w-0">
                  <div className="h-11 w-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs truncate text-foreground">{rec.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                      <span className="bg-muted px-2 py-0.5 rounded-full font-semibold">{rec.type}</span>
                      <span>{rec.fileSize}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {rec.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl border-primary/20 text-primary hover:bg-primary/5" onClick={() => handleViewFile(rec.title)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {user.role === 'patient' && (
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive" onClick={() => handleDeleteRecord(rec.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Information Panel */}
        <div className="md:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-primary">
              <EyeOff className="h-5 w-5" />
              Privacy Protocols
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Medical records are stored securely. Only consulting doctors assigned to your active appointments can view or download these records. You can withdraw file permissions at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
