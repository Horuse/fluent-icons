#!/usr/bin/env bun
import { resolve } from 'node:path';

const TARBALL_URL =
	'https://codeload.github.com/microsoft/fluentui-system-icons/tar.gz/refs/heads/main';

const ROOT = resolve(import.meta.dir, '..');
const NPM_ICONS_DIR = resolve(ROOT, 'node_modules/@fluentui/svg-icons/icons');
const NPM_PKG = resolve(ROOT, 'node_modules/@fluentui/svg-icons/package.json');
const OUT_FILE = resolve(ROOT, 'static/icons.json');

type IconMetadata = {
	name?: string;
	description?: string;
	keyword?: string | string[];
	metaphor?: string[];
};

type IconStyle = 'regular' | 'filled';
type Variant = { size: number; style: IconStyle; file: string };

const SVG_NAME_RE = /^(.+)_(\d+)_(regular|filled)\.svg$/;
const META_PATH_RE = /\/assets\/([^/]+)\/metadata\.json$/;

const MOJIBAKE_DECODER = new TextDecoder('utf-8', { fatal: true });

// Fix strings that are valid UTF-8 bytes that were decoded as Latin-1 elsewhere
// and then re-encoded — common in the upstream metadata (e.g. "â ï¸" for "⚠️").
function fixMojibake(s: string): string {
	if (!/[-ÿ]/.test(s)) return s;
	const bytes = new Uint8Array(s.length);
	for (let i = 0; i < s.length; i++) {
		const c = s.charCodeAt(i);
		if (c > 0xff) return s;
		bytes[i] = c;
	}
	try {
		return MOJIBAKE_DECODER.decode(bytes);
	} catch {
		return s;
	}
}

const folderToSlug = (folder: string): string =>
	folder
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');

const slugToTitle = (slug: string): string =>
	slug
		.split('_')
		.filter(Boolean)
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.join(' ');

async function readNpmSvgIndex(): Promise<Map<string, Variant[]>> {
	const glob = new Bun.Glob('*.svg');
	const bySlug = new Map<string, Variant[]>();
	for await (const file of glob.scan({ cwd: NPM_ICONS_DIR, onlyFiles: true })) {
		const m = file.match(SVG_NAME_RE);
		if (!m) continue;
		const [, slug, sizeStr, style] = m;
		const variant: Variant = { size: Number(sizeStr), style: style as IconStyle, file };
		const arr = bySlug.get(slug);
		if (arr) arr.push(variant);
		else bySlug.set(slug, [variant]);
	}
	return bySlug;
}

async function fetchMetadataEntries(): Promise<Array<{ folder: string; data: IconMetadata }>> {
	console.log(`→ fetching ${TARBALL_URL}`);
	const res = await fetch(TARBALL_URL);
	if (!res.ok) throw new Error(`tarball fetch failed: ${res.status} ${res.statusText}`);

	const bytes = await res.bytes();
	console.log(`  ${(bytes.byteLength / 1024 / 1024).toFixed(1)} MB gzipped`);

	const archive = new Bun.Archive(bytes);
	const files = await archive.files('**/assets/*/metadata.json');
	console.log(`  ${files.size} metadata files in archive`);

	const entries: Array<{ folder: string; data: IconMetadata }> = [];
	for (const [path, file] of files) {
		const m = path.match(META_PATH_RE);
		if (!m) continue;
		try {
			entries.push({ folder: m[1], data: (await file.json()) as IconMetadata });
		} catch (err) {
			console.warn(`  ! bad JSON at ${path}: ${(err as Error).message}`);
		}
	}
	return entries;
}

const started = Date.now();

const [svgBySlug, metaEntries, pkg] = await Promise.all([
	readNpmSvgIndex(),
	fetchMetadataEntries(),
	Bun.file(NPM_PKG).json() as Promise<{ version: string }>
]);

console.log(`→ npm: ${svgBySlug.size} unique slugs, metadata: ${metaEntries.length} folders`);

type IconEntry = {
	name: string;
	slug: string;
	folder: string | null;
	direction: 'ltr' | 'rtl' | null;
	sizes: number[];
	styles: IconStyle[];
	description: string;
	metaphors: string[];
	keywords: string[];
	hasMetadata: boolean;
	files: Record<string, string>;
};

const buildVariantMaps = (variants: Variant[]) => {
	const sizes = [...new Set(variants.map((v) => v.size))].sort((a, b) => a - b);
	const styles = [...new Set(variants.map((v) => v.style))].sort() as IconStyle[];
	const files: Record<string, string> = {};
	for (const v of variants) files[`${v.size}_${v.style}`] = v.file;
	return { sizes, styles, files };
};

