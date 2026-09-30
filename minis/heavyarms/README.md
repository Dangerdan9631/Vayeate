# HeavyArms Mini

A custom animated Codex pet inspired by the HeavyArms mobile suit, with red and white armor, shoulder missile pods, and a compact gatling.

## Install

Copy `pet.json` and `spritesheet.webp` into `~/.codex/pets/heavyarms-mini/` (on Windows, `%USERPROFILE%\.codex\pets\heavyarms-mini\`). In the Codex desktop app, open **Settings > Pets**, select **Refresh**, and choose **HeavyArms Mini**. Enter `/pet` to show it. `heavyarms-mini.zip` contains the same two-file installable package.

## Edit

`source/references/` contains the Vayeate style reference, the HeavyArms canonical base, and layout guides. `source/prompts/` records the generated prompts; `source/decoded/` holds the generated state strips; and `source/frames/` contains individual transparent PNG frames for precise edits. `source/final/spritesheet.png` is the lossless atlas. QA contact sheets, GIF previews, checks, and generation records are under `source/`.

The atlas is 1536 × 1872 pixels: eight columns and nine rows, with 192 × 208 pixel cells. After editing frames, run the installed `hatch-pet` skill's `compose_atlas.py` and `validate_atlas.py` scripts to rebuild and check the WebP atlas. Generation records contain historical absolute paths.
