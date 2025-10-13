export interface SearchResult {
  id: string;
  value: string;
  filename: string;
}

export interface ElectronAPI {
  searchStrings: (query: string, language: string) => Promise<SearchResult[]>;
  getLanguages: () => Promise<string[]>;
  setFolderPath: (path: string) => Promise<boolean>;
  browseFolderPath: () => Promise<string | null>;
  gitPull: () => Promise<boolean>;
  getLastUpdateTime: () => Promise<string>;
  copyToClipboard: (text: string) => Promise<boolean>;
  saveSearchHistory: (query: string) => Promise<boolean>;
  getSearchHistory: () => Promise<string[]>;
  searchTranslations: (stringId: string) => Promise<SearchResult[]>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
