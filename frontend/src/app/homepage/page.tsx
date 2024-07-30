'use client';

import { useRef, useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ReportIncidentForm from "@/components/ReportIncidentForm";
import { getIncidents } from '@/lib/disasterAPI';
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function Homepage() {
  const [showReportIncident, setShowReportIncident] = useState(false);
  const reportIncidentRef = useRef<HTMLDivElement>(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        setIncidents(data);
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
      }
    };
    fetchIncidents();
  }, []);

  const toggleReportIncident = () => {
    setShowReportIncident(prevState => !prevState);
    if (!showReportIncident && reportIncidentRef.current) {
      reportIncidentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">commUnity</h1>
          <p className="mt-4 text-lg text-gray-600">United in Resilience</p>
        </div>
        <div className="mt-12">
          <Input type="search" placeholder="Search incidents or locations" className="w-full h-12 px-4 rounded-full shadow-sm text-lg" />
        </div>
        <div className="flex flex-col gap-6 mt-12">
          <Button onClick={toggleReportIncident} className="w-full h-12 bg-black text-white hover:bg-gray-800 text-lg">
            Report an Incident
          </Button>
          <div className="flex justify-between gap-4">
            <Link href="/monitor" passHref className="flex-1">
              <Button variant="outline" className="w-full h-12 text-lg">Monitor</Button>
            </Link>
            <Link href="/evacuation" passHref className="flex-1">
              <Button variant="outline" className="w-full h-12 text-lg">Evacuation</Button>
            </Link>
            <Link href="/donate" passHref className="flex-1">
              <Button variant="outline" className="w-full h-12 text-lg">Donate</Button>
            </Link>
          </div>
        </div>
      </div>
      {incidents.length > 0 && (
        <div className="mt-16 w-full max-w-xl">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Recent Incidents</h2>
          <ul className="space-y-4">
            {incidents.slice(0, 3).map((incident: any) => (
              <li key={incident.id} className="p-4 bg-gray-100 rounded-lg shadow-sm">
                <span className="font-semibold">{incident.type}</span> - {incident.location}
              </li>
            ))}
          </ul>
        </div>
      )}
      {showReportIncident && (
        <div className="mt-16 w-full max-w-xl" ref={reportIncidentRef}>
          <ReportIncidentForm />
        </div>
      )}
      <Footer />
    </div>
  );
}