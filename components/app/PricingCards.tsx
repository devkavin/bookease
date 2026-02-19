import { GlassCard } from './GlassCard';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    subtitle: '/ month',
    description: 'For boutique teams launching their first direct booking experience.',
    cta: 'Start with Starter',
    variant: 'outline' as const,
    highlights: ['Public booking page', '1 property or service line', 'Automated confirmation emails'],
  },
  {
    name: 'Pro',
    price: '$19',
    subtitle: '/ month',
    description: 'For growing hospitality brands that want premium guest journeys at scale.',
    cta: 'Start 14-day trial',
    variant: 'default' as const,
    featured: true,
    highlights: ['Unlimited rooms/services', 'Custom brand domain', 'Reminders, upsells, and calendar sync'],
  },
];

export function PricingCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <GlassCard
          key={plan.name}
          className={
            plan.featured
              ? 'rounded-3xl border-amber-200/40 bg-gradient-to-b from-amber-300/10 to-fuchsia-300/5 p-6'
              : 'rounded-3xl border-white/15 p-6'
          }
        >
          <h3 className="text-2xl font-semibold tracking-tight">{plan.name}</h3>
          <p className="mt-3 flex items-end gap-1">
            <span className="text-4xl font-semibold leading-none">{plan.price}</span>
            <span className="text-sm text-white/60">{plan.subtitle}</span>
          </p>
          <p className="mt-3 text-sm text-white/70">{plan.description}</p>

          <ul className="mt-5 space-y-2 text-sm text-white/75">
            {plan.highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className={`h-4 w-4 ${plan.featured ? 'text-amber-200' : 'text-violet-200'}`} />
                {item}
              </li>
            ))}
          </ul>

          <Button
            variant={plan.variant}
            className={`mt-6 w-full ${plan.featured ? 'shadow-[0_10px_28px_rgba(217,119,6,0.3)]' : 'border-white/25 bg-white/5 hover:bg-white/10'}`}
          >
            {plan.cta}
          </Button>
        </GlassCard>
      ))}
    </div>
  );
}
