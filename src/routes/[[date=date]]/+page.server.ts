import { error } from '@sveltejs/kit';
import { getBulletin, listIssues } from '$lib/server/bulletins';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const [bulletin, issues] = await Promise.all([getBulletin(params.date), listIssues()]);
	if (!bulletin) error(404, '해당 날짜의 주보를 찾을 수 없습니다.');

	// 주보는 주 1회 갱신 — 짧게 캐시하고 백그라운드에서 갱신
	setHeaders({ 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600' });

	const i = issues.findIndex((x) => x.date === bulletin.date);
	return {
		bulletin,
		issues,
		isLatest: i === 0,
		prev: i >= 0 ? (issues[i + 1] ?? null) : null,
		next: i > 0 ? issues[i - 1] : null
	};
};
