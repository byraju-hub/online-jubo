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

## 자동 생성 (교회 홈페이지 교회소식 → 온라인 주보)

[dbchurch.net 교회소식](https://dbchurch.net/news?category=%EA%B5%90%ED%9A%8C%EC%86%8C%EC%8B%9D&page=1)에 'YYYY년 M월 D일 교회소식' 글과 주보 PDF 가 올라오면,
`.github/workflows/sync-bulletin.yml` 이 매시간 `scripts/sync-from-dbchurch.mjs` 를 실행해 **확인 없이 바로 게시**합니다.

1. 교회소식 1쪽에서 주보 글을 찾는다 (최근 45일, 이미 있는 날짜는 건너뜀)
2. 글의 PDF(공개 Supabase 저장소 주소만)를 받아 Claude API(`claude-sonnet-5-5`)로 정해 둔 칸만 읽는다
3. 글 제목의 날짜와 PDF 의 날짜가 같은지·필요한 칸이 있는지 검사 → `bulletins` 에 upsert
4. 실패하면 `bulletin_jobs.last_error` 에 이유를 적고 30분 뒤 다시(최대 3번)

설정: GitHub 저장소 → Settings → Secrets and variables → Actions 에 `PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` 를 등록하고,
Supabase SQL Editor 에서 `supabase/schema.sql` 을 (이미 했더라도 `bulletin_jobs` 때문에) 다시 실행합니다. 값이 없으면 아무것도 하지 않고 끝납니다.

```bash
node scripts/sync-from-dbchurch.mjs --dry                      # 키 없이 무엇을 처리할지 목록만
node --env-file=.env scripts/sync-from-dbchurch.mjs            # 지금 한 번 실행 (ANTHROPIC_API_KEY 도 .env 에)
node scripts/extract.test.mjs                                  # 읽기 결과 검사 로직 테스트
```

같은 날짜가 다시 만들어지면 덮어씁니다. 잘못 읽은 곳은 Supabase 에서 `bulletins.content` 를 직접 고칩니다. (GitHub 는 60일간 활동이 없으면 예약 실행을 멈추므로, 멈추면 Actions 탭에서 다시 켭니다.)
교회 홈페이지 저장소(`jyub86/dbw`)에는 같은 기능이 엣지 함수(`bulletin-from-post`)와 `/bulletin` 화면으로 PR 되어 있습니다.

## 수동으로 주보 올리기

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
