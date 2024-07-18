// pages/predictions
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/ui/footer';
import { Button } from "@/components/ui/button"
import { fetchDisasterData } from '@/lib/api';
import DisasterIcon from '@/components/ui/DisasterIcon';
import useErrorHandler from '@/hooks/useErrorHandler';

interface Disaster {
  type: string;
  predictionTime: string;
}

export default function Predictions() {
  const [disasterData, setDisasterData] = useState<Disaster[]>([]);
  const { error, handleError, clearError } = useErrorHandler();

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchDisasterData();
        setDisasterData(data);
      } catch (error) {
        handleError(error);
      }
    };
    getData();
  }, [handleError]); // Add handleError to the dependency array

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" prefetch={false}>
          commUnity
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/evacuation" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Evacuation
          </Link>
          <Link href="/monitor" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Monitor
          </Link>
          <Link href="/donate" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Donate
          </Link>
        </div>
      </header>
      <main className="flex-1 bg-[#f5f5f5] px-6 py-12">
        <div className="container mx-auto max-w-5xl">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Disaster Prediction and Early Warning</h1>
              <p className="text-muted-foreground">
                Stay informed and prepared with our advanced disaster prediction and early warning system.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {disasterData.map((disaster, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
                    <DisasterIcon type={disaster.type} className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">{disaster.type}</h3>
                      <p className="text-sm text-muted-foreground">Predicted in {disaster.predictionTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <h2 className="text-2xl font-bold">Immediate Evacuation Strategy</h2>
              <p className="text-muted-foreground">
                In the event of a disaster, follow these steps to evacuate safely:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <CheckIcon className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Gather essential items</h3>
                    <p className="text-muted-foreground">
                      Collect your ID, medications, and other important documents.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Evacuate immediately</h3>
                    <p className="text-muted-foreground">
                      Follow the designated evacuation routes and proceed to the nearest safe zone.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Stay informed</h3>
                    <p className="text-muted-foreground">
                      Monitor local news and official channels for updates and further instructions.
                    </p>
                  </div>
                </li>
              </ul>
              <Link
                href="/evacuation"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2 font-medium hover:bg-primary/90 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                prefetch={false}
              >
                <CompassIcon className="h-5 w-5" />
                Evacuation Page
              </Link>
            </div>
          </section>
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Report an Incident</h2>
            <Link href="/report_incident" className="text-primary hover:underline">
              Go to Report an Incident Page
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CheckIcon(props: any) {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CompassIcon(props: any) {
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
      <path d="m16.24 7.76-1.804 5.411a2 2.5 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2.5 0 0 1 1.265-1.265z" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}