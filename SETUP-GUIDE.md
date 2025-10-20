# String-Search 설정 및 실행 가이드

## ✅ 프로젝트 구성 완료!

모든 파일이 성공적으로 생성되었습니다.

## 📁 프로젝트 구조

```
string-search/
├── src/
│   ├── main/                 # Electron 메인 프로세스
│   │   ├── main.ts          # 메인 진입점
│   │   ├── fileService.ts   # JSON 파일 읽기/캐싱
│   │   ├── searchService.ts # 검색 로직
│   │   └── gitService.ts    # Git Pull 기능
│   ├── renderer/             # React 렌더러
│   │   ├── App.tsx          # 메인 앱 컴포넌트
│   │   ├── index.tsx        # 렌더러 진입점
│   │   ├── types/           # TypeScript 타입 정의
│   │   ├── styles/          # Tailwind CSS 스타일
│   │   └── components/      # React 컴포넌트
│   └── preload/             # IPC 브릿지
│       └── preload.ts
├── public/
│   └── index.html           # HTML 템플릿
├── build/                    # 빌드 출력 & 아이콘
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

## 📦 배포 파일 생성

### ⚠️ 중요: 관리자 권한 필요

Windows에서 배포 파일 생성 시 **관리자 권한**이 필요합니다.

**방법 1: Git Bash를 관리자 권한으로 실행**
1. 시작 메뉴에서 "Git Bash" 검색
2. 우클릭 → "관리자 권한으로 실행"
3. 프로젝트 폴더로 이동 후 빌드:
   ```bash
   cd "c:\Users\iamle\바탕 화면\project\String-Search"
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
- `dist/String-Search-1.0.0-x64.exe` (인스톨러)
- `dist/String-Search-1.0.0-portable.exe` (포터블)

### 개별 빌드:
```bash
npm run dist:win       # 인스톨러만
npm run dist:portable  # 포터블만
```

### 💡 인스톨러 vs 포터블 버전

**인스톨러 (`String-Search-1.0.0-x64.exe`)**
- Windows에 **설치**가 필요
- Program Files에 파일 복사
- 시작 메뉴에 바로가기 생성
- 제어판에서 제거 가능
- **일반 사용자에게 권장**

**포터블 버전 (`String-Search-1.0.0-portable.exe`)**
- **설치 불필요**, 실행 파일 하나로 완결
- USB 드라이브에 담아 어디서든 실행 가능
- 시스템에 흔적을 남기지 않음
- 관리자 권한이 없는 환경에서 유용

### 📤 배포 방법

다른 사용자에게는 **인스톨러 파일 하나만 공유**하면 됩니다:
- `String-Search-1.0.0-x64.exe` 파일만 전달
- 사용자가 더블클릭하여 설치
- 설치 후 시작 메뉴에서 실행

## 🎯 첫 실행 가이드

1. **앱 실행**
   ```bash
   npm run dev          # 터미널 1
   npm run electron:dev # 터미널 2
   ```

2. **경로 설정**
   - 우측 상단 ⚙️ 버튼 클릭
   - GDD의 `ui` 폴더 선택
   - 확인 버튼 클릭

3. **검색 시작**
   - 언어 선택 (기본: KO)
   - 검색어 입력
   - Enter 또는 검색 버튼 클릭

4. **상세 보기**
   - 검색 결과 행 더블클릭
   - 모든 언어 번역 확인
   - 📋 버튼으로 클립보드 복사

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

### Git Pull 실패
- Git이 설치되어 있는지 확인
- 선택한 폴더가 Git 저장소인지 확인

## 📝 주요 스크립트

| 스크립트 | 설명 |
|---------|------|
| `npm run dev` | Webpack Dev Server 실행 (포트 3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run electron` | Electron 앱 실행 |
| `npm run electron:dev` | 개발 모드로 Electron 실행 |
| `npm start` | 빌드 후 실행 |
| `npm run release` | 배포 파일 생성 (인스톨러 + 포터블) |

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

## 📚 추가 기능 구현 예정

- ⏸️ 유의어 검색 (한국어 의미론적 유사도)
- 검색 결과 정렬 옵션
- 다크/라이트 테마 전환

## 🐛 버그 리포트

문제가 발생하면 다음 정보와 함께 리포트:
- 오류 메시지
- 실행 환경 (Windows 버전)
- 재현 방법

---

**제작:** Your Name | **버전:** 1.0.0 | **라이센스:** MIT
