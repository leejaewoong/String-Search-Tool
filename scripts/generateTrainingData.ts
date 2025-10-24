import * as fs from 'fs';
import * as path from 'path';

interface TranslationData {
  [key: string]: string;
}

interface TranslationRecord {
  key: string;
  en: string;
  translations: {
    [lang: string]: string;
  };
}

// 지원 언어 목록 (en 제외)
const SUPPORTED_LANGUAGES = [
  'ar', 'ca', 'de', 'es', 'es-MX', 'fr', 'ga-IE', 'hi', 'id', 'it',
  'ja', 'ko', 'ku', 'pl', 'pt', 'pt-BR', 'ru', 'th', 'tr', 'uk',
  'ur', 'vi', 'zh', 'zh-CN', 'zh-TW'
];

function loadTranslationFile(filePath: string): TranslationData {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load ${filePath}:`, error);
    return {};
  }
}

function loadAllTranslations(folderPath: string): TranslationRecord[] {
  console.log('📁 Loading translation files from:', folderPath);

  // 영어(기준) 파일 로드
  const enPath = path.join(folderPath, 'ui_en.json');
  const enData = loadTranslationFile(enPath);

  if (Object.keys(enData).length === 0) {
    throw new Error('English translation file is empty or not found');
  }

  console.log(`✅ Loaded English: ${Object.keys(enData).length} keys`);

  // 모든 다른 언어 파일 로드
  const allLanguageData: { [lang: string]: TranslationData } = {};

  for (const lang of SUPPORTED_LANGUAGES) {
    const langPath = path.join(folderPath, `ui_${lang}.json`);
    if (fs.existsSync(langPath)) {
      allLanguageData[lang] = loadTranslationFile(langPath);
      console.log(`✅ Loaded ${lang}: ${Object.keys(allLanguageData[lang]).length} keys`);
    } else {
      console.log(`⚠️  Skipped ${lang}: file not found`);
    }
  }

  // 영어 키를 기준으로 모든 번역 병합
  const records: TranslationRecord[] = [];

  for (const key in enData) {
    const enValue = enData[key];

    // 빈 값 제외
    if (!enValue || enValue.trim() === '') {
      continue;
    }

    const translations: { [lang: string]: string } = {};
    let hasAllTranslations = true;

    // 모든 언어의 번역 수집
    for (const lang of SUPPORTED_LANGUAGES) {
      if (allLanguageData[lang] && allLanguageData[lang][key]) {
        const translatedValue = allLanguageData[lang][key];

        // 빈 번역 제외
        if (translatedValue && translatedValue.trim() !== '') {
          translations[lang] = translatedValue;
        } else {
          hasAllTranslations = false;
        }
      } else {
        hasAllTranslations = false;
      }
    }

    // 모든 언어에 번역이 있는 경우만 포함
    if (hasAllTranslations && Object.keys(translations).length === SUPPORTED_LANGUAGES.length) {
      records.push({
        key,
        en: enValue,
        translations
      });
    }
  }

  return records;
}

function generateJSONL(records: TranslationRecord[], outputPath: string): void {
  console.log('\n📝 Generating JSONL training data...');

  const lines: string[] = [];

  // 언어 코드 목록 생성 (알파벳 순)
  const langCodes = SUPPORTED_LANGUAGES.sort().join(', ');

  for (const record of records) {
    // System message: AI의 역할 정의
    const systemMessage = {
      role: 'system',
      content: 'You are a professional game UI localization expert. Translate English text to multiple languages following game industry localization standards and UI text conventions.'
    };

    // User message: 번역 요청
    const userMessage = {
      role: 'user',
      content: `Translate the following English text to all supported languages (${langCodes}):\n\n"${record.en}"`
    };

    // Assistant message: 번역 결과 (JSON 형식)
    const assistantMessage = {
      role: 'assistant',
      content: JSON.stringify(record.translations)
    };

    // JSONL 형식: 한 줄에 하나의 JSON 객체
    const sample = {
      messages: [systemMessage, userMessage, assistantMessage]
    };

    lines.push(JSON.stringify(sample));
  }

  // 파일 저장
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');

  console.log(`\n✅ Training data generated successfully!`);
  console.log(`📊 Total samples: ${lines.length}`);
  console.log(`📁 Saved to: ${outputPath}`);

  // 통계 정보
  const fileSize = fs.statSync(outputPath).size;
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
  console.log(`📦 File size: ${fileSizeMB} MB`);

  // 예상 토큰 수 (대략적인 계산: 1 token ≈ 4 characters)
  const totalChars = lines.reduce((sum, line) => sum + line.length, 0);
  const estimatedTokens = Math.round(totalChars / 4);
  console.log(`🔢 Estimated tokens: ${estimatedTokens.toLocaleString()}`);

  // 예상 학습 비용 (GPT-4o-mini: $3.00 per 1M tokens)
  const trainingCostUSD = (estimatedTokens / 1_000_000) * 3.0;
  const trainingCostKRW = Math.round(trainingCostUSD * 1330);
  console.log(`💰 Estimated training cost: $${trainingCostUSD.toFixed(2)} (₩${trainingCostKRW.toLocaleString()})`);

  // 첫 번째 샘플 미리보기
  if (lines.length > 0) {
    console.log('\n📋 Sample preview (first entry):');
    const firstSample = JSON.parse(lines[0]);
    console.log('English:', records[0].en);
    console.log('Translations:', Object.keys(records[0].translations).length, 'languages');
    console.log('Sample languages:');
    const sampleLangs = ['ko', 'ja', 'zh', 'es', 'de', 'fr'];
    for (const lang of sampleLangs) {
      if (records[0].translations[lang]) {
        console.log(`  - ${lang}: ${records[0].translations[lang]}`);
      }
    }
  }
}

function validateJSONL(filePath: string): boolean {
  console.log('\n🔍 Validating JSONL file...');

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    let validLines = 0;
    let invalidLines = 0;

    for (let i = 0; i < lines.length; i++) {
      try {
        const sample = JSON.parse(lines[i]);

        // 필수 구조 검증
        if (!sample.messages || !Array.isArray(sample.messages)) {
          throw new Error('Missing or invalid "messages" field');
        }

        if (sample.messages.length !== 3) {
          throw new Error(`Expected 3 messages, got ${sample.messages.length}`);
        }

        const [system, user, assistant] = sample.messages;

        if (system.role !== 'system' || !system.content) {
          throw new Error('Invalid system message');
        }

        if (user.role !== 'user' || !user.content) {
          throw new Error('Invalid user message');
        }

        if (assistant.role !== 'assistant' || !assistant.content) {
          throw new Error('Invalid assistant message');
        }

        // Assistant content가 유효한 JSON인지 확인
        JSON.parse(assistant.content);

        validLines++;
      } catch (error) {
        console.error(`❌ Line ${i + 1} is invalid:`, (error as Error).message);
        invalidLines++;

        // 처음 5개 오류만 출력
        if (invalidLines >= 5) {
          console.log('⚠️  Too many errors, stopping validation...');
          break;
        }
      }
    }

    console.log(`\n📊 Validation results:`);
    console.log(`  ✅ Valid lines: ${validLines}`);
    console.log(`  ❌ Invalid lines: ${invalidLines}`);

    return invalidLines === 0;
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

// 메인 실행
function main() {
  const args = process.argv.slice(2);

  // 기본 경로
  const defaultInputPath = 'C:\\Users\\iamle\\바탕 화면\\game-design-data\\localization\\ui';
  const defaultOutputPath = path.join(__dirname, '..', 'training_data.jsonl');

  const inputPath = args[0] || defaultInputPath;
  const outputPath = args[1] || defaultOutputPath;

  console.log('🚀 Starting training data generation...\n');
  console.log('📂 Input folder:', inputPath);
  console.log('📄 Output file:', outputPath);
  console.log('🌍 Supported languages:', SUPPORTED_LANGUAGES.length);
  console.log('   ', SUPPORTED_LANGUAGES.join(', '));
  console.log('');

  try {
    // 입력 폴더 확인
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input folder not found: ${inputPath}`);
    }

    // 번역 데이터 로드
    const records = loadAllTranslations(inputPath);

    if (records.length === 0) {
      throw new Error('No complete translation records found');
    }

    // JSONL 생성
    generateJSONL(records, outputPath);

    // 검증
    const isValid = validateJSONL(outputPath);

    if (isValid) {
      console.log('\n✅ All done! Training data is ready for fine-tuning.');
      console.log('\n📚 Next steps:');
      console.log('1. Upload to OpenAI: https://platform.openai.com/finetune');
      console.log('2. Or use OpenAI CLI:');
      console.log(`   openai api files.create -f "${outputPath}" -p fine-tune`);
      console.log('3. Create fine-tuning job:');
      console.log('   openai api fine_tuning.jobs.create -t <file-id> -m gpt-4o-mini-2024-07-18');
    } else {
      console.log('\n⚠️  Validation found issues. Please check the output file.');
    }
  } catch (error) {
    console.error('\n❌ Error:', (error as Error).message);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main();
}

export { loadAllTranslations, generateJSONL, validateJSONL };
