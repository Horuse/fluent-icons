<script lang="ts">
	import { theme, toggleTheme } from '$lib/theme.svelte';
	import darkSvg from '@fluentui/svg-icons/icons/dark_theme_24_regular.svg?raw';
	import sunnySvg from '@fluentui/svg-icons/icons/weather_sunny_24_regular.svg?raw';
</script>

<button
	type="button"
	onclick={toggleTheme}
	title={theme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
	aria-label="Toggle theme"
	class="fluent-icon flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
>
	{@html theme.value === 'dark' ? sunnySvg : darkSvg}
</button>

<style>
	.fluent-icon :global(svg) {
		width: 16px;
		height: 16px;
		fill: currentColor;
	}
</style>