'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <Link href="/" className="text-xl font-bold">commUnity</Link>
      <nav>
      <a href="/api/auth/login">Login</a>
      </nav>
    </header>
  );
}