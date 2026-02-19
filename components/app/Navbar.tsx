import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#040711]/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">BookEase</Link>
        <div className="flex items-center gap-3 text-sm text-white/75">
          <Link href="/">Product</Link><Link href="/pricing">Pricing</Link><Link href="/auth/sign-in">Sign in</Link>
          <Link href="/auth/sign-up"><Button>Start free</Button></Link>
        </div>
      </nav>
    </header>
  );
}
