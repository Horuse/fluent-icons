<script lang="ts">
	import { VList } from 'virtua/svelte';
	import IconCard from './IconCard.svelte';
	import type { IconEntry, IconStyle } from '$lib/types';

	type Props = {
		icons: IconEntry[];
		cdn: string;
		preferredSize: number;
		preferredStyle: IconStyle;
		columns: number;
		selectedSlug?: string | null;
		onSelect: (icon: IconEntry) => void;
	};

	let {
		icons,
		cdn,
		preferredSize,
		preferredStyle,
		columns,
		selectedSlug = null,
		onSelect
	}: Props = $props();

	const rows = $derived.by(() => {
		const out: IconEntry[][] = [];
		for (let i = 0; i < icons.length; i += columns) {
			out.push(icons.slice(i, i + columns));
		}
		return out;
	});
</script>

{#if icons.length === 0}
	<div class="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
		No icons match.
	</div>
{:else}
	<VList data={rows} getKey={(_, i) => `${i}-${columns}`}>
		{#snippet children(row: IconEntry[])}
			<div
				class="grid gap-2 px-4 pb-2"
				style:grid-template-columns="repeat({columns}, minmax(0, 1fr))"
			>
				{#each row as icon (icon.slug)}
					<IconCard
						{icon}
						{cdn}
						{preferredSize}
						{preferredStyle}
						{onSelect}
						selected={icon.slug === selectedSlug}
					/>
				{/each}
			</div>
		{/snippet}
	</VList>
{/if}