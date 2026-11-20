// node scripts/extract.test.mjs   (Node 22.18+ / 24)
// 모델이 준 답을 흉내 낸 값으로 stripNulls·validate 를 확인한다. Claude API 는 부르지 않는다.
import assert from 'node:assert/strict';
import { SCHEMA, stripNulls, validate } from './extract.ts';

const item = (label, text = null, extra = {}) => ({ label, text, parts: null, standing: false, emphasis: false, ...extra });
const answer = (over = {}) => ({
	readable: true,
	volume: 62,
	issue_no: 47,
	issue_date: '2026-11-22',
	theme: null,
	service: {
		label: '요한복음 강해',
		leader: '강길수 목사',
		items: [
			item('묵도', '다같이', { standing: true }),
			item('찬송', '48장 “거룩하신 주 하나님”', { standing: true }),
			item('교독문', '교독문 77번 〈요한복음 3장〉', { standing: true }),
			item('신앙고백', '사도신경 / 다같이', { standing: true }),
			item('찬송', '366장 “어두운 내 눈 밝히사”'),
			item('기도', null, { parts: [{ tag: '1부', text: '조용민 집사', sub: null }, { tag: '2부', text: '최병원 장로', sub: null }] }),
			item('성경봉독', '요한복음 9장 13-41절 〈신약 161쪽〉'),
			item('말씀', '“지록위마(指鹿爲馬)의 신앙”  강길수 목사', { emphasis: true })
		]
	},
	sermon: { title: '지록위마(指鹿爲馬)의 신앙', preacher: '강길수 목사', scripture: '요한복음 9장 13-41절', page: '신약 161쪽' },
	weekday: [
		{ name: '소그룹 모임', time: '오후 1:30', state: 'normal', heading: '소그룹 모임', sub: null, note: null, lines: null },
		{ name: '수요 성경 아카데미', time: '오후 8:00', state: 'off', heading: 'WBA 휴강', sub: null, note: null, lines: null },
		{ name: '금요기도회', time: '오후 9:00', state: 'normal', heading: null, sub: null, note: null, lines: [{ label: '말씀', text: '“아둘람 공동체”', sub: '이동호 목사' }] },
		{ name: '새벽기도회', time: '월-금 오전 5:00', state: 'normal', heading: '“고린도후서 강해”', sub: '강길수 목사', note: null, lines: null }
	],
	events: [{ date: '11월 22일', text: '한남노회 여전도회 찬양제' }],
	outreach: [],
	dishwashing: [],
	notes: [],
	news: [{ text: '이번주 수요 성경 아카데미는 휴강입니다.', tables: null }],
	bereavement: [],
	committee: [
		{ date: '11월 29일', prayer: ['김경태 집사', '윤동성 장로'], offering: ['박지섭 집사', '임대룡 집사'] },
		{ date: '12월 6일', prayer: ['신동문 집사'], offering: ['임대룡 집사', '김문수 집사'] } // 칸이 모자란 줄은 걸러진다
	],
	...over
});

// 1) null 칸 제거
const stripped = stripNulls({ a: null, b: [{ c: null, d: 1 }], e: { f: null } });
assert.deepEqual(stripped, { b: [{ d: 1 }], e: {} });

// 2) 정상 답
const ok = validate(answer(), '2026-11-22');
assert.equal(ok.volume, 62);
assert.equal(ok.issueNo, 47);
assert.equal(ok.issueDate, '2026-11-22');
assert.equal(ok.content.readable, undefined);
assert.equal(ok.content.theme, undefined);
assert.equal(ok.content.service.items[5].parts[0].sub, undefined);
assert.equal(ok.content.committee.length, 1, '2칸이 아닌 예배위원 줄은 뺀다');

// 3) 거절해야 하는 답
const bad = (over, re, date = '2026-11-22') => assert.throws(() => validate(answer(over), date), re);
bad({ readable: false }, /읽지 못함/);
bad({ issue_date: '2026-11-15' }, /다름/);
bad({}, /다름/, '2026-11-29');
bad({ volume: null }, /권/);
bad({ issue_no: 0 }, /호/);
bad({ service: { label: '요한복음 강해', leader: '강길수 목사', items: [] } }, /예배 순서/);
bad({ service: { ...answer().service, label: '' } }, /인도자|이름/);
bad({ sermon: { title: '', preacher: 'x', scripture: 'y', page: null } }, /설교/);
bad({ weekday: [] }, /주중/);

// 4) 스키마 모양: 모든 객체가 additionalProperties:false 이고 required 가 모든 칸
(function walk(s) {
	if (!s || typeof s !== 'object') return;
	if (s.type === 'object') {
		assert.equal(s.additionalProperties, false);
		assert.deepEqual([...s.required].sort(), Object.keys(s.properties).sort());
	}
	for (const v of Object.values(s)) walk(v);
})(SCHEMA);

console.log('extract.test: OK');
