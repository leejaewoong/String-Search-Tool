import { fileService } from './fileService';

const SEMANTIC_SIMILARITY_THRESHOLD = 0.7;

interface SearchResult {
  id: string;
  value: string;
  filename: string;
  length: number;
}

class SearchService {
  search(query: string, language: string): SearchResult[] {
    const fileData = fileService.getFileData(language);
    if (!fileData) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const [id, value] of Object.entries(fileData)) {
      const lowerValue = value.toLowerCase();
      const lowerId = id.toLowerCase();

      const matchesId = lowerId.includes(lowerQuery);
      const matchesValue = lowerValue.includes(lowerQuery);

      // 추가 문자 체크: 검색어가 값에 포함되고, 값이 검색어만 포함하거나 검색어의 일부여야 함
      const isExactOrSubstring =
        lowerValue === lowerQuery ||
        lowerQuery.includes(lowerValue);

      if ((matchesId || matchesValue) && isExactOrSubstring) {
        results.push({
          id,
          value,
          filename: `ui_${language}.json`,
          length: value.length,
        });
      }
    }

    // 정렬: 1. 글자수 내림차순, 2. 파일명 오름차순
    results.sort((a, b) => {
      if (a.length !== b.length) {
        return b.length - a.length;
      }
      return a.filename.localeCompare(b.filename);
    });

    return results;
  }

  searchTranslations(stringId: string): SearchResult[] {
    const allFiles = fileService.getAllFiles();
    const results: SearchResult[] = [];

    for (const [lang, data] of allFiles.entries()) {
      if (data[stringId]) {
        results.push({
          id: stringId,
          value: data[stringId],
          filename: lang,
          length: data[stringId].length,
        });
      }
    }

    // 글자수 내림차순 정렬
    results.sort((a, b) => b.length - a.length);

    return results;
  }

  // TODO: 유의어 검색 구현 (natural 라이브러리)
  searchSynonyms(query: string, language: string): SearchResult[] {
    // 향후 구현
    return [];
  }
}

export const searchService = new SearchService();
