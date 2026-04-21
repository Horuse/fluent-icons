type Theme = 'light' | 'dark';

function readInitial(): Theme {
	if (typeof document === 'undefined') return 'light';
	return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export const theme = $state({ value: readInitial() });

export function toggleTheme() {
	const next: Theme = theme.value === 'dark' ? 'light' : 'dark';
	theme.value = next;
	document.documentElement.classList.toggle('dark', next === 'dark');
	localStorage.setItem('theme', next);
}