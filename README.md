# fluent-icons

Unofficial viewer for [Microsoft Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons) - a fast way to find the icon you need out of ~2,900 and grab a ready-to-paste snippet for SVG, React, React Native, iOS, Android, or Flutter.

## Why

Microsoft ships its icon set as an open-source repo with ~2,900 icons. A few third-party viewers already exist, but most match on the icon name only - if you're looking for "delete" but the icon is filed under `trash`, you won't find it.

Microsoft's own metadata already includes `keywords` and `metaphors` (e.g. `trash` has `delete`, `remove`, `garbage`). This viewer indexes those fields with fuzzy + prefix search, so the word you'd naturally think of usually gets you there.

## What you can do

- **Search** by name, keyword, metaphor, or slug - fuzzy + prefix, using the upstream metadata.
- **Filter** by style (regular / filled) and size (16/20/24/28/32/48), and pick how many columns the grid has.
- **Preview** any icon at the size and style you actually need, with full metadata (keywords, metaphors, description, direction).
- **Copy** ready-to-paste snippets for every platform:
  - raw SVG markup
  - Vite `?raw` import
  - `@fluentui/react-icons` import
  - `@fluentui/react-native-icons` import
  - Android drawable resource
  - iOS `UIImage(fluent:)` enum
  - Flutter `FluentIcons` constant
- **Download** individual SVGs as files.

## License

The app itself is MIT. The icons are Microsoft's and distributed under MIT — see the upstream repo.