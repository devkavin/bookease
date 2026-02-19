import Link from 'next/link';

const items = ['overview', 'services', 'availability', 'bookings', 'settings'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto grid min-h-screen max-w-6xl grid-cols-[220px_1fr] gap-6 p-4"><aside className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"><h2 className="mb-3 text-lg">Dashboard</h2><nav className="space-y-1">{items.map((i)=><Link className="block rounded-lg px-2 py-1 text-white/70 hover:bg-white/10" key={i} href={`/dashboard/${i}` as any}>{i[0].toUpperCase()+i.slice(1)}</Link>)}</nav></aside><section>{children}</section></main>;
}
