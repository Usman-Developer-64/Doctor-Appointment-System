'use client';

import React, { useState } from 'react';
import { HelpCircle, Plus, Calendar, CheckCircle2, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'closed';
  date: string;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const faqs = [
    { q: 'How do I join a video call room?', a: 'Go to the Telemedicine page, enter the Room ID (Appointment ID), and click Enter. Grant browser permissions to camera and microphone.' },
    { q: 'What is the refund policy for cancelled slots?', a: 'If a doctor cancels an appointment, the Stripe transaction refund is automatically processed to your payment method within 3-5 working days.' },
    { q: 'How does the AI assistant symptom checker work?', a: 'Go to the AI Assistant tab. Ask symptoms, and it matches keywords or uses the Gemini engine to recommend remedies and specialist categories.' },
  ];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      description,
      status: 'open',
      date: new Date().toISOString().split('T')[0],
    };
    setTickets([newTicket, ...tickets]);
    setSubject('');
    setDescription('');
    alert('Support ticket created successfully! Our helpdesk team will respond within 24 hours.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          Support & FAQs
        </h1>
        <p className="text-muted-foreground mt-1">
          Resolve platform queries, search answers, or raise helpdesk service tickets.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: FAQs & Raise ticket form */}
        <div className="md:col-span-7 space-y-6">
          <form onSubmit={handleCreateTicket} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
              <Plus className="h-5 w-5 text-primary" />
              Raise Support Ticket
            </h2>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Booking confirmation error" required />
            </div>

            <div className="space-y-2">
              <Label>Description / Queries</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please elaborate your platform issue or query details..."
                rows={4}
                className="w-full rounded-xl border border-input bg-card p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                required
              />
            </div>

            <Button type="submit" variant="gradient" className="w-full h-10 font-bold">
              Submit Helpdesk Ticket
            </Button>
          </form>

          {/* FAQs section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5" />
              Frequently Asked Questions (FAQs)
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-3xl border border-border bg-card p-5 space-y-2 hover:border-primary/20 transition-all shadow-sm">
                  <h4 className="font-bold text-xs text-foreground">Q: {faq.q}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">A: {faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Tickets */}
        <div className="md:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5" />
            Your Support Tickets
          </h3>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-3xl border border-border bg-card p-5 space-y-3 hover:border-primary/20 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-primary/10 text-primary text-[9px] font-bold px-2.5 py-0.5 rounded-full">{t.id}</span>
                    <h4 className="font-bold text-xs text-foreground mt-1.5">{t.subject}</h4>
                  </div>
                  <div>
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      t.status === 'open' ? 'text-blue-600 bg-blue-500/10' : 'text-slate-500 bg-slate-500/10'
                    }`}>
                      {t.status === 'open' ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                      {t.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                <div className="text-[9px] text-muted-foreground pt-1.5 border-t border-border/30 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Created on: {t.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
