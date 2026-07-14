'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Plus, StarHalf, Calendar, Sparkles } from 'lucide-react';

interface Review {
  id: string;
  doctorName: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [doctorName, setDoctorName] = useState('');

  if (!user) return null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !comment) return;

    const newRev: Review = {
      id: String(reviews.length + 1),
      doctorName,
      patientName: `${user.firstName} ${user.lastName}`,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };
    setReviews([newRev, ...reviews]);
    setDoctorName('');
    setComment('');
    setRating(5);
    alert('Review submitted successfully! Thank you for your feedback.');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Star className="h-8 w-8 text-primary fill-primary/10" />
          Reviews & Feedback
        </h1>
        <p className="text-muted-foreground mt-1">
          {user.role === 'patient'
            ? 'Rate your consulting doctors and share your post-appointment experience.'
            : 'View patient feedback and aggregate consultation reviews.'}
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Column: Create Form (Patient Only) & Feedback Feed */}
        <div className="md:col-span-8 space-y-6">
          {user.role === 'patient' && (
            <form onSubmit={handleSubmitReview} className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
                <Plus className="h-5 w-5 text-primary" />
                Submit Post-Consultation Review
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Doctor Name</label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                >
                  <option value="">Select Doctor</option>
                  <option value="Dr. Sarah Connor">Dr. Sarah Connor</option>
                  <option value="Dr. Alex Mercer">Dr. Alex Mercer</option>
                </select>
              </div>

              {/* Star Rating select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">Rating Score</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`h-7 w-7 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Your Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your appointment, treatment, behavior, and environment..."
                  rows={4}
                  className="w-full rounded-xl border border-input bg-card p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  required
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full h-10 font-bold">
                Publish Review
              </Button>
            </form>
          )}

          {/* List of reviews */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5" />
              Patient Experience Feed
            </h3>
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="rounded-3xl border border-border bg-card p-5 space-y-3 hover:border-primary/20 transition-all shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{rev.doctorName}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Reviewed by: {rev.patientName}</p>
                    </div>
                    {/* Star score display */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`h-4 w-4 ${idx < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rev.comment}
                  </p>

                  <div className="flex items-center gap-4 text-[9px] text-muted-foreground pt-1.5 border-t border-border/30">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Review date: {rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Statistics */}
        <div className="md:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-card p-6 space-y-4 shadow-sm text-center">
            <Sparkles className="h-7 w-7 text-primary mx-auto" />
            <h3 className="font-bold text-sm text-primary">Aggregate Rating</h3>
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-foreground">4.8 / 5.0</div>
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3, 4].map((star) => <Star key={star} className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />)}
                <StarHalf className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              DocAppoint doctors maintain an average score of 4.8 based on over 10,000 Patient consultation feedback checks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
