# Exam Timer

A lightweight, local-first web app to create and track countdown timers for exams. Add custom timers, import presets, or quickly add specific papers from a built-in schedule. Dark mode included.

## Features

- Countdown cards for each exam/paper
- Add Individual Paper card
  - Select a subject and paper to add a pre-scheduled timer
  - Shows formatted date/time preview before adding
- Preset imports (two examples included)
- Import/export timers as JSON files
- Remove all timers with confirmation
- Dark mode toggle with persisted preference
- LocalStorage persistence (your timers remain across refreshes)

## Getting started

This is a static site—no server required. You only need to build the CSS once (or watch while developing) and open `index.html` in your browser.

### 1) Install dependencies

```cmd
npm install
```

### 2) Build CSS (Tailwind)

Build once:

```cmd
npx tailwindcss -i input.css -o output.css
```

Or watch for changes during development:

```cmd
npm run build
```

> The script `npm run build` runs Tailwind in `--watch` mode using your `input.css` and writes to `output.css`.

### 3) Open the app

Open `index.html` directly in your browser (double-click it or drag it into a tab). All logic runs client-side.

## How to use

- Add a custom timer
  - Enter a name and pick a future date/time, then click "Add Timer".
- Add an individual paper
  - Use the "Add Individual Paper" card to select subject and paper.
  - The preview shows the exact date/time; click "Add Paper Timer" to add it.
- Import presets
  - Two preset buttons are available under "Manage Timers" to quickly add example sets.
- Import from file
  - Click "Import Timers" and choose a `.json` file in the export format below.
- Export timers
  - Click "Export Timers" to download your current timers as JSON.
- Remove all
  - Click "Remove All" to clear everything (asks for confirmation).
- Theme toggle
  - Use the sun/moon button in the header to switch themes; choice is saved.

## JSON format (import/export)

Exported timers are a simple array of objects:

```json
[
  { "name": "Math P1", "targetDate": "2025-10-08T08:30" },
  { "name": "Chem P2", "targetDate": "2025-10-10T08:30" }
]
```

Notes:
- `targetDate` must be a valid ISO string (`YYYY-MM-DDTHH:mm`).
- During import, timers with past dates are ignored and duplicates are skipped.

## Built-in paper schedule

The "Add Individual Paper" card uses an embedded schedule for subjects like Economics, Business, Further Mathematics, Chemistry, Physics, Biology, Accounting, Psychology, and Mathematics with their paper codes (e.g., `P12`, `P23`, `P43`). Selecting one will show the date/time and let you add that specific paper as a timer.

## Development notes

- TailwindCSS 4.x is used via CLI with the following pieces:
  - `input.css` contains `@import "tailwindcss";` and a few custom styles.
  - `tailwind.config.js` scans `*.html` and `*.js` and uses class-based dark mode.
  - Output is written to `output.css`, which is linked in `index.html`.
- JavaScript
  - The app is a single script (`script.js`) loaded as a module.
  - Timers persist in `localStorage` under the key `examTimers`.
  - Duplicate detection prevents adding the same name+date pair twice.

## Troubleshooting

- Page has no styling
  - Ensure `output.css` exists. Rebuild CSS (see Build CSS section above).
- Import fails
  - Verify your file is valid JSON and matches the export format.
- Time appears off by some hours
  - Times are interpreted in the browser's local time zone. Confirm your system time zone.
- Delete button not working inside icon
  - The handler detects clicks on the button or its SVG via `closest('.delete-btn')`.

## License

ISC
