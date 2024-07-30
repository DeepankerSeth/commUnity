import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'commUnity',
  description: 'United in Resilience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex justify-end items-center p-4 bg-white shadow-sm">
          <nav>
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Sign in</Link>
          </nav>
        </header>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}