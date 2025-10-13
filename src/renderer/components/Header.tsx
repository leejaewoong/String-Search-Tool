import React from 'react';

interface HeaderProps {
  selectedLanguage: string;
  languages: string[];
  onLanguageChange: (lang: string) => void;
  searchHistory: string[];
  onHistorySelect: (query: string) => void;
  onPathSetting: () => void;
  onGitPull: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  languages,
  onLanguageChange,
  searchHistory,
  onHistorySelect,
  onPathSetting,
  onGitPull,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-figma-border">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">String-Search</h1>

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

        {searchHistory.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                onHistorySelect(e.target.value);
              }
            }}
            className="dropdown text-figma-text-secondary"
            defaultValue=""
          >
            <option value="">최근 검색</option>
            {searchHistory.map((query, idx) => (
              <option key={idx} value={query}>
                {query}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPathSetting}
          className="btn-icon"
          title="경로 설정"
        >
          ⚙️
        </button>
        <button
          onClick={onGitPull}
          className="btn-icon"
          title="Git Pull"
        >
          🔄
        </button>
      </div>
    </div>
  );
};
