'use client';

// pages/monitor
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Weather from "@/components/weather";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getNearbyIncidents } from "@/lib/disasterAPI";
import DisasterIcon from "@/components/ui/icons";

interface Incident {
  _id: string;
  type: string;
  status: string;
  severity: number;
  location: {
    coordinates: [number, number];
  };
}

const getSeverityColor = (severity: number) => {
  if (severity >= 8) return 'bg-red-500 text-red-50';
  if (severity >= 5) return 'bg-yellow-500 text-yellow-50';
  return 'bg-green-500 text-green-50';
};

export default function Monitor() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number }>({});

  const fetchIncidents = async (lat: number, lon: number) => {
    try {
      const data = await getNearbyIncidents(lat, lon);
      const sortedIncidents = data.sort((a: Incident, b: Incident) => {
        if (a.status !== b.status) {
          return a.status === 'active' ? -1 : 1;
        }
        return b.severity - a.severity;
      });
      setIncidents(sortedIncidents);
    } catch (error) {
      console.error('Failed to fetch nearby incidents', error);
    }
  };

  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchIncidents(location.latitude, location.longitude);
    }
  }, [location]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const position: GeolocationPosition = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (error) {
        console.error('Failed to fetch location', error);
      }
    };

    fetchLocation();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      <header className="flex items-center justify-between h-16 px-6 border-b">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <DisasterIcon type="circle alert" className="w-6 h-6" />
          <span>Monitor</span>
        </div>
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input type="search" placeholder="Search by location..." className="w-full pl-10 rounded-md bg-muted" />
        </div>
      </header>
      <main className="flex-1 p-6 grid gap-6">
        {incidents.map((incident, index) => (
          <Link href={`/incident/${incident._id}`} key={index}>
            <Card className={`${getSeverityColor(incident.severity)}`}>
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DisasterIcon type={incident.type} className="w-6 h-6" />
                  <CardTitle>{incident.type}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {incident.status}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div>
                  <span className="font-medium">Location:</span> {incident.location.coordinates.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Severity:</span> {incident.severity}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </main>
    </div>
  );
}