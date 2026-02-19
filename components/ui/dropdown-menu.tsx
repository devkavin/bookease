export const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => <div className="rounded-xl border border-white/10 bg-[#0c1223] p-2">{children}</div>;
export const DropdownMenuItem = ({ children }: { children: React.ReactNode }) => <div className="rounded px-2 py-1 hover:bg-white/10">{children}</div>;
