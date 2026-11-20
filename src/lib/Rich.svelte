<script lang="ts">
	/** "**굵게**" 표기만 지원하는 가벼운 인라인 렌더러 (HTML 주입 없음) */
	let { text }: { text: string } = $props();
	const chunks = $derived(
		text.split(/(\*\*[^*]+\*\*)/g).map((s) =>
			s.startsWith('**') && s.endsWith('**') && s.length > 4
				? { bold: true, s: s.slice(2, -2) }
				: { bold: false, s }
		)
	);
</script>

{#each chunks as c}{#if c.bold}<strong>{c.s}</strong>{:else}{c.s}{/if}{/each}
