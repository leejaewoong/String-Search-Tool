import { fileService } from './fileService';

const SEMANTIC_SIMILARITY_THRESHOLD = 0.7;

interface SearchResult {
  id: string;
  value: string;
  filename: string;
  length: number;
  distance?: number;
}

class SearchService {
  // 레벤슈타인 거리 계산 (두 문자열의 차이)
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[len1][len2];
  }

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

      if (matchesId || matchesValue) {
        const distance = this.levenshteinDistance(lowerQuery, lowerValue);
        results.push({
          id,
          value,
          filename: `ui_${language}.json`,
          length: value.length,
          distance,
        });
      }
    }

    // 정렬: 레벤슈타인 거리 오름차순 (차이가 적은 순)
    results.sort((a, b) => {
      return (a.distance || 0) - (b.distance || 0);
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
