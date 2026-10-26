# TypeStory — Skriv deg videre

A Norwegian typing adventure for ages 7–12, built with plain HTML, CSS and JavaScript. No frameworks, external fonts or runtime dependencies.

## Run

Open `index.html` directly in a browser, or run `python -m http.server 8000` in this folder and visit `http://localhost:8000`.

Choose a story with **Velg eventyr**. Type the sentence, then press **Enter** or **Fortsett** to reveal it and move on. **Med litt hjelp** rejects incorrect input. **På egen hånd** lets you correct mistakes yourself. Accuracy counts typed characters. Pasting and dropping text into the exercise are blocked. The input receives focus when the game loads. Completed sentences are saved per story in browser local storage. Switching modes preserves completed sentences. **Start på nytt** resets only the current story. The final button opens the story library.

If storage is unavailable, progress lasts only while the page remains open. A fully typed sentence is saved when you press Continue or Enter.

## Content

`data/stories.json` is the source for ten original Norwegian stories. After edits, run `node scripts/sync-stories.js` to validate the punctuation and regenerate the direct-file/offline copy in `data/stories.js`. Only letters, whitespace, periods, commas and exclamation marks are allowed in story text and titles. Decorative interface symbols are never typing targets.

## Design and assets

The desktop layout uses a generated storybook landscape, dark panels, gold accents and cyan typing highlights. The story library uses a native accessible dialog. Narrow-window layouts and reduced-motion preferences are supported.

- `assets/stories/*.png`: ten unique story backgrounds generated with the built-in image generation tool. Selecting a story changes both the page and revealed-story background. Each story maps to its image via the `background` field in `data/stories.json`. Exact prompts are in `assets/stories/prompts.json`.
- `assets/favicon.svg`: scalable book and sparkle mark.
- `assets/favicon-32.png`: browser PNG fallback.
- `assets/apple-touch-icon.png`: opaque 180 by 180 iOS home-screen icon.

`src/app.js` contains the active game logic. The legacy `src/ui.js` is not loaded.

## Validation

JavaScript syntax and story punctuation checked. A Node DOM simulation exercised both typing modes, wrong input, corrections, sentence advancement, mode and story switches, saved progress after reload, completion and reset. Story bundle parity and PNG dimensions were also checked. Visual browser review remains outstanding because the connected browser disallowed local file URLs.

