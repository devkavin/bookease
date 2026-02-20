export function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center"><h3 className="font-medium">{title}</h3><p className="mt-2 text-sm text-white/60">{message}</p></div>;
}
