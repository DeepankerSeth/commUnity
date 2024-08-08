import React, { useState, useEffect } from 'react';
import { searchLocations, getLocationDetails } from '@/lib/disasterAPI';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocationSearchProps {
  onLocationSelect: (latitude: number, longitude: number) => void;
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ placeId: string; description: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 2) {
        setIsLoading(true);
        try {
          const results = await searchLocations(query);
          setSuggestions(results);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSuggestionClick = async (placeId: string) => {
    try {
      const details = await getLocationDetails(placeId);
      onLocationSelect(details.latitude, details.longitude);
      setQuery('');
      setSuggestions([]);
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search for a location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
      {isLoading && <p className="mt-2">Loading...</p>}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.placeId}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion.placeId)}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
