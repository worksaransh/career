"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, Building2, Send, Loader2, CheckCircle } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedContainer } from "@/components/ui/animated-container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactContent() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${firstName} ${lastName}`.trim(), email, subject, message }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data?.error?.message ?? "Submission failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Message Sent!</h1>
          <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AnimatedContainer animation="fadeUp">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions? We&apos;d love to hear from you. Send us a message
            and we&apos;ll respond as soon as possible.
          </p>
        </AnimatedContainer>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <GlassCard>
              {error && (
                <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Input label="First Name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  <Input label="Last Name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <Input label="Email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input label="Subject" placeholder="How can we help?" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[150px]"
                    placeholder="Tell us more about your inquiry..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button variant="gradient" size="lg" type="submit" loading={loading} rightIcon={<Send className="h-4 w-4" />}>
                  Send Message
                </Button>
              </form>
            </GlassCard>
          </div>

          <div className="space-y-4">
            {[
              { icon: Mail, title: "Email", text: "hello@careeros.ai" },
              { icon: MessageSquare, title: "Support", text: "support@careeros.ai" },
              { icon: Building2, title: "Partnerships", text: "partners@careeros.ai" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <GlassCard key={item.title} variant="light">
                  <Icon className="mb-2 h-6 w-6 text-primary" />
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
