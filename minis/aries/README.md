# Aries Mini

A Codex v2 animated pet based on the Gundam Wing Aries mobile suit. Slate blue armor, pale gray twin shoulder intakes, a cyan visor, wings, and a dark rifle match the supplied reference.

## Install

Copy `pet.json` and `spritesheet.webp` into `~/.codex/pets/aries-mini/`. On Windows, that is usually `%USERPROFILE%\.codex\pets\aries-mini\`. In the Codex desktop app, open **Settings > Pets**, select **Refresh**, and choose **Aries Mini**. Enter `/pet` to show it.

`aries-mini.zip` contains the same two installable files.

## Edit

- `source/v2/references/` has the character reference, canonical base, and layout guides.
- `source/v2/prompts/`, `source/v2/imagegen-jobs.json`, and `source/v2/decoded/` preserve the generation prompts, provenance, and pose strips. Historical absolute paths in JSON refer to the original run.
- `source/v2/frames/` has extracted transparent frames. `source/v2/final/` has the lossless and installable extended atlas plus validation.
- `source/v2/qa/` has contact sheets, motion previews, 16-direction visual review, blind direction checks, and continuity reports.
- Files directly under `source/` are the previous v1 source and are kept as history.

The v2 atlas is 1536 × 2288 pixels: eight columns and eleven rows of 192 × 208 pixel cells. It includes the nine standard animation states and sixteen clockwise look directions. `pet.json` sets `spriteVersionNumber` to `2`.
