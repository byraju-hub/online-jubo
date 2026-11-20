/** 주보 한 호의 내용. Supabase `bulletins.content` (jsonb)와 1:1 대응합니다. */

export type Part = { tag?: string; text: string; sub?: string };

export type OrderItem = {
	label: string;
	text?: string;
	/** 1부 / 2부처럼 나뉘는 항목 */
	parts?: Part[];
	/** * 표시: 일어서서 */
	standing?: boolean;
	/** 설교처럼 강조할 항목 */
	emphasis?: boolean;
};

export type Table = { title?: string; head: string[]; rows: string[][] };

export type Weekday = {
	name: string;
	time: string;
	/** normal | off(휴강) | replaced(다른 모임으로 대체) */
	state?: 'normal' | 'off' | 'replaced';
	heading?: string;
	sub?: string;
	note?: string;
	lines?: { label: string; text: string; sub?: string }[];
};

export type NewsItem = {
	/** **굵게** 표기를 지원합니다 */
	text: string;
	tables?: Table[];
};

export type Content = {
	motto?: string;
	theme?: { label: string; verse?: string; ref?: string };
	service: { label: string; leader: string; items: OrderItem[] };
	sermon: { title: string; preacher: string; scripture: string; page?: string };
	weekday: Weekday[];
	events: { date: string; text: string }[];
	outreach: { date: string; teams: string }[];
	dishwashing: { date: string; names: string }[];
	notes?: string[];
	news: NewsItem[];
	bereavement: string[];
	committee: { date: string; prayer: [string, string]; offering: [string, string] }[];
};

export type Bulletin = {
	volume: number;
	issueNo: number;
	/** YYYY-MM-DD (주일 날짜) */
	date: string;
	content: Content;
};

export type IssueRef = { date: string; volume: number; issueNo: number; label: string };
