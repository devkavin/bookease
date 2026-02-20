import { Navbar } from '@/components/app/Navbar';
import { PricingCards } from '@/components/app/PricingCards';
import { FadeIn } from '@/components/app/FadeIn';

export default function PricingPage() {
  return (
    <main>
      <Navbar />
      <FadeIn className="mx-auto max-w-5xl px-4 py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-amber-100/80">Pricing</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight md:text-6xl">Plans for modern booking brands</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Start free and scale into a full guest experience platform with premium automation, branding, and team controls.
        </p>
        <div className="mt-10">
          <PricingCards />
        </div>
      </FadeIn>
    </main>
  );
}
