import MiniSearch from 'minisearch';
import type { IconEntry } from './types';

type Doc = {
	id: number;
	name: string;
	slug: string;
	keywords: string;
	metaphors: string;
	description: string;
};

export const SEARCH_OPTIONS = {
	boost: { name: 4, keywords: 2, metaphors: 1.5, slug: 1, description: 0.5 },
	prefix: true,
	fuzzy: 0.2,
	combineWith: 'AND' as const
};

export function buildIndex(icons: IconEntry[]): MiniSearch<Doc> {
	const index = new MiniSearch<Doc>({
		fields: ['name', 'slug', 'keywords', 'metaphors', 'description'],
		storeFields: ['id'],
		searchOptions: SEARCH_OPTIONS
	});

	index.addAll(
		icons.map((icon, id) => ({
			id,
			name: icon.name,
			slug: icon.slug.replace(/_/g, ' '),
			keywords: icon.keywords.join(' '),
			metaphors: icon.metaphors.join(' '),
			description: icon.description
		}))
	);

	return index;
}