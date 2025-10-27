// 언어 코드별 메타데이터
interface LanguageMetadata {
  name: string;
  nativeName: string;
  countries: string[];
}

export const LANGUAGE_METADATA: Record<string, LanguageMetadata> = {
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    countries: ['사우디아라비아', '이집트', 'UAE', '이라크', '요르단', '레바논']
  },
  ca: {
    name: 'Catalan',
    nativeName: 'Català',
    countries: ['스페인(카탈루냐)', '안도라']
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    countries: ['독일', '오스트리아', '스위스']
  },
  en: {
    name: 'English',
    nativeName: 'English',
    countries: ['미국', '영국', '캐나다', '호주']
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    countries: ['스페인', '멕시코', '콜롬비아', '아르헨티나']
  },
  'es-MX': {
    name: 'Spanish (Mexico)',
    nativeName: 'Español (México)',
    countries: ['멕시코']
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    countries: ['프랑스', '캐나다', '벨기에', '스위스']
  },
  'ga-IE': {
    name: 'Irish',
    nativeName: 'Gaeilge',
    countries: ['아일랜드']
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    countries: ['인도']
  },
  id: {
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    countries: ['인도네시아']
  },
  it: {
    name: 'Italian',
    nativeName: 'Italiano',
    countries: ['이탈리아', '스위스']
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    countries: ['일본']
  },
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    countries: ['대한민국', '북한']
  },
  ku: {
    name: 'Kurdish',
    nativeName: 'Kurdî',
    countries: ['이라크', '터키', '이란', '시리아']
  },
  pl: {
    name: 'Polish',
    nativeName: 'Polski',
    countries: ['폴란드']
  },
  pt: {
    name: 'Portuguese',
    nativeName: 'Português',
    countries: ['포르투갈', '브라질', '앙골라', '모잠비크']
  },
  'pt-BR': {
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    countries: ['브라질']
  },
  ru: {
    name: 'Russian',
    nativeName: 'Русский',
    countries: ['러시아', '벨라루스', '카자흐스탄']
  },
  th: {
    name: 'Thai',
    nativeName: 'ไทย',
    countries: ['태국']
  },
  tr: {
    name: 'Turkish',
    nativeName: 'Türkçe',
    countries: ['터키', '키프로스']
  },
  uk: {
    name: 'Ukrainian',
    nativeName: 'Українська',
    countries: ['우크라이나']
  },
  ur: {
    name: 'Urdu',
    nativeName: 'اردو',
    countries: ['파키스탄', '인도']
  },
  vi: {
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    countries: ['베트남']
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    countries: ['중국', '대만', '싱가포르']
  },
  'zh-CN': {
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    countries: ['중국', '싱가포르']
  },
  'zh-TW': {
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    countries: ['대만', '홍콩', '마카오']
  }
};

/**
 * 언어 코드에 대한 툴팁 텍스트 생성
 */
export function getLanguageTooltip(languageCode: string): string {
  const metadata = LANGUAGE_METADATA[languageCode];

  if (!metadata) {
    return languageCode.toUpperCase();
  }

  const countries = metadata.countries.join(', ');
  return `${metadata.name}\n주요 사용 국가: ${countries}`;
}

/**
 * 언어 코드에 대한 완전한 이름 가져오기
 */
export function getLanguageName(languageCode: string): string {
  const metadata = LANGUAGE_METADATA[languageCode];
  return metadata ? metadata.name : languageCode.toUpperCase();
}

/**
 * 언어의 원어 이름 가져오기
 */
export function getLanguageNativeName(languageCode: string): string {
  const metadata = LANGUAGE_METADATA[languageCode];
  return metadata ? metadata.nativeName : languageCode.toUpperCase();
}

/**
 * 언어의 주요 사용 국가 목록 가져오기
 */
export function getLanguageCountries(languageCode: string): string[] {
  const metadata = LANGUAGE_METADATA[languageCode];
  return metadata ? metadata.countries : [];
}
