<script lang="ts">
	import type { IconStyle } from '$lib/types';

	type Props = {
		styleFilter: IconStyle | null;
		sizeFilter: number | null;
		columns: number;
	};

	let {
		styleFilter = $bindable(),
		sizeFilter = $bindable(),
		columns = $bindable()
	}: Props = $props();

	const STYLES: IconStyle[] = ['regular', 'filled'];
	const SIZES = [16, 20, 24, 28, 32, 48];

	const pillCls = (active: boolean) =>
		`px-2.5 py-1 text-xs rounded-md transition ${
			active
				? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
				: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
		}`;
</script>

<div
	class="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900"
>
	<div class="flex items-center gap-1">
		<span class="mr-2 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">style</span>
		<button class={pillCls(styleFilter === null)} onclick={() => (styleFilter = null)}>any</button>
		{#each STYLES as st (st)}
			<button class={pillCls(styleFilter === st)} onclick={() => (styleFilter = st)}>{st}</button>
		{/each}
	</div>

	<div class="flex items-center gap-1">
		<span class="mr-2 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">size</span>
		<button class={pillCls(sizeFilter === null)} onclick={() => (sizeFilter = null)}>any</button>
		{#each SIZES as sz (sz)}
			<button class={pillCls(sizeFilter === sz)} onclick={() => (sizeFilter = sz)}>{sz}</button>
		{/each}
	</div>

	<label class="ml-auto flex items-center gap-2">
		<span class="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">columns</span>
		<input
			type="range"
			min="3"
			max="20"
			step="1"
			bind:value={columns}
			class="accent-slate-900 dark:accent-slate-100"
		/>
		<span class="w-6 text-right font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300"
			>{columns}</span
		>
	</label>
</div>