import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface IncidentFiltersProps {
  onFilterChange: (filters: IncidentFilters) => void;
}

export interface IncidentFilters {
  type: string;
  severity: number | null;
  status: 'active' | 'resolved' | '';
  sortBy: 'severity' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

export function IncidentFilters({ onFilterChange }: IncidentFiltersProps) {
  const [filters, setFilters] = React.useState<IncidentFilters>({
    type: '',
    severity: null,
    status: '',
    sortBy: 'severity',
    sortOrder: 'desc',
  });

  const handleFilterChange = (key: keyof IncidentFilters, value: string | number | null) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <Input
        placeholder="Incident Type"
        value={filters.type}
        onChange={(e) => handleFilterChange('type', e.target.value)}
      />
      <Select
        value={filters.severity?.toString() || ''}
        onValueChange={(value) => handleFilterChange('severity', value ? parseInt(value) : null)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((severity) => (
            <SelectItem key={severity} value={severity.toString()}>
              {severity}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(value) => handleFilterChange('status', value as 'active' | 'resolved' | '')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.sortBy}
        onValueChange={(value) => handleFilterChange('sortBy', value as 'severity' | 'createdAt' | 'updatedAt')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="severity">Severity</SelectItem>
          <SelectItem value="createdAt">Created At</SelectItem>
          <SelectItem value="updatedAt">Updated At</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.sortOrder}
        onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}