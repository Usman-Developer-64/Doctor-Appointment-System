"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  User as UserIcon,
  Phone,
  Heart,
  FileText,
  Check,
  X,
  ClipboardCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Appointment } from "@/types/appointment";

type TabType = "pending" | "upcoming" | "past";

export default function AppointmentsDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Tabs state
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notesModalId, setNotesModalId] = useState<string | null>(null);
  const [treatmentNotes, setTreatmentNotes] = useState("");

  // Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAppointmentId, setReviewAppointmentId] = useState<string | null>(
    null,
  );
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/appointments/my");
      setAppointments(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to load appointments. Please refresh.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (!user) return null;

  const handleStatusUpdate = async (
    id: string,
    status: "confirmed" | "cancelled" | "completed",
    notes?: string,
  ) => {
    setActionLoadingId(id);
    try {
      const response = await api.patch(`/appointments/${id}/status`, {
        status,
        notes: notes || undefined,
      });

      // Update state locally
      setAppointments((prev) =>
        prev.map((app) => (app._id === id ? response.data.data : app)),
      );
      setNotesModalId(null);
      setTreatmentNotes("");
    } catch (err: any) {
      alert(
        err.response?.data?.message || "Failed to update appointment status.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAppointmentId) return;
    setIsReviewLoading(true);
    try {
      await api.post("/reviews", {
        appointmentId: reviewAppointmentId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewModalOpen(false);
      setReviewAppointmentId(null);
      setReviewComment("");
      setReviewRating(5);
      alert("Thank you for your feedback! Review submitted successfully.");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsReviewLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200/50";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200/50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const formatTime = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes} ${ampm}`;
  };

  // Grouping appointments
  const pendingAppointments = appointments.filter(
    (app) => app.status === "pending",
  );
  const upcomingAppointments = appointments.filter(
    (app) => app.status === "confirmed",
  );
  const pastAppointments = appointments.filter(
    (app) => app.status === "completed" || app.status === "cancelled",
  );

  const getActiveList = () => {
    switch (activeTab) {
      case "pending":
        return pendingAppointments;
      case "upcoming":
        return upcomingAppointments;
      case "past":
        return pastAppointments;
    }
  };

  const activeList = getActiveList();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            {user.role === "doctor"
              ? "Review patient booking requests and manage daily appointments."
              : "Track your consultation visits and upcoming doctor schedules."}
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border">
        {user.role === "doctor" && (
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            } flex items-center gap-2`}
          >
            Requests
            {pendingAppointments.length > 0 && (
              <span className="bg-amber-500 text-white rounded-full text-xs h-5 px-1.5 flex items-center justify-center font-bold">
                {pendingAppointments.length}
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "upcoming"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          } flex items-center gap-2`}
        >
          Upcoming
          {user.role === "patient" && pendingAppointments.length > 0 && (
            <span
              className="bg-amber-500 text-white rounded-full text-xs h-5 px-1.5 flex items-center justify-center font-bold"
              title="Pending approval"
            >
              {pendingAppointments.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "past"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          History
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center justify-center gap-3">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : activeList.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-lg">No Appointments Found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto text-sm">
            {activeTab === "pending"
              ? "There are no pending requests requiring your review."
              : activeTab === "upcoming"
                ? "You do not have any confirmed upcoming appointments scheduled."
                : "Your consultation history is currently empty."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Patients Listing Profile UI */}
          {activeList.map((app) => {
            const oppositeUser =
              user.role === "doctor"
                ? (app.patient as any)
                : (app.doctor as any);
            const initials =
              `${oppositeUser?.firstName?.charAt(0) || ""}${oppositeUser?.lastName?.charAt(0) || ""}`.toUpperCase();

            // Include pending appointments in the patient's upcoming tab
            const displayStatus =
              user.role === "patient" && activeTab === "upcoming"
                ? app.status
                : null;

            return (
              <div
                key={app._id}
                className="rounded-2xl bg-card border border-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
              >
                {/* Left Info Column */}
                <div className="flex gap-4 items-start flex-1 min-w-0">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {initials}
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h3 className="font-bold text-base text-foreground truncate">
                      {user.role === "doctor" ? "Patient:" : "Doctor:"}{" "}
                      {oppositeUser?.firstName} {oppositeUser?.lastName}
                    </h3>

                    {user.role === "patient" && (
                      <p className="text-xs text-primary font-medium">
                        {oppositeUser?.specialization} • Rs.{" "}
                        {oppositeUser?.consultationFee}
                      </p>
                    )}

                    {/* Date/Time rows */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {formatDate(app.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {formatTime(app.slot)}
                      </span>
                    </div>

                    {/* Symptoms/Reason */}
                    {app.symptoms && (
                      <div className="text-xs bg-muted/60 p-2.5 rounded-lg text-muted-foreground mt-2 border border-border max-w-xl">
                        <span className="font-semibold text-foreground block mb-0.5">
                          Symptoms:
                        </span>
                        {app.symptoms}
                      </div>
                    )}

                    {/* Doctor's Treatment Notes */}
                    {app.notes && (
                      <div className="text-xs bg-green-500/5 p-2.5 rounded-lg text-green-800 dark:text-green-400 mt-2 border border-green-500/10 max-w-xl">
                        <span className="font-semibold text-foreground block mb-0.5 flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-green-600" />
                          Doctor&apos;s Feedback & Notes:
                        </span>
                        {app.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions Column */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {/* Status indicator on Patient Upcoming list */}
                  {displayStatus && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${getStatusBadge(displayStatus)}`}
                    >
                      {displayStatus}
                    </span>
                  )}

                  {/* Pending/Request Actions for Doctor */}
                  {user.role === "doctor" && activeTab === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(app._id, "cancelled")}
                        disabled={actionLoadingId === app._id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => handleStatusUpdate(app._id, "confirmed")}
                        disabled={actionLoadingId === app._id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  )}

                  {/* Confirmed / Upcoming Actions for Doctor */}
                  {user.role === "doctor" && activeTab === "upcoming" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(app._id, "cancelled")}
                        disabled={actionLoadingId === app._id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => setNotesModalId(app._id)}
                        disabled={actionLoadingId === app._id}
                      >
                        <ClipboardCheck className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
                    </div>
                  )}

                  {/* Patient Action: Cancel Request/Booking */}
                  {user.role === "patient" &&
                    activeTab === "upcoming" &&
                    app.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(app._id, "cancelled")}
                        disabled={actionLoadingId === app._id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 rounded-lg"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel Visit
                      </Button>
                    )}

                  {/* History Status badges */}
                  {activeTab === "past" && (
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${getStatusBadge(app.status)}`}
                      >
                        {app.status}
                      </span>
                      {user.role === "patient" &&
                        app.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReviewAppointmentId(app._id);
                              setReviewModalOpen(true);
                            }}
                            className="text-primary hover:bg-primary/5 rounded-lg border-primary/20 text-[11px] h-7"
                          >
                            Leave Review
                          </Button>
                        )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Treatment Notes Modal Popup */}
      {notesModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setNotesModalId(null)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl z-10 animate-fade-in">
            <h3 className="text-lg font-bold border-b border-border pb-3 mb-4">
              Complete Appointment
            </h3>
            <p className="text-muted-foreground text-xs mb-4">
              Add any prescription, instructions, or notes for the patient
              below. This feedback will show on their profile history.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="treatment-notes">
                  Treatment/Prescription Notes
                </Label>
                <textarea
                  id="treatment-notes"
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  placeholder="Take 1 tablet daily after meals, avoid heavy exercise..."
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex gap-4 border-t border-border pt-4 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setNotesModalId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={() =>
                    handleStatusUpdate(
                      notesModalId,
                      "completed",
                      treatmentNotes,
                    )
                  }
                  disabled={actionLoadingId === notesModalId}
                >
                  Confirm Completed
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Review Modal Popup */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setReviewModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl z-10 animate-fade-in">
            <h3 className="text-lg font-bold border-b border-border pb-3 mb-4">
              Leave a Review
            </h3>
            <p className="text-muted-foreground text-xs mb-4">
              Please share your experience with the doctor to help other
              patients find the best care.
            </p>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="review-rating">Rating (1 to 5 Stars)</Label>
                <select
                  id="review-rating"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {[5, 4, 3, 2, 1].map((star) => (
                    <option key={star} value={star}>
                      {star} {"★".repeat(star)}
                      {"☆".repeat(5 - star)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-comment">Your Comment</Label>
                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="The doctor was very professional and explained the treatment clearly..."
                  required
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex gap-4 border-t border-border pt-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setReviewModalOpen(false)}
                  disabled={isReviewLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="flex-1"
                  disabled={isReviewLoading}
                >
                  {isReviewLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
