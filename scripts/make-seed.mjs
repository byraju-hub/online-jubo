// src/lib/data/*.json → supabase/seed.sql 생성
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const dir = 'src/lib/data';
const q = (s) => `'${s.replaceAll("'", "''")}'`;
const rows = readdirSync(dir)
	.filter((f) => f.endsWith('.json'))
	.sort()
	.map((f) => {
		const b = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
		return `  (${b.volume}, ${b.issueNo}, ${q(b.date)}, true, ${q(JSON.stringify(b.content))}::jsonb)`;
	});

writeFileSync(
	'supabase/seed.sql',
	`-- scripts/make-seed.mjs 로 생성됨 (최근 주보 예시)\ninsert into public.bulletins (volume, issue_no, issue_date, published, content) values\n${rows.join(',\n')}\non conflict (issue_date) do update set\n  volume = excluded.volume, issue_no = excluded.issue_no,\n  published = excluded.published, content = excluded.content;\n`
);
console.log(`seed.sql: ${rows.length}건`);
