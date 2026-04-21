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
	class="icon-host group relative flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border p-2 text-slate-900 transition {selected
		? 'border-blue-500 bg-blue-50'
		: 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'}"
>
	<div class="icon-inline flex h-[40%] w-[40%] items-center justify-center">
		{#if svgText}
			{@html svgText}
		{/if}
	</div>
	<div class="w-full truncate text-center text-[11px] text-slate-500">{icon.name}</div>

	{#if !icon.hasMetadata}
		<span
			class="absolute left-1 top-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800 opacity-0 transition group-hover:opacity-100"
			title="No metadata in GitHub repo"
		>
			no meta
		</span>
	{/if}
</button>

<style>
	.icon-inline :global(svg) {
		width: 100%;
		height: 100%;
		fill: currentColor;
	}
</style>