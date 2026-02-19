import { Navbar } from '@/components/app/Navbar';
import { Section } from '@/components/app/Section';
import { PricingCards } from '@/components/app/PricingCards';
import { GlassCard } from '@/components/app/GlassCard';
import { FadeIn } from '@/components/app/FadeIn';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarCheck2, Crown, Hotel, Sparkles, Users } from 'lucide-react';

const featureCards = [
  {
    title: 'Branded booking journeys',
    body: 'Turn first impressions into confirmed reservations with pages that match your hospitality brand.',
    icon: Sparkles,
  },
  {
    title: 'Smart room & service availability',
    body: 'Manage time slots, seasonal rules, and blackout dates without manual calendar cleanup.',
    icon: CalendarCheck2,
  },
  {
    title: 'VIP guest experience automation',
    body: 'Send confirmations, reminders, and upsell moments that feel concierge-level every time.',
    icon: Crown,
  },
  {
    title: 'Team-ready booking operations',
    body: 'Coordinate front desk, spa, and activity schedules from one elegant booking command center.',
    icon: Users,
  },
];

const trustWords = ['Aurora Suites', 'Citrine Spa', 'Grand Coast Villas', 'Velvet Stay', 'Élan Retreat', 'North Pier Hotel'];

export default function MarketingPage() {
  return (
    <main>
      <Navbar />

      <FadeIn className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 md:pt-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
          <Hotel className="h-3.5 w-3.5" />
          Trusted by premium hospitality and service brands
        </div>

        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
          Make every booking feel like a five-star arrival.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-white/75">
          BookEase helps hotels, spas, and experience-led businesses deliver seamless reservations with premium design,
          real-time availability, and guest-first automation.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/auth/sign-up">
            <Button className="group h-11 px-6 text-sm shadow-[0_10px_32px_rgba(217,119,6,0.35)]">
              Launch your booking flow
              <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="h-11 px-6 text-sm border-white/25 bg-white/5 hover:bg-white/10">
              View plans
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            ['+41%', 'More direct bookings'],
            ['52 sec', 'Average reservation time'],
            ['24/7', 'Always-on guest confirmations'],
          ].map(([value, label]) => (
            <GlassCard key={label} className="rounded-3xl border-white/15 bg-white/[0.03] p-6">
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-sm text-white/65">{label}</p>
            </GlassCard>
          ))}
        </div>
      </FadeIn>

      <section className="trust-marquee mt-2 border-y border-white/10 py-4">
        <div className="trust-marquee__track">
          {[...trustWords, ...trustWords].map((item, i) => (
            <span key={`${item}-${i}`} className="trust-marquee__item">
              {item}
            </span>
          ))}
        </div>
      </section>

      <Section title="Everything your booking journey needs">
        <div className="grid gap-4 md:grid-cols-2">
          {featureCards.map(({ title, body, icon: Icon }) => (
            <GlassCard key={title} className="rounded-3xl border-white/15 p-6">
              <div className="mb-4 inline-flex rounded-2xl border border-amber-200/25 bg-amber-300/10 p-2.5 text-amber-100">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-medium tracking-tight">{title}</h3>
              <p className="mt-2 text-white/70">{body}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section title="Pricing">
        <PricingCards />
      </Section>

      <footer className="mx-auto max-w-6xl px-4 py-12 text-sm text-white/50">© {new Date().getFullYear()} BookEase</footer>
    </main>
  );
}
