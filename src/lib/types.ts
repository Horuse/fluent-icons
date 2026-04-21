export type IconStyle = 'regular' | 'filled';
export type IconDirection = 'ltr' | 'rtl' | null;

export type IconEntry = {
	name: string;
	slug: string;
	folder: string | null;
	direction: IconDirection;
	sizes: number[];
	styles: IconStyle[];
	description: string;
	metaphors: string[];
	keywords: string[];
	hasMetadata: boolean;
	files: Record<string, string>;
};

export type IconsJson = {
	version: string;
	source: string;
	npm: string;
	cdn: string;
	generatedAt: string;
	count: number;
	icons: IconEntry[];
};