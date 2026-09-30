# Sandrock Mini

A custom animated Codex pet inspired by the Sandrock mobile suit, with ivory and teal armor, a gold crescent crest, and paired curved blades.

## Install

Copy `pet.json` and `spritesheet.webp` into `~/.codex/pets/sandrock-mini/` (on Windows, `%USERPROFILE%\.codex\pets\sandrock-mini\`). In the Codex desktop app, open **Settings > Pets**, select **Refresh**, and choose **Sandrock Mini**. Enter `/pet` to show it. `sandrock-mini.zip` contains the same two-file installable package.

## Edit

`source/references/` contains the Vayeate style reference, the Sandrock canonical base, and layout guides. `source/prompts/` records the generated prompts; `source/decoded/` holds the generated state strips; and `source/frames/` contains individual transparent PNG frames for precise edits. `source/final/spritesheet.png` is the lossless atlas. QA contact sheets, GIF previews, checks, and generation records are under `source/`.

The atlas is 1536 × 1872 pixels: eight columns and nine rows, with 192 × 208 pixel cells. After editing frames, run the installed `hatch-pet` skill's `compose_atlas.py` and `validate_atlas.py` scripts to rebuild and check the WebP atlas. Generation records contain historical absolute paths.
