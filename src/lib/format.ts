const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** YYYY-MM-DD → 시간대와 무관하게 월/일/요일 */
export function parseDate(iso: string) {
	const [y, m, d] = iso.split('-').map(Number);
	const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
	return { y, m, d, weekday: WEEKDAYS[wd] };
}

export const shortDate = (iso: string) => {
	const { m, d } = parseDate(iso);
	return `${m}/${d}`;
};
