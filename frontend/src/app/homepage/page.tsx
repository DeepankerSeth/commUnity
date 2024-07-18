'use client';

import { useRef, useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/ui/footer";
import ReportIncidentForm from "@/components/ReportIncidentForm";

export default function Homepage() {
  const [showReportIncident, setShowReportIncident] = useState(false);
  const reportIncidentRef = useRef<HTMLDivElement>(null);

  const toggleReportIncident = () => {
    setShowReportIncident(prevState => !prevState);
    if (!showReportIncident && reportIncidentRef.current) {
      reportIncidentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-6xl">Hello</h1>
        <p className="text-xl text-muted-foreground">Welcome to the commUnity website.</p>
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleReportIncident}
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Report an Incident
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-600"
          >
            <MicIcon className="w-4 h-4" />
            <span className="sr-only">Voice</span>
          </Button>
        </div>
      </div>
      <div className="mt-12 flex gap-4">
        <Link
          href="/monitor"
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          prefetch={false}
        >
          Monitor
        </Link>
        <Link
          href="/predictions"
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          prefetch={false}
        >
          Predictions
        </Link>
        <Link
          href="/evacuation"
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          prefetch={false}
        >
          Evacuation
        </Link>
        <Link
          href="/donate"
          className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          prefetch={false}
        >
          Donate to a Cause
        </Link>
      </div>
      {showReportIncident && (
        <div className="mt-12 w-full" ref={reportIncidentRef}>
          <ReportIncidentForm />
        </div>
      )}
      <footer style={{ position: "fixed", bottom: 0, width:"100%" }} className="bg-muted py-6 px-6 border-t">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 commUnity. All rights reserved.
          </p>
          <nav className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
              Terms
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function MicIcon(props: any) {
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
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}