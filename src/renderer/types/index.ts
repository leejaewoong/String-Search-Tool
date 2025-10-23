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
  searchSynonyms: (stringId: string, targetLanguage: string) => Promise<SynonymSearchResult>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
