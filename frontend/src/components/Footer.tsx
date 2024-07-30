import Link from 'next/link';

export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer className={`py-4 text-center text-sm text-gray-500 ${className}`}>
      <div>© 2024 commUnity. All rights reserved.</div>
      <div className="mt-2">
        <Link href="/privacy" className="hover:underline">Privacy</Link>
        {' · '}
        <Link href="/terms" className="hover:underline">Terms</Link>
        {' · '}
        <Link href="/contact" className="hover:underline">Contact</Link>
      </div>
    </footer>
  );
}