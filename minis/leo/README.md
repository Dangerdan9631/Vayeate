# Leo Mini

A custom animated Codex pet inspired by the Leo mobile suit. Olive armor, a red mono-eye, a rifle, and a compact shield give it a distinct silhouette.

## Install

Copy `pet.json` and `spritesheet.webp` into `~/.codex/pets/leo-mini/`. On Windows, that is usually `%USERPROFILE%\.codex\pets\leo-mini\`.

In the ChatGPT desktop app, open **Settings > Pets**, select **Refresh**, and choose **Leo Mini**. Enter `/pet` to show it.

`leo-mini.zip` contains the same installable two-file package.

## Edit

- `source/references/` contains the style reference, canonical Leo design, and frame layout guides.
- `source/prompts/` contains the generation prompts for the base and nine animation states.
- `source/decoded/` contains the generated pose strips on a yellow background.
- `source/frames/` contains the extracted transparent PNG frames for precise edits.
- `source/final/spritesheet.png` is the editable lossless atlas; the root `spritesheet.webp` is the installable atlas.
- `source/qa/` and `source/final/validation.json` contain previews and validation results.

The atlas is 1536 × 1872 pixels: eight columns and nine rows with 192 × 208 pixel cells. After editing frames, use the installed `hatch-pet` skill's `compose_atlas.py` and `validate_atlas.py` scripts to rebuild and check the WebP atlas. Leo used stable-slot extraction to keep poses aligned, with a stricter yellow key cutoff to remove the generated background fringe. The JSON job records under `source/` document the generation run and contain historical absolute paths.
