import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled: boolean;
  initialQuery?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  disabled,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="flex gap-2 p-4 border-b border-figma-border">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="검색어를 입력하세요(id or word)"
          className="input-field pr-10"
          disabled={disabled}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-figma-text-secondary hover:text-figma-text transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      <button
        onClick={handleSearch}
        disabled={disabled || !query.trim()}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        검색
      </button>
    </div>
  );
};
