'use client';

import Link from 'next/link';
import { Menu, Sparkles, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/', label: 'Product' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/auth/sign-in', label: 'Sign in' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#120a1f]/65 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="rounded-lg border border-amber-200/35 bg-amber-300/15 p-1.5 text-amber-100 transition group-hover:bg-amber-300/30">
            <Sparkles className="h-4 w-4" />
          </span>
          BookEase
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm text-white/75 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 transition ${
                  active ? 'bg-white/15 text-white' : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex">
          <Link href="/auth/sign-up">
            <Button className="shadow-[0_10px_28px_rgba(217,119,6,0.28)]">Start free</Button>
          </Link>
        </div>

        <Button
          variant="ghost"
          className="h-9 w-9 p-0 md:hidden"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2 text-sm text-white/75">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 transition ${
                  pathname === link.href ? 'bg-white/15 text-white' : 'hover:bg-white/10'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/auth/sign-up" onClick={() => setMobileOpen(false)}>
              <Button className="mt-1 w-full">Start free</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
