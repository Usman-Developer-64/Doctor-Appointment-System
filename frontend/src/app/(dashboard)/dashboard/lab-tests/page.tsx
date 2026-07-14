'use client';

import React, { useState } from 'react';
import { Microscope, Plus, Calendar, DollarSign, Activity, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LabPackage {
  id: string;
  name: string;
  price: number;
  parameters: number;
  description: string;
  tests: string[];
}

export default function LabTestsPage() {
  const packages: LabPackage[] = [
    {
      id: 'LAB-01',
      name: 'Full Body Health Screening',
      price: 99.0,
      parameters: 62,
      description: 'Comprehensive checkup designed for general screening of vitals, blood counts, glucose, and organ health.',
      tests: ['Complete Blood Count', 'Kidney Function Test', 'Liver Function Test', 'Lipid Profile', 'Thyroid Profile'],
    },
    {
      id: 'LAB-02',
      name: 'Diabetes Care Profile',
      price: 49.0,
      parameters: 12,
      description: 'Specific tests for diabetic monitoring, tracking blood sugar levels and average sugar log.',
      tests: ['HbA1c (Glycosylated Hemoglobin)', 'Blood Glucose Fasting', 'Urine Microalbumin'],
    },
    {
      id: 'LAB-03',
      name: 'Cardiac Risk Assessment',
      price: 79.0,
      parameters: 18,
      description: 'Vital blood analysis looking at markers directly connected with blood circulation and cholesterol risk factors.',
      tests: ['Lipid Profile', 'Apolipoproteins', 'High Sensitivity CRP'],
    },
  ];

  const handleBookTest = (name: string) => {
    alert(`Successfully requested booking for: "${name}". Our team will contact you shortly to coordinate home sample collection!`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Microscope className="h-8 w-8 text-primary" />
          Diagnostic Lab Tests
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse specialized pathology and diagnostic test packages with free home sample collection.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Packages list */}
        <div className="md:col-span-8 space-y-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-3xl border border-border bg-card p-6 space-y-4 hover:border-primary/20 transition-all shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-primary/10 text-primary text-[9px] font-bold px-2.5 py-0.5 rounded-full">{pkg.id}</span>
                  <h3 className="font-bold text-sm mt-1.5">{pkg.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{pkg.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-extrabold text-foreground">${pkg.price.toFixed(2)}</div>
                  <span className="text-[10px] text-muted-foreground font-semibold">{pkg.parameters} Parameters</span>
                </div>
              </div>

              <div className="border-t border-border/50 pt-3 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Included Tests:</span>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.tests.map((t, idx) => (
                    <span key={idx} className="bg-muted text-muted-foreground text-[10px] px-2.5 py-1 rounded-xl font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button variant="outline" size="sm" className="rounded-xl px-6 hover:bg-primary hover:text-white" onClick={() => handleBookTest(pkg.name)}>
                  Request Home Collection
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Home collection details */}
        <div className="md:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-card p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-primary">
              <CheckCircle className="h-5 w-5" />
              How It Works
            </h3>
            <ul className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <li><strong>1. Request booking</strong>: Tap "Request Home Collection" on the chosen package.</li>
              <li><strong>2. Coordination</strong>: An agent will confirm sample slot timing.</li>
              <li><strong>3. Sample collection</strong>: A certified lab agent will visit you to collect sample details.</li>
              <li><strong>4. E-Reports</strong>: View compiled medical logs online in the "Medical Records" tab.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
