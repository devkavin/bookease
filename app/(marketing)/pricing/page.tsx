import { Navbar } from '@/components/app/Navbar';
import { PricingCards } from '@/components/app/PricingCards';

export default function PricingPage() {
  return <main><Navbar /><section className="mx-auto max-w-4xl px-4 py-20"><h1 className="mb-8 text-4xl font-semibold">Simple pricing</h1><PricingCards /></section></main>;
}
