'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Heart, 
  Award, 
  Sparkles, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Verified Specialists', value: '500+', icon: ShieldCheck, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Happy Patients', value: '10,000+', icon: Users, color: 'text-teal-500 bg-teal-500/10' },
    { label: 'Appointments Booked', value: '50,000+', icon: Calendar, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Success Consultations', value: '99.8%', icon: Award, color: 'text-amber-500 bg-amber-500/10' },
  ];

  const values = [
    {
      title: 'Patient-First Care',
      description: 'We prioritize our patients health and comfort above all else, ensuring a reliable and stress-free booking experience.',
      icon: Heart,
    },
    {
      title: 'Verified Medical Specialists',
      description: 'Every doctor on our platform goes through a strict verification process, validating credentials and experience.',
      icon: ShieldCheck,
    },
    {
      title: 'Digital Innovation',
      description: 'We use modern telemedicine, AI-driven assistants, and smart scheduling to bring the future of healthcare to your screen.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background space-y-20">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          About DocAppoint
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          Your trusted companion for <span className="text-gradient">smarter, faster</span> healthcare
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We bridge the gap between patients and premium medical specialists. No long queues, no endless phone calls — just quick and secure appointments at your convenience.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild size="lg" variant="gradient" className="rounded-xl">
            <Link href="/signup">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl border-border">
            <Link href="/doctors">Find Doctors</Link>
          </Button>
        </div>
      </section>

      {/* Grid Stats */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div 
              key={stat.label} 
              className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center card-hover flex flex-col items-center space-y-3"
            >
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-extrabold text-foreground">{stat.value}</h3>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission mesh */}
      <section className="bg-muted/50 py-16 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Our Dedicated Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              At DocAppoint, we believe quality healthcare should be just a click away. Our mission is to empower patients with seamless digital booking, instant doctor verifications, and integrated telemedicine features.
            </p>
            <div className="space-y-3">
              {[
                'Instant appointment scheduling without calls',
                '24/7 AI-powered health assessment assistant',
                'Secure telemedicine online consultations',
                'Easy prescription download & medical history logs',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-border bg-card p-8 shadow-xl space-y-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
            <h3 className="text-2xl font-bold">The Core Story</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              DocAppoint was founded in 2026 by a passionate team of doctors and developers. Recognizing the frustration patients face when seeking consultations, we set out to build a clean, modern, and reliable healthcare platform.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Today, DocAppoint helps thousands of patients connect with medical professionals daily. We continue to innovate with smart tools that put patient safety, schedule transparency, and digital access at the center of the experience.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Values That Guide Us</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            We are driven by a commitment to build trust, make access effortless, and deliver care when it matters most.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v) => (
            <div key={v.title} className="bg-card border border-border p-8 rounded-2xl shadow-sm space-y-4 card-hover">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-4 text-center py-12 bg-gradient-to-r from-blue-500/5 to-teal-500/5 border border-primary/10 rounded-3xl space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Ready to take control of your health?</h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          Join DocAppoint today. Book verified specialist doctors in your city and start consulting with ease.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" variant="gradient" className="rounded-xl">
            <Link href="/signup">Create Free Account</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl border-border">
            <Link href="/doctors">Browse Specialist Directory</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
