export type BreakRange = { start: string; end: string };
export type Rule = { start_time: string; end_time: string; breaks: BreakRange[] };
export type ExceptionRule = { is_closed: boolean; start_time: string | null; end_time: string | null; breaks: BreakRange[] } | null;
