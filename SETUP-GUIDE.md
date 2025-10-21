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

### 자주 발생하는 오류와 해결
- Error launching app / Cannot find module '...build\\main.js'
  - 원인: 빌드 산출물(`build/main.js`)이 없음
  - 해결: `npm run build` 또는 `npm start`를 먼저 실행

## 📦 배포 파일 생성

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

## ⚙️ 아이콘 설정 (선택사항)

현재 아이콘 파일이 없어도 개발 모드에서는 정상 작동합니다.

배포용 아이콘을 추가하려면:

1. 256x256 PNG 이미지 생성
2. ICO 변환: https://www.icoconverter.com/
3. 다음 파일을 `build/` 폴더에 저장:
   - `icon.png` (256x256)
   - `icon.ico` (Windows 아이콘)

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
