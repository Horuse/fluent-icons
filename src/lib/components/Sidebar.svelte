<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import dismissSvg from '@fluentui/svg-icons/icons/dismiss_24_regular.svg?raw';
	import type { IconEntry, IconStyle } from '$lib/types';
	import { pickFile } from '$lib/pickFile';
	import { loadSvg } from '$lib/svgCache';

	type Props = {
		icon: IconEntry;
		cdn: string;
		preferredSize: number;
		preferredStyle: IconStyle;
		onClose: () => void;
	};

	let { icon, cdn, preferredSize, preferredStyle, onClose }: Props = $props();

	let userStyle: IconStyle | null = $state(null);
	let userSize: number | null = $state(null);

	const effStyle: IconStyle = $derived(
		userStyle && icon.styles.includes(userStyle)
			? userStyle
			: icon.styles.includes(preferredStyle)
				? preferredStyle
				: (icon.styles[0] ?? 'regular')
	);

	const effSize: number = $derived(
		userSize && icon.sizes.includes(userSize)
			? userSize
			: icon.sizes.includes(preferredSize)
				? preferredSize
				: (icon.sizes[0] ?? 24)
	);

	const file = $derived(pickFile(icon, effSize, effStyle));
	const url = $derived(file ? `${cdn}/${file}` : '');

	let svgText: string | null = $state(null);
	$effect(() => {
		svgText = null;
		if (!url) return;
		let cancelled = false;
		loadSvg(url)
			.then((t) => {
				if (!cancelled) svgText = t;
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	});

	const pascal = $derived(pascalCase(icon.slug));
	const camel = $derived(pascal.charAt(0).toLowerCase() + pascal.slice(1));
	const styleCap = $derived(effStyle === 'filled' ? 'Filled' : 'Regular');
	const identifier = $derived(`${pascal}${effSize}${styleCap}`);

	const svgImport = $derived(
		file ? `import svg from '@fluentui/svg-icons/icons/${file}?raw';` : ''
	);
	const reactImport = $derived(`import { ${identifier} } from '@fluentui/react-icons';`);
	const reactNativeImport = $derived(
		`import { ${identifier} } from '@fluentui/react-native-icons';`
	);
	const androidDrawable = $derived(`R.drawable.ic_fluent_${icon.slug}_${effSize}_${effStyle}`);
	const iosEnum = $derived(`UIImage(fluent: .${camel}${effSize}${styleCap})`);
	const flutterIcon = $derived(`Icon(FluentIcons.${icon.slug}_${effSize}_${effStyle})`);

	function pascalCase(slug: string): string {
		return slug
			.split('_')
			.filter(Boolean)
			.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
			.join('');
	}

	let copiedKey: string | null = $state(null);
	let copyTimer: ReturnType<typeof setTimeout> | null = null;

	async function copy(text: string, key: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedKey = key;
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => {
				copiedKey = null;
			}, 1200);
		} catch {}
	}

	async function copySvg() {
		if (svgText) await copy(svgText, 'svg');
	}

	function downloadSvg() {
		if (!svgText || !file) return;
		const blob = new Blob([svgText], { type: 'image/svg+xml' });
		const a = document.createElement('a');
		const href = URL.createObjectURL(blob);
		a.href = href;
		a.download = file.split('/').pop() ?? `${icon.slug}.svg`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(href);
	}

	const chipCls = (active: boolean) =>
		`px-2 py-0.5 text-xs rounded transition ${
			active
				? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
				: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
		}`;
</script>

<aside
	class="fixed inset-y-0 right-0 z-40 flex h-full w-full flex-col border-l border-slate-200 bg-white text-slate-900 shadow-xl sm:static sm:inset-auto sm:w-80 sm:shrink-0 sm:shadow-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
	transition:slide|global={{ axis: 'x', duration: 220, easing: cubicOut }}
