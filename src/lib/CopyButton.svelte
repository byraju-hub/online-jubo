<script lang="ts">
	let { value, label }: { value: string; label: string } = $props();
	let done = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			// 클립보드 권한이 없는 환경: 선택 복사로 대체
			const ta = document.createElement('textarea');
			ta.value = value;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			ta.remove();
		}
		done = true;
		clearTimeout(timer);
		timer = setTimeout(() => (done = false), 1600);
	}
</script>

<button type="button" class="copy" class:done onclick={copy} aria-label="{label} 계좌번호 복사">
	<span class="a" aria-hidden={done}>복사</span>
	<span class="b" aria-hidden={!done}>복사됨</span>
	<span class="sr-only" aria-live="polite">{done ? '복사했습니다' : ''}</span>
</button>

<style>
	.copy {
		position: relative;
		display: inline-grid;
		place-items: center;
		min-width: 3.5rem;
		min-height: 2.75rem;
		padding: 0 var(--s3);
		border: 1px solid var(--rule-strong);
		border-radius: 999px;
		background: transparent;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--blue);
		cursor: pointer;
		transition:
			transform 160ms var(--ease-out),
			background-color 160ms ease,
			border-color 160ms ease;
	}
	.a,
	.b {
		grid-area: 1 / 1;
		transition:
			opacity 200ms var(--ease-out),
			filter 200ms var(--ease-out),
			transform 200ms var(--ease-out);
	}
	.b {
		opacity: 0;
		filter: blur(2px);
		transform: translateY(4px);
		color: var(--leaf);
	}
	.done .a {
		opacity: 0;
		filter: blur(2px);
		transform: translateY(-4px);
	}
	.done .b {
		opacity: 1;
		filter: blur(0);
		transform: none;
	}
	.copy:active {
		transform: scale(0.97);
	}
	@media (hover: hover) and (pointer: fine) {
		.copy:hover {
			background: color-mix(in srgb, var(--blue) 9%, transparent);
			border-color: var(--blue);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.a,
		.b {
			transform: none !important;
			filter: none !important;
		}
	}
</style>
