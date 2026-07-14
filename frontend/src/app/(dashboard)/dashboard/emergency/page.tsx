'use client';

import React from 'react';
import { AlertTriangle, Phone, ShieldAlert, Heart, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmergencyPage() {
  const contacts = [
    { title: 'DocAppoint SOS Helpline', number: '+1 (800) 999-5555', desc: 'Direct medical advisory and critical guidance helpline' },
    { title: 'National Emergency Line', number: '911 / 112', desc: 'Direct access to national ambulance and medical emergency dispatch' },
    { title: 'Cardiac Emergency Helpline', number: '+1 (800) 222-3333', desc: 'Direct ambulance dispatch for cardiovascular incidents' },
  ];

  const hospitals = [
    { name: 'City Central General Hospital', distance: '1.2 Miles', address: '404 Health Ave, Downtown', phone: '+1 (234) 555-0199' },
    { name: 'St. Jude Cardiac Care Center', distance: '2.5 Miles', address: '789 Cardiology Circle', phone: '+1 (234) 555-0188' },
  ];

  const triggerMockSos = () => {
    alert('🚨 Emergency Alert Sent! Your location coordinates and patient emergency contact profile have been sent to local hospital dispatch units.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-8 w-8 animate-bounce" />
          Emergency Support & SOS
        </h1>
        <p className="text-muted-foreground mt-1">
          Instant emergency dispatcher lines, hospital locators, and automated SOS triggers.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: SOS Trigger box */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 space-y-4 text-center shadow-sm">
            <ShieldAlert className="h-10 w-10 text-destructive mx-auto animate-pulse" />
            <h2 className="text-lg font-bold text-destructive">Send Location SOS Alert</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tapping the button below broadcasts your exact GPS coordinates and medical history overview to emergency hospital units in your city.
            </p>
            <Button variant="default" onClick={triggerMockSos} className="bg-destructive hover:bg-destructive/80 text-white w-full h-12 font-extrabold rounded-xl shadow-lg hover:shadow-destructive/20 transition-all">
              🚨 Trigger Medical SOS
            </Button>
          </div>
        </div>

        {/* Right Column: Dispatch Contacts list */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <Phone className="h-4.5 w-4.5" />
            Emergency Contacts Log
          </h3>

          <div className="space-y-3">
            {contacts.map((c, idx) => (
              <div key={idx} className="rounded-3xl border border-border bg-card p-5 flex justify-between items-center hover:border-destructive/20 transition-all shadow-sm">
                <div>
                  <h4 className="font-bold text-xs text-foreground">{c.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.desc}</p>
                </div>
                <a href={`tel:${c.number}`} className="h-10 px-4 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                  {c.number}
                </a>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 pt-2">
            <MapPin className="h-4.5 w-4.5" />
            Nearest Emergency Hospital Locate
          </h3>

          <div className="space-y-3">
            {hospitals.map((h, idx) => (
              <div key={idx} className="rounded-3xl border border-border bg-card p-5 space-y-3 hover:border-primary/20 transition-all shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-foreground">{h.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{h.address}</p>
                  </div>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {h.distance}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${h.phone}`} className="h-9 px-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-[10px] font-bold rounded-xl flex items-center gap-1.5 transition-colors">
                    <Phone className="h-3.5 w-3.5" /> Call Hospital
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
