import { useState, useEffect, useCallback } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  resultsCount: number;
  onClear: () => void;
}

export default function SearchBar({ onSearch, searchQuery, resultsCount, onClear }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(localQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localQuery, onSearch]);

  // Sync with external searchQuery changes
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    onClear();
  }, [onClear]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search employees..."
        value={localQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        aria-label="Search employees by name"
      />
      
      {searchQuery && (
        <span className="search-results-count">
          {resultsCount} result{resultsCount !== 1 ? 's' : ''} found
        </span>
      )}
      
      {searchQuery && (
        <button
          className="search-clear-button"
          onClick={handleClear}
          aria-label="Clear search"
          title="Clear search (Esc)"
        >
          ✕
        </button>
      )}
    </div>
  );
}