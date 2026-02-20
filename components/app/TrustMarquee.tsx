'use client';

import Marquee from 'react-fast-marquee';

type TrustMarqueeProps = {
  items: string[];
};

export function TrustMarquee({ items }: TrustMarqueeProps) {
  return (
    <div className="trust-marquee" aria-label="Trusted by brands">
      <Marquee
        autoFill
        speed={36}
        direction="right"
        gradient={false}
        pauseOnHover
        pauseOnClick
        className="trust-marquee__rail"
      >
        {items.map((item) => (
          <span key={item} className="trust-marquee__item">
            {item}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
