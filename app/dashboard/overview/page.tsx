import { GlassCard } from '@/components/app/GlassCard';
import { getMyBusiness, getBookings } from '@/lib/db/queries';

export default async function OverviewPage() {
  const business = await getMyBusiness();
  const bookings = business ? await getBookings(business.id) : [];
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = bookings.filter((b: any) => b.start_at.slice(0, 10) === today).length;
  const next = bookings.find((b: any) => new Date(b.start_at) > new Date());
  return <div className="space-y-4"><h1 className="text-2xl">Overview</h1><div className="grid gap-4 md:grid-cols-3"><GlassCard><p className="text-white/60">Today</p><p className="text-3xl">{todayCount}</p></GlassCard><GlassCard><p className="text-white/60">This week</p><p className="text-3xl">{bookings.length}</p></GlassCard><GlassCard><p className="text-white/60">Next booking</p><p>{next ? `${next.customer_name} · ${new Date(next.start_at).toLocaleString()}` : 'None yet'}</p></GlassCard></div></div>;
}
