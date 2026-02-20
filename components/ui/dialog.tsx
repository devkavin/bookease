import * as React from 'react';
export const Dialog = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DialogTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DialogContent = ({ children }: { children: React.ReactNode }) => <div className="rounded-2xl border border-white/10 bg-[#0b1020] p-4">{children}</div>;
export const DialogHeader = ({ children }: { children: React.ReactNode }) => <div className="mb-2">{children}</div>;
export const DialogTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-semibold">{children}</h3>;
