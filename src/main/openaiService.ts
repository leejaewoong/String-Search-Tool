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

  // Fine-tuned 모델 설정
  setModel(modelId: string) {
    this.model = modelId;
  }
}

export const openaiService = new OpenAIService();
