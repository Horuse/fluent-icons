<script lang="ts">
	import { onMount } from 'svelte';
	import type MiniSearch from 'minisearch';
	import panelRightSvg from '@fluentui/svg-icons/icons/panel_right_24_regular.svg?raw';
	import dismissSvg from '@fluentui/svg-icons/icons/dismiss_24_regular.svg?raw';
	import type { IconEntry, IconStyle, IconsJson } from '$lib/types';
	import { buildIndex, SEARCH_OPTIONS } from '$lib/search';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import IconGrid from '$lib/components/IconGrid.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let data: IconsJson | null = $state(null);
	let index: MiniSearch<{ id: number }> | null = $state(null);

	let query = $state('');
	let styleFilter: IconStyle | null = $state(null);
	let sizeFilter: number | null = $state(null);
	let columns = $state(8);

	let inputEl: HTMLInputElement | undefined = $state();
	let selected: IconEntry | null = $state(null);
	let sidebarOpen: boolean = $state(false);
	let prefsLoaded = false;

	function loadPrefs() {
		const savedStyle = localStorage.getItem('styleFilter');
		if (savedStyle !== null) {
			try {
				styleFilter = JSON.parse(savedStyle);
			} catch {}
		}
		const savedSize = localStorage.getItem('sizeFilter');
		if (savedSize !== null) {
			try {
				sizeFilter = JSON.parse(savedSize);
			} catch {}
		}
		const savedCols = localStorage.getItem('columns');
		if (savedCols !== null) {
			columns = Number(savedCols);
		} else {
			columns = Math.min(20, Math.max(1, Math.round((window.innerWidth - 32) / 200)));
		}
		prefsLoaded = true;
	}

	onMount(async () => {
		loadPrefs();
		const res = await fetch('/icons.json');
		const json: IconsJson = await res.json();
		data = json;
		index = buildIndex(json.icons);
		inputEl?.focus();
	});

	$effect(() => {
		const v = styleFilter;
		if (prefsLoaded) localStorage.setItem('styleFilter', JSON.stringify(v));
	});
	$effect(() => {
		const v = sizeFilter;
		if (prefsLoaded) localStorage.setItem('sizeFilter', JSON.stringify(v));
	});
	$effect(() => {
		const v = columns;
		if (prefsLoaded) localStorage.setItem('columns', String(v));
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
	<title>Fluent Icons — search Microsoft Fluent UI System Icons</title>
	<meta
		name="description"
		content="Fast viewer for Microsoft Fluent UI System Icons. Search ~5000 icons by name, keyword, or metaphor, and copy ready-to-paste snippets for SVG, React, React Native, iOS, Android, and Flutter."
	/>
	<link rel="canonical" href="https://fluent-icons.vercel.app/" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="fluent-icons" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:url" content="https://fluent-icons.vercel.app/" />
	<meta property="og:title" content="Fluent Icons — search Microsoft Fluent UI System Icons" />
	<meta
		property="og:description"
		content="Fast viewer for Microsoft Fluent UI System Icons with keyword and metaphor search, plus copy-ready snippets for every platform."
	/>
	<meta property="og:image" content="https://fluent-icons.vercel.app/preview.png" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="2802" />
	<meta property="og:image:height" content="1654" />
	<meta
		property="og:image:alt"
		content="fluent-icons viewer showing the searchable icon grid and details sidebar"
	/>

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://fluent-icons.vercel.app/" />
	<meta name="twitter:title" content="Fluent Icons — search Microsoft Fluent UI System Icons" />
	<meta
		name="twitter:description"
		content="Fast viewer for Microsoft Fluent UI System Icons with keyword and metaphor search."
	/>
	<meta name="twitter:image" content="https://fluent-icons.vercel.app/preview.png" />
	<meta
		name="twitter:image:alt"
		content="fluent-icons viewer showing the searchable icon grid and details sidebar"
	/>

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'fluent-icons',
		url: 'https://fluent-icons.vercel.app/',
		description:
			'Fast viewer for Microsoft Fluent UI System Icons with keyword and metaphor search, plus copy-ready snippets for SVG, React, React Native, iOS, Android, and Flutter.',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript',
		image: 'https://fluent-icons.vercel.app/preview.png',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		license: 'https://opensource.org/licenses/MIT'
	})}<\/script>`}
</svelte:head>

<div class="flex h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
	<header
		class="flex items-start sm:items-center flex-col sm:flex-row gap-3 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900"
	>
		<div class="flex items-center gap-2">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				class="h-6 w-6 shrink-0 fill-current text-slate-900 dark:text-slate-100"
			>
				<path
					d="M8.9 16.5h6.2c-.62 3.27-1.87 5.5-3.1 5.5-1.2 0-2.4-2.1-3.04-5.2l-.06-.3h6.2-6.2Zm-5.83 0h4.3c.37 2.08.98 3.85 1.8 5.1a10.03 10.03 0 0 1-5.96-4.82l-.14-.28Zm13.56 0h4.3a10.03 10.03 0 0 1-6.1 5.1 13.47 13.47 0 0 0 1.72-4.69l.08-.4h4.3-4.3Zm.3-6.5h4.87a10.05 10.05 0 0 1-.26 5h-4.7a27.53 27.53 0 0 0 .13-4.34l-.04-.66h4.87-4.87ZM2.2 10h4.87a28.21 28.21 0 0 0 .03 4.42l.06.58h-4.7a10 10 0 0 1-.26-5Zm6.38 0h6.84a25.84 25.84 0 0 1-.03 4.43l-.06.57H8.67a25.36 25.36 0 0 1-.13-4.51l.04-.49h6.84-6.84Zm6.36-7.42-.1-.17c3.01.89 5.44 3.16 6.53 6.09h-4.59c-.31-2.42-.96-4.5-1.84-5.92l-.1-.17.1.17Zm-5.9-.14.12-.03a14.57 14.57 0 0 0-1.88 5.65l-.06.44h-4.6a10.03 10.03 0 0 1 6.42-6.06l.12-.03-.12.03ZM12 2c1.32 0 2.65 2.54 3.21 6.19l.05.31H8.74C9.28 4.7 10.64 2 12 2Z"
				/>
			</svg>
			<div class="flex flex-col leading-tight">
				<h1 class="text-sm font-semibold tracking-tight">fluent-icons</h1>
				<span class="text-[11px] text-slate-500 dark:text-slate-400">
					unofficial viewer for
					<a
						href="https://github.com/microsoft/fluentui-system-icons"
						target="_blank"
						rel="noreferrer"
						class="underline decoration-slate-300 hover:text-slate-700 hover:decoration-slate-500 dark:decoration-slate-600 dark:hover:text-slate-200 dark:hover:decoration-slate-400"
						>Microsoft Fluent UI System Icons</a
					>
					· MIT License
				</span>
			</div>
		</div>
		<div class="sm:ml-auto flex items-center gap-2">
		{#if selected}
			<button
				type="button"
				onclick={() => (sidebarOpen = !sidebarOpen)}
				title={sidebarOpen ? 'Hide details' : 'Show details'}
				aria-label="Toggle details panel"
				class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:fill-current"
			>
				{@html panelRightSvg}
			</button>
		{/if}
		<ThemeToggle />
		<a
			href="https://github.com/Horuse/fluenticons"
			target="_blank"
			rel="noreferrer"
			title="Star on GitHub"
			class="flex h-8 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
		>
			<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
				<path
					d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
				/>
			</svg>
			<span>Star on GitHub</span>
		</a>
		</div>
	</header>

	<div
		class="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
	>
		<div class="relative flex-1">
			<input
				bind:this={inputEl}
				bind:value={query}
				placeholder={data ? `Search ${data.count.toLocaleString()} icons…` : 'Loading…'}
				type="text"
				class="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-4 pr-11 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900"
			/>
			{#if query}
				<button
					type="button"
					onclick={() => {
						query = '';
						inputEl?.focus();
					}}
					title="Clear search"
					aria-label="Clear search"
					class="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:fill-current"
				>
					{@html dismissSvg}
				</button>
			{/if}
		</div>
		<span class="w-28 text-right text-xs tabular-nums text-slate-500 dark:text-slate-400">
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
			<div class="min-w-0 flex-1 pt-4">
				<IconGrid
					icons={filtered}
					cdn={data.cdn}
					preferredSize={displaySize}
					preferredStyle={displayStyle}
					{columns}
					selectedSlug={selected?.slug ?? null}
					onSelect={(ic) => {
						selected = ic;
						sidebarOpen = true;
					}}
				/>
			</div>
			{#if selected && sidebarOpen}
				<Sidebar
					icon={selected}
					cdn={data.cdn}
					preferredSize={displaySize}
					preferredStyle={displayStyle}
					onClose={() => (sidebarOpen = false)}
				/>
			{/if}
		</div>
	{:else}
		<div class="flex flex-1 items-center justify-center text-sm text-slate-400 dark:text-slate-500">
			Loading…
		</div>
	{/if}
</div>