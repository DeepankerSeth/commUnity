'use client';

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useGeolocation } from '@/hooks/useGeoLocation';

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
  distance?: number;
}

const getSeverityColor = (severity: number) => {
  if (severity >= 8) return 'bg-red-500 text-red-50';
  if (severity >= 5) return 'bg-yellow-500 text-yellow-50';
  return 'bg-green-500 text-green-50';
};

const MonitorClient: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
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
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();

  const fetchIncidents = useCallback(async () => {
    if (latitude === null || longitude === null) return;
    
    try {
      const newIncidents = await getNearbyIncidents(
        latitude, 
        longitude, 
        5000, // 5km radius
        INCIDENTS_PER_PAGE, 
        (page - 1) * INCIDENTS_PER_PAGE
      );
      setIncidents(prevIncidents => [...prevIncidents, ...newIncidents]);
      setHasMore(newIncidents.length === INCIDENTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  }, [latitude, longitude, page]);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      fetchIncidents();
    }
  }, [latitude, longitude, page, fetchIncidents]);

  useEffect(() => {
    const socket = initializeSocket();

    socket.on('incidentUpdate', (updatedIncident: Incident) => {
      setIncidents(prevIncidents => 
        prevIncidents.map(incident => 
          incident._id === updatedIncident._id ? { ...incident, ...updatedIncident } : incident
        )
      );
    });

    socket.on('newIncident', (newIncident: Incident) => {
      setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
    });

    return () => {
      socket.off('incidentUpdate');
      socket.off('newIncident');
    };
  }, []);

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
    }
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

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Incident Monitor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <LocationSearch onLocationSelect={(lat, lon) => {
            // Update location if needed
          }} />
          <FacetedSearch />
          <IncidentFilters onFilterChange={setFilters} />
        </div>
        <ApiKeyManagement />
      </div>
      {locationError && <p className="text-red-500 mb-4">Error getting location: {locationError}</p>}
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
              {incident.distance && (
                <p className="text-sm text-gray-500">
                  Distance: {incident.distance.toFixed(2)} km
                </p>
              )}
              <Link href={`/incident/${incident._id}`} passHref>
                <Button className="mt-2" asChild>
                  <a>View Details</a>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {hasMore && (
        <Button onClick={loadMore} className="mt-4">Load More</Button>
      )}
      {locationLoading && <p>Loading incidents...</p>}
    </div>
  );
};

export default MonitorClient;
