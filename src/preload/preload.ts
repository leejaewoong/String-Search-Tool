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

  searchSynonyms: (stringId: string, targetLanguage: string) =>
    ipcRenderer.invoke('search-synonyms', stringId, targetLanguage),
});
