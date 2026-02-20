'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BookOpenCheck, CalendarClock, LayoutDashboard, Menu, Settings, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const items = [
  { slug: 'overview', label: 'Overview', icon: LayoutDashboard },
  { slug: 'services', label: 'Services', icon: Wrench },
  { slug: 'availability', label: 'Availability', icon: CalendarClock },
  { slug: 'bookings', label: 'Bookings', icon: BookOpenCheck },
  { slug: 'settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-4 p-3 sm:p-4 md:grid-cols-[auto_1fr] md:gap-6">
      <Button
        variant="outline"
        className="sticky top-3 z-30 h-10 w-10 p-0 md:hidden"
        aria-label={mobileOpen ? 'Hide navigation' : 'Show navigation'}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <aside
        className={cn(
          'rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition-all md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:self-start',
          collapsed ? 'md:w-20' : 'md:w-60',
          mobileOpen ? 'block' : 'hidden md:block'
        )}
      >
        <div className={cn('mb-3 flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed ? <h2 className="text-lg">Dashboard</h2> : null}
          <Button
            variant="ghost"
            className="h-9 w-9 p-0"
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === `/dashboard/${item.slug}`;
            const Icon = item.icon;

            return (
              <Link
                className={cn(
                  'flex items-center rounded-lg px-2 py-2 text-white/80 hover:bg-white/10',
                  isActive && 'bg-white/10 text-white',
                  collapsed && 'justify-center'
                )}
                key={item.slug}
                href={`/dashboard/${item.slug}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span className="ml-2">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <section>{children}</section>
    </main>
  );
}
