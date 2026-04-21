<script lang="ts">
	import type { IconEntry, IconStyle } from '$lib/types';
	import { pickFile } from '$lib/pickFile';
	import { loadSvg } from '$lib/svgCache';

	type Props = {
		icon: IconEntry;
		cdn: string;
		preferredSize: number;
		preferredStyle: IconStyle;
		selected?: boolean;
		onSelect: (icon: IconEntry) => void;
	};

	let { icon, cdn, preferredSize, preferredStyle, selected = false, onSelect }: Props = $props();

	const file = $derived(pickFile(icon, preferredSize, preferredStyle));
	const url = $derived(file ? `${cdn}/${file}` : '');

	let svgText: string | null = $state(null);

	$effect(() => {
		if (!url) {
			svgText = null;
			return;
		}
		let cancelled = false;
		loadSvg(url).then((t) => {
			if (!cancelled) svgText = t;
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<button
	type="button"
	onclick={() => onSelect(icon)}
	title={`${icon.name}\n${icon.slug}`}
	class="icon-host flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border p-2 text-slate-900 transition dark:text-slate-100 {selected
		? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10'
		: 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800'}"
>
	<div class="icon-inline flex h-[40%] w-[40%] items-center justify-center">
		{#if svgText}
			{@html svgText}
		{/if}
	</div>
	<div class="w-full truncate text-center text-[11px] text-slate-500 dark:text-slate-400">
		{icon.name}
	</div>
</button>

<style>
	.icon-inline :global(svg) {
		width: 100%;
		height: 100%;
		fill: currentColor;
	}
</style>