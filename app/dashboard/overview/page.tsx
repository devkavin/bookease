export const dynamic = 'force-dynamic';

import {
  addDays,
  format,
  formatDistanceToNow,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import {
  CalendarClock,
  CalendarDays,
  CircleCheckBig,
  Clock3,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import { GlassCard } from '@/components/app/GlassCard';
import { getBookings, getMyBusiness } from '@/lib/db/queries';

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  start_at: string;
  end_at: string;
  services?: { name: string } | null;
};

function getDayDistribution(bookings: Booking[], weekStart: Date) {
  return Array.from({ length: 7 }, (_, dayOffset) => {
    const day = addDays(weekStart, dayOffset);
    const count = bookings.filter((booking) => isSameDay(parseISO(booking.start_at), day)).length;
    return { day: format(day, 'EEE'), count };
  });
}

export default async function OverviewPage() {
  const business = await getMyBusiness();
  const bookings: Booking[] = business ? await getBookings(business.id) : [];
  const now = new Date();
  const todayStart = startOfDay(now);

  const sortedAscending = [...bookings].sort((a, b) => +parseISO(a.start_at) - +parseISO(b.start_at));
  const upcoming = sortedAscending.filter((booking) => parseISO(booking.start_at) > now);
  const next = upcoming[0];

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const previousWeekStart = addDays(weekStart, -7);
  const previousWeekEnd = addDays(weekStart, -1);

  const todayCount = bookings.filter((booking) => isSameDay(parseISO(booking.start_at), todayStart)).length;
  const thisWeekBookings = bookings.filter((booking) =>
    isWithinInterval(parseISO(booking.start_at), { start: weekStart, end: weekEnd }),
  );
  const previousWeekBookings = bookings.filter((booking) =>
    isWithinInterval(parseISO(booking.start_at), { start: previousWeekStart, end: previousWeekEnd }),
  );

  const weekDelta = thisWeekBookings.length - previousWeekBookings.length;
  const weekDeltaLabel =
    weekDelta === 0 ? 'steady vs last week' : `${weekDelta > 0 ? '+' : ''}${weekDelta} vs last week`;

  const serviceBreakdown = bookings.reduce<Record<string, number>>((acc, booking) => {
    const serviceName = booking.services?.name ?? 'General booking';
    acc[serviceName] = (acc[serviceName] ?? 0) + 1;
    return acc;
  }, {});

  const topServices = Object.entries(serviceBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const weeklyDistribution = getDayDistribution(thisWeekBookings, weekStart);
  const peakDayCount = Math.max(...weeklyDistribution.map((item) => item.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-white/70">
            {business?.name ? `${business.name} at a glance` : 'A live snapshot of how your schedule is performing.'}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/75">
          <Sparkles className="h-4 w-4 text-indigo-200" />
          Updated {formatDistanceToNow(now, { addSuffix: true })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-white/60">Today&apos;s bookings</p>
              <CalendarDays className="h-5 w-5 text-white/70" />
            </div>
            <p className="text-3xl font-semibold">{todayCount}</p>
            <p className="text-xs text-white/60">For {format(now, 'EEEE, MMM d')}</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-white/60">This week</p>
              <TrendingUp className="h-5 w-5 text-emerald-300" />
            </div>
            <p className="text-3xl font-semibold">{thisWeekBookings.length}</p>
            <p className="text-xs text-white/60">{weekDeltaLabel}</p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-white/60">Next booking</p>
              <CircleCheckBig className="h-5 w-5 text-indigo-200" />
            </div>
            {next ? (
              <>
                <p className="text-base font-semibold">{next.customer_name}</p>
                <p className="text-xs text-white/65">{format(parseISO(next.start_at), 'EEE, MMM d • p')}</p>
              </>
            ) : (
              <p className="text-sm text-white/65">No upcoming bookings yet.</p>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Upcoming agenda</h2>
              <CalendarClock className="h-4 w-4 text-white/70" />
            </div>
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{booking.customer_name}</p>
                    <p className="text-xs text-white/60">{booking.services?.name ?? 'General booking'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{format(parseISO(booking.start_at), 'EEE, MMM d • p')}</p>
                    <p className="text-xs text-white/60">{formatDistanceToNow(parseISO(booking.start_at), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}

              {upcoming.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-sm text-white/60">
                  No upcoming bookings. Share your booking link to fill your calendar faster.
                </p>
              ) : null}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="space-y-4">
            <h2 className="text-base font-semibold">Weekly load</h2>
            <div className="space-y-2">
              {weeklyDistribution.map((item) => (
                <div key={item.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-white/65">
                    <span>{item.day}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-300 to-cyan-300"
                      style={{ width: `${(item.count / peakDayCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Top services</h2>
            <UserRound className="h-4 w-4 text-white/70" />
          </div>
          {topServices.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {topServices.map(([name, count]) => (
                <div key={name} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-white/65">
                    <Clock3 className="h-3.5 w-3.5" />
                    {count} booking{count === 1 ? '' : 's'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">No service activity yet. Your most booked services will appear here.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
