# String-Search

GDD JSON 파일에서 문자열을 빠르게 검색하는 Windows 애플리케이션입니다.

## 기능
- JSON 파일 다국어 문자열 검색
- Git Pull 지원
- 검색 히스토리 (최근 10개)
- 번역 확인 (모든 언어)
- 클립보드 복사
- 상세 검색 결과 보기
- **AI 예상 번역** (OpenAI API 사용)

## 설치
`String-Search-{version}-x64.exe` 실행

## 사용법
1. 경로 설정 (⚙️) - GDD ui 폴더 선택
2. 언어 선택 (기본: KO)
3. 검색어 입력 후 Enter
4. 행 더블클릭으로 상세 정보 확인

## 시스템 요구사항
- Windows 10 이상 (64bit)
- Git 설치 (Pull 기능 사용 시)

## 검색 규칙
- 부분 일치 지원
- 대소문자 구분 없음
- 추가 문자 제외 (예: "시즌" 검색 시 "시즌패스" 제외)

## AI 예상 번역 설정 (선택사항)

검색 결과가 없을 때 OpenAI API를 사용하여 예상 번역을 제공합니다.

### 1. API 키 발급
1. https://platform.openai.com/api-keys 접속
2. 새 API 키 생성
3. 키 복사

### 2. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 수정
OPENAI_API_KEY=your-actual-api-key-here
```

### 3. (선택) Fine-tuned 모델 사용
Fine-tuning한 모델이 있는 경우:
```bash
# .env 파일에 추가
OPENAI_MODEL=ft:gpt-4o-mini-2024-07-18:your-org:custom:abc123
```

Fine-tuning 학습 데이터 생성:
```bash
npx ts-node scripts/generateTrainingData.ts
```

생성된 `training_data.jsonl` 파일을 OpenAI에 업로드하여 Fine-tuning을 진행하세요.

### 비용
- 기본 모델 (gpt-4o-mini): 호출당 약 ₩0.5~1원
- Fine-tuned 모델: 초기 학습 ₩2,000~3,000 + 호출당 약 ₩0.5~1원

## 개발
```bash
npm install
npm run dev      # 터미널 1
npm run electron:dev  # 터미널 2
```

### 자주 발생하는 오류와 해결
- Error launching app / Cannot find module '...build\\main.js'
  - 원인: 빌드 산출물(`build/main.js`)이 없음
  - 해결: `npm run build` 또는 `npm start`를 먼저 실행

### 빠른 실행/권장 흐름
- 최초 1회: `npm run build`로 `build/main.js` 생성
- 개발 모드: 두 터미널에서 `npm run dev`와 `npm run electron:dev`
- 한 번에 실행: `npm start` (빌드 후 Electron 실행)

## 배포
```bash
npm run release
```

## 라이센스
MIT License
