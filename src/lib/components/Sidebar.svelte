<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
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
	const reactImportName = $derived(
		`${pascal}${effSize}${effStyle === 'filled' ? 'Filled' : 'Regular'}`
	);
	const reactImport = $derived(
		`import { ${reactImportName} } from '@fluentui/react-icons';`
	);
	const svgImport = $derived(
		file ? `import svg from '@fluentui/svg-icons/icons/${file}?raw';` : ''
	);
	const svgPath = $derived(file ? `node_modules/@fluentui/svg-icons/icons/${file}` : '');

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
				? 'bg-slate-900 text-white'
				: 'bg-slate-100 text-slate-700 hover:bg-slate-200'
		}`;
</script>

<aside
	class="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white text-slate-900"
	transition:slide|global={{ axis: 'x', duration: 220, easing: cubicOut }}
>
	<header class="flex items-start gap-2 border-b border-slate-200 px-4 py-3">
		<div class="min-w-0 flex-1">
			<div class="truncate text-sm font-semibold">{icon.name}</div>
			<div class="truncate font-mono text-[11px] text-slate-500">{icon.slug}</div>
		</div>
		<button
			type="button"
			onclick={onClose}
			class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
			title="Close"
			aria-label="Close"
		>
			<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
				<path
					d="M5.3 4.3a1 1 0 0 1 1.4 0L10 7.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 9l3.3 3.3a1 1 0 0 1-1.4 1.4L10 10.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 9 5.3 5.7a1 1 0 0 1 0-1.4Z"
				/>
			</svg>
		</button>
	</header>

	<div class="flex-1 overflow-auto px-4 py-4">
		<div
			class="icon-preview mx-auto flex h-32 w-32 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-900"
		>
			{#if svgText}
				{@html svgText}
			{/if}
		</div>

		<div class="mt-4 space-y-3">
			<div>
				<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500">style</div>
				<div class="flex flex-wrap gap-1">
					{#each icon.styles as s (s)}
						<button class={chipCls(effStyle === s)} onclick={() => (userStyle = s)}>
							{s}
						</button>
					{/each}
				</div>
			</div>

			<div>
				<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500">size</div>
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
					<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500">direction</div>
					<span class="font-mono text-xs text-slate-700">{icon.direction}</span>
				</div>
			{/if}

			{#if icon.keywords.length > 0}
				<div>
					<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500">keywords</div>
					<div class="flex flex-wrap gap-1">
						{#each icon.keywords as k (k)}
							<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">{k}</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if icon.metaphors.length > 0}
				<div>
					<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500">metaphors</div>
					<div class="flex flex-wrap gap-1">
						{#each icon.metaphors as m (m)}
							<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">{m}</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if icon.description}
				<div>
					<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500">description</div>
					<div class="text-xs text-slate-700">{icon.description}</div>
				</div>
			{/if}
		</div>

		<div class="mt-5 space-y-3">
			<div>
				<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500">file</div>
				<div class="flex items-center gap-1">
					<code
						class="min-w-0 flex-1 overflow-x-auto rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-800"
						>{file ?? '—'}</code
					>
					{#if file}
						<button
							onclick={() => copy(file!, 'file')}
							class="shrink-0 rounded bg-slate-900 px-2 py-1 text-[11px] text-white hover:bg-slate-700"
						>
							{copiedKey === 'file' ? 'copied' : 'copy'}
						</button>
					{/if}
				</div>
			</div>

			{#if svgPath}
				<div>
					<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500">path</div>
					<div class="flex items-center gap-1">
						<code
							class="min-w-0 flex-1 overflow-x-auto rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-800"
							>{svgPath}</code
						>
						<button
							onclick={() => copy(svgPath, 'path')}
							class="shrink-0 rounded bg-slate-900 px-2 py-1 text-[11px] text-white hover:bg-slate-700"
						>
							{copiedKey === 'path' ? 'copied' : 'copy'}
						</button>
					</div>
				</div>
			{/if}

			<div>
				<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500">svg import</div>
				<div class="flex items-start gap-1">
					<code
						class="min-w-0 flex-1 overflow-x-auto whitespace-pre rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-800"
						>{svgImport}</code
					>
					{#if svgImport}
						<button
							onclick={() => copy(svgImport, 'svgImport')}
							class="shrink-0 rounded bg-slate-900 px-2 py-1 text-[11px] text-white hover:bg-slate-700"
						>
							{copiedKey === 'svgImport' ? 'copied' : 'copy'}
						</button>
					{/if}
				</div>
			</div>

			<div>
				<div class="mb-1 text-[11px] uppercase tracking-wide text-slate-500">react icons</div>
				<div class="flex items-start gap-1">
					<code
						class="min-w-0 flex-1 overflow-x-auto whitespace-pre rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-800"
						>{reactImport}</code
					>
					<button
						onclick={() => copy(reactImport, 'react')}
						class="shrink-0 rounded bg-slate-900 px-2 py-1 text-[11px] text-white hover:bg-slate-700"
					>
						{copiedKey === 'react' ? 'copied' : 'copy'}
					</button>
				</div>
			</div>
		</div>
	</div>

	<footer class="flex gap-2 border-t border-slate-200 px-4 py-3">
		<button
			onclick={copySvg}
			disabled={!svgText}
			class="flex-1 rounded-md bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-700 disabled:opacity-40"
		>
			{copiedKey === 'svg' ? 'copied!' : 'copy svg'}
		</button>
		<button
			onclick={downloadSvg}
			disabled={!svgText}
			class="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 hover:bg-slate-50 disabled:opacity-40"
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
</style>