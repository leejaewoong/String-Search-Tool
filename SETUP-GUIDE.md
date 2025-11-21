# String-Search 설정 및 실행 가이드

## 📁 프로젝트 구조

```
String-Finder/
├── src/
│   ├── main/                 # Electron 메인 프로세스
│   │   ├── main.ts          # 메인 진입점
│   │   ├── fileService.ts   # JSON 파일 읽기/캐싱
│   │   ├── searchService.ts # 검색 로직
│   │   ├── gitService.ts    # Git Pull 기능
│   │   ├── openaiService.ts # OpenAI API 연동
│   │   ├── wordnetService.ts # 유의어 검색
│   │   └── analyticsService.ts # 사용 로그 수집
│   ├── renderer/             # React 렌더러
│   │   ├── App.tsx          # 메인 앱 컴포넌트
│   │   ├── index.tsx        # 렌더러 진입점
│   │   ├── types/           # TypeScript 타입 정의
│   │   ├── styles/          # Tailwind CSS 스타일
│   │   └── components/      # React 컴포넌트
│   │       ├── SearchBar.tsx          # 검색 입력
│   │       ├── SearchResults.tsx      # 검색 결과 목록
│   │       ├── DetailView.tsx         # 상세 번역 보기
│   │       ├── PredictedTranslations.tsx # AI 번역 결과
│   │       ├── Settings.tsx           # 설정 화면
│   │       └── RecentSearches.tsx     # 최근 검색 기록
│   └── preload/             # IPC 브릿지
│       └── preload.ts
├── public/
│   └── index.html           # HTML 템플릿
├── build/                    # 빌드 출력 & 아이콘
│   └── openai.svg           # OpenAI 아이콘
├── package.json             # 의존성 및 스크립트
├── tsconfig.json            # TypeScript 설정
├── webpack.config.js        # Webpack 설정
├── tailwind.config.js       # Tailwind CSS 설정
└── electron-builder.json    # 배포 설정
```

## 🚀 실행 방법

### 개발 모드

**터미널 1** - Webpack Dev Server 실행:
```bash
npm run dev
```

**터미널 2** - Electron 실행:
```bash
npm run electron:dev
```

> 💡 팁: 두 터미널을 동시에 열어두고 실행해야 합니다.

### 프로덕션 빌드 및 실행

```bash
npm run build    # 빌드
npm run electron # 실행
```

또는 한 번에:
```bash
npm start
```

### 자주 발생하는 오류와 해결
- Error launching app / Cannot find module '...build\\main.js'
  - 원인: 빌드 산출물(`build/main.js`)이 없음
  - 해결: `npm run build` 또는 `npm start`를 먼저 실행

## 📦 배포 파일 생성

### ⚠️ 중요: 관리자 권한 필요

Windows에서 배포 파일 생성 시 **관리자 권한**이 필요합니다.

**방법 1: Git Bash를 관리자 권한으로 실행**
1. 시작 메뉴에서 "Git Bash" 검색
2. 우클릭 → "관리자 권한으로 실행"
3. 프로젝트 폴더로 이동 후 빌드:
   ```bash
   cd "c:\Users\iamle\바탕 화면\project\String-Finder"
   npm run release
   ```

**방법 2: VSCode를 관리자 권한으로 실행**
1. VSCode 종료
2. 시작 메뉴에서 "Visual Studio Code" 검색
3. 우클릭 → "관리자 권한으로 실행"
4. 터미널에서 `npm run release` 실행

**방법 3: Windows 개발자 모드 활성화 (권장)**
1. Windows 설정 (Win + I)
2. **개인 정보 보호 및 보안** → **개발자용**
3. **개발자 모드** 토글 켜기
4. PC 재시작
5. 이후부터는 일반 권한으로 빌드 가능

### Windows 인스톨러 + 포터블 버전 생성:
```bash
npm run release
```

생성되는 파일:
- `dist/String-Finder-{version}-x64.exe` (인스톨러)
- `dist/String-Finder-{version}-portable.exe` (포터블)

### 개별 빌드:
```bash
npm run dist:win       # 인스톨러만
npm run dist:portable  # 포터블만
```

