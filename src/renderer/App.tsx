import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar, SearchMode } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { StatusBar } from './components/StatusBar';
import { PathSettingModal } from './components/PathSettingModal';
import { DetailView } from './components/DetailView';
import { LoadingOverlay } from './components/LoadingOverlay';
import { PredictedTranslations } from './components/PredictedTranslations';
import { SearchResult, SynonymSearchResult } from './types';

const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('ko');
  const [languages, setLanguages] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [synonymResults, setSynonymResults] = useState<SynonymSearchResult | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [isSearchDisabled, setIsSearchDisabled] = useState(true);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredicted, setShowPredicted] = useState(false);
  const [selectedSearchMode, setSelectedSearchMode] = useState<SearchMode>('gdd'); // SearchBar에서 선택된 모드
  const [activeSearchMode, setActiveSearchMode] = useState<SearchMode>('gdd'); // 실제 검색이 수행된 모드
  const [predictedTranslations, setPredictedTranslations] = useState<Array<{language: string, value: string}>>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const langs = await window.electron.getLanguages();
    setLanguages(langs);

    const history = await window.electron.getSearchHistory();
    setSearchHistory(history);

    const updateTime = await window.electron.getLastUpdateTime();
    setLastUpdateTime(updateTime);

    const folderPath = await window.electron.getFolderPath();
    const isValidPath = folderPath
      ? (folderPath.includes('\\game-design-data\\localization\\ui') ||
         folderPath.includes('/game-design-data/localization/ui'))
      : false;
    setIsSearchDisabled(!isValidPath);
  };

  const handleSearch = async (query: string, mode: SearchMode) => {
    setCurrentQuery(query);
    setHasSearched(true);
    setShowPredicted(false);
    setSelectedResult(null);
    setIsLoading(true);
    setActiveSearchMode(mode); // 검색 수행 시 activeSearchMode 업데이트

    try {
      if (mode === 'gdd') {
        // GDD 검색
        const results = await window.electron.searchStrings(query, selectedLanguage);
        setSearchResults(results);
        setSynonymResults(null);
        await window.electron.trackSearch(selectedLanguage);
      } else if (mode === 'synonym') {
        // 유의어 검색
        const data = await window.electron.searchSynonyms(query, selectedLanguage);
        setSynonymResults(data);
        setSearchResults([]);
        await window.electron.trackSynonymsView();
      } else if (mode === 'ai') {
        // AI 번역
        await window.electron.trackPredictedTranslations();
        const translations = await window.electron.getPredictedTranslations(query);
        setPredictedTranslations(translations);
        setShowPredicted(true);
        setSearchResults([]);
        setSynonymResults(null);
      }

      await window.electron.saveSearchHistory(query);
      const history = await window.electron.getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      if (mode === 'ai') {
        await window.electron.trackPredictedTranslationsFailed();
      }
      alert('검색 실패: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    // 검색 버튼을 누를 때까지 재검색하지 않음
  };

  const handleHistorySelect = (query: string) => {
    handleSearch(query, selectedSearchMode);
  };

  const handlePathSetting = () => {
    setIsPathModalOpen(true);
  };

  const handleGitPull = async () => {
    setIsLoading(true);
    try {
      await window.electron.gitPull();

      // 업데이트 시간 갱신
      const updateTime = await window.electron.getLastUpdateTime();
      setLastUpdateTime(updateTime);

      // 언어 목록 갱신
      const langs = await window.electron.getLanguages();
      setLanguages(langs);

      console.log('[Git Pull Debug] langs:', langs);
      console.log('[Git Pull Debug] langs.length:', langs.length);      

      // Analytics: Git Pull 이벤트 추적
      await window.electron.trackGitPull();
    } catch (error) {
      const errorMessage = String(error);
      if (errorMessage.includes('경로가 설정되지 않았습니다')) {
        alert('경로가 설정되지 않았습니다.');
      } else {
        alert('Git Pull 실패: ' + error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePathConfirm = async (path: string) => {
    try {
      await window.electron.setFolderPath(path);
      setCurrentPath(path);
      setIsPathModalOpen(false);

      const langs = await window.electron.getLanguages();
      setLanguages(langs);

      const isValidPath = path.includes('\\game-design-data\\localization\\ui') ||
                          path.includes('/game-design-data/localization/ui');
      setIsSearchDisabled(!isValidPath);

      if (langs.length > 0) {
        setSelectedLanguage(langs[0]);
      }
    } catch (error) {
      alert('경로 설정 실패: ' + error);
    }
  };

  const handleBrowse = async (): Promise<string | null> => {
    return await window.electron.browseFolderPath();
  };

  const handleCopy = async (text: string) => {
    await window.electron.copyToClipboard(text);
  };

  const handleRowClick = async (result: SearchResult) => {
    setSelectedResult(result);

    // Analytics: 번역 조회 이벤트 추적 (진입 경로: gdd 또는 synonym)
    if (activeSearchMode === 'gdd' || activeSearchMode === 'synonym') {
      await window.electron.trackTranslationsView(activeSearchMode);
    }
  };

  const handleCloseDetail = () => {
    setSelectedResult(null);
  };

  return (
    <div className="flex flex-col h-screen bg-figma-bg text-figma-text">
      <Header
        selectedLanguage={selectedLanguage}
        languages={languages}
        onLanguageChange={handleLanguageChange}
        searchHistory={searchHistory}
        onHistorySelect={handleHistorySelect}
        onPathSetting={handlePathSetting}
        onGitPull={handleGitPull}
      />

      <SearchBar
        onSearch={handleSearch}
        disabled={isSearchDisabled}
        initialQuery={currentQuery}
        selectedLanguage={selectedLanguage}
        languages={languages}
        onLanguageChange={handleLanguageChange}
        searchHistory={searchHistory}
        onHistorySelect={handleHistorySelect}
        searchMode={selectedSearchMode}
        onSearchModeChange={setSelectedSearchMode}
      />

      <div className="flex-1 overflow-hidden">
        {selectedResult ? (
          <DetailView
            result={selectedResult}
            onClose={handleCloseDetail}
            onCopy={handleCopy}
          />
        ) : showPredicted ? (
          <PredictedTranslations
            originalEnglish={currentQuery}
            translations={predictedTranslations}
            onCopy={handleCopy}
          />
        ) : (
          <SearchResults
            results={activeSearchMode === 'gdd' ? searchResults : synonymResults?.results || []}
            synonymsList={activeSearchMode === 'synonym' ? synonymResults?.synonymsList : undefined}
            onRowClick={handleRowClick}
            onCopy={handleCopy}
            hasSearched={hasSearched}
            isSearchDisabled={isSearchDisabled}
            searchMode={activeSearchMode}
            currentQuery={currentQuery}
            onSearchWithMode={(mode) => handleSearch(currentQuery, mode)}
          />
        )}
      </div>

      <StatusBar lastUpdateTime={lastUpdateTime} />

      <PathSettingModal
        isOpen={isPathModalOpen}
        currentPath={currentPath}
        onClose={() => setIsPathModalOpen(false)}
        onConfirm={handlePathConfirm}
        onBrowse={handleBrowse}
      />

      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default App;
