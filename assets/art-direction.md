# Background art direction

## Mandatory requirements
- Create every background from scratch using the full story text in `data/stories.json` as the narrative source. Never inspect, trace, edit, imitate, or provide old backgrounds as image references.
- Use original anime and manga-inspired art: expressive ink contours, cel shading, restrained hatching, atmospheric painted environments and cinematic light. Avoid copying a franchise, named character, or particular artist.
- Each story has its own unique cast. Before generation, assign distinct face shapes, hair silhouettes and colors, skin tones, builds, outfits and accessories. Compare against ALL other stories, especially the immediately preceding story; a clothing recolor alone is insufficient.
- Preserve those identities across future scenes within the same story. If the prose specifies appearance, it takes precedence; otherwise art-only appearance choices may establish the cast.
- Read the entire story and depict a coherent event with its actual characters, objects and setting. Do not borrow narrative motifs from previous artwork.
- Keep imagery welcoming and appropriate for ages 7–12. No lettering, captions, panels, watermarks, UI, or logos.

## Composition
Use a wide 16:9 full-bleed environment. The desktop typing panel occupies the center: keep that region relatively quiet, with characters and story landmarks toward the lower outer thirds. Allow cover cropping on narrow screens. Maintain readable UI overlays.

## Cast register and generation prompts
`stories/prompts.json` records the complete shared direction and each final prompt, including the distinct cast descriptions. Consult it for identity collision checks, not old pictures. Future stories must add a new entry and a distinct cast before generating art. Generation uses the built-in image_gen tool with no image references.

## Web delivery
- Ship opaque WebP files, not generated PNG masters. Keep masters outside the served repository.
- Maximum delivered dimensions: 1600 × 900. Target approximately 100–220 KiB per background, hard maximum 250 KiB (256000 bytes).
- Use `scripts/optimize-story-images.cjs <story-id> <generated-source-path>` with Sharp installed or `NODE_PATH` pointing to its package directory. It strips metadata and tries quality 82 down to 54, then smaller dimensions if necessary, rejecting any output over the budget.
- After export, inspect the actual WebP for linework, faces, gradients and story accuracy. Check cast distinction across the collection. Record dimensions, quality and bytes in `stories/image-report.json`.
- Update `data/stories.json`, regenerate `data/stories.js` with `node scripts/sync-stories.js`, and update the default CSS background. Load only the selected story; do not preload the entire collection.
- Remove superseded background files and stale prompts after verifying replacements. Retain unrelated app icons.

