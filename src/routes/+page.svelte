<script lang="ts">
	import { onMount } from 'svelte';
	import type MiniSearch from 'minisearch';
	import type { IconEntry, IconStyle, IconsJson } from '$lib/types';
	import { buildIndex, SEARCH_OPTIONS } from '$lib/search';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import IconGrid from '$lib/components/IconGrid.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let data: IconsJson | null = $state(null);
	let index: MiniSearch<{ id: number }> | null = $state(null);

	let query = $state('');
	let styleFilter: IconStyle | null = $state(null);
	let sizeFilter: number | null = $state(null);
	let columns = $state(8);

	let inputEl: HTMLInputElement | undefined = $state();
	let selected: IconEntry | null = $state(null);

	onMount(async () => {
		const res = await fetch('/icons.json');
		const json: IconsJson = await res.json();
		data = json;
		index = buildIndex(json.icons);
		inputEl?.focus();
	});

	const filtered: IconEntry[] = $derived.by(() => {
		if (!data) return [];
		let base: IconEntry[];
		if (query.trim() && index) {
			const hits = index.search(query, SEARCH_OPTIONS);
			base = hits.map((r) => data!.icons[r.id as number]).filter(Boolean);
		} else {
			base = data.icons;
		}
		if (styleFilter !== null) base = base.filter((ic) => ic.styles.includes(styleFilter!));
		if (sizeFilter !== null) base = base.filter((ic) => ic.sizes.includes(sizeFilter!));
		return base;
	});

	const displaySize: number = $derived(sizeFilter ?? 24);
	const displayStyle: IconStyle = $derived(styleFilter ?? 'regular');
</script>

<svelte:head>
	<title>Fluent Icons Search</title>
	<meta
		name="description"
		content="Search Microsoft Fluent UI System Icons by name, keyword, or metaphor."
	/>
</svelte:head>

<div class="flex h-screen flex-col bg-slate-50 text-slate-900">
	<header
		class="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2"
	>
		<div class="flex flex-col leading-tight">
			<h1 class="text-sm font-semibold tracking-tight">fluent-icons</h1>
			<span class="text-[11px] text-slate-500">
				unofficial viewer for
				<a
					href="https://github.com/microsoft/fluentui-system-icons"
					target="_blank"
					rel="noreferrer"
					class="underline decoration-slate-300 hover:text-slate-700 hover:decoration-slate-500"
					>Microsoft Fluent UI System Icons</a
				>
				· MIT License
			</span>
		</div>
		<a
			href="https://github.com/Horuse/fluenticons"
			target="_blank"
			rel="noreferrer"
			title="Star on GitHub"
			class="ml-auto flex h-8 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
		>
			<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
				<path
					d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
				/>
			</svg>
			<span>Star on GitHub</span>
		</a>
	</header>

	<div
		class="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm"
	>
		<input
			bind:this={inputEl}
			bind:value={query}
			placeholder={data ? `Search ${data.count.toLocaleString()} icons…` : 'Loading…'}
			type="search"
			class="h-10 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
		/>
		<span class="w-28 text-right text-xs tabular-nums text-slate-500">
			{#if data}
				{filtered.length.toLocaleString()} / {data.count.toLocaleString()}
			{:else}
				&mdash;
			{/if}
		</span>
	</div>

	{#if data && index}
		<FilterBar bind:styleFilter bind:sizeFilter bind:columns />
		<div class="flex min-h-0 flex-1">
			<div class="min-w-0 flex-1 pt-2">
				<IconGrid
					icons={filtered}
					cdn={data.cdn}
					preferredSize={displaySize}
					preferredStyle={displayStyle}
					{columns}
					selectedSlug={selected?.slug ?? null}
					onSelect={(ic) => (selected = ic)}
				/>
			</div>
			{#if selected}
				<Sidebar
					icon={selected}
					cdn={data.cdn}
					preferredSize={displaySize}
					preferredStyle={displayStyle}
					onClose={() => (selected = null)}
				/>
			{/if}
		</div>
	{:else}
		<div class="flex flex-1 items-center justify-center text-sm text-slate-400">Loading…</div>
	{/if}
</div>