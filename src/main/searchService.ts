import { fileService } from './fileService';
const natural = require('natural');

const SEMANTIC_SIMILARITY_THRESHOLD = 0.7;

interface SearchResult {
  id: string;
  value: string;
  filename: string;
  length: number;
  distance?: number;
  matchType?: 'direct' | 'synonym'; // 직접 매칭 vs 유의어 매칭
  synonymSource?: string; // 유의어인 경우 원본 영어 단어
}

interface SynonymSearchResult {
  results: SearchResult[];
  synonymsList: string[]; // WordNet에서 찾은 모든 유의어 목록
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

  // 영어 단어에서 WordNet 유의어 추출 (최대 10개)
  private async getWordNetSynonyms(word: string): Promise<string[]> {
    return new Promise((resolve) => {
      const wordnet = new natural.WordNet();
      const synonyms = new Set<string>();

      wordnet.lookup(word, (results: any[]) => {
        results.forEach((result) => {
          if (result.synonyms && result.synonyms.length > 0) {
            result.synonyms.forEach((syn: string) => {
              // 언더스코어를 공백으로 변환 (time_of_year -> time of year)
              const cleanSyn = syn.replace(/_/g, ' ').toLowerCase();
              synonyms.add(cleanSyn);
            });
          }
        });

        // 원본 단어 제외
        synonyms.delete(word.toLowerCase());

        // 최대 10개로 제한
        resolve(Array.from(synonyms).slice(0, 10));
      });
    });
  }

  // 영어 JSON에서 특정 단어를 포함하는 STRING_ID 찾기
  private searchInEnglishData(searchWord: string): string[] {
    const englishData = fileService.getFileData('en');
    if (!englishData) {
      return [];
    }

    const lowerSearchWord = searchWord.toLowerCase();
    const matchedIds: string[] = [];

    for (const [id, value] of Object.entries(englishData)) {
      const lowerValue = value.toLowerCase();

      // 단어 경계를 고려한 매칭 (부분 문자열이 아닌 단어 단위)
      const words = lowerValue.split(/\s+/);
      if (words.includes(lowerSearchWord) || lowerValue.includes(lowerSearchWord)) {
        matchedIds.push(id);
      }
    }

    return matchedIds;
  }

  // 영어 단어를 목표 언어로 번역 (JSON 데이터 기반)
  private translateEnglishWord(englishWord: string, targetLanguage: string): string {
    // 영어가 목표 언어면 그대로 반환
    if (targetLanguage === 'en') {
      return englishWord;
    }

    const englishData = fileService.getFileData('en');
    const targetData = fileService.getFileData(targetLanguage);

    if (!englishData || !targetData) {
      return englishWord; // 번역 불가 시 원본 반환
    }

    const lowerWord = englishWord.toLowerCase();

    // 영어 JSON에서 단어를 포함하는 첫 번째 항목 찾기
    for (const [id, value] of Object.entries(englishData)) {
      const lowerValue = value.toLowerCase();
      const words = lowerValue.split(/\s+/);

      // 정확한 단어 매칭
      if (words.includes(lowerWord)) {
        // 해당 STRING_ID의 목표 언어 번역 반환
        if (targetData[id]) {
          // 번역에서도 해당 단어 부분만 추출 시도
          const targetWords = targetData[id].split(/\s+/);
          if (targetWords.length === 1) {
            return targetData[id]; // 단일 단어면 그대로 반환
          }
          // 여러 단어면 첫 번째 단어 반환 (근사치)
          return targetWords[0];
        }
      }
    }

    // 번역 못 찾으면 원본 반환
    return englishWord;
  }

  // 유의어 검색 (영어를 pivot 언어로 활용)
  async searchSynonyms(stringId: string, targetLanguage: string): Promise<SynonymSearchResult> {
    try {
      // 1. STRING_ID로 영어 번역 가져오기
      const englishData = fileService.getFileData('en');
      if (!englishData || !englishData[stringId]) {
        return { results: [], synonymsList: [] };
      }

      const englishValue = englishData[stringId];

      // 2. 영어 값에서 주요 단어 추출 (첫 단어 또는 주요 단어)
      const mainWords = englishValue
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2); // 2글자 이상 단어만

      if (mainWords.length === 0) {
        return { results: [], synonymsList: [] };
      }

      // 3. 각 주요 단어의 유의어 추출
      const allSynonyms = new Set<string>();
      for (const word of mainWords.slice(0, 3)) { // 최대 3개 단어만 처리
        const synonyms = await this.getWordNetSynonyms(word);
        synonyms.forEach(syn => allSynonyms.add(syn));
      }

      if (allSynonyms.size === 0) {
        return { results: [], synonymsList: [] };
      }

      // 4. 유의어로 영어 JSON에서 STRING_ID 찾기
      const relatedStringIds = new Set<string>();
      for (const synonym of allSynonyms) {
        const ids = this.searchInEnglishData(synonym);
        ids.forEach(id => {
          if (id !== stringId) { // 원본 ID 제외
            relatedStringIds.add(id);
          }
        });
      }

      // 5. 찾은 STRING_ID들을 목표 언어로 변환
      const targetData = fileService.getFileData(targetLanguage);
      if (!targetData) {
        return { results: [], synonymsList: Array.from(allSynonyms) };
      }

      const results: SearchResult[] = [];
      for (const id of relatedStringIds) {
        if (targetData[id]) {
          results.push({
            id,
            value: targetData[id],
            filename: `ui_${targetLanguage}.json`,
            length: targetData[id].length,
            matchType: 'synonym',
          });
        }
      }

      // 6. 레벤슈타인 거리로 정렬 (원본과 가까운 순)
      const originalValue = targetData[stringId];
      if (originalValue) {
        results.forEach(result => {
          result.distance = this.levenshteinDistance(originalValue.toLowerCase(), result.value.toLowerCase());
        });

        results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      // 최대 50개로 제한하고 유의어 목록과 함께 반환
      return {
        results: results.slice(0, 50),
        synonymsList: Array.from(allSynonyms).sort(),
      };
    } catch (error) {
      console.error('유의어 검색 오류:', error);
      return { results: [], synonymsList: [] };
    }
  }
}

export const searchService = new SearchService();
