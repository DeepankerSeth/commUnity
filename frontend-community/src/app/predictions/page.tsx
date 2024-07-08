// pages/predictions
'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Footer from '@/components/ui/footer';
import { Button } from "@/components/ui/button"
//import { MicIcon } from "@heroicons/react/24/outline"

export default function Predictions() {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [media, setMedia] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('description', description);
    if (photo) formData.append('photo', photo);
    if (video) formData.append('video', video);

    const res = await fetch('/api/report', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('Incident reported successfully!');
    } else {
      alert('Failed to report incident');
    }
  };

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
                <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
                  <TornadoIcon className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Tornado</h3>
                    <p className="text-sm text-muted-foreground">Predicted in 2 hours</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
                  <CloudRainIcon className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Flood</h3>
                    <p className="text-sm text-muted-foreground">Predicted in 4 hours</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
                  <EarthIcon className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Earthquake</h3>
                    <p className="text-sm text-muted-foreground">Predicted in 1 hour</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
                  <FlameIcon className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">Wildfire</h3>
                    <p className="text-sm text-muted-foreground">Predicted in 3 hours</p>
                  </div>
                </div>
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the incident"
                    className="w-full border rounded-lg p-2"
                    required
                  />
                  <Button variant="secondary" size="icon" className="ml-4">
                    <MicIcon className="w-6 h-6" />
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload Photos, Videos</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    onChange={(e) => setMedia(e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Any other files</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded">
                  Submit
                </Button>
              </form>
            </div>
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

function CloudRainIcon(props: any) {
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
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 14v6" />
      <path d="M8 14v6" />
      <path d="M12 16v6" />
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

function DatabaseIcon(props: any) {
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
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

function EarthIcon(props: any) {
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
      <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54" />
      <path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17" />
      <path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function FlameIcon(props: any) {
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
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function TornadoIcon(props: any) {
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
      <path d="M21 4H3" />
      <path d="M18 8H6" />
      <path d="M19 12H9" />
      <path d="M16 16h-6" />
      <path d="M11 20H9" />
    </svg>
  );
}

function MicIcon(props:any) {
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
  )
}
