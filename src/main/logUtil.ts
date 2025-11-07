import log from 'electron-log';
import { BrowserWindow } from 'electron';

// electron-log 설정
log.transports.file.level = 'info';
log.transports.console.level = 'info';

// 로그 파일 경로를 사용자 데이터 디렉토리에 설정
// Windows: C:\Users\{username}\AppData\Roaming\{appName}\logs\main.log
// macOS: ~/Library/Logs/{appName}/main.log
// Linux: ~/.config/{appName}/logs/main.log

/**
 * Renderer 프로세스로 로그 전달
 */
function sendLogToRenderer(level: 'info' | 'warn' | 'error', message: string, ...args: any[]) {
  try {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('main-process-log', {
        level,
        message,
        args,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Renderer로 전송 실패 시 무시 (앱 초기화 중이거나 창이 닫힌 경우)
  }
}

/**
 * Info 레벨 로그 (파일 + 콘솔 + DevTools)
 */
export function logInfo(message: string, ...args: any[]): void {
  log.info(message, ...args); // 파일 + 터미널 콘솔
  sendLogToRenderer('info', message, ...args); // DevTools 콘솔
}

/**
 * Warning 레벨 로그 (파일 + 콘솔 + DevTools)
 */
export function logWarn(message: string, ...args: any[]): void {
  log.warn(message, ...args);
  sendLogToRenderer('warn', message, ...args);
}

/**
 * Error 레벨 로그 (파일 + 콘솔 + DevTools)
 */
export function logError(message: string, ...args: any[]): void {
  log.error(message, ...args);
  sendLogToRenderer('error', message, ...args);
}

/**
 * 로그 파일 경로 반환
 */
export function getLogFilePath(): string {
  return log.transports.file.getFile().path;
}

/**
 * electron-log 인스턴스 export (필요 시 직접 사용)
 */
export { log };
