# Deathscythe Mini

A custom animated Codex pet inspired by the Deathscythe mobile suit, drawn in the chibi sticker style of the neighboring Vayeate Mini.

## Install

Copy `pet.json` and `spritesheet.webp` into `~/.codex/pets/deathscythe-mini/`. On Windows, that is usually `%USERPROFILE%\.codex\pets\deathscythe-mini\`. In the Codex desktop app, open **Settings > Pets**, select **Refresh**, and choose **Deathscythe Mini**. Enter `/pet` to show it.

`deathscythe-mini.zip` contains the same two installable files.

## Edit

- `source/references/` contains the canonical base, Vayeate style reference, and row layout guides.
- `source/prompts/` and `source/imagegen-jobs.json` record the visual generation plan. Historical absolute `source_path` values refer to the original generation run; all selected images are retained under `source/decoded/`.
- `source/decoded/` contains generated pose strips on a magenta background.
- `source/frames/` contains extracted transparent PNG frames for precise edits.
- `source/final/spritesheet.png` is the lossless atlas; the root `spritesheet.webp` is the installable atlas.
- `source/qa/` and `source/final/validation.json` contain the contact sheet, motion previews, and checks.

The atlas is 1536 × 1872 pixels: eight columns and nine animation rows, with 192 × 208 pixel cells. After editing frames, use the installed `hatch-pet` skill's `compose_atlas.py` and `validate_atlas.py` scripts to rebuild and check the WebP atlas, then copy it to this folder and recreate the zip.
