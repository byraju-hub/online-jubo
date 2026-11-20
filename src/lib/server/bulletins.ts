import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import type { Bulletin, IssueRef } from '$lib/types';

/**
 * 주보 데이터 소스.
 * - PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY 가 있으면 Supabase `bulletins` 테이블
 * - 없으면 src/lib/data/*.json (로컬 개발·데모용)
 */

const local = Object.values(
	import.meta.glob<Bulletin>('../data/*.json', { eager: true, import: 'default' })
).sort((a, b) => b.date.localeCompare(a.date));

const supabase =
	env.PUBLIC_SUPABASE_URL && env.PUBLIC_SUPABASE_ANON_KEY
		? createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
				auth: { persistSession: false, autoRefreshToken: false }
			})
		: null;

export const dataSource = supabase ? 'supabase' : 'local';

const ref = (b: Pick<Bulletin, 'date' | 'volume' | 'issueNo'>): IssueRef => ({
	date: b.date,
	volume: b.volume,
	issueNo: b.issueNo,
	label: b.date
});

type Row = { volume: number; issue_no: number; issue_date: string; content: Bulletin['content'] };
const fromRow = (r: Row): Bulletin => ({
	volume: r.volume,
	issueNo: r.issue_no,
	date: r.issue_date,
	content: r.content
});

/** 최근 주보 목록 (최신순) */
export async function listIssues(limit = 12): Promise<IssueRef[]> {
	if (!supabase) return local.slice(0, limit).map(ref);
	const { data, error } = await supabase
		.from('bulletins')
		.select('volume, issue_no, issue_date')
		.eq('published', true)
		.order('issue_date', { ascending: false })
		.limit(limit);
	if (error) throw new Error(`주보 목록을 불러오지 못했습니다: ${error.message}`);
	return (data ?? []).map((r) => ref({ volume: r.volume, issueNo: r.issue_no, date: r.issue_date }));
}

/** date 가 없으면 가장 최근 주보. 없으면 null */
export async function getBulletin(date?: string): Promise<Bulletin | null> {
	if (!supabase) return (date ? local.find((b) => b.date === date) : local[0]) ?? null;

	let q = supabase
		.from('bulletins')
		.select('volume, issue_no, issue_date, content')
		.eq('published', true);
	q = date ? q.eq('issue_date', date) : q.order('issue_date', { ascending: false });
	const { data, error } = await q.limit(1).maybeSingle<Row>();
	if (error) throw new Error(`주보를 불러오지 못했습니다: ${error.message}`);
	return data ? fromRow(data) : null;
}
