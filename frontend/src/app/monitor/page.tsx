'use client';

// pages/monitor
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/ui/footer";
import Weather from "@/components/weather";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchNearbyIncidents } from "@/lib/api";
import DisasterIcon from "@/components/ui/DisasterIcon";

export default function Component() {
  const [incidents, setIncidents] = useState([]);
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('/api/location');
        const data = await response.json();
        setLocation(data);
      } catch (error) {
        console.error('Failed to fetch location', error);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      const fetchIncidents = async () => {
        try {
          const data = await fetchNearbyIncidents(location.latitude, location.longitude);
          setIncidents(data);
        } catch (error) {
          console.error('Failed to fetch nearby incidents', error);
        }
      };
      fetchIncidents();
    }
  }, [location]);

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
          <Card key={index} className={`bg-${incident.severity === 'high' ? 'red' : incident.severity === 'medium' ? 'yellow' : 'green'}-500 text-${incident.severity === 'high' ? 'red' : incident.severity === 'medium' ? 'yellow' : 'green'}-50`}>
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
        ))}
      </main>
    </div>
  );
}