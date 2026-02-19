import { CalendarClock, CalendarDays, CircleCheckBig } from 'lucide-react';
import { GlassCard } from '@/components/app/GlassCard';
import { getBookings, getMyBusiness } from '@/lib/db/queries';

export default async function OverviewPage() {
  const business = await getMyBusiness();
  const bookings = business ? await getBookings(business.id) : [];
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const todayCount = bookings.filter((booking: any) => booking.start_at.slice(0, 10) === today).length;
  const upcoming = bookings.filter((booking: any) => new Date(booking.start_at) > now);
  const next = upcoming[0];

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const thisWeek = bookings.filter((booking: any) => {
    const start = new Date(booking.start_at);
    return start >= weekStart && start < weekEnd;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Overview</h1>
        <p className="mt-1 text-sm text-white/70">A live snapshot of how your schedule is performing.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-white/60">Today</p>
              <p className="text-3xl font-semibold">{todayCount}</p>
            </div>
            <CalendarDays className="h-5 w-5 text-white/70" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-white/60">This week</p>
              <p className="text-3xl font-semibold">{thisWeek}</p>
            </div>
            <CalendarClock className="h-5 w-5 text-white/70" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-white/60">Next booking</p>
              <p className="text-sm font-medium">
                {next ? `${next.customer_name} · ${new Date(next.start_at).toLocaleString()}` : 'None yet'}
              </p>
            </div>
            <CircleCheckBig className="h-5 w-5 text-emerald-300" />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
