import { cn } from '@/lib/utils';
export const Table = ({ children }: { children: React.ReactNode }) => <table className="w-full text-sm">{children}</table>;
export const TableHeader = ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>;
export const TableBody = ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>;
export const TableRow = ({ children, className }: { children: React.ReactNode; className?: string }) => <tr className={cn('border-b border-white/10', className)}>{children}</tr>;
export const TableHead = ({ children }: { children: React.ReactNode }) => <th className="px-2 py-2 text-left text-white/60">{children}</th>;
export const TableCell = ({ children }: { children: React.ReactNode }) => <td className="px-2 py-2">{children}</td>;
