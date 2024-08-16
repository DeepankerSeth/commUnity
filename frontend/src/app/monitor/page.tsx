'use client';

// pages/monitor
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Weather from "@/components/weather";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getNearbyIncidents } from "@/lib/disasterAPI";
import DisasterIcon from "@/components/ui/icons";
import { LocationSearch } from '@/components/LocationSearch';
import { FacetedSearch } from '@/components/FacetedSearch';
import { performHybridSearch } from '@/lib/disasterAPI';
import { IncidentFilters, IncidentFilters as IncidentFiltersType } from '@/components/IncidentFilters';
import { initializeSocket, getSocket } from '@/lib/socket';
import { Dashboard } from '@/components/Dashboard';
import { ApiKeyManagement } from '@/components/ApiKeyManagement';
import { useDebounce } from 'use-debounce';

interface Incident {
  _id: string;
  type: string;
  status: 'active' | 'resolved';
  severity: number;
  description: string;
  location: {
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

const getSeverityColor = (severity: number) => {
  if (severity >= 8) return 'bg-red-500 text-red-50';
  if (severity >= 5) return 'bg-yellow-500 text-yellow-50';
  return 'bg-green-500 text-green-50';
};

export default function Monitor() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number }>({});
  const [filters, setFilters] = useState<IncidentFiltersType>({
    type: '',
    severity: null,
    status: '',
    sortBy: 'severity',
    sortOrder: 'desc',
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const INCIDENTS_PER_PAGE = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    } else {
      setFilteredIncidents(incidents);
    }
  }, [debouncedSearchTerm, incidents]);

  const performSearch = useCallback(async (term: string) => {
    try {
      const results = await performHybridSearch(term);
      setFilteredIncidents(results);
    } catch (error) {
      console.error('Error performing search:', error);
      // Optionally set an error state here
    }
  }, []);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const fetchIncidents = async (latitude: number, longitude: number) => {
    const newIncidents = await getNearbyIncidents(latitude, longitude, INCIDENTS_PER_PAGE, (page - 1) * INCIDENTS_PER_PAGE);
    setIncidents(prevIncidents => [...prevIncidents, ...newIncidents]);
    setHasMore(newIncidents.length === INCIDENTS_PER_PAGE);
  };

  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchIncidents(location.latitude, location.longitude);
    }
  }, [location, page]);

  useEffect(() => {
    const socket = initializeSocket();

    socket.on('incidentUpdate', (updatedIncident) => {
      setIncidents(prevIncidents => 
        prevIncidents.map(incident => 
          incident._id === updatedIncident._id ? { ...incident, ...updatedIncident } : incident
        )
      );
    });

    socket.on('newIncident', (newIncident) => {
      setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
    });

    return () => {
      socket.off('incidentUpdate');
      socket.off('newIncident');
    };
  }, []);

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

  const displayedIncidents = useMemo(() => {
    return filteredIncidents
      .filter(incident => 
        (!filters.type || incident.type.toLowerCase().includes(filters.type.toLowerCase())) &&
        (!filters.severity || incident.severity === filters.severity) &&
        (!filters.status || incident.status === filters.status)
      )
      .sort((a, b) => {
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        if (filters.sortBy === 'severity') {
          return (a.severity - b.severity) * order;
        } else if (filters.sortBy === 'createdAt') {
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
        } else {
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * order;
        }
      });
  }, [filteredIncidents, filters]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Incident Monitor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <LocationSearch onLocationSelect={(lat, lon) => setLocation({ latitude: lat, longitude: lon })} />
          <FacetedSearch />
          <IncidentFilters onFilterChange={setFilters} />
        </div>
        <ApiKeyManagement />
      </div>
      <Dashboard />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {displayedIncidents.map((incident) => (
          <Card key={incident._id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <DisasterIcon type={incident.type} className="w-6 h-6 mr-2" />
                  {incident.type}
                </span>
                <Badge className={getSeverityColor(incident.severity)}>
                  Severity: {incident.severity}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{incident.description}</p>
              <p className="text-sm text-gray-500">
                Status: {incident.status}
              </p>
              <p className="text-sm text-gray-500">
                Created: {new Date(incident.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Updated: {new Date(incident.updatedAt).toLocaleString()}
              </p>
              <Link href={`/incident/${incident._id}`} passHref>
                <Button className="mt-2">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {hasMore && (
        <Button onClick={loadMore} className="mt-4">Load More</Button>
      )}
      <Footer />
    </div>
  );
}