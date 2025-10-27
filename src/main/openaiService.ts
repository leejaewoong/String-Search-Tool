import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

interface PredictedTranslation {
  language: string;
  value: string;
}

// 지원하는 언어 목록
const SUPPORTED_LANGUAGES = [
  'ar', 'ca', 'en', 'de', 'es', 'es-MX', 'fr', 'ga-IE', 'hi', 'id', 'it',
  'ja', 'ko', 'ku', 'pl', 'pt', 'pt-BR', 'ru', 'th', 'tr', 'uk',
  'ur', 'vi', 'zh', 'zh-CN', 'zh-TW'
];

class OpenAIService {
  private apiKey: string | undefined;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;    
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    console.log('[OpenAI] Using model:', this.model);
  }

  async getPredictedTranslations(text: string): Promise<PredictedTranslation[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    try {
      // 언어 코드 목록 생성
      const langCodes = SUPPORTED_LANGUAGES.join(', ');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional game UI localization expert. Translate text to multiple languages following game industry localization standards and UI text conventions. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: `Translate the following text to all supported languages (${langCodes}):\n\n"${text}"\n\nRespond with a JSON object where keys are language codes and values are translations. Example: {"ko":"번역","ja":"翻訳",...}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API 오류: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('OpenAI로부터 응답을 받지 못했습니다.');
      }

      console.log('[OpenAI] Raw response:', content.substring(0, 200));

      // JSON 파싱 시도
      let translationsObj: any;
      try {
        translationsObj = JSON.parse(content);
      } catch (parseError) {
        console.error('[OpenAI] JSON 파싱 실패. 응답 내용:', content);
        throw new Error(`OpenAI 응답이 JSON 형식이 아닙니다. 응답: ${content.substring(0, 100)}...`);
      }

      // PredictedTranslation 배열로 변환
      const translations: PredictedTranslation[] = [];
      for (const lang of SUPPORTED_LANGUAGES) {
        if (translationsObj[lang]) {
          translations.push({
            language: lang,
            value: translationsObj[lang]
          });
        }
      }

      // 글자수 내림차순 정렬 (searchService의 searchTranslations와 동일)
      translations.sort((a, b) => b.value.length - a.value.length);
      
      return translations;
    } catch (error) {
      console.error('OpenAI API 호출 실패:', error);
      throw error;
    }
  }

  async getAbbreviatedTranslations(
    originalEnglish: string,
    formalTranslations: PredictedTranslation[],
    languagesToAbbreviate: string[]
  ): Promise<PredictedTranslation[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    try {
      // 축약이 필요한 언어들의 정식 번역만 추출
      const translationsToAbbreviate = formalTranslations.filter(t =>
        languagesToAbbreviate.includes(t.language)
      );

      // 축약할 번역들을 JSON 형태로 변환
      const translationsJson: { [key: string]: string } = {};
      translationsToAbbreviate.forEach(t => {
        translationsJson[t.language] = t.value;
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are a professional game UI localization expert specializing in EXTREMELY space-constrained UI text (buttons, labels, tooltips). Your PRIMARY goal is to create the SHORTEST possible translation while maintaining core meaning.

                CRITICAL RULES - APPLY AGGRESSIVELY:
                1. ALWAYS abbreviate when possible - this is the default, not the exception
                2. Remove ALL articles (a, an, the, 그, 그것, la, le, etc.) unless grammatically essential
                3. Remove ALL auxiliary/helping verbs when meaning is clear without them
                4. Use standard abbreviations aggressively (Max, Min, Info, Num, Qty, Lvl, HP, MP, etc.)
                5. Remove redundant words - keep only the core noun/verb
                6. Prefer single words over phrases whenever possible
                7. Use symbols over words: % instead of "percent", + instead of "plus", etc.
                8. Remove polite/formal suffixes if casual form is acceptable in gaming context
                9. For compound concepts, use only the most essential word
                10. Only keep translation unchanged if it's ALREADY abbreviated (≤8 characters AND cannot be shortened further)

                ABBREVIATION INTENSITY BY LENGTH:
                - >25 characters: Reduce by at least 40%
                - 16-25 characters: Reduce by at least 30%
                - 10-15 characters: Reduce by at least 20%
                - <10 characters: Still try to shorten if possible

                EXAMPLES (notice the aggressive shortening):
                - "Maximum Health Points" → "Max HP" (65% reduction)
                - "Continue to Next Level" → "Continue" or "Next" (54-70% reduction)
                - "Player Statistics" → "Stats" (67% reduction)
                - "Inventory Management" → "Inventory" or "Items" (47-70% reduction)
                - "View Detailed Information" → "Details" or "Info" (67-79% reduction)
                - "Confirm Selection" → "Confirm" (47% reduction)
                - "戻る" (Japanese, 2 chars) → "戻る" (already minimal)
                - "設定を開く" → "設定" (remove verb when context is clear)
                - "Retour au menu" (French) → "Retour" or "Menu" (remove articles/prepositions)

                GAME UI CONTEXT: Buttons/labels must fit in small spaces. Brevity is MORE important than formality. When in doubt, ALWAYS choose the shorter option.`
            },
            {
              role: 'user',
              content: `Original English: "${originalEnglish}"
                Formal translations to abbreviate:
                ${JSON.stringify(translationsJson, null, 2)}
                TASK: Create AGGRESSIVELY shortened versions that are SIGNIFICANTLY shorter than originals. Apply all abbreviation rules intensively. The goal is MAXIMUM brevity while maintaining core meaning. Do NOT keep translations unchanged unless they are already at minimum length (≤8 characters AND cannot be shortened).
                Respond with ONLY a JSON object where keys are language codes and values are abbreviated translations.`
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API 오류: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('OpenAI로부터 응답을 받지 못했습니다.');
      }

      console.log('[OpenAI] Abbreviated response:', content.substring(0, 200));

      // JSON 파싱
      let abbreviatedObj: any;
      try {
        abbreviatedObj = JSON.parse(content);
      } catch (parseError) {
        console.error('[OpenAI] JSON 파싱 실패. 응답 내용:', content);
        throw new Error(`OpenAI 응답이 JSON 형식이 아닙니다.`);
      }

      // 정식 번역과 동일한 순서로 결과 구성
      const result: PredictedTranslation[] = formalTranslations.map(formal => {
        if (languagesToAbbreviate.includes(formal.language) && abbreviatedObj[formal.language]) {
          return {
            language: formal.language,
            value: abbreviatedObj[formal.language]
          };
        }
        // 축약 대상이 아닌 언어는 정식 번역 그대로 반환
        return formal;
      });

      return result;
    } catch (error) {
      console.error('축약 번역 API 호출 실패:', error);
      throw error;
    }
  }

  // Fine-tuned 모델 설정
  setModel(modelId: string) {
    this.model = modelId;
  }
}

export const openaiService = new OpenAIService();
