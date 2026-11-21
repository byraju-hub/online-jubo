<script lang="ts">
	import { church } from '$lib/church';
	import { parseDate, shortDate } from '$lib/format';
	import Rich from '$lib/Rich.svelte';
	import CopyButton from '$lib/CopyButton.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const b = $derived(data.bulletin);
	const c = $derived(b.content);
	const when = $derived(parseDate(b.date));
	const chips = $derived([...data.issues].slice(0, 8).reverse());
	const sermonItem = $derived(c.service.items.find((i) => i.emphasis));

	// 좁은 화면에서 현재 주차 탭이 오른쪽에 잘려 보이지 않도록 보이는 위치로 맞춘다
	function keepCurrentInView(nav: HTMLElement, _date: string) {
		const fit = () => {
			const cur = nav.querySelector<HTMLElement>('[aria-current="page"]');
			if (cur) nav.scrollLeft = cur.offsetLeft + cur.offsetWidth - nav.clientWidth + 12;
		};
		fit();
		return { update: fit };
	}
</script>

<svelte:head>
	<title>{when.m}월 {when.d}일 온라인 주보 · {church.name}</title>
	<meta
		name="description"
		content="{church.name} {b.volume}권 {b.issueNo}호 ({when.m}월 {when.d}일) 온라인 주보 — {c.sermon.title}, {c.sermon.preacher}"
	/>
	<meta name="theme-color" content="#faf6ee" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#131925" media="(prefers-color-scheme: dark)" />
</svelte:head>

<a class="skip" href="#jubo">주보 본문으로 건너뛰기</a>

