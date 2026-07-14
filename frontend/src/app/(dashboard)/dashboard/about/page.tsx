'use client';

import React from 'react';
import { Shield, Sparkles, Video, Bot, Users, Heart, Award } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Verified Specialist Doctors', value: '150+' },
    { label: 'Happy Patients Consulted', value: '10,000+' },
    { label: 'Consultations Done', value: '25,000+' },
    { label: 'Response Time', value: '< 2 Mins' },
  ];

  const features = [
    {
      icon: Video,
      title: 'WhatsApp-Style Telemedicine',
      description: 'Exchange direct messages, share images/files, record voice notes, and trigger instant end-to-end peer video calls.',
    },
    {
      icon: Bot,
      title: 'AI Health Assistant',
      description: 'Get immediate self-care tips, disease diagnostic guides, and correct doctor recommendations from our Gemini AI Bot.',
    },
    {
      icon: Shield,
      title: 'Secure & Encrypted',
      description: 'Your health records and consultations are strictly encrypted using JWT keys and local browser-based WebRTC protocols.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-10">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          DocAppoint Health Suite v2.0
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Next-Gen Patient Care & <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-teal-400">Telemedicine</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
          DocAppoint bridges the gap between remote patients and medical experts. Book physical appointments or consult via high-definition WebRTC video feeds instantly.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-3xl border border-border bg-card p-6 text-center space-y-1 hover:border-primary/30 transition-colors">
            <h3 className="text-3xl font-extrabold text-primary">{stat.value}</h3>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Core values */}
      <div className="grid md:grid-cols-3 gap-6 pt-4">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div key={i} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm hover:-translate-y-1 transition-all duration-300">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-sm">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Mission Statement */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="space-y-4 flex-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500/20" />
            Our Visionary Healthcare Goal
          </h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            DocAppoint was built to resolve critical accessibility challenges in healthcare. By digitizing doctors schedules, booking gates, and integrating premium real-time communications directly in modern browsers, we empower patients with instant access to qualified specialists regardless of location.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Award className="h-4.5 w-4.5 text-primary" />
              <span>WHO Standards Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-4.5 w-4.5 text-primary" />
              <span>100% Verified Practitioners</span>
            </div>
          </div>
        </div>
        <div className="h-40 w-40 rounded-full border-4 border-dashed border-primary/20 flex items-center justify-center animate-spin-slow shrink-0">
          <div className="h-28 w-28 rounded-full bg-primary/10 text-primary flex flex-col items-center justify-center text-center p-4">
            <Shield className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Secure Health</span>
          </div>
        </div>
      </div>
    </div>
  );
}
