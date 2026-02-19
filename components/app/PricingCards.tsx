import { GlassCard } from './GlassCard';
import { Button } from '@/components/ui/button';

export function PricingCards() {
  return <div className="grid gap-4 md:grid-cols-2"><GlassCard><h3 className="text-xl">Starter</h3><p className="text-white/70">$0/mo</p><p className="my-3 text-sm text-white/70">Single calendar and core booking.</p><Button variant="outline">Choose starter</Button></GlassCard><GlassCard className="border-sky-300/40"><h3 className="text-xl">Pro</h3><p className="text-white/70">$19/mo</p><p className="my-3 text-sm text-white/70">Everything in Starter + reminders and custom domains.</p><Button>Start 14-day trial</Button></GlassCard></div>;
}
