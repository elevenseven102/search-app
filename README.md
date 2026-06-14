# Search App - Electrobun

Minimalist desktop search application built with Electrobun for fast fuzzy search across 900k+ records.

## Features

- **4 Search Types**: Switch between naim, inverted_naim, voenkomats, addresses (Tab key)
- **Fuzzy Search**: Real-time search with ~3+ character threshold
- **Keyboard Navigation**: 
  - ↑/↓ Arrow keys: Navigate results
  - Tab: Switch search type
  - Enter: Copy selected result
  - Ctrl+Q: Toggle window visibility
- **Semi-transparent UI**: Modern glassmorphism design
- **Fast Search**: Uses Fuse.js for efficient fuzzy matching
- **Smart Copy**: For addresses, copies name + address + postal code with line breaks

## Installation

```bash
bun install
```

## Development

```bash
bun run dev
```

## Building

```bash
bun run build
```

## Data Format

The `data.json` file should contain:

```json
{
  "naim": [{"name": "..."}, ...],
  "inverted_naim": [{"name": "..."}, ...],
  "voenkomats": [{"name": "..."}, ...],
  "adresses": [
    {
      "name": "...",
      "address": "...",
      "postal_code": "..."
    },
    ...
  ]
}
```

## Performance Notes

For 900k+ records:
- Fuse.js loads and indexes data efficiently in memory
- Search threshold set to 0.3 for typo tolerance
- Results limited to 5 per search for UI responsiveness
- Data loads synchronously on app start (fast with Bun)

For even better performance with very large datasets, consider:
1. Splitting data by first letter/category
2. Using Web Workers for search indexing
3. Lazy-loading specific categories only

## Customization

- **Window size**: Edit `electrobun.config.ts` BrowserWindow dimensions
- **Search threshold**: Adjust `threshold` in `initFuseInstances()` (0-1, lower = more fuzzy)
- **Max results**: Change the `slice(0, 5)` in `performSearch()`
- **Colors**: Edit `styles.css` CSS variables and colors

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+Q | Toggle window |
| Tab | Next search type |
| ↑/↓ | Navigate results |
| Enter | Copy selected |
| Type | Focus on search input (always) |
