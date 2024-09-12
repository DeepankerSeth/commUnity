import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full max-w-4xl text-center text-gray-600 dark:text-gray-400 mt-12 relative z-10">
      <p>© 2024 commUnity. All rights reserved.</p>
      <div className="mt-2 space-x-4">
        <Link href="/privacy" className="hover:underline">Privacy</Link>
        <Link href="/terms" className="hover:underline">Terms</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
      </div>
    </footer>
  );
}