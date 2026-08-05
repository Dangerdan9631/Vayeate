# Vayeate

A custom extension and settings for Visual Studio Code.

## Included themes

| Dark themes | Theme | Light themes |
| --- | --- | --- |
| <img src="./images/vayeate-theme.png" alt="Vayeate dark theme" width="600"> | **Vayeate**<br><img src="./images/Vayeate.png" alt="Vayeate" width="100"> | <img src="./images/vayeate-light-theme.png" alt="Vayeate light theme" width="600"> |
| <img src="./images/mercurius-theme.png" alt="Mercurius dark theme" width="600"> | **Mercurius**<br><img src="./images/Mercurius.png" alt="Vayeate" width="100"> | <img src="./images/mercurius-light-theme.png" alt="Mercurius light theme" width="600"> |
| <img src="./images/wing-zero-theme.png" alt="Wing Zero dark theme" width="600"> | **Wing Zero**<br><img src="./images/Wing Zero.png" alt="Vayeate" width="100"> | <img src="./images/wing-zero-light-theme.png" alt="Wing Zero light theme" width="600"> |
| <img src="./images/deathscythe-theme.png" alt="Deathscythe dark theme" width="600"> | **Deathscythe**<br><img src="./images/Deathscythe.png" alt="Vayeate" width="100"> | <img src="./images/deathscythe-light-theme.png" alt="Deathscythe light theme" width="600"> |
| <img src="./images/heavyarms-theme.png" alt="Heavyarms dark theme" width="600"> | **Heavyarms**<br><img src="./images/Heavyarms.png" alt="Vayeate" width="100"> | <img src="./images/heavyarms-light-theme.png" alt="Heavyarms light theme" width="600"> |
| <img src="./images/sandrock-theme.png" alt="Sandrock dark theme" width="600"> | **Sandrock**<br><img src="./images/Sandrock.png" alt="Vayeate" width="100"> | <img src="./images/sandrock-light-theme.png" alt="Sandrock light theme" width="600"> |
| <img src="./images/altron-theme.png" alt="Altron dark theme" width="600"> | **Altron**<br><img src="./images/Altron.png" alt="Vayeate" width="100"> | <img src="./images/altron-light-theme.png" alt="Altron light theme" width="600"> |
| <img src="./images/shenlong-theme.png" alt="Shenlong dark theme" width="600"> | **Shenlong**<br><img src="./images/Shenlong.png" alt="Vayeate" width="100"> | <img src="./images/shenlong-light-theme.png" alt="Shenlong light theme" width="600"> |
| <img src="./images/tallgeese-theme.png" alt="Tallgeese dark theme" width="600"> | **Tallgeese**<br><img src="./images/Tallgeese.png" alt="Vayeate" width="100"> | <img src="./images/tallgeese-light-theme.png" alt="Tallgeese light theme" width="600"> |
| <img src="./images/tallgeese-2-theme.png" alt="Tallgeese 2 dark theme" width="600"> | **Tallgeese 2**<br><img src="./images/Tallgeese 2.png" alt="Vayeate" width="100"> | <img src="./images/tallgeese-2-light-theme.png" alt="Tallgeese 2 light theme" width="600"> |
| <img src="./images/tallgeese-3-theme.png" alt="Tallgeese 3 dark theme" width="600"> | **Tallgeese 3**<br><img src="./images/Tallgeese 3.png" alt="Vayeate" width="100"> | <img src="./images/tallgeese-3-light-theme.png" alt="Tallgeese 3 light theme" width="600"> |
| <img src="./images/epyon-theme.png" alt="Epyon dark theme" width="600"> | **Epyon**<br><img src="./images/Epyon.png" alt="Vayeate" width="100"> | <img src="./images/epyon-light-theme.png" alt="Epyon light theme" width="600"> |
| <img src="./images/leo-theme.png" alt="Leo dark theme" width="600"> | **Leo**<br><img src="./images/Leo.png" alt="Vayeate" width="100"> | <img src="./images/leo-light-theme.png" alt="Leo light theme" width="600"> |
| <img src="./images/aries-theme.png" alt="Aries dark theme" width="600"> | **Aries**<br><img src="./images/Aries.png" alt="Vayeate" width="100"> | <img src="./images/aries-light-theme.png" alt="Aries light theme" width="600"> |
| <img src="./images/taurus-theme.png" alt="Taurus dark theme" width="600"> | **Taurus**<br><img src="./images/Taurus.png" alt="Vayeate" width="100"> | <img src="./images/taurus-light-theme.png" alt="Taurus light theme" width="600"> |
| <img src="./images/virgo-theme.png" alt="Virgo dark theme" width="600"> | **Virgo**<br><img src="./images/Virgo.png" alt="Vayeate" width="100"> | <img src="./images/virgo-light-theme.png" alt="Virgo light theme" width="600"> |
| <img src="./images/serpent-theme.png" alt="Serpent dark theme" width="600"> | **Serpent**<br><img src="./images/Serpent.png" alt="Vayeate" width="100"> | <img src="./images/serpent-light-theme.png" alt="Serpent light theme" width="600"> |

## What's in the repo?

This repo contains all of the files necessary for the extension.
* `package.json` - This is the manifest file that defines the properties of the
  extension.
* `themes` - This folder contains color theme definitions.
* `examples` - This folder includes files in several different languages that 
  can be used to test color themes.
* `settings` - This folder includes exported settings used within VS Code.
  * `settings/VSCode/keybindings.json` - VS Code keyboard bindings that can be
    added using the JSON keybinding editor. 
    `Command Palette -> Preferences: Open Keyboard Shortcuts (JSON)`
  * `settings/VSCode/*` - VS Code settings that can be added using the JSON
    settings editor. `Command Palette -> Preferences: Open Settings (JSON)`
    * `settings/VSCode/*.workspace.json` - VS Code settings that should be 
    configured per workspace by adding to the `.vscode/settings.json` file in
    the workspace root.
  * `settings/Omnisharp` - C# formatting settings that can be used by copying
    the json file into the `<user home>/.omnisharp` folder and replace the
    substitution values inside of `[]`.
  * `settings/Idea` - IDEA settings. See [README.md](./settings/Idea/README.md) for instructions.
* `scripts` - Vayeate BlueShell Scripts. See [README.md](./scripts/README.md).

## Testing color themes

* Press `F5` to open a new window with the extension loaded.
* Open `File > Preferences > Color Themes` and pick the "Vayeate" color theme.
* Open a file that has a language associated. The languages' configured grammar 
  will tokenize the text and assign 'scopes' to the tokens. To examine these 
  scopes, invoke the `Inspect TM Scopes` command from the Command Palette 
  (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).

Changes to the theme file are automatically applied to the Extension 
Development Host window.

The token colorization is done based on standard TextMate themes. Colors are
matched against one or more scopes.

**To learn more about scopes and how they're used, check out:**
* [Color theme documentation](https://code.visualstudio.com/api/extension-guides/color-theme)
* [Descriptions of the VS Code controls](https://vscode.readthedocs.io/en/latest/getstarted/theme-color-reference/)
* [Names of semantic highlighting tokens](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#semantic-token-scope-map)
* [TextMate scope selectors](https://macromates.com/manual/en/scope_selectors)

## Install the extension

Install the `Visual Studio Code Extensions` CLI
```shell
 npm install -g @vscode/vsce
 ```

Run the install-extension script
```shell
npm run install-extension
```

Diff Editor
Editor Chrome
Editor Window
Terminal
