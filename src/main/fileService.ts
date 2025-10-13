import * as fs from 'fs';
import * as path from 'path';

const EXCLUDE_FILES = ['_do_not_use_ui_en_dev.json'];

interface FileData {
  [key: string]: string;
}

class FileService {
  private cachedFiles: Map<string, FileData> = new Map();
  private languages: string[] = [];

  async loadFiles(folderPath: string): Promise<void> {
    this.cachedFiles.clear();
    this.languages = [];

    if (!fs.existsSync(folderPath)) {
      throw new Error(`폴더를 찾을 수 없습니다: ${folderPath}`);
    }

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      if (!file.startsWith('ui_') || !file.endsWith('.json')) {
        continue;
      }

      if (EXCLUDE_FILES.includes(file)) {
        continue;
      }

      const filePath = path.join(folderPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content) as FileData;

      // 언어 코드 추출 (ui_ko.json -> ko)
      const langMatch = file.match(/ui_(.+)\.json/);
      if (langMatch) {
        const lang = langMatch[1];
        this.languages.push(lang);
        this.cachedFiles.set(lang, data);
      }
    }

    // 언어 알파벳 순 정렬, KO를 맨 앞으로
    this.languages.sort((a, b) => {
      if (a === 'ko') return -1;
      if (b === 'ko') return 1;
      return a.localeCompare(b);
    });
  }

  getLanguages(): string[] {
    return this.languages;
  }

  getFileData(language: string): FileData | undefined {
    return this.cachedFiles.get(language);
  }

  getAllFiles(): Map<string, FileData> {
    return this.cachedFiles;
  }
}

export const fileService = new FileService();
