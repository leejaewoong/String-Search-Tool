export interface SearchResult {
  id: string;
  value: string;
  filename: string;
  matchType?: 'direct' | 'synonym';
  synonymSource?: string;
}

export interface SynonymSearchResult {
  results: SearchResult[];
  synonymsList: string[];
}

export interface AnalyticsData {
  userId: string;
  firstInstalled: string;
  appVersion: string;
  totalSearches: number;
  totalGitPulls: number;
  languageUsage: Record<string, number>;
  features: {
    synonymsViews: number;
    translationsViews: number;
    detailViewOpens: number;
    predictedTranslationsViews: number;
    predictedTranslationsFailed: number;
    abbreviatedTranslationsViews: number;
    abbreviatedTranslationsFailed: number;
  };
}

export interface PredictedTranslation {
  language: string;
  value: string;
}

export interface ElectronAPI {
  searchStrings: (query: string, language: string) => Promise<SearchResult[]>;
  getLanguages: () => Promise<string[]>;
  getFolderPath: () => Promise<string | null>;
  validateFolderPath: (path: string) => Promise<boolean>;
  setFolderPath: (path: string) => Promise<boolean>;
  browseFolderPath: () => Promise<string | null>;
  gitPull: () => Promise<boolean>;
  getLastUpdateTime: () => Promise<string>;
  copyToClipboard: (text: string) => Promise<boolean>;
  saveSearchHistory: (query: string) => Promise<boolean>;
  getSearchHistory: () => Promise<string[]>;
  searchTranslations: (stringId: string) => Promise<SearchResult[]>;
  searchSynonyms: (searchQuery: string, targetLanguage: string) => Promise<SynonymSearchResult>;
  getPredictedTranslations: (query: string) => Promise<PredictedTranslation[]>;
  getAbbreviatedTranslations: (originalEnglish: string, formalTranslations: PredictedTranslation[], languagesToAbbreviate: string[]) => Promise<PredictedTranslation[]>;
  trackSearch: (language: string) => Promise<boolean>;
  trackGitPull: () => Promise<boolean>;
  trackSynonymsView: () => Promise<boolean>;
  trackTranslationsView: () => Promise<boolean>;
  trackDetailViewOpen: () => Promise<boolean>;
  trackPredictedTranslations: () => Promise<boolean>;
  trackPredictedTranslationsFailed: () => Promise<boolean>;
  trackAbbreviatedTranslations: () => Promise<boolean>;
  trackAbbreviatedTranslationsFailed: () => Promise<boolean>;
  getAnalyticsData: () => Promise<AnalyticsData>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
