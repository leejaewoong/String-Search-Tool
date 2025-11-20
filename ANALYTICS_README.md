# Analytics 구현 가이드

## 개요

이 프로젝트에는 사용자 행동을 추적하는 Analytics 기능이 구현되어 있습니다. GA4(Google Analytics 4)로 실시간 이벤트를 전송하고, 로컬에 백업 통계를 저장합니다.

## 구현 내용

### 1. 추적 이벤트

다음 사용자 행동들이 자동으로 추적됩니다:

- **검색 (search)**: 사용자가 문자열을 검색할 때
  - 언어 정보 포함
- **Git Pull (git_pull)**: Git 저장소를 업데이트할 때
- **유의어 조회 (synonyms_view)**: 유의어 탭을 열 때
- **번역 조회 (translations_view)**: 번역 탭을 열 때
- **상세 뷰 열기 (detail_view_open)**: 검색 결과를 클릭하여 상세 뷰를 열 때

### 2. 데이터 구조

#### 로컬 저장 (electron-store)
```typescript
{
  userId: string;              // 기기 고유 ID (SHA256 해시)
  firstInstalled: string;      // 최초 설치일
  appVersion: string;          // 앱 버전
  totalSearches: number;       // 총 검색 횟수
  totalGitPulls: number;       // 총 Git Pull 횟수
  languageUsage: {             // 언어별 사용 횟수
    ko: 120,
    en: 30
  },
  features: {                  // 기능별 사용 통계
    synonymsViews: 45,
    translationsViews: 80,
    detailViewOpens: 90
  }
}
```

#### GA4 이벤트
```typescript
{
  event: 'search',
  user_id: 'a1b2c3d4...',
  language: 'ko',
  timestamp: 1234567890  // GA4가 자동 추가
}
```

### 3. 파일 구조

```
src/
├── main/
│   ├── analyticsService.ts    # Analytics 핵심 로직
│   └── main.ts                # IPC 핸들러 등록
├── preload/
│   └── preload.ts             # Renderer와 Main 프로세스 연결
└── renderer/
    ├── types/index.ts         # TypeScript 타입 정의
    ├── App.tsx                # 검색/Git Pull 이벤트
    └── components/
        └── DetailView.tsx     # 상세 뷰 이벤트
```

## 설정 방법

### GA4 설정

#### 1. Google Analytics에서 Measurement ID와 API Secret 가져오기

**Measurement ID 확인:**
1. https://analytics.google.com 접속
2. 관리(⚙️) → 데이터 스트림 → 웹 스트림 클릭
3. **측정 ID** 복사 (예: `G-T7WB0DZSZY`)

**API Secret 생성:**
1. 같은 스트림 설정 페이지에서 아래로 스크롤
2. **Measurement Protocol API secrets** 섹션 찾기
3. "만들기" 버튼 클릭
4. 닉네임 입력 (예: "Electron App")
5. "만들기" 클릭
6. **Secret 값** 복사 (예: `abcdefGHIJKLmnopqr`)

⚠️ **주의**: Secret 값은 생성 시 한 번만 표시되므로 반드시 복사해두세요!

#### 2. `.env` 파일 생성 (프로젝트 루트에)

```bash
GA_MEASUREMENT_ID=G-T7WB0DZSZY
GA_API_SECRET=abcdefGHIJKLmnopqr
```

실제 값으로 교체하세요.

#### 3. dotenv 자동 로드

- `dotenv` 패키지가 이미 설치되어 있습니다
- [main.ts](src/main/main.ts#L1)에서 `import 'dotenv/config'`로 자동 로드됩니다

#### 4. 환경 변수를 설정하지 않으면

GA4 전송 없이 로컬 저장만 수행됩니다.

### 개발 모드 vs 프로덕션 모드

**중요**: GA4 전송은 **프로덕션 모드에서만** 활성화됩니다.

| 모드 | GA4 전송 | 로컬 저장 | 콘솔 메시지 |
|------|---------|----------|------------|
| 개발 (`npm start`) | ❌ 비활성화 | ✅ 활성화 | `Development mode - GA4 disabled, local tracking only` |
| 프로덕션 (빌드 후 실행) | ✅ 활성화 | ✅ 활성화 | `GA4 enabled in production mode` |

**이유**: 개발 중 테스트 데이터가 GA4에 쌓이는 것을 방지하기 위함

**확인 방법**:
```bash
# 개발 모드 (GA4 전송 안 됨)
npm start

# 프로덕션 빌드 (GA4 전송 됨)
npm run build
electron .
```

### 로컬 데이터 확인

Analytics 데이터는 다음 위치에 저장됩니다:
```
Windows: %APPDATA%\String-Finder\analytics.json
macOS: ~/Library/Application Support/String-Finder/analytics.json
Linux: ~/.config/String-Finder/analytics.json
```

## API 사용법

### Renderer Process에서 추적

```typescript
// 검색 이벤트
await window.electron.trackSearch('ko');

// Git Pull 이벤트
await window.electron.trackGitPull();

// 유의어 조회 이벤트
await window.electron.trackSynonymsView();

// 번역 조회 이벤트
await window.electron.trackTranslationsView();

// 상세 뷰 열기 이벤트
await window.electron.trackDetailViewOpen();

// Analytics 데이터 가져오기
const data = await window.electron.getAnalyticsData();
console.log(data);
```

## 데이터 흐름

```
사용자 행동
    ↓
┌───────────────────────────┐
│ Renderer Process          │
│ - trackSearch('ko')       │ → GA4 즉시 전송
└───────────────────────────┘
    ↓ IPC
┌───────────────────────────┐
│ Main Process              │
│ - analyticsService        │
│ - 로컬 카운터 증가        │ → electron-store 저장
└───────────────────────────┘
```

## 프라이버시

- 개인 식별 정보는 수집하지 않습니다
- User ID는 기기별 고유 ID를 SHA256으로 해시한 값입니다
- 검색 쿼리 내용은 저장하지 않으며, 언어 정보만 수집합니다
- 모든 데이터는 로컬에 백업되어 오프라인에서도 사용 가능합니다

## 오프라인 동작

- GA4는 자동으로 이벤트를 큐잉하여 온라인 시 전송합니다
- 로컬 카운터는 항상 증가하여 백업 역할을 합니다

## 테스트

Analytics가 제대로 작동하는지 확인하려면:

1. 앱을 실행합니다
2. 몇 가지 작업을 수행합니다 (검색, Git Pull 등)
3. 콘솔에서 다음과 같은 로그를 확인합니다:
   ```
   [Analytics] Search tracked: ko Total: 1
   [Analytics] Event sent to GA4: search { user_id: 'xxx', language: 'ko' }
   ```

## 문제 해결

### GA4 이벤트가 전송되지 않는 경우

1. `GA_MEASUREMENT_ID`가 올바르게 설정되었는지 확인
2. 인터넷 연결 확인
3. 콘솔 로그 확인: `[Analytics] GA4 not configured, skipping event`

### 로컬 데이터가 저장되지 않는 경우

1. 앱 데이터 디렉토리에 쓰기 권한이 있는지 확인
2. 디스크 공간 확인

## 패키지

Analytics 기능을 위해 다음 패키지들이 사용됩니다:

- `universal-analytics`: GA4 이벤트 전송
- `electron-store`: 로컬 데이터 저장
- `uuid`: 고유 ID 생성
- `crypto`: ID 해싱 (Node.js 내장 모듈)
