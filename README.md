<div align="center">

![Vayeate](/images/Vayeate.png)

# Vayeate
</div>

A custom extension and settings for Visual Studio Code.
![Vayeate](/images/vayeate-theme.png)
![Mercurius](/images/mercurius-theme.png)
![Vayeate Light](/images/vayeate-light-theme.png)

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
