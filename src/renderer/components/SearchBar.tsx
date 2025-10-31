import React, { useState, useEffect } from 'react';
import { getLanguageTooltip } from '../utils/languageMetadata';

export type SearchMode = 'gdd' | 'synonym' | 'ai';

interface SearchBarProps {
  onSearch: (query: string, mode: SearchMode) => void;
  disabled: boolean;
  initialQuery?: string;
  selectedLanguage: string;
  languages: string[];
  onLanguageChange: (lang: string) => void;
  searchHistory: string[];
  onHistorySelect: (query: string) => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
}

const searchModeOptions: { value: SearchMode; label: string; tooltip: string }[] = [
  {
    value: 'gdd',
    label: 'GDD',
    tooltip: 'GDD에 검색어가 포함된 데이터가 있는지 확인합니다.',
  },
  {
    value: 'synonym',
    label: '유의어',
    tooltip: 'GDD에 유의어가 등록되어 있는지 확인합니다.',
  },
  {
    value: 'ai',
    label: 'AI번역',
    tooltip: '검색어의 예상 번역 결과를 확인합니다.',
  },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  disabled,
  initialQuery = '',
  selectedLanguage,
  languages,
  onLanguageChange,
  searchHistory,
  onHistorySelect,
  searchMode,
  onSearchModeChange,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [hoveredMode, setHoveredMode] = useState<SearchMode | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, searchMode);
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

  const currentModeTooltip = searchModeOptions.find((opt) => opt.value === (hoveredMode || searchMode))?.tooltip;

  return (
    <div className="border-b border-figma-border">
      <div className="flex gap-2 p-4 w-full">
        {/* Search Mode Dropdown */}
        <div className="relative">
          <select
            value={searchMode}
            onChange={(e) => onSearchModeChange(e.target.value as SearchMode)}
            onMouseEnter={(e) => {
              const mode = (e.target as HTMLSelectElement).value as SearchMode;
              setHoveredMode(mode);
            }}
            onMouseLeave={() => setHoveredMode(null)}
            className="dropdown w-20 pl-3 pr-1"
            disabled={disabled}
            title={currentModeTooltip}
          >
            {searchModeOptions.map((option) => (
              <option key={option.value} value={option.value} title={option.tooltip}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input with Language Selector Inside */}
        <div className="flex flex-1 gap-2 items-center border border-figma-border rounded bg-figma-surface">
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-figma-surface px-1 text-xs text-figma-text-secondary hover:text-figma-text focus:outline-none"
            disabled={disabled || languages.length === 0}
            title={getLanguageTooltip(selectedLanguage)}
          >
            {languages.length > 0 ? (
              languages.map((lang) => (
                <option key={lang} value={lang} title={getLanguageTooltip(lang)}>
                  {lang.toUpperCase()}
                </option>
              ))
            ) : (
              <option value="ko">KO</option>
            )}
          </select>
          <div className="h-6 w-px bg-figma-border"></div>
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ID 또는 String을 입력하세요."
              className="w-full bg-transparent px-2 py-2 text-sm text-figma-text focus:outline-none pr-8"
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
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={disabled || !query.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          검색
        </button>
      </div>
      <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-thin-x ">
        <span className="text-xs text-figma-text-secondary whitespace-nowrap">최근 검색:</span>
        {!disabled && searchHistory.length > 0 && (
          <div className="flex gap-2 py-2 overflow-x-auto scrollbar-thin-x">
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
        )}
      </div>
    </div>
  );
};
