import * as React from 'react';
export function Tabs({ children }: { children: React.ReactNode }) { return <div>{children}</div>; }
export function TabsList({ children }: { children: React.ReactNode }) { return <div className="flex gap-2">{children}</div>; }
export function TabsTrigger({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button className="rounded-lg border border-white/10 px-3 py-1" {...props}>{children}</button>; }
export function TabsContent({ children }: { children: React.ReactNode }) { return <div>{children}</div>; }
