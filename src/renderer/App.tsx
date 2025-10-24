import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { StatusBar } from './components/StatusBar';
import { PathSettingModal } from './components/PathSettingModal';
import { DetailView } from './components/DetailView';
import { LoadingOverlay } from './components/LoadingOverlay';
import { PredictedTranslations } from './components/PredictedTranslations';
import { SearchResult } from './types';

const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('ko');
  const [languages, setLanguages] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [isSearchDisabled, setIsSearchDisabled] = useState(true);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredicted, setShowPredicted] = useState(false);
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

  const handleSearch = async (query: string) => {
    setCurrentQuery(query);
    setHasSearched(true);
    setShowPredicted(false);
    const results = await window.electron.searchStrings(query, selectedLanguage);
    setSearchResults(results);
    setSelectedResult(null);
    await window.electron.saveSearchHistory(query);

    const history = await window.electron.getSearchHistory();
    setSearchHistory(history);

    // Analytics: 검색 이벤트 추적
    await window.electron.trackSearch(selectedLanguage);
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (currentQuery) {
      handleSearch(currentQuery);
    }
  };

  const handleHistorySelect = (query: string) => {
    handleSearch(query);
  };

  const handlePathSetting = () => {
    setIsPathModalOpen(true);
  };

  const handleGitPull = async () => {
    setIsLoading(true);
    try {
      await window.electron.gitPull();
      const updateTime = await window.electron.getLastUpdateTime();
      setLastUpdateTime(updateTime);

      const langs = await window.electron.getLanguages();
      setLanguages(langs);

      // Analytics: Git Pull 이벤트 추적
      await window.electron.trackGitPull();

      alert('업데이트 완료');
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

    // Analytics: 상세 뷰 열기 이벤트 추적
    await window.electron.trackDetailViewOpen();
  };

  const handleCloseDetail = () => {
    setSelectedResult(null);
  };

  const handleShowPredicted = async () => {
    setIsLoading(true);
    try {
      const translations = await window.electron.getPredictedTranslations(currentQuery);
      setPredictedTranslations(translations);
      setShowPredicted(true);

      // Analytics: AI 예상 번역 조회 이벤트 추적
      await window.electron.trackPredictedTranslations();
    } catch (error) {
      alert('AI 예상 번역을 가져오는데 실패했습니다: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePredicted = () => {
    setShowPredicted(false);
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
      />

      <div className="flex-1 overflow-hidden">
        {selectedResult ? (
          <DetailView
            result={selectedResult}
            onClose={handleCloseDetail}
            onCopy={handleCopy}
            selectedLanguage={selectedLanguage}
          />
        ) : showPredicted ? (
          <PredictedTranslations
            translations={predictedTranslations}
            onCopy={handleCopy}
            onClose={handleClosePredicted}
          />
        ) : (
          <SearchResults
            results={searchResults}
            onRowClick={handleRowClick}
            onCopy={handleCopy}
            hasSearched={hasSearched}
            isSearchDisabled={isSearchDisabled}
            onShowPredicted={handleShowPredicted}
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
