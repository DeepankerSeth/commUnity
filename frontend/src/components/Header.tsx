'use client';

import Link from 'next/link';
import AuthButton from './AuthButton';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <Link href="/" className="text-xl font-bold">commUnity</Link>
      <nav>
        <AuthButton />
      </nav>
    </header>
  );
}