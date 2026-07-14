'use client';

import React from 'react';
import { CreditCard, Download, ShieldCheck, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Invoice {
  id: string;
  doctorName: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
}

export default function BillingPage() {
  const invoices: Invoice[] = [];

  const handleDownloadInvoice = (id: string) => {
    alert(`Downloading Stripe Invoice PDF: ${id} ...`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" />
          Billing & Invoices
        </h1>
        <p className="text-muted-foreground mt-1">
          Review payment history, active medical insurance claims, and download receipts.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Transaction list */}
        <div className="md:col-span-8 space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <FileText className="h-4.5 w-4.5" />
            Stripe Consultation Invoices
          </h2>

          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="rounded-3xl border border-border bg-card p-5 flex justify-between items-center hover:border-primary/20 transition-all shadow-sm">
                <div className="flex gap-4 items-center min-w-0">
                  <div className="h-11 w-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">${inv.amount.toFixed(2)}</span>
                      <span className="text-[9px] font-semibold text-muted-foreground">({inv.id})</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Consultation with {inv.doctorName}</p>
                    <div className="flex items-center gap-3 text-[9px] text-muted-foreground mt-1.5">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {inv.date}</span>
                      <span>{inv.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3 fill-emerald-600/15" />
                    Paid
                  </span>
                  <button onClick={() => handleDownloadInvoice(inv.id)} className="h-9 w-9 bg-muted hover:bg-muted/80 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" title="Download PDF Copy">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Cards & Payment Gate Security info */}
        <div className="md:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-card p-6 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-primary">
              <ShieldCheck className="h-5 w-5" />
              Stripe Verified Gateway
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All transactions are securely handled using Stripe APIs. DocAppoint does not store raw credit card details or CVV codes on our servers, ensuring HIPAA and PCI compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
