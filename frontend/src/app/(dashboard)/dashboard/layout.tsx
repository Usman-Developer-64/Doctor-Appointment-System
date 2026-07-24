'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  Settings,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  UserCheck,
  LogOut,
  Menu,
  X,
  Video,
  Bot,
  Info,
  FileText,
  CreditCard,
  Star,
  Activity,
  BookOpen,
  Microscope,
  Pill,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    href: '/dashboard/appointments',
    label: 'Appointments',
    icon: Calendar,
    roles: ['doctor', 'patient'],
  },
  {
    href: '/dashboard/consultations',
    label: 'Telemedicine',
    icon: Video,
    roles: ['doctor', 'patient'],
  },
  {
    href: '/dashboard/chatbot',
    label: 'AI Assistant',
    icon: Bot,
    roles: ['patient'],
  },
  {
    href: '/dashboard/schedule',
    label: 'My Schedule',
    icon: Clock,
    roles: ['doctor'],
  },
  {
    href: '/dashboard/patients',
    label: 'My Patients',
    icon: Users,
    roles: ['doctor'],
  },
  {
    href: '/dashboard/users',
    label: 'Manage Users',
    icon: Users,
    roles: ['admin'],
  },
  {
    href: '/dashboard/verification',
    label: 'Verification',
    icon: UserCheck,
    roles: ['admin'],
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: User,
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['admin', 'doctor', 'patient'],
  },
  {
    href: '/dashboard/about',
    label: 'About Suite',
    icon: Info,
    roles: ['doctor', 'patient'],
  },
  {
    href: '/dashboard/prescriptions',
    label: 'Prescriptions',
    icon: FileText,
    roles: ['doctor', 'patient'],
  },
  {
    href: '/dashboard/medical-records',
    label: 'Medical Records',
    icon: FileText,
    roles: ['doctor', 'patient'],
  },
  {
    href: '/dashboard/billing',
    label: 'Invoices & Billing',
    icon: CreditCard,
    roles: ['patient'],
  },
  {
    href: '/dashboard/reviews',
    label: 'Reviews & Ratings',
    icon: Star,
    roles: ['doctor', 'patient'],
  },
  {
    href: '/dashboard/health-tracker',
    label: 'Health Tracker',
    icon: Activity,
    roles: ['patient'],
  },
  {
    href: '/dashboard/articles',
    label: 'Articles & Blogs',
    icon: BookOpen,
    roles: ['doctor', 'patient'],
  },
  {
    href: '/dashboard/lab-tests',
    label: 'Diagnostic Labs',
    icon: Microscope,
    roles: ['patient'],
  },
  {
    href: '/dashboard/medicine-reminders',
    label: 'Pill Tracker',
    icon: Pill,
    roles: ['patient'],
  },
  {
    href: '/dashboard/emergency',
    label: 'Emergency SOS',
    icon: AlertTriangle,
    roles: ['doctor', 'patient'],
  },
  {
    href: '/dashboard/vaccinations',
    label: 'Vaccinations',
    icon: ShieldCheck,
    roles: ['patient'],
  },
  {
    href: '/dashboard/insurance',
    label: 'Insurance Claims',
    icon: Shield,
    roles: ['patient'],
  },
  {
    href: '/dashboard/support',
    label: 'Support & FAQs',
    icon: HelpCircle,
    roles: ['doctor', 'patient'],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Middleware will redirect
  }

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role),
  );

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'doctor':
        return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const SidebarContent = () => (
    <>
      {/* User info */}
      <div className={`p-4 border-b border-border ${isCollapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar className="h-10 w-10 shrink-0">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.firstName} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {user.firstName} {user.lastName}
              </p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getRoleBadgeStyle(user.role)}`}
              >
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Log out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen pt-16">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-16 bottom-0 left-0 z-40 border-r border-border bg-card transition-all duration-300 ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-16 bottom-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-card transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold">Dashboard</h2>
        </div>

        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
