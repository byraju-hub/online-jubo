// dbchurch.net 교회소식에 올라온 주보 PDF 를 찾아 온라인 주보로 자동 게시한다 (확인 없이 바로 게시).
//
//   node --env-file=.env scripts/sync-from-dbchurch.mjs          실제로 처리
//   node scripts/sync-from-dbchurch.mjs --dry                    키 없이, 무엇을 처리할지 목록만 본다
//
// 흐름: 교회소식 목록(1쪽) → 제목이 'YYYY년 M월 D일 교회소식' 인 글 → 아직 없는 날짜만(최근 45일, 글당 3번까지)
//       → 글 페이지의 PDF 첨부(공개 Supabase 저장소 주소만) → Claude API 로 정해 둔 칸만 읽기 → 검사 → bulletins 에 upsert.
// 필요한 값(.env 또는 GitHub Actions secrets): PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { SCHEMA, SYSTEM, validate } from './extract.ts';

const SITE = 'https://dbchurch.net';
const MODEL = 'claude-sonnet-5-5';
const MAX_AGE_DAYS = 45;
const MAX_ATTEMPTS = 3;
const RETRY_AFTER_MIN = 30;
const PER_RUN = 2;
const PDF_MAX = 10 * 1024 * 1024;

const dry = process.argv.includes('--dry');
const TITLE = /^\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*교회소식\s*$/;
const pad = (n) => String(n).padStart(2, '0');
const log = (...a) => console.log(...a);

/** 교회소식 목록 1쪽에서 [{ id, title, date(YYYY-MM-DD), postedAt(Date) }] */
async function listPosts() {
	const res = await fetch(`${SITE}/news?category=${encodeURIComponent('교회소식')}&page=1`, { headers: { accept: 'text/html' } });
	if (!res.ok) throw new Error(`목록 ${res.status}`);
	const html = await res.text();
	const out = [];
	for (const seg of html.split('<a href="/news/').slice(1)) {
		const id = /^(\d+)"/.exec(seg)?.[1];
		const title = /<h3[^>]*>([^<]+)<\/h3>/.exec(seg)?.[1]?.trim();
		const posted = /(\d{4})\.\s*(\d{2})\.\s*(\d{2})\./.exec(seg);
		const m = title && TITLE.exec(title);
		if (!id || !m || !posted) continue;
		out.push({
			id,
			title,
			date: `${m[1]}-${pad(m[2])}-${pad(m[3])}`,
			postedAt: new Date(`${posted[1]}-${posted[2]}-${posted[3]}T00:00:00+09:00`)
		});
	}
	return out;
}

/** 글 페이지의 PDF 첨부 주소. 공개 Supabase 저장소(posts 버킷)가 아니면 쓰지 않는다 */
async function pdfUrlOf(id) {
	const res = await fetch(`${SITE}/news/${id}`, { headers: { accept: 'text/html' } });
	if (!res.ok) throw new Error(`글 ${res.status}`);
	const html = await res.text();
	for (const m of html.matchAll(/href="(https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/posts\/[^"\s]+\.pdf)"/gi)) return m[1];
	return null;
}

const posts = (await listPosts()).filter((p) => Date.now() - p.postedAt.getTime() < MAX_AGE_DAYS * 86_400_000);
log(`교회소식 주보 글 ${posts.length}건(최근 ${MAX_AGE_DAYS}일):`, posts.map((p) => p.date).join(', ') || '없음');

if (dry) {
	for (const p of posts) log(`  /news/${p.id}  ${p.date}  PDF: ${(await pdfUrlOf(p.id)) ? '있음' : '없음'}`);
	process.exit(0);
}

const { PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, ANTHROPIC_API_KEY: apiKey } = process.env;
if (!url || !key || !apiKey) {
	log('PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ANTHROPIC_API_KEY 가 없어 건너뜁니다.');
	process.exit(0);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const claude = new Anthropic({ apiKey, timeout: 90_000, maxRetries: 1 });

const { data: have } = await db.from('bulletins').select('issue_date');
const done = new Set((have ?? []).map((r) => r.issue_date));
const { data: jobs } = await db.from('bulletin_jobs').select('source_id, status, attempts, last_attempt_at');
const jobOf = new Map((jobs ?? []).map((j) => [j.source_id, j]));

const todo = posts
	.filter((p) => !done.has(p.date))
	.filter((p) => {
		const j = jobOf.get(p.id);
		if (!j) return true;
		if (j.status !== 'pending' || j.attempts >= MAX_ATTEMPTS) return false;
		return !j.last_attempt_at || Date.now() - new Date(j.last_attempt_at).getTime() > RETRY_AFTER_MIN * 60_000;
	})
	.slice(0, PER_RUN);
if (!todo.length) {
	log('새로 만들 주보가 없습니다.');
	process.exit(0);
}

let failed = 0;
for (const p of todo) {
	const attempts = (jobOf.get(p.id)?.attempts ?? 0) + 1;
	await db.from('bulletin_jobs').upsert({ source_id: p.id, issue_date: p.date, status: 'pending', attempts, last_attempt_at: new Date().toISOString(), updated_at: new Date().toISOString() });
	let usage = null;
	try {
		const pdfUrl = await pdfUrlOf(p.id);
		if (!pdfUrl) throw new Error('PDF 첨부가 아직 없음');
		const res = await fetch(pdfUrl, { redirect: 'error' });
		if (!res.ok) throw new Error(`PDF 받기 ${res.status}`);
		const bytes = Buffer.from(await res.arrayBuffer());
		if (bytes.length > PDF_MAX || bytes.subarray(0, 4).toString() !== '%PDF') throw new Error('PDF 가 아니거나 10MB 초과');

		const msg = await claude.beta.messages.create({
			model: MODEL,
			max_tokens: 16000,
			betas: ['server-side-fallback-2026-07-01'],
			fallbacks: 'default',
			output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
			system: SYSTEM,
			messages: [
				{
					role: 'user',
					content: [
						{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: bytes.toString('base64') } },
						{ type: 'text', text: '이 주보를 온라인 주보 칸에 옮겨 주세요.' }
					]
				}
			]
		});
		usage = { input_tokens: msg.usage.input_tokens, output_tokens: msg.usage.output_tokens };
		if (msg.stop_reason === 'refusal' || msg.stop_reason === 'max_tokens') throw new Error(`Claude ${msg.stop_reason}`);
		const text = msg.content.filter((b) => b.type === 'text').at(-1);
		const raw = JSON.parse(text.text);
		const out = validate(raw, p.date);

		const { error } = await db.from('bulletins').upsert(
			{ issue_date: out.issueDate, volume: out.volume, issue_no: out.issueNo, content: out.content, published: true },
			{ onConflict: 'issue_date' }
		);
		if (error) throw new Error(`게시 실패: ${error.message}`);
		await db.from('bulletin_jobs').update({ status: 'done', last_error: null, input_tokens: usage.input_tokens, output_tokens: usage.output_tokens, updated_at: new Date().toISOString() }).eq('source_id', p.id);
		log(`✔ ${p.date} (${out.volume}권 ${out.issueNo}호) 게시`);
	} catch (e) {
		failed++;
		const reason = (e instanceof Error ? e.message : String(e)).slice(0, 300);
		await db.from('bulletin_jobs').update({ status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending', last_error: reason, input_tokens: usage?.input_tokens ?? null, output_tokens: usage?.output_tokens ?? null, updated_at: new Date().toISOString() }).eq('source_id', p.id);
		console.error(`✘ ${p.date}: ${reason} (시도 ${attempts}/${MAX_ATTEMPTS})`);
	}
}
process.exit(failed ? 1 : 0);