<header class="top">
	<div class="top-in">
		<a class="brand" href="/" aria-label="{church.name} 온라인 주보 최신호">
			<svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true">
				<circle cx="5" cy="4" r="2.6" fill="var(--blue-soft)" />
				<rect x="3" y="8" width="4" height="11" rx="2" fill="var(--blue-soft)" />
				<circle cx="14" cy="4" r="2.6" fill="var(--coral-fill)" />
				<rect x="12" y="8" width="4" height="11" rx="2" fill="var(--coral-fill)" />
				<circle cx="23" cy="4" r="2.6" fill="var(--leaf)" />
				<rect x="21" y="8" width="4" height="11" rx="2" fill="var(--leaf)" />
			</svg>
			<span>{church.name}</span>
		</a>

		<nav class="weeks" aria-label="지난 주보" use:keepCurrentInView={b.date}>
			<ul>
				{#each chips as it (it.date)}
					<li>
						<a
							href={it.date === data.issues[0]?.date ? '/' : `/${it.date}`}
							aria-current={it.date === b.date ? 'page' : undefined}
							data-sveltekit-noscroll
						>
							<span class="num">{shortDate(it.date)}</span>
							{#if it.date === data.issues[0]?.date}<em>최신</em>{/if}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<main id="jubo">
	{#key b.date}
		<article class="sheet">
			<!-- 오늘의 한눈에 -->
			<section class="hero rise" style="--i:0" aria-labelledby="hero-title">
				<div class="hero-date">
					<p class="issue num">{b.volume}권 {b.issueNo}호</p>
					<h1 id="hero-title">
						<span class="num">{when.m}월 {when.d}일</span>
						<span class="wd">{when.weekday === '일' ? '주일' : `${when.weekday}요일`}</span>
					</h1>
					<p class="theme">
						<span class="theme-lead"><span class="num">{church.theme.year}</span> {church.theme.lead}</span>
						<span class="theme-title">{church.theme.title}</span>
					</p>
					<p class="service-line">
						<strong>{c.service.label}</strong>
						<span class="dot" aria-hidden="true"></span>
						<span class="num">1부 오전 9:00 · 2부 오전 11:00</span>
					</p>
					{#if c.theme?.verse}
						<blockquote class="verse">
							<p>{c.theme.verse}</p>
							<footer>{c.theme.ref}</footer>
						</blockquote>
					{/if}
				</div>

				<div class="hero-sermon">
					<h2>{c.sermon.title}</h2>
					<p class="by">
						<strong>{c.sermon.preacher}</strong>
						<span class="dot" aria-hidden="true"></span>
						<span>{c.sermon.scripture}{c.sermon.page ? ` (${c.sermon.page})` : ''}</span>
					</p>
				</div>
			</section>

			<p class="welcome rise" style="--i:1">{church.welcome}</p>

			<div class="cols">
				<!-- 주일예배 순서 -->
				<section class="order rise" style="--i:2" aria-labelledby="h-order">
					<div class="sec-head">
						<h2 id="h-order">주일예배</h2>
						<p class="legend"><span class="star" aria-hidden="true">*</span>표는 일어서서 · 인도 {c.service.leader}</p>
					</div>
					<ol>
						{#each c.service.items as item}
							<li class:emph={item.emphasis}>
								<span class="lbl">
									{#if item.standing}<span class="star" aria-hidden="true">*</span><span class="sr-only">일어서서 </span>{/if}{item.label}
								</span>
								<span class="val">
									{#if item.parts}
										<span class="parts">
											{#each item.parts as p}
												<span class="part">
													{#if p.tag}<span class="tag">{p.tag}</span>{/if}
													<span>{p.text}{#if p.sub}<small>{p.sub}</small>{/if}</span>
												</span>
											{/each}
										</span>
									{:else if item.emphasis && sermonItem}
										<span class="sermon-title">“{c.sermon.title}”</span>
										<small>{c.sermon.preacher}</small>
									{:else if item.text}
										{item.text}
									{/if}
								</span>
							</li>
						{/each}
					</ol>
				</section>

				<div class="side">
					<!-- 교회소식 -->
					<section class="news rise" style="--i:3" aria-labelledby="h-news">
						<div class="sec-head"><h2 id="h-news">교회소식</h2></div>
						<ol>
							{#each c.news as n, i}
								<li>
									<span class="n num" aria-hidden="true">{i + 1}</span>
									<div>
										<p><Rich text={n.text} /></p>
										{#each n.tables ?? [] as t}
											<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
											<div class="tbl" role="region" tabindex="0" aria-label={t.title ?? '표'}>
												{#if t.title}<p class="tbl-title">{t.title}</p>{/if}
												<table>
													<thead>
														<tr>{#each t.head as h}<th scope="col">{h}</th>{/each}</tr>
													</thead>
													<tbody>
														{#each t.rows as r}
															<tr>{#each r as cell}<td>{cell}</td>{/each}</tr>
														{/each}
													</tbody>
												</table>
											</div>
										{/each}
									</div>
								</li>
							{/each}
						</ol>
					</section>

					<!-- 교회행사 -->
					<section class="events rise" style="--i:4" aria-labelledby="h-events">
						<div class="sec-head"><h2 id="h-events">교회행사</h2></div>
						<ul>
							{#each c.events as e}
								<li><span class="d num">{e.date}</span><span>{e.text}</span></li>
							{/each}
						</ul>
					</section>
				</div>
			</div>

			<!-- 주중 예배·모임 -->
			<section class="week rise" style="--i:5" aria-labelledby="h-week">
				<div class="sec-head"><h2 id="h-week">이번 주 예배·모임</h2></div>
				<ul class="week-grid">
					{#each c.weekday as w}
						<li class="w" data-state={w.state ?? 'normal'}>
							<div class="w-head">
								<h3>{w.name}</h3>
								<span class="t num">{w.time}</span>
							</div>
							{#if w.state === 'off'}<span class="badge">휴강</span>
							{:else if w.state === 'replaced'}<span class="badge">대체</span>{/if}
							{#if w.heading}<p class="w-main">{w.heading}</p>{/if}
							{#if w.sub}<p class="w-sub">{w.sub}</p>{/if}
							{#if w.note}<p class="w-note">{w.note}</p>{/if}
							{#if w.lines}
								<dl class="w-lines">
									{#each w.lines as l}
										<div>
											<dt>{l.label}</dt>
											<dd>{l.text}{#if l.sub}<small>{l.sub}</small>{/if}</dd>
										</div>
									{/each}
								</dl>
							{/if}
						</li>
					{/each}
				</ul>
			</section>

			<!-- 모임·봉사·위원 -->
			<div class="trio">
				<section class="rise" style="--i:6" aria-labelledby="h-meet">
					<div class="sec-head"><h2 id="h-meet">모임안내</h2></div>
					<dl class="kv">
						<div><dt>전도폭발</dt><dd>{church.evangelism}</dd></div>
						<div>
							<dt>지역전도</dt>
							<dd>
								{church.outreach}
								<ul class="sub-list">
									{#each c.outreach as o}<li><span class="num">{o.date}</span> {o.teams}</li>{/each}
								</ul>
							</dd>
						</div>
						<div>
							<dt>설거지 봉사</dt>
							<dd>
								<ul class="sub-list">
									{#each c.dishwashing as d}<li><span class="num">{d.date}</span> {d.names}</li>{/each}
								</ul>
							</dd>
						</div>
						{#each c.notes ?? [] as n}<div class="note"><dd>{n}</dd></div>{/each}
					</dl>
				</section>

				<section class="rise" style="--i:7" aria-labelledby="h-committee">
					<div class="sec-head"><h2 id="h-committee">예배위원 안내</h2></div>
					<div class="tbl plain">
						<table class="committee">
							<thead>
								<tr><th rowspan="2" scope="col">예배</th><th colspan="2" scope="colgroup">기도</th><th colspan="2" scope="colgroup">헌금</th></tr>
								<tr><th scope="col">1부</th><th scope="col">2부</th><th scope="col">1부</th><th scope="col">2부</th></tr>
							</thead>
							<tbody>
								{#each c.committee as m}
									<tr>
										<th scope="row" class="num">{m.date}</th>
										<td>{m.prayer[0]}</td><td>{m.prayer[1]}</td>
										<td>{m.offering[0]}</td><td>{m.offering[1]}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>

				<section class="rise" style="--i:8" aria-labelledby="h-care">
					<div class="sec-head"><h2 id="h-care">교우동정</h2></div>
					{#if c.bereavement.length}
						<ul class="care">
							{#each c.bereavement as t}<li><Rich text={t} /></li>{/each}
						</ul>
					{:else}
						<p class="empty">이번 주 알리실 소식이 없습니다.</p>
					{/if}

					<div class="sec-head give-head"><h2>헌금 계좌</h2></div>
					<ul class="give">
						{#each church.offering as o}
							<li>
								<div>
									<span class="g-l">{o.label}</span>
									<span class="g-a num">{o.account} <small>({o.bank})</small></span>
								</div>
								<CopyButton value={o.account} label={o.label} />
							</li>
						{/each}
					</ul>
				</section>
			</div>
		</article>
	{/key}

	<!-- 교회 안내 (매주 동일) -->
	<footer class="about">
		<details>
			<summary><span>교회 안내 · 예배시간 · 섬기는 분들</span></summary>
			<div class="about-body">
				<section>
					<h3>예배시간 안내</h3>
					<table class="times">
						<tbody>
							<tr class="grp"><th colspan="3" scope="colgroup">주일</th></tr>
							{#each church.services as s}
								<tr><th scope="row">{s.name}</th><td class="num">{s.time}</td><td>{s.place}</td></tr>
							{/each}
							<tr class="grp"><th colspan="3" scope="colgroup">주중</th></tr>
							{#each church.weekdayServices as s}
								<tr><th scope="row">{s.name}</th><td class="num">{s.time}</td><td>{s.place}</td></tr>
							{/each}
							<tr class="grp"><th colspan="3" scope="colgroup">주일학교</th></tr>
							{#each church.sundaySchool as s}
								<tr><th scope="row">{s.name}</th><td class="num">{s.time}</td><td>{s.place}</td></tr>
							{/each}
						</tbody>
					</table>
				</section>

				<section>
					<h3>섬기는 분들</h3>
					<dl class="kv tight">
						{#each church.ministers as m}<div><dt>{m.role}</dt><dd>{m.names}</dd></div>{/each}
					</dl>
					<h3 class="mt">찬양대</h3>
					<table class="times">
						<thead><tr><th scope="col">찬양대</th><th scope="col">지휘</th><th scope="col">피아노</th><th scope="col">오르간</th></tr></thead>
						<tbody>
							{#each church.choirs as ch}
								<tr><th scope="row">{ch.name}</th><td>{ch.conductor}</td><td>{ch.piano}</td><td>{ch.organ}</td></tr>
							{/each}
						</tbody>
					</table>
				</section>

				<section>
					<h3>선교후원</h3>
					<dl class="kv tight">
						{#each church.missionaries as m}<div><dt>{m.role}</dt><dd>{m.names}</dd></div>{/each}
						<div><dt>협력교회</dt><dd>{church.partnerChurches}</dd></div>
					</dl>

					<h3 class="mt">우리 교회는</h3>
					<p class="about-p">
						<strong>{church.denomination}</strong> 소속입니다. 설립일은 {church.founded}입니다.
						우리 교회는 <em>‘{church.tagline}’</em>로서
					</p>
					<ul class="vision">
						{#each church.vision as v}<li><span>{v.text}</span><i>({v.key})</i></li>{/each}
					</ul>
					<p class="about-p">통합적이고 균형 잡힌 교회를 향하여 나아갑니다.</p>

					<address>
						{church.address}<br />
						TEL. <a href="tel:{church.tel}">{church.tel}</a> · FAX. {church.fax}<br />
						<a href={church.homepage} rel="noopener">{church.homepage.replace('http://', '')}</a>
					</address>
				</section>
			</div>
		</details>
		<p class="verse-foot">“{church.verse}”</p>
	</footer>
</main>

<style>
	/* ───────── 헤더 ───────── */
	.skip {
		position: absolute;
		left: var(--s4);
		top: -4rem;
		z-index: 20;
		padding: var(--s2) var(--s4);
		background: var(--ink);
		color: var(--paper);
		border-radius: 8px;
	}
	.skip:focus {
		top: var(--s3);
	}

	.top {
		position: sticky;
		top: 0;
		z-index: 10;
		background: color-mix(in srgb, var(--paper) 88%, transparent);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--rule);
	}
	.top-in {
		max-width: 1180px;
		margin: 0 auto;
		padding: var(--s2) var(--s4);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s4);
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--s2);
		min-height: 2.75rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		text-decoration: none;
		white-space: nowrap;
	}

	.weeks {
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
		mask-image: linear-gradient(to right, transparent, #000 12px);
	}
	.weeks::-webkit-scrollbar {
		display: none;
	}
	.weeks ul {
		display: flex;
		gap: var(--s1);
		padding-left: 12px;
	}
	.weeks a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 2.75rem;
		padding: 0 var(--s3);
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--muted);
		text-decoration: none;
		white-space: nowrap;
		transition:
			background-color 160ms ease,
			color 160ms ease,
			transform 160ms var(--ease-out);
	}
	.weeks a em {
		font-style: normal;
		font-size: 0.6875rem;
		font-weight: 700;
		color: var(--coral);
	}
	.weeks a[aria-current='page'] {
		background: var(--ink);
		color: var(--paper);
	}
	.weeks a[aria-current='page'] em {
		color: var(--coral-fill);
	}
	.weeks a:active {
		transform: scale(0.97);
	}
	@media (hover: hover) and (pointer: fine) {
		.weeks a:not([aria-current='page']):hover {
			background: var(--paper-2);
			color: var(--ink);
		}
	}

	/* ───────── 본문 틀 ───────── */
	main {
		max-width: 1180px;
		margin: 0 auto;
		padding: var(--s5) var(--s4) var(--s7);
	}

	.sheet {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s6);
	}

	/* 은은한 입장: 위치는 8px, 단계별 45ms */
	.rise {
		animation: rise 560ms var(--ease-out) backwards;
		animation-delay: calc(var(--i, 0) * 45ms);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.rise {
			animation-name: fade;
			animation-delay: 0ms;
		}
		@keyframes fade {
			from {
				opacity: 0;
			}
		}
	}

	.sec-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s3);
		padding-bottom: var(--s2);
		margin-bottom: var(--s3);
		border-bottom: 1px solid var(--blue-soft);
	}
	.sec-head h2 {
		font-size: 1.0625rem;
		font-weight: 700;
		color: var(--blue);
		letter-spacing: -0.01em;
	}
	.legend {
		font-size: 0.8125rem;
		color: var(--muted);
	}
	.star {
		color: var(--coral);
		font-weight: 700;
		margin-right: 0.1em;
	}
	small {
		font-size: 0.875em;
		color: var(--muted);
		margin-left: 0.5em;
		font-weight: 400;
	}

	/* ───────── 히어로 ───────── */
	.hero {
		display: grid;
		gap: var(--s5);
		padding: var(--s6) var(--s5);
		background: var(--paper-2);
		border-radius: 20px;
	}
	.issue {
		font-size: 0.875rem;
		color: var(--muted);
		margin-bottom: var(--s2);
	}
	.hero h1 {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: clamp(2.25rem, 7vw, 3.75rem);
		line-height: 1.12;
		letter-spacing: -0.03em;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		column-gap: 0.4em;
	}
	.hero h1 .wd {
		font-size: 0.5em;
		font-weight: 500;
		color: var(--coral);
	}
	.service-line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.6rem;
		margin-top: var(--s3);
		color: var(--ink);
	}
	.service-line strong {
		font-weight: 700;
	}
	.service-line span:last-child {
		color: var(--muted);
	}
	.dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--coral-fill);
		flex: none;
	}
	/* 좁은 화면에서는 줄이 바뀌면 점만 줄 끝에 남으므로 숨긴다 */
	@media (max-width: 520px) {
		.dot {
			display: none;
		}
		.service-line strong {
			flex-basis: 100%;
		}
	}
	.theme {
		display: grid;
		gap: 0.1rem;
		margin-top: var(--s3);
	}
	.theme-lead {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--muted);
	}
	.theme-title {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: clamp(1.375rem, 3.6vw, 1.875rem);
		line-height: 1.3;
		letter-spacing: -0.025em;
		color: var(--leaf);
	}
	.verse {
		margin: var(--s4) 0 0;
		max-width: 34rem;
		font-family: var(--font-serif);
		font-size: 0.9375rem;
		line-height: 1.75;
		color: var(--muted);
	}
	.verse footer {
		margin-top: var(--s1);
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--coral);
	}

	.hero-sermon {
		align-self: end;
		padding-top: var(--s5);
		border-top: 1px solid var(--rule-strong);
	}
	.hero-sermon h2 {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: clamp(1.625rem, 4.6vw, 2.5rem);
		line-height: 1.3;
		letter-spacing: -0.025em;
	}
	.hero-sermon h2::before {
		content: '“';
	}
	.hero-sermon h2::after {
		content: '”';
	}
	.by {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.6rem;
		margin-top: var(--s3);
		color: var(--muted);
	}
	.by strong {
		color: var(--ink);
	}

	.welcome {
		max-width: 38rem;
		margin: calc(var(--s2) * -1) auto 0;
		text-align: center;
		font-family: var(--font-serif);
		font-size: 0.9375rem;
		line-height: 1.8;
		color: var(--muted);
	}

	/* ───────── 2단 ───────── */
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s6);
		align-items: start;
	}
	.side {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s6);
	}

	/* 주일예배 */
	.order ol {
		display: grid;
	}
	.order li {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr);
		gap: var(--s3);
		padding: 0.55rem var(--s2);
		align-items: baseline;
		border-radius: 10px;
	}
	.order li + li:not(.emph) {
		border-top: 1px dashed var(--rule);
	}
	.lbl {
		font-weight: 700;
		white-space: nowrap;
		text-align: right;
		letter-spacing: 0.04em;
		position: relative;
		padding-right: var(--s3);
	}
	.lbl::after {
		content: '';
		position: absolute;
		right: 0;
		top: 0.35em;
		bottom: 0.35em;
		width: 1.5px;
		background: var(--coral-fill);
		border-radius: 2px;
	}
	.val {
		min-width: 0;
	}
	.parts {
		display: grid;
		gap: 0.2rem;
	}
	.part {
		display: flex;
		gap: var(--s2);
		align-items: baseline;
	}
	.tag {
		flex: none;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--blue);
		min-width: 1.75rem;
	}
	.part small {
		display: block;
		margin: 0;
	}
	.order li.emph {
		background: color-mix(in srgb, var(--coral-fill) 13%, var(--paper));
		margin: var(--s2) 0;
		padding: var(--s3) var(--s2);
	}
	.sermon-title {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: 1.1875rem;
		line-height: 1.4;
	}
	.emph .val small {
		display: block;
		margin: 0.1rem 0 0;
	}

	/* 교회소식 */
	.news ol {
		display: grid;
		gap: var(--s4);
	}
	.news li {
		display: grid;
		grid-template-columns: 1.5rem minmax(0, 1fr);
		gap: var(--s2);
	}
	.news .n {
		font-weight: 700;
		color: var(--coral);
		text-align: right;
	}
	.news p {
		max-width: 62ch;
	}
	.tbl {
		margin-top: var(--s3);
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: 10px;
		background: var(--surface);
	}
	.tbl-title {
		padding: var(--s2) var(--s3) 0;
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--blue);
	}
	.tbl table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		min-width: 30rem;
	}
	.tbl th,
	.tbl td {
		padding: 0.5rem var(--s3);
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--rule);
	}
	.tbl thead th {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--muted);
		background: var(--paper-2);
	}
	.tbl tr:last-child td,
	.tbl tr:last-child th {
		border-bottom: 0;
	}
	.tbl td {
		white-space: normal;
	}
	.tbl.plain {
		margin-top: 0;
	}
	.committee {
		min-width: 24rem;
	}
	.committee thead th {
		text-align: center;
	}
	.committee td {
		text-align: center;
		white-space: nowrap;
	}
	.committee tbody th {
		white-space: nowrap;
		font-weight: 600;
	}
	.committee tbody th,
	.committee thead tr:first-child th:first-child {
		text-align: left;
	}

	/* 교회행사 */
	.events li {
		display: grid;
		grid-template-columns: 6.5rem minmax(0, 1fr);
		gap: var(--s3);
		padding: 0.5rem 0;
	}
	.events li + li {
		border-top: 1px dashed var(--rule);
	}
	.events .d {
		font-weight: 700;
		color: var(--coral);
	}

	/* ───────── 주중 모임 ───────── */
	.week-grid {
		display: grid;
		gap: 0;
	}
	.w {
		position: relative;
		padding: var(--s4) 0;
		display: grid;
		align-content: start;
		gap: var(--s1);
	}
	.w + .w {
		border-top: 1px solid var(--rule);
	}
	.w-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--s3);
		margin-bottom: var(--s1);
	}
	.w-head h3 {
		font-size: 0.9375rem;
		font-weight: 700;
	}
	.w-head .t {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--coral);
		white-space: nowrap;
	}
	.badge {
		justify-self: start;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--coral-fill) 20%, transparent);
		color: var(--coral);
	}
	.w-main {
		font-family: var(--font-serif);
		font-weight: 600;
		font-size: 1.0625rem;
		line-height: 1.5;
	}
	.w-sub {
		color: var(--muted);
		font-size: 0.9375rem;
	}
	.w-note {
		font-size: 0.8125rem;
		color: var(--muted);
		line-height: 1.55;
		max-width: 32ch;
	}
	.w[data-state='off'] .w-main,
	.w[data-state='replaced'] .w-main {
		color: var(--muted);
	}
	.w-lines {
		display: grid;
		gap: 0.2rem;
		margin-top: var(--s1);
		font-size: 0.9375rem;
	}
	.w-lines div {
		display: grid;
		grid-template-columns: 4.5rem minmax(0, 1fr);
		gap: var(--s2);
		align-items: baseline;
	}
	.w-lines dt {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--blue);
	}

	/* ───────── 하단 3열 ───────── */
	.trio {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s6);
		align-items: start;
	}
	.kv {
		display: grid;
		gap: var(--s3);
	}
	.kv > div {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr);
		gap: var(--s2);
		align-items: baseline;
	}
	.kv dt {
		font-size: 0.875rem;
		font-weight: 700;
	}
	.kv dd {
		font-size: 0.9375rem;
	}
	.kv .note {
		display: block;
		color: var(--muted);
		font-size: 0.875rem;
	}
	.sub-list {
		display: grid;
		gap: 0.15rem;
		margin-top: 0.25rem;
		font-size: 0.875rem;
		color: var(--muted);
	}
	.sub-list .num {
		font-weight: 600;
		color: var(--ink);
		margin-right: 0.35em;
	}

	.care {
		display: grid;
		gap: var(--s2);
		padding: var(--s3) var(--s4);
		border: 1px solid var(--rule);
		border-radius: 10px;
		background: var(--surface);
		font-size: 0.9375rem;
	}
	.empty {
		font-size: 0.9375rem;
		color: var(--muted);
		padding: var(--s3) 0;
	}
	.give-head {
		margin-top: var(--s5);
	}
	.give {
		display: grid;
		gap: var(--s2);
	}
	.give li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s3);
		padding: 0.15rem 0;
	}
	.give li > div {
		display: grid;
		min-width: 0;
	}
	.g-l {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--muted);
	}
	.g-a {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0;
	}
	.g-a small {
		margin-left: 0.2em;
	}

	/* ───────── 교회 안내 ───────── */
	.about {
		margin-top: var(--s7);
		padding-top: var(--s5);
		border-top: 1px solid var(--rule-strong);
	}
	summary {
		display: inline-flex;
		align-items: center;
		gap: var(--s2);
		min-height: 2.75rem;
		cursor: pointer;
		font-weight: 600;
		list-style: none;
		color: var(--blue);
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary::before {
		content: '';
		width: 0.5rem;
		height: 0.5rem;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: rotate(-45deg);
		transition: transform 200ms var(--ease-out);
	}
	details[open] summary::before {
		transform: rotate(45deg);
	}
	.about-body {
		display: grid;
		gap: var(--s6);
		padding-top: var(--s5);
		animation: rise 360ms var(--ease-out) backwards;
	}
	.about h3 {
		font-size: 0.9375rem;
		font-weight: 700;
		color: var(--blue);
		margin-bottom: var(--s2);
	}
	.about h3.mt {
		margin-top: var(--s5);
	}
	.kv.tight {
		gap: var(--s2);
	}
	.kv.tight dd,
	.kv.tight dt {
		font-size: 0.875rem;
	}
	.times {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}
	.times th,
	.times td {
		padding: 0.35rem var(--s2);
		text-align: left;
		font-weight: 400;
		border-bottom: 1px solid var(--rule);
	}
	.times thead th {
		color: var(--muted);
		font-size: 0.8125rem;
		font-weight: 600;
	}
	.times tbody th {
		font-weight: 600;
	}
	.times .grp th {
		padding-top: var(--s3);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--coral);
		border-bottom-color: var(--rule-strong);
	}
	.about-p {
		font-size: 0.875rem;
		line-height: 1.7;
	}
	.about-p em {
		font-style: normal;
		color: var(--leaf);
		font-weight: 700;
	}
	.vision {
		margin: var(--s2) 0;
		padding-left: var(--s4);
		display: grid;
		gap: 0.15rem;
		font-size: 0.875rem;
	}
	.vision i {
		font-style: normal;
		color: var(--muted);
		margin-left: 0.3em;
	}
	address {
		margin-top: var(--s4);
		font-style: normal;
		font-size: 0.8125rem;
		line-height: 1.7;
		color: var(--muted);
	}
	.verse-foot {
		margin-top: var(--s6);
		text-align: center;
		font-family: var(--font-serif);
		font-size: 1rem;
		color: var(--muted);
	}

	/* ───────── 반응형 ───────── */
	@media (min-width: 640px) {
		main {
			padding-inline: var(--s5);
		}
		.top-in {
			padding-inline: var(--s5);
		}
		.hero {
			padding: var(--s7) var(--s6);
		}
		.week-grid {
			grid-template-columns: repeat(2, 1fr);
			column-gap: var(--s6);
		}
		.w:nth-child(2) {
			border-top: 0;
		}
		.about-body {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (min-width: 1000px) {
		.hero {
			grid-template-columns: 1fr 1.15fr;
			gap: var(--s7);
			padding: var(--s7);
			align-items: end;
		}
		.hero-sermon {
			border-top: 0;
			padding-top: 0;
			padding-left: var(--s7);
			border-left: 1px solid var(--rule-strong);
		}
		.cols {
			grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
			gap: var(--s7);
		}
		.week-grid {
			grid-template-columns: repeat(4, 1fr);
			column-gap: 0;
		}
		.w {
			padding: var(--s2) var(--s4);
			border-top: 0 !important;
		}
		.w:first-child {
			padding-left: 0;
		}
		.w + .w {
			border-left: 1px solid var(--rule);
		}
		.trio {
			grid-template-columns: 1fr 1.25fr 1fr;
			gap: var(--s7);
		}
		.about-body {
			grid-template-columns: 1fr 1.1fr 1fr;
			gap: var(--s7);
		}
	}

	@media print {
		.top,
		.skip {
			display: none;
		}
		.rise,
		.about-body {
			animation: none;
		}
	}
</style>
