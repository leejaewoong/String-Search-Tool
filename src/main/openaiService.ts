import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

interface PredictedTranslation {
  language: string;
  value: string;
}

// 지원하는 언어 목록
const SUPPORTED_LANGUAGES = [
  'ar', 'ca', 'de', 'es', 'es-MX', 'fr', 'ga-IE', 'hi', 'id', 'it',
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

  async getPredictedTranslations(englishText: string): Promise<PredictedTranslation[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다. .env 파일에 OPENAI_API_KEY를 추가해주세요.');
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
              content: 'You are a professional game UI localization expert. Translate English text to multiple languages following game industry localization standards and UI text conventions.'
            },
            {
              role: 'user',
              content: `Translate the following English text to all supported languages (${langCodes}):\n\n"${englishText}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
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

      // JSON 파싱
      const translationsObj = JSON.parse(content);

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
