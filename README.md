# fluent-icons

Unofficial viewer for [Microsoft Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons) - a fast way to find the icon you need out of ~4,000 and grab whatever you want from it: raw SVG, the path inside `node_modules`, or a ready-to-paste React import.

## Why

Microsoft ships its icon set as an npm package and an open-source repo, and a few third-party viewers already exist. Most of them match on the icon name only - if you're looking for "delete" but the icon is filed under `trash`, you won't find it.

Microsoft's own metadata already includes `keywords` and `metaphors` (e.g. `trash` has `delete`, `remove`, `garbage`). This project just indexes all of those fields with fuzzy + prefix matching, so searching by the word you'd naturally think of usually works.

## What you can do

- **Search** by name, keyword, metaphor or slug. Fuzzy + prefix, using the synonym metadata pulled straight from the upstream GitHub repo.
- **Filter** by style (regular / filled), size (16/20/24/28/32/48), and drag a slider to pick how many columns the grid has.
- **Preview** any icon at the size and style you actually need.
- **One-click copy** for: SVG markup, the file path inside `node_modules/@fluentui/svg-icons/icons/...`, the Vite-style `?raw` import, and the matching `@fluentui/react-icons` import — all preformatted so you can paste them straight into your code.
- **Download** individual SVGs as files.

## License

The app itself is MIT. The icons are Microsoft's and distributed under MIT — see the upstream repo.