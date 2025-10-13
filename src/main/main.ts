import { app, BrowserWindow, ipcMain, dialog, clipboard } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import { fileService } from './fileService';
import { searchService } from './searchService';
import { gitService } from './gitService';

const store = new Store();
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  registerIpcHandlers();

  // 저장된 경로 자동 로드
  const savedPath = store.get('folderPath') as string;
  if (savedPath) {
    fileService.loadFiles(savedPath).catch(console.error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function registerIpcHandlers() {
  // 검색
  ipcMain.handle('search-strings', async (event, query, language) => {
    return searchService.search(query, language);
  });

  // 번역 확인
  ipcMain.handle('search-translations', async (event, stringId) => {
    return searchService.searchTranslations(stringId);
  });

  // 언어 목록
  ipcMain.handle('get-languages', async () => {
    return fileService.getLanguages();
  });

  // 폴더 선택
  ipcMain.handle('browse-folder-path', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    return result.canceled ? null : result.filePaths[0];
  });

  // 경로 설정
  ipcMain.handle('set-folder-path', async (event, folderPath) => {
    store.set('folderPath', folderPath);
    await fileService.loadFiles(folderPath);
    return true;
  });

  // Git Pull
  ipcMain.handle('git-pull', async () => {
    const folderPath = store.get('folderPath') as string;
    if (!folderPath) {
      throw new Error('경로가 설정되지 않았습니다.');
    }
    await gitService.pull(folderPath);
    await fileService.loadFiles(folderPath);
    return true;
  });

  // 마지막 업데이트 시간
  ipcMain.handle('get-last-update-time', async () => {
    const folderPath = store.get('folderPath') as string;
    if (!folderPath) {
      return null;
    }
    return gitService.getLastCommitTime(folderPath);
  });

  // 클립보드 복사
  ipcMain.handle('copy-to-clipboard', async (event, text) => {
    clipboard.writeText(text);
    return true;
  });

  // 검색 히스토리
  ipcMain.handle('save-search-history', async (event, query) => {
    let history = (store.get('searchHistory') as string[]) || [];
    history = [query, ...history.filter(q => q !== query)].slice(0, 10);
    store.set('searchHistory', history);
    return true;
  });

  ipcMain.handle('get-search-history', async () => {
    return (store.get('searchHistory') as string[]) || [];
  });
}
