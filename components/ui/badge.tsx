export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-sky-300/30 bg-sky-400/10 px-2 py-0.5 text-xs text-sky-200">{children}</span>;
}
