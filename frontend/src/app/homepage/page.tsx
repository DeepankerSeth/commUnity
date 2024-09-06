'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ReportIncidentForm from "@/components/ReportIncidentForm";
import { getIncidents } from '@/lib/disasterAPI';
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Activity, Users } from "lucide-react";
import Footer from "@/components/Footer";

export default function Homepage() {
  const [showReportIncident, setShowReportIncident] = useState(false);
  const reportIncidentRef = useRef<HTMLDivElement>(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchIncidents = async () => {
      try {
        const data = await getIncidents();
        if (isMounted) {
          setIncidents(data);
        }
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
      }
    };
    fetchIncidents();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleReportIncident = () => {
    setShowReportIncident(prevState => !prevState);
    if (!showReportIncident && reportIncidentRef.current) {
      reportIncidentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      
      <main className="flex flex-col items-center w-full max-w-4xl text-center relative z-10">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-700 dark:text-gray-300 mb-4">
          comm<span className="text-gray-900 dark:text-gray-100">Unity</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">United in Resilience</p>
        
        <div className="relative w-full max-w-2xl mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input 
            type="search" 
            placeholder="Search incidents or locations" 
            className="w-full pl-10 pr-4 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500 focus:ring focus:ring-gray-200 dark:focus:ring-gray-800 focus:ring-opacity-50 transition-all bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <Button 
          onClick={toggleReportIncident}
          className="w-full max-w-md text-lg sm:text-xl py-4 sm:py-5 bg-gray-800 hover:bg-gray-700 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-gray-800 font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 mb-10 transform hover:scale-105"
        >
          Report an Incident
        </Button>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
          <Link href="/monitor" passHref>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 w-full"
            >
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Monitor</span>
            </Button>
          </Link>
          
          <Link href="/donate" passHref>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 w-full"
            >
              <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-2" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Donate</span>
            </Button>
          </Link>
        </div>

        {incidents.length > 0 && (
          <div className="w-full max-w-xl mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Recent Incidents</h2>
            <ul className="space-y-4">
              {incidents.slice(0, 3).map((incident: any) => (
                <li key={incident.id} className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{incident.type}</span> - {incident.location}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      
      {showReportIncident && (
        <div className="w-full max-w-xl mb-12" ref={reportIncidentRef}>
          <ReportIncidentForm />
        </div>
      )}
      
      <Footer />
    </div>
  );
}