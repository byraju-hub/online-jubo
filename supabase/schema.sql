-- 부평동부교회 온라인 주보 — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.

create table if not exists public.bulletins (
  id          uuid primary key default gen_random_uuid(),
  volume      int  not null,                 -- 권 (예: 62)
  issue_no    int  not null,                 -- 호 (예: 47)
  issue_date  date not null unique,          -- 주일 날짜
  published   boolean not null default true, -- false 면 공개 안 됨 (임시저장)
  content     jsonb not null,                -- src/lib/types.ts 의 Content
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists bulletins_issue_date_idx on public.bulletins (issue_date desc);

-- 공개 읽기 전용: 익명(anon) 키로는 published=true 인 주보만 SELECT 가능.
-- 쓰기는 정책이 없으므로 service_role 키(scripts/publish.mjs)나 대시보드에서만 가능합니다.
alter table public.bulletins enable row level security;

drop policy if exists "public can read published bulletins" on public.bulletins;
create policy "public can read published bulletins"
  on public.bulletins for select
  to anon, authenticated
  using (published);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists bulletins_touch on public.bulletins;
create trigger bulletins_touch before update on public.bulletins
  for each row execute function public.touch_updated_at();
