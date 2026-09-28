# Vayeate Mini

A custom animated Codex pet inspired by the Vayeate mobile suit.

## Install

Copy `pet.json` and `spritesheet.webp` into `~/.codex/pets/vayeate-mini/`.
On Windows, that is usually `%USERPROFILE%\.codex\pets\vayeate-mini\`.
In the ChatGPT desktop app, open **Settings > Pets**, select **Refresh**, and choose **Vayeate Mini**. Enter `/pet` to show it.

`vayeate-mini.zip` contains the same installable two-file package.

## Edit

- `source/references/` contains the original character art, the canonical base pose, and the frame layout guides.
- `source/prompts/` contains the prompts used for the base pose and each animation state.
- `source/decoded/` contains the generated pose strips on a magenta background.
- `source/frames/` contains the extracted transparent PNG frames. Edit these for precise frame changes.
- `source/final/spritesheet.png` is the editable lossless atlas; the root `spritesheet.webp` is the installable atlas.
- `source/qa/` and `source/final/validation.json` contain previews and checks.

The atlas is 1536 × 1872 pixels: eight columns and nine animation rows, with 192 × 208 pixel cells. After editing frames, use the installed `hatch-pet` skill's `compose_atlas.py` and `validate_atlas.py` scripts to rebuild and check the WebP atlas. The JSON job records under `source/` document the original generation run and contain historical absolute paths.
