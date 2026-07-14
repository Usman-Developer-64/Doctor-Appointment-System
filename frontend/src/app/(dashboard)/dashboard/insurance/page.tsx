'use client';

import React, { useState } from 'react';
import { ShieldAlert, Plus, Shield, Award, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Policy {
  provider: string;
  policyNumber: string;
  startDate: string;
  status: string;
}

export default function InsurancePage() {
  const [policy, setPolicy] = useState<Policy>({
    provider: 'Blue Cross Shield',
    policyNumber: 'BCS-990887123',
    startDate: '2025-01-01',
    status: 'Active',
  });

  const claims: any[] = [];

  const [provider, setProvider] = useState(policy.provider);
  const [policyNumber, setPolicyNumber] = useState(policy.policyNumber);

  const handleUpdatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setPolicy({
      ...policy,
      provider,
      policyNumber,
    });
    alert('Insurance policy details updated successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Insurance Claims
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your health insurance provider policies and track medical claim status.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Form log */}
        <div className="md:col-span-5">
          <form onSubmit={handleUpdatePolicy} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Policy Details
            </h2>

            <div className="space-y-2">
              <Label>Insurance Provider</Label>
              <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Cigna, United Health" required />
            </div>

            <div className="space-y-2">
              <Label>Policy / Member ID</Label>
              <Input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="e.g. UHA-992200" required />
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1.5">
              <span>Status: <strong className="text-emerald-500 font-semibold">{policy.status}</strong></span>
              <span>Valid since: {policy.startDate}</span>
            </div>

            <Button type="submit" variant="gradient" className="w-full h-10 font-bold">
              Update Policy Details
            </Button>
          </form>
        </div>

        {/* Right Column: Claims lists */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <Award className="h-4.5 w-4.5" />
            Claim History logs
          </h3>

          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim.id} className="rounded-3xl border border-border bg-card p-5 flex justify-between items-center hover:border-primary/20 transition-all shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">{claim.type}</span>
                    <span className="text-[9px] font-semibold text-muted-foreground">({claim.id})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Claim date: {claim.date}</span>
                    <span>Amount: ${claim.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    claim.status === 'approved' ? 'text-emerald-600 bg-emerald-500/10' : 'text-orange-600 bg-orange-500/10'
                  }`}>
                    {claim.status === 'approved' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {claim.status === 'approved' ? 'Approved' : 'Pending'}
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
