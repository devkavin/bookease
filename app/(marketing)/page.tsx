import { Navbar } from '@/components/app/Navbar';
import { Section } from '@/components/app/Section';
import { PricingCards } from '@/components/app/PricingCards';
import { GlassCard } from '@/components/app/GlassCard';
import { FadeIn } from '@/components/app/FadeIn';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MarketingPage() {
  return (
    <main>
      <Navbar />
      <FadeIn className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-sky-300">Appointment booking for modern operators</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight">BookEase helps you turn visitors into confirmed appointments.</h1>
        <p className="mt-4 max-w-2xl text-white/70">Elegant booking pages, conflict-free scheduling, and instant confirmations in one polished workflow.</p>
        <div className="mt-8 flex gap-3"><Link href="/auth/sign-up"><Button>Start free</Button></Link><Link href="/pricing"><Button variant="outline">See pricing</Button></Link></div>
      </FadeIn>
      <Section title="Features"><div className="grid gap-4 md:grid-cols-3">{['Public booking links','Availability rules + exceptions','ICS and email confirmations'].map((x)=><GlassCard key={x}>{x}</GlassCard>)}</div></Section>
      <Section title="Pricing"><PricingCards /></Section>
      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-white/50">© {new Date().getFullYear()} BookEase</footer>
    </main>
  );
}
