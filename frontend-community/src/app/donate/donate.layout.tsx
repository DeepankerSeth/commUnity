// This is the root layout component for your Next.js app.
// Learn more: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
import { IBM_Plex_Sans } from 'next/font/google'
import { Cabin } from 'next/font/google'
import { cn } from '@/lib/utils'
import '../globals.css'

const fontHeading = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['400', '700'], // This is the default weight for the font
})

const fontBody = Cabin({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body 
        className={cn(
          'antialiased',
          fontHeading.variable,
          fontBody.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}