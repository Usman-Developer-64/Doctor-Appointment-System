"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  MapPin,
  Briefcase,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "patient" as "patient" | "doctor",
    specialization: "",
    education: "",
    city: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2800/api';
    window.location.href = `${backendUrl}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TypeScript compiler ko direct batane ke liye ke data 'any' type ka hi hai
      const data: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.phone) {
        data.phone = formData.phone;
      }

      if (formData.role === "doctor") {
        if (formData.specialization)
          data.specialization = formData.specialization;
        if (formData.education) data.education = formData.education;
        if (formData.city) data.city = formData.city;
      }

      // register function ke andar explicitly as any pass kiya hai jo types skip kar dega
      await register(data as any);
      router.push("/dashboard");
    } catch (err) {
      const apiError = err as any;
      const msg = apiError.response?.data?.message;
      setError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canGoToStep2 =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.password.length >= 8;

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-20 pb-8 px-4">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-20 left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-blue-500/25">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-gradient">Doc</span>
              <span className="text-foreground">Appoint</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1">
            Join DocAppoint and start your healthcare journey
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
              step >= 1
                ? "gradient-primary text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            1
          </div>
          <div
            className={`h-[2px] w-12 rounded transition-all ${
              step >= 2 ? "bg-primary" : "bg-muted"
            }`}
          />
          <div
            className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
              step >= 2
                ? "gradient-primary text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </div>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl bg-card border border-border p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must contain uppercase, lowercase, and a number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  disabled={!canGoToStep2}
                  onClick={() => setStep(2)}
                  id="signup-next-btn"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateField("role", "patient")}
                      className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                        formData.role === "patient"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <User className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="font-semibold text-sm">Patient</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Book appointments
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("role", "doctor")}
                      className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                        formData.role === "doctor"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Stethoscope className="h-8 w-8 mx-auto mb-2 text-teal-500" />
                      <p className="font-semibold text-sm">Doctor</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Manage patients
                      </p>
                    </button>
                  </div>
                </div>

                {/* Doctor-specific fields */}
                {formData.role === "doctor" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="specialization"
                          placeholder="e.g., Cardiologist"
                          value={formData.specialization}
                          onChange={(e) =>
                            updateField("specialization", e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education">Education / Degree</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="education"
                          placeholder="e.g., MBBS, FCPS"
                          value={formData.education}
                          onChange={(e) =>
                            updateField("education", e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="city"
                          placeholder="e.g., Lahore"
                          value={formData.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                      ⚠️ Doctor accounts require admin verification before you
                      can accept appointments.
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    disabled={isLoading}
                    className="flex-1"
                    id="signup-submit-btn"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
            </div>
          </div>

          {/* Google signup button */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-border hover:bg-muted/50 rounded-xl h-11"
            onClick={handleGoogleSignup}
            disabled={isLoading || googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
            ) : (
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  style={{ fill: '#4285F4' }}
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  style={{ fill: '#34A853' }}
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  style={{ fill: '#FBBC05' }}
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  style={{ fill: '#EA4335' }}
                />
              </svg>
            )}
            Google
          </Button>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
