'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="flex justify-between items-center p-4">
      <Link href="/" className="text-xl font-bold">commUnity</Link>
      <nav>
        {pathname !== '/login' && (
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}