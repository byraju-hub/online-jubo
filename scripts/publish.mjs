// 사용법: node --env-file=.env scripts/publish.mjs src/lib/data/2026-11-22.json [--draft]
// 주보 JSON 을 Supabase 에 upsert 합니다. (service_role 키 필요 — 절대 커밋하지 마세요)
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const [file, flag] = process.argv.slice(2);
const { PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
if (!file || !url || !key) {
	console.error('필요: JSON 파일 경로, PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env)');
	process.exit(1);
}

const b = JSON.parse(readFileSync(file, 'utf8'));
const supabase = createClient(url, key, { auth: { persistSession: false } });
const { error } = await supabase.from('bulletins').upsert(
	{
		volume: b.volume,
		issue_no: b.issueNo,
		issue_date: b.date,
		published: flag !== '--draft',
		content: b.content
	},
	{ onConflict: 'issue_date' }
);
if (error) {
	console.error('실패:', error.message);
	process.exit(1);
}
console.log(`✔ ${b.date} (${b.volume}권 ${b.issueNo}호) ${flag === '--draft' ? '임시저장' : '게시'} 완료`);
