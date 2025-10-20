import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled: boolean;
  initialQuery?: string;
  selectedLanguage: string;
  languages: string[];
  onLanguageChange: (lang: string) => void;
  searchHistory: string[];
  onHistorySelect: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  disabled,
  initialQuery = '',
  selectedLanguage,
  languages,
  onLanguageChange,
  searchHistory,
  onHistorySelect
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
    <div className="border-b border-figma-border">
      <div className="flex gap-2 p-4">
        {languages.length > 0 && (
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="dropdown"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        )}
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ID 또는 String을 입력하세요."
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
      {searchHistory.length > 0 && (
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-figma-text-secondary whitespace-nowrap">최근 검색:</span>
          <div className="flex gap-2 overflow-x-auto">
            {searchHistory.map((historyQuery, idx) => (
              <button
                key={idx}
                onClick={() => onHistorySelect(historyQuery)}
                className="text-xs px-2 py-1 rounded bg-figma-surface hover:bg-figma-border text-figma-text-secondary hover:text-figma-text transition-colors whitespace-nowrap"
              >
                {historyQuery}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
