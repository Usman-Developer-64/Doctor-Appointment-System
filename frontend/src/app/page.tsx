import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Search,
  Calendar,
  Shield,
  Clock,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Brain,
  Bone,
  Eye,
  Baby,
  type LucideIcon,
} from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Find Top Doctors',
    description:
      'Search by specialization, city, and fee range to find the perfect doctor for your needs.',
  },
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description:
      'Book appointments with real-time slot availability. No more waiting in long queues.',
  },
  {
    icon: Shield,
    title: 'Verified Doctors',
    description:
      'All doctors are credential-verified by our admin team. Your health is in safe hands.',
  },
  {
    icon: Clock,
    title: 'Real-time Tracking',
    description:
      'Track your appointment status from pending to confirmed. Stay updated every step.',
  },
];

const specializations = [
  { icon: HeartPulse, name: 'Cardiologist', count: '120+ Doctors' },
  { icon: Brain, name: 'Neurologist', count: '85+ Doctors' },
  { icon: Bone, name: 'Orthopedic', count: '95+ Doctors' },
  { icon: Eye, name: 'Ophthalmologist', count: '70+ Doctors' },
  { icon: Stethoscope, name: 'General Physician', count: '200+ Doctors' },
  { icon: Baby, name: 'Pediatrician', count: '90+ Doctors' },
];

const steps = [
  {
    step: '01',
    title: 'Search for a Doctor',
    description: 'Browse our extensive database of verified doctors by specialization or location.',
  },
  {
    step: '02',
    title: 'Choose a Time Slot',
    description: 'Select a convenient time slot from the doctor\'s real-time availability.',
  },
  {
    step: '03',
    title: 'Book & Confirm',
    description: 'Confirm your appointment and receive instant confirmation with all the details.',
  },
];

const stats: { value: string; label: string; icon?: LucideIcon }[] = [
  { value: '500+', label: 'Verified Doctors' },
  { value: '50K+', label: 'Appointments Booked' },
  { value: '100+', label: 'Specializations' },
  { value: '4.9', label: 'User Rating', icon: Star },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-fade-in">
                <HeartPulse className="h-4 w-4" />
                Trusted Healthcare Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight animate-fade-in stagger-1 opacity-0">
                Your Health,{' '}
                <span className="text-gradient">Our Priority</span>
              </h1>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fade-in stagger-2 opacity-0">
                Find top-rated, verified doctors and book appointments in
                seconds. Experience healthcare the way it should be — simple,
                fast, and reliable.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in stagger-3 opacity-0">
                <Button size="xl" variant="gradient" asChild>
                  <Link href="/signup" id="hero-cta-signup">
                    Book an Appointment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link href="/doctors" id="hero-cta-doctors">
                    Find Doctors
                  </Link>
                </Button>
              </div>

              {/* Stats row */}
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-in stagger-4 opacity-0">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center lg:text-left">
                      <div className="text-2xl font-bold text-foreground flex items-center justify-center lg:justify-start gap-1">
                        {stat.value}
                        {Icon && (
                          <Icon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:flex justify-center relative animate-fade-in stagger-3 opacity-0">
              <div className="relative w-full max-w-md">
                {/* Decorative card stack */}
                <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 rotate-3" />
                <div className="absolute -top-2 -left-2 w-full h-full rounded-3xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 rotate-1" />
                <div className="relative rounded-3xl bg-card border border-border p-8 shadow-2xl shadow-blue-500/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center">
                      <Stethoscope className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Dr. Sarah Ahmed</h3>
                      <p className="text-sm text-muted-foreground">
                        Cardiologist • 10 yrs exp
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <span className="text-sm text-muted-foreground">
                        Available Slots
                      </span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        8 slots today
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['10:00 AM', '11:30 AM', '2:00 PM'].map((time) => (
                        <div
                          key={time}
                          className="text-center py-2 px-3 rounded-lg border border-border text-xs font-medium hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-foreground">
                        Rs. 2,000
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {' '}
                        / visit
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold">4.9</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4" variant="gradient">
                    Book Now
                  </Button>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-6 -right-6 glass rounded-2xl p-3 shadow-lg animate-float">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                </div>
                <div
                  className="absolute -bottom-4 -left-6 glass rounded-2xl p-3 shadow-lg animate-float"
                  style={{ animationDelay: '1s' }}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">2.5K+ Patients</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Specializations Section ─── */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Browse by <span className="text-gradient">Specialization</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Find the right specialist for your health needs from our wide range
              of medical specializations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specializations.map((spec) => {
              const Icon = spec.icon;
              return (
                <Link
                  key={spec.name}
                  href={`/doctors?specialization=${spec.name}`}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border card-hover"
                >
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">{spec.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {spec.count}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Why Choose <span className="text-gradient">DocAppoint</span>?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              We make healthcare accessible, reliable, and hassle-free for
              everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl bg-card border border-border card-hover"
                >
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Booking a doctor appointment has never been easier. Just follow
              three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-primary/10" />
                )}

                <div className="relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-white text-2xl font-bold mb-4 shadow-lg shadow-blue-500/25">
                  {step.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden gradient-primary p-12 lg:p-16 text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Ready to Take Care of Your Health?
              </h2>
              <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                Join thousands of patients who trust DocAppoint for their
                healthcare needs. Sign up today and book your first appointment.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="xl"
                  className="bg-white text-blue-600 hover:bg-white/90 shadow-xl"
                  asChild
                >
                  <Link href="/signup" id="cta-signup-btn">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/doctors">Browse Doctors</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