>
	<header
		class="flex items-start gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800"
	>
		<div class="min-w-0 flex-1">
			<div class="truncate text-sm font-semibold">{icon.name}</div>
			<div class="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
				{icon.slug}
			</div>
		</div>
		<button
			type="button"
			onclick={onClose}
			class="close-icon rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
			title="Close"
			aria-label="Close"
		>
			{@html dismissSvg}
		</button>
	</header>

	<div class="flex-1 overflow-auto px-4 py-4">
		<div class="icon-preview mx-auto flex w-full aspect-square items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
		>
			{#if svgText}
				{@html svgText}
			{/if}
		</div>

		<div class="mt-4 space-y-3">
			<div>
				<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">style</div>
				<div class="flex flex-wrap gap-1">
					{#each icon.styles as s (s)}
						<button class={chipCls(effStyle === s)} onclick={() => (userStyle = s)}>
							{s}
						</button>
					{/each}
				</div>
			</div>

			<div>
				<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">size</div>
				<div class="flex flex-wrap gap-1">
					{#each icon.sizes as sz (sz)}
						<button class={chipCls(effSize === sz)} onclick={() => (userSize = sz)}>
							{sz}
						</button>
					{/each}
				</div>
			</div>

			{#if icon.direction}
				<div>
					<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">direction</div>
					<span class="font-mono text-xs text-slate-700 dark:text-slate-300">{icon.direction}</span>
				</div>
			{/if}

			{#if icon.keywords.length > 0}
				<div>
					<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">keywords</div>
					<div class="flex flex-wrap gap-1">
						{#each icon.keywords as k (k)}
							<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">{k}</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if icon.metaphors.length > 0}
				<div>
					<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">metaphors</div>
					<div class="flex flex-wrap gap-1">
						{#each icon.metaphors as m (m)}
							<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">{m}</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if icon.description}
				<div>
					<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">description</div>
					<div class="text-xs text-slate-700 dark:text-slate-300">{icon.description}</div>
				</div>
			{/if}
		</div>

		<div class="mt-5 space-y-3">
			<div>
				<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">file</div>
				<div class="flex items-center gap-1">
					<code
						class="min-w-0 flex-1 overflow-x-auto rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200"
						>{file ?? '—'}</code
					>
					{#if file}
						<button
							onclick={() => copy(file!, 'file')}
							class="shrink-0 rounded bg-slate-900 px-2 py-1 text-[11px] text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
						>
							{copiedKey === 'file' ? 'copied' : 'copy'}
						</button>
					{/if}
				</div>
			</div>

			{#snippet codeRow(label: string, value: string, key: string)}
				<div>
					<div
						class="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400"
					>
						{label}
					</div>
					<div class="flex items-start gap-1">
						<code
							class="min-w-0 flex-1 overflow-x-auto whitespace-pre rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200"
							>{value}</code
						>
						<button
							onclick={() => copy(value, key)}
							class="shrink-0 rounded bg-slate-900 px-2 py-1 text-[11px] text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
						>
							{copiedKey === key ? 'copied' : 'copy'}
						</button>
					</div>
				</div>
			{/snippet}

			{#if svgImport}
				{@render codeRow('svg import', svgImport, 'svgImport')}
			{/if}
			{@render codeRow('@fluentui/react-icons', reactImport, 'react')}
			{@render codeRow('@fluentui/react-native-icons', reactNativeImport, 'rn')}
			{@render codeRow('android', androidDrawable, 'android')}
			{@render codeRow('ios', iosEnum, 'ios')}
			{@render codeRow('flutter', flutterIcon, 'flutter')}
		</div>
	</div>

	<footer class="flex gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
		<button
			onclick={copySvg}
			disabled={!svgText}
			class="flex-1 rounded-md bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-700 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
		>
			{copiedKey === 'svg' ? 'copied!' : 'copy svg'}
		</button>
		<button
			onclick={downloadSvg}
			disabled={!svgText}
			class="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
		>
			download
		</button>
	</footer>
</aside>

<style>
	.icon-preview :global(svg) {
		width: 80%;
		height: 80%;
		fill: currentColor;
	}
	.icon-preview :global(svg *) {
		fill: currentColor;
	}
	.close-icon :global(svg) {
		width: 16px;
		height: 16px;
		fill: currentColor;
	}
</style>