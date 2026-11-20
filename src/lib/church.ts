/** 매주 바뀌지 않는 교회 정보 (주보 1면/표지 영역). */

export const church = {
	name: '부평동부교회',
	denomination: '대한예수교장로회(합동) 한남노회',
	address: '인천광역시 부평구 시장로 64 (부평시장로타리) 21392',
	tel: '032-515-1401',
	fax: '032-515-1403',
	homepage: 'http://www.dbchurch.net',
	founded: '1964년 12월 18일',
	tagline: '하나님나라 이루어가는 신앙공동체',
	welcome:
		'오늘 부평동부교회에 처음 나오신 분들을 진심으로 환영합니다. 등록을 원하시는 분들은 예배 후 지하 1층 바나바홀로 오시기 바랍니다.',
	verse: '예배하는 자가 영과 진리로 예배하느니라',
	vision: [
		{ key: 'Sign', text: '하나님나라의 실존을 알리며' },
		{ key: 'Instrument', text: '하나님나라의 완성에 동참하며' },
		{ key: 'Foretaste', text: '하나님나라의 삶을 선험하는' }
	],
	offering: [
		{ label: '일반헌금', bank: '농협', account: '355-0018-6021-13' },
		{ label: '장학헌금', bank: '농협', account: '355-0019-2028-93' }
	],
	// 주일(기본)
	services: [
		{ name: '1부 예배', time: '오전 9:00', place: '글로리홀' },
		{ name: '2부 예배', time: '오전 11:00', place: '글로리홀' },
		{ name: '소그룹 모임', time: '오후 1:30', place: '' },
		{ name: '새가족교육', time: '오후 12:00', place: '바나바홀' }
	],
	weekdayServices: [
		{ name: '수요 성경 아카데미', time: '오후 8:00', place: '글로리홀' },
		{ name: '금요기도회', time: '오후 9:00', place: '글로리홀' },
		{ name: '새벽기도회', time: '오전 5:00', place: '유초등부실' }
	],
	sundaySchool: [
		{ name: '영아부', time: '오전 11:00', place: '영유아부실' },
		{ name: '유치부', time: '오전 11:00', place: '유치부실' },
		{ name: '유초등부', time: '오전 11:00', place: '유초등부실' },
		{ name: '중고등부', time: '오전 11:00', place: '다니엘관' },
		{ name: '청년부', time: '오후 2:00', place: '다니엘관' }
	],
	evangelism: '매주 화요일 오전 10시',
	outreach: '매주 토요일 오후 1시 30분',
	ministers: [
		{ role: '담임목사', names: '강길수' },
		{ role: '원로장로', names: '고성기' },
		{ role: '은퇴장로', names: '김주희 유철형 하은태 송덕헌 박진수 이영오 김봉선' },
		{ role: '은퇴협동장로', names: '박용학' },
		{ role: '시무장로', names: '유석환 김광호 임원규 유진열 최병원 윤동성 박준수 강병환 정 훈 김상엽' },
		{ role: '휴직장로', names: '김요진' },
		{ role: '부목사', names: '이동호 김현겸 임효빈' },
		{ role: '전임전도사', names: '한성숙' },
		{ role: '교육전도사', names: '유선아' }
	],
	choirs: [
		{ name: '시온', conductor: '유석환', piano: '박유빈', organ: '고혜선' },
		{ name: '할렐루야', conductor: '윤석원', piano: '이민아', organ: '' },
		{ name: '그레이스', conductor: '고성기', piano: '박유빈', organ: '고혜선' },
		{ name: '아가페', conductor: '박지연', piano: '', organ: '' },
		{ name: '셀라챔버', conductor: '', piano: '', organ: '' }
	],
	missionaries: [
		{ role: '선교사', names: '김항철 홍정미 (캄보디아)' },
		{ role: '협력선교사', names: '윤운한 송정숙 (말레이시아)' },
		{ role: '협력선교사', names: '최성묵 김영숙 (프랑스 몽펠리에 예사랑교회)' }
	],
	partnerChurches: '참샘교회 신현동부교회 주문진세우리교회 장흥동부교회 하선교회 노회미자립교회'
} as const;