### 💡 인스톨러 vs 포터블 버전

**인스톨러 (`String-Finder-{version}-x64.exe`)**
- Windows에 **설치**가 필요
- Program Files에 파일 복사
- 시작 메뉴에 바로가기 생성
- 제어판에서 제거 가능
- **일반 사용자에게 권장**

**포터블 버전 (`String-Finder-{version}-portable.exe`)**
- **설치 불필요**, 실행 파일 하나로 완결
- USB 드라이브에 담아 어디서든 실행 가능
- 시스템에 흔적을 남기지 않음
- 관리자 권한이 없는 환경에서 유용

### 📤 배포 방법

다른 사용자에게는 **인스톨러 파일 하나만 공유**하면 됩니다:
- `String-Finder-{version}-x64.exe` 파일만 전달
- 사용자가 더블클릭하여 설치
- 설치 후 시작 메뉴에서 실행

## 🎯 첫 실행 가이드

### 개발자 모드

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정 (선택사항 - AI 번역 기능 사용 시)**
   ```bash
   # .env 파일 생성
   cp .env.example .env

   # .env 파일 수정
   OPENAI_API_KEY=your-actual-api-key-here
   OPENAI_MODEL=ft:gpt-4o-mini-2024-07-18:your-org:custom:abc123  # 선택사항
   ```

3. **앱 실행**
   ```bash
   npm run dev          # 터미널 1
   npm run electron:dev # 터미널 2
   ```

### 최종 사용자 모드

1. **설치 파일 다운로드**
   - `String-Finder-{version}-x64.exe` 다운로드
   - 파일 더블클릭하여 설치

2. **경로 설정**
   - 우측 상단 ⚙️ 버튼 클릭
   - `game-design-data/localization/ui` 폴더 선택
   - 확인 버튼 클릭

3. **Git Pull로 데이터 최신화 (선택사항)**
   - 좌측 상단 🔄 버튼 클릭
   - 최신 번역 데이터 자동 업데이트
   - (Git이 설치되어 있어야 함)

4. **검색 시작**
   - 언어 선택
   - 검색어 입력 후 Enter

## 🔧 문제 해결

### 패키지 설치 오류
```bash
rm -rf node_modules package-lock.json
npm install
```

### 빌드 오류
```bash
npm run build
# 에러 메시지 확인 후 해당 파일 수정
```

## 📝 주요 스크립트

| 스크립트 | 설명 |
|---------|------|
| `npm run dev` | Webpack Dev Server 실행 (포트 3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run electron` | Electron 앱 실행 |
| `npm run electron:dev` | 개발 모드로 Electron 실행 |
| `npm start` | 빌드 후 실행 |
| `npm run release` | 배포 파일 생성 (인스톨러 + 포터블) |
| `npm run dist:win` | Windows 인스톨러만 생성 |
| `npm run dist:portable` | 포터블 버전만 생성 |

## 🎨 UI 커스터마이징

Figma 스타일 테마는 `tailwind.config.js`에서 수정 가능:

```javascript
colors: {
  'figma-bg': '#2c2c2c',        // 배경색
  'figma-surface': '#383838',   // 컴포넌트 배경
  'figma-primary': '#18a0fb',   // 기본 버튼 색상
  // ...
}
```

## 📊 로그 수집 안내

본 프로그램은 개선을 위해 익명 사용 로그를 수집합니다.

**수집하는 정보:**
- 기능 사용 횟수 (검색, 상세보기, AI 번역, Git Pull 등)
- 세션 지속 시간
- 오류 발생 빈도

**수집하지 않는 정보:**
- 검색어 내용
- 사용자 개인정보
- 파일 경로 또는 데이터 내용

## 📚 기술 스택

- **프레임워크**: Electron 28
- **UI 라이브러리**: React 18
- **빌드 도구**: Webpack 5
- **스타일링**: Tailwind CSS 3
- **언어**: TypeScript 5
- **AI 모델**: OpenAI GPT-4o-mini (Fine-tuned)
- **유의어 검색**: WordNet
- **분석**: Google Analytics 4

---

**제작:** Jaewoong Lee (이재웅) 
