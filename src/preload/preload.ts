import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  searchStrings: (query: string, language: string) =>
    ipcRenderer.invoke('search-strings', query, language),

  getLanguages: () =>
    ipcRenderer.invoke('get-languages'),

  getFolderPath: () =>
    ipcRenderer.invoke('get-folder-path'),

  validateFolderPath: (path: string) =>
    ipcRenderer.invoke('validate-folder-path', path),

  setFolderPath: (path: string) =>
    ipcRenderer.invoke('set-folder-path', path),

  browseFolderPath: () =>
    ipcRenderer.invoke('browse-folder-path'),

  gitPull: () =>
    ipcRenderer.invoke('git-pull'),

  getLastUpdateTime: () =>
    ipcRenderer.invoke('get-last-update-time'),

  copyToClipboard: (text: string) =>
    ipcRenderer.invoke('copy-to-clipboard', text),

  saveSearchHistory: (query: string) =>
    ipcRenderer.invoke('save-search-history', query),

  getSearchHistory: () =>
    ipcRenderer.invoke('get-search-history'),

  searchTranslations: (stringId: string) =>
    ipcRenderer.invoke('search-translations', stringId),

  searchSynonyms: (searchQuery: string, targetLanguage: string) =>
    ipcRenderer.invoke('search-synonyms', searchQuery, targetLanguage),

  getPredictedTranslations: (query: string) =>
    ipcRenderer.invoke('get-predicted-translations', query),

  getAbbreviatedTranslations: (originalEnglish: string, formalTranslations: any[], languagesToAbbreviate: string[]) =>
    ipcRenderer.invoke('get-abbreviated-translations', originalEnglish, formalTranslations, languagesToAbbreviate),

  // Analytics
  trackSearch: (language: string) =>
    ipcRenderer.invoke('track-search', language),

  trackGitPull: () =>
    ipcRenderer.invoke('track-git-pull'),

  trackSynonymsView: (source?: 'search' | 'noResult') =>
    ipcRenderer.invoke('track-synonyms-view', source),

  trackTranslationsView: (source: 'gdd' | 'synonym') =>
    ipcRenderer.invoke('track-translations-view', source),

  trackPredictedTranslations: (source?: 'search' | 'noResult') =>
    ipcRenderer.invoke('track-predicted-translations', source),

  trackPredictedTranslationsFailed: () =>
    ipcRenderer.invoke('track-predicted-translations-failed'),

  trackAbbreviatedTranslations: () =>
    ipcRenderer.invoke('track-abbreviated-translations'),

  trackAbbreviatedTranslationsFailed: () =>
    ipcRenderer.invoke('track-abbreviated-translations-failed'),

  getAnalyticsData: () =>
    ipcRenderer.invoke('get-analytics-data'),

  trackGuideButtonClick: () =>
    ipcRenderer.invoke('track-guide-button-click'),

  trackPatchNotesButtonClick: () =>
    ipcRenderer.invoke('track-patch-notes-button-click'),

  getAppVersion: () =>
    ipcRenderer.invoke('get-app-version'),

  openExternal: (url: string) =>
    ipcRenderer.invoke('open-external', url),

  getPatchNotes: () =>
    ipcRenderer.invoke('get-patch-notes'),
});
