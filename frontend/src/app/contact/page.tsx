// pages/contact
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Footer from "@/components/Footer"
import Link from "next/link"

export default function contact() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">
              <Link href="/" className="flex items-center justify-center" prefetch={false}>
                commUnity
                </Link>
                </h1>
              <p className="text-sm text-primary-foreground/80">United in Resilience</p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 py-12 md:py-24">
        <div className="container grid grid-cols-1 gap-12 px-4 md:grid-cols-[1fr_300px] md:gap-16 md:px-6">
          <div>
            <h2 className="text-3xl font-bold">Get in Touch</h2>
            <p className="mt-2 text-muted-foreground">Fill out the form below to reach out to our team.</p>
            <form className="mt-8 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" type="tel" placeholder="(123) 456-7890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} placeholder="How can we help you?" />
              </div>
              <Button type="submit">Submit</Button>
            </form>
          </div>
          <div className="space-y-6 rounded-lg bg-muted p-6 shadow">
            <div>
              <h3 className="text-lg font-bold">Contact Us</h3>
              <div className="mt-2 space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  <p>123 Main St, Anytown USA</p>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5" />
                  <p>(123) 456-7890</p>
                </div>
                <div className="flex items-center gap-2">
                  <MailIcon className="h-5 w-5" />
                  <p>info@willsoonhaveanaccount.org</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold">Follow Us</h3>
              <div className="mt-2 flex gap-4 text-muted-foreground">
                <Link href="#" className="hover:text-primary" prefetch={false}>
                  <TwitterIcon className="h-6 w-6" />
                </Link>
                <Link href="#" className="hover:text-primary" prefetch={false}>
                  <FacebookIcon className="h-6 w-6" />
                </Link>
                <Link href="#" className="hover:text-primary" prefetch={false}>
                  <InstagramIcon className="h-6 w-6" />
                </Link>
                <Link href="#" className="hover:text-primary" prefetch={false}>
                  <LinkedinIcon className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  )
}

function FacebookIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}


function InstagramIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}


function LinkedinIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}


function MailIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}


function MapPinIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}


function PhoneIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}


function TwitterIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}
