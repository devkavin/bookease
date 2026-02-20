'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback } from 'react';

const TRUSTED_BRANDS = [
  'Aurora Suites',
  'Citrine Spa',
  'Grand Coast Villas',
  'Velvet Stay',
  'Élan Retreat',
  'North Pier Hotel',
  'Solstice Residences',
  'The Luma Collection',
];

export function TrustedBrandsCarousel() {
  const [emblaRef] = useEmblaCarousel(
    {
      align: 'start',
      loop: true,
      dragFree: true,
      containScroll: false,
    },
    [
      Autoplay({
        delay: 2400,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const renderBrand = useCallback(
    (brand: string, index: number) => (
      <div key={`${brand}-${index}`} className="min-w-0 shrink-0 grow-0 basis-auto pl-3 first:pl-0 md:pl-4">
        <span className="inline-flex whitespace-nowrap rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-medium tracking-[0.12em] text-amber-50/90 uppercase sm:px-5 sm:text-sm">
          {brand}
        </span>
      </div>
    ),
    [],
  );

  return (
    <section className="relative mt-2 border-y border-white/10 py-4 md:py-5" aria-label="Trusted by premium hospitality brands">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#05030a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#05030a] to-transparent" />

      <div ref={emblaRef} className="overflow-hidden px-4">
        <div className="flex touch-pan-y -ml-3 md:-ml-4">{TRUSTED_BRANDS.map(renderBrand)}</div>
      </div>
    </section>
  );
}