const icons: IconEntry[] = [];
const matched = new Set<string>();
const stillMissing: string[] = [];

// Pass 1 — metadata ↔ npm direct match.
for (const { folder, data } of metaEntries) {
	const baseSlug = folderToSlug(folder);
	const direct = svgBySlug.get(baseSlug);

	const rawKeywords = Array.isArray(data.keyword)
		? data.keyword
		: data.keyword
			? [data.keyword]
			: [];
	const keywords = rawKeywords.map(fixMojibake);
	const metaphors = (Array.isArray(data.metaphor) ? data.metaphor : []).map(fixMojibake);
	const description = fixMojibake(data.description ?? '');
	const displayName = fixMojibake(data.name ?? folder);

	if (direct) {
		matched.add(baseSlug);
		const { sizes, styles, files } = buildVariantMaps(direct);
		icons.push({
			name: displayName,
			slug: baseSlug,
			folder,
			direction: null,
			sizes,
			styles,
			description,
			metaphors,
			keywords,
			hasMetadata: true,
			files
		});
		continue;
	}

	// Pass 1b — directional variants: `<slug>_ltr_*` and `<slug>_rtl_*`.
	const ltrSlug = `${baseSlug}_ltr`;
	const rtlSlug = `${baseSlug}_rtl`;
	const ltr = svgBySlug.get(ltrSlug);
	const rtl = svgBySlug.get(rtlSlug);

	if (ltr) {
		matched.add(ltrSlug);
		const { sizes, styles, files } = buildVariantMaps(ltr);
		icons.push({
			name: `${displayName} (LTR)`,
			slug: ltrSlug,
			folder,
			direction: 'ltr',
			sizes,
			styles,
			description,
			metaphors,
			keywords,
			hasMetadata: true,
			files
		});
	}
	if (rtl) {
		matched.add(rtlSlug);
		const { sizes, styles, files } = buildVariantMaps(rtl);
		icons.push({
			name: `${displayName} (RTL)`,
			slug: rtlSlug,
			folder,
			direction: 'rtl',
			sizes,
			styles,
			description,
			metaphors,
			keywords,
			hasMetadata: true,
			files
		});
	}
	if (!ltr && !rtl) stillMissing.push(folder);
}

// Pass 2 — npm slugs without any metadata. Name generated from slug.
let orphanCount = 0;
for (const [slug, variants] of svgBySlug) {
	if (matched.has(slug)) continue;
	orphanCount++;

	let direction: 'ltr' | 'rtl' | null = null;
	let baseTitle = slug;
	if (slug.endsWith('_ltr')) {
		direction = 'ltr';
		baseTitle = slug.slice(0, -4);
	} else if (slug.endsWith('_rtl')) {
		direction = 'rtl';
		baseTitle = slug.slice(0, -4);
	}

	const title = slugToTitle(baseTitle);
	const name = direction ? `${title} (${direction.toUpperCase()})` : title;
	const { sizes, styles, files } = buildVariantMaps(variants);

	icons.push({
		name,
		slug,
		folder: null,
		direction,
		sizes,
		styles,
		description: '',
		metaphors: [],
		keywords: [],
		hasMetadata: false,
		files
	});
}

icons.sort((a, b) => a.name.localeCompare(b.name));

const output = {
	version: pkg.version,
	source: 'https://github.com/microsoft/fluentui-system-icons',
	npm: `@fluentui/svg-icons@${pkg.version}`,
	cdn: `https://cdn.jsdelivr.net/npm/@fluentui/svg-icons@${pkg.version}/icons`,
	generatedAt: new Date().toISOString(),
	count: icons.length,
	icons
};

await Bun.write(OUT_FILE, JSON.stringify(output));
const size = Bun.file(OUT_FILE).size;
const elapsed = ((Date.now() - started) / 1000).toFixed(1);
console.log(
	`✓ ${icons.length} icons → static/icons.json (${(size / 1024 / 1024).toFixed(2)} MB) in ${elapsed}s`
);
console.log(
	`  matched metadata: ${icons.filter((i) => i.hasMetadata).length}, orphan npm slugs: ${orphanCount}`
);
if (stillMissing.length) {
	console.log(
		`  ! ${stillMissing.length} metadata folders still unmatched (no npm / _ltr / _rtl): ${stillMissing.join(', ')}`
	);
}