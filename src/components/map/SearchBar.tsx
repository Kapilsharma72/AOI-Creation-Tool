import React, { useState, useCallback, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import { Search } from 'lucide-react';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

// Debounce function for search
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const map = useMap();

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await performSearch(query);
  };

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const handleResultClick = (result: SearchResult) => {
    const { lat, lon } = result;
    map.flyTo([parseFloat(lat), parseFloat(lon)], 13);
    setResults([]);
    setQuery('');
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-96">
      <form onSubmit={searchLocation} className="relative">
        <label htmlFor="location-search" className="sr-only">Search for a location</label>
        <input
          id="location-search"
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search for a city, state, or country..."
          className="w-full px-4 py-2 pl-10 pr-12 rounded-lg shadow-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search for a location"
          aria-describedby="search-description"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <Search className="w-5 h-5" />
        </button>
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </form>
      
      {results.length > 0 && (
        <div className="mt-1 bg-white rounded-lg shadow-lg overflow-hidden">
          {results.map((result, index) => (
            <div
              key={`${result.lat}-${result.lon}-${index}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              <p className="text-sm text-gray-800">{result.display_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
