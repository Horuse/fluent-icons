const svgCache = new Map<string, Promise<string>>();

export async function loadSvg(url: string): Promise<string> {
	if (svgCache.has(url)) {
		return svgCache.get(url)!;
	}

	const request = fetch(url).then((response) => {
		if (!response.ok) {
			throw new Error(`Failed to fetch SVG (${response.status}): ${url}`);
		}
		return response.text();
	});

	svgCache.set(url, request);

	return request;
}