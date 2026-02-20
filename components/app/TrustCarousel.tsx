'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Hotel, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BrandHighlight = {
  name: string;
  segment: string;
  stat: string;
  note: string;
};

const highlights: BrandHighlight[] = [
  {
    name: 'Aurora Suites',
    segment: 'Luxury hotel group',
    stat: '+38% direct bookings',
    note: 'Replaced fragmented OTAs with a premium first-party booking flow.',
  },
  {
    name: 'Citrine Spa',
    segment: 'Urban wellness chain',
    stat: '2.3x repeat guests',
    note: 'Automated post-treatment follow-ups and member rebooking prompts.',
  },
  {
    name: 'Grand Coast Villas',
    segment: 'Boutique resorts',
    stat: '52s avg checkout',
    note: 'Guest-friendly mobile experience that drives faster confirmations.',
  },
  {
    name: 'Velvet Stay',
    segment: 'Lifestyle hospitality',
    stat: '99.9% calendar uptime',
    note: 'Synced room inventory and concierge services in one control layer.',
  },
  {
    name: 'Élan Retreat',
    segment: 'Destination spa retreat',
    stat: '+64% premium upsells',
    note: 'Personalized add-ons surfaced at exactly the right booking moment.',
  },
];

export function TrustCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      loop: true,
      dragFree: false,
      skipSnaps: false,
    },
    [
      Autoplay({
        delay: 4200,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      }),
    ],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative mt-4 border-y border-white/10 py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/55">Trusted outcomes</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white/90 md:text-2xl">
            Hospitality teams using BookEase at scale
          </h2>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button onClick={scrollPrev} variant="outline" className="h-10 w-10 border-white/20 bg-white/5 p-0 hover:bg-white/10">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button onClick={scrollNext} variant="outline" className="h-10 w-10 border-white/20 bg-white/5 p-0 hover:bg-white/10">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {highlights.map((item) => (
            <article key={item.name} className="min-w-0 flex-[0_0_92%] px-4 sm:flex-[0_0_70%] md:flex-[0_0_48%] lg:flex-[0_0_36%]">
              <div className="h-full rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(8,6,15,0.45)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
                    <Hotel className="h-3.5 w-3.5" />
                    {item.segment}
                  </div>
                  <Sparkles className="h-4 w-4 text-amber-100/80" />
                </div>

                <h3 className="mt-4 text-2xl font-semibold tracking-tight">{item.name}</h3>
                <p className="mt-3 text-sm text-white/70">{item.note}</p>

                <p className="mt-6 text-lg font-medium text-amber-100">{item.stat}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {highlights.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className={`h-2.5 rounded-full transition-all ${selectedIndex === index ? 'w-8 bg-amber-200' : 'w-2.5 bg-white/35'}`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to ${item.name}`}
          />
        ))}
      </div>
    </section>
  );
}
