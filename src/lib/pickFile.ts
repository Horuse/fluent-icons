import type { IconEntry, IconStyle } from './types';

function fileKey(size: number, style: IconStyle): string {
	return `${size}_${style}`;
}

export function pickFile(
	icon: IconEntry,
	preferredSize: number,
	preferredStyle: IconStyle
): string | null {
	const exactMatch = icon.files[fileKey(preferredSize, preferredStyle)];
	if (exactMatch) {
		return exactMatch;
	}

	for (const style of icon.styles) {
		const sameSizeOtherStyle = icon.files[fileKey(preferredSize, style)];
		if (sameSizeOtherStyle) {
			return sameSizeOtherStyle;
		}
	}

	const sizesWithPreferredStyle = icon.sizes.filter(
		(size) => icon.files[fileKey(size, preferredStyle)]
	);
	const closestSize = sizesWithPreferredStyle.sort(
		(a, b) => Math.abs(a - preferredSize) - Math.abs(b - preferredSize)
	)[0];
	if (closestSize !== undefined) {
		return icon.files[fileKey(closestSize, preferredStyle)];
	}

	const anyAvailable = Object.values(icon.files)[0];
	return anyAvailable ?? null;
}