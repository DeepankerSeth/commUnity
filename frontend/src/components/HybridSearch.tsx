import React, { useState } from 'react';
import { performHybridSearch } from '@/lib/disasterAPI';

interface SearchResult {
  id: string;
  description: string;
}

const HybridSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    try {
      const searchResults = await performHybridSearch(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Error performing hybrid search:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search incidents..."
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default HybridSearch;