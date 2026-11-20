# online-jubo · 부평동부교회 온라인 주보

매주 올라오는 주보 PDF를 **한 페이지 온라인 주보**로 보여주는 SvelteKit + Supabase 앱입니다.

- 최신 주보가 `/`, 지난 주보는 `/2026-11-15` 처럼 날짜 주소로 열립니다. (상단 주차 탭)
- 주일예배 순서 · 설교 · 교회소식 · 주중 예배/모임 · 예배위원 · 헌금계좌(복사 버튼)까지 한 화면 흐름에.
- 모바일 우선, 라이트/다크 자동, `prefers-reduced-motion` 존중, 인쇄 가능.
- 매주 같은 정보(섬기는 분들, 예배시간, 교회소개)는 하단 "교회 안내"에 접어 두었습니다 (`src/lib/church.ts`).

## 실행

```bash
npm install
npm run dev
```

환경변수가 없으면 `src/lib/data/*.json`(최근 3주 예시)로 동작합니다.

## Supabase 연동

1. Supabase 프로젝트 생성 → **SQL Editor**에서 `supabase/schema.sql` 실행 (RLS: 공개 읽기 전용)
2. (선택) `supabase/seed.sql` 실행으로 예시 3주치 입력
3. `.env.example` 을 `.env` 로 복사 후 `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` 입력

익명 키는 `published = true` 인 행만 읽을 수 있고, 쓰기는 service role 로만 가능합니다.

## 매주 주보 올리기

1. `src/lib/data/` 의 JSON 하나를 복사해 새 주 내용으로 수정 (스키마: `src/lib/types.ts`)
2. `.env` 에 `SUPABASE_SERVICE_ROLE_KEY` 를 넣고 실행:

```bash
node --env-file=.env scripts/publish.mjs src/lib/data/2026-11-29.json          # 게시
node --env-file=.env scripts/publish.mjs src/lib/data/2026-11-29.json --draft  # 임시저장
```

## 교회 홈페이지에 넣기

배포 후 `<iframe src="https://배포주소/" style="width:100%;height:1400px;border:0" title="온라인 주보"></iframe>` 로 삽입하거나 링크로 연결합니다.
배포 어댑터는 `svelte.config.js` 의 `adapter-auto` (Vercel/Netlify/Cloudflare 자동 감지)입니다.

## 디자인·모션

원본 주보의 색(청색 괘선·코랄·녹색)과 구성을 따랐고, 모션은 입장 시 8px 상승 + 45ms 단계 페이드, 주차 전환 시 재생, 버튼 `:active` 0.97 스케일 정도로 절제했습니다.
