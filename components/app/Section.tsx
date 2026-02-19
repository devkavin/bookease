export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mx-auto w-full max-w-6xl px-4 py-12"><h2 className="mb-6 text-2xl font-semibold">{title}</h2>{children}</section>;
}
