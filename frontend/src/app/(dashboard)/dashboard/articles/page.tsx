'use client';

import React from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, User } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  readTime: string;
  date: string;
  summary: string;
}

export default function ArticlesPage() {
  const articles: Article[] = [
    {
      id: '1',
      title: 'Understanding High Blood Pressure: Symptoms & Control',
      category: 'Cardiology',
      author: 'Dr. Sarah Connor',
      readTime: '5 min read',
      date: '2026-07-12',
      summary: 'Hypertension is often called a silent killer. Learn about the early signs, dietary guidelines, and active lifestyle habits to keep your blood pressure in check.',
    },
    {
      id: '2',
      title: 'Top 10 Self-Care Guidelines for Seasonal Cold & Cough',
      category: 'General Medicine',
      author: 'Dr. Alex Mercer',
      readTime: '3 min read',
      date: '2026-07-08',
      summary: 'With seasonal shifts, viral cold is extremely common. Discover natural home remedies, hydration protocols, and indicator symptoms that signal it is time to consult a doctor.',
    },
    {
      id: '3',
      title: 'Nutrition 101: Balancing Macros & Stay Energized',
      category: 'Nutrition & Diet',
      author: 'Dr. Emily Vance',
      readTime: '6 min read',
      date: '2026-07-01',
      summary: 'Understanding proteins, fats, and carbs can revolutionize your fitness goals. Get structured meal outlines and simple ways to incorporate greens in daily food charts.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Health Articles & Tips
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore health guidelines, medical suggestions, and wellness tips written by verified professionals.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div key={art.id} className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 shadow-sm group">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{art.category}</span>
                <span>{art.readTime}</span>
              </div>
              <h3 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{art.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{art.summary}</p>
            </div>

            <div className="border-t border-border/40 pt-4 mt-6 flex justify-between items-center text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-primary" /> {art.author}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {art.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
