import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getFacets, performHybridSearch } from '@/lib/disasterAPI';

interface Facets {
  types: string[];
  severities: number[];
  statuses: string[];
}

interface SearchResult {
  _id: string;
  type: string;
  description: string;
  severity: number;
  status: string;
}

export function FacetedSearch() {
  const [query, setQuery] = useState('');
  const [facets, setFacets] = useState<Facets>({ types: [], severities: [], statuses: [] });
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    async function loadFacets() {
      const facetData = await getFacets();
      setFacets(facetData);
    }
    loadFacets();
  }, []);

  const handleSearch = async () => {
    const filters: Record<string, string> = {};
    if (selectedType) filters.type = selectedType;
    if (selectedSeverity) filters.severity = selectedSeverity;
    if (selectedStatus) filters.status = selectedStatus;

    const searchResults = await performHybridSearch(query, 10, filters);
    setResults(searchResults);
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search incidents..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex space-x-2">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Incident Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {facets.types.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
          <SelectTrigger>
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Severities</SelectItem>
            {facets.severities.map((severity) => (
              <SelectItem key={severity} value={severity.toString()}>{severity}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {facets.statuses.map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSearch}>Search</Button>
      <div className="space-y-2">
        {results.map((result) => (
          <div key={result._id} className="border p-2 rounded">
            <h3 className="font-bold">{result.type}</h3>
            <p>{result.description}</p>
            <p>Severity: {result.severity}</p>
            <p>Status: {result.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
