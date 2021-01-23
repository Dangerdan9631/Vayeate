<div align="center">

![Vayeate](/images/Vayeate.png)

# Vayeate
</div>

A custom extension and settings for Visual Studio Code.
![Vayeate](/images/Screenshot.png)

## What's in the folder

* This folder contains all of the files necessary for the color theme extension.
* `package.json` - this is the manifest file that defines the location of the 
  theme file and specifies the base theme of the theme.
* `themes/vayeate-color-theme.json` - the color theme definition file.
* `examples` - this folder includes files in several different languages that can be
  used to test the color theme.
* `settings` - this folder includes exported VS Code settings.

## Testing the color theme

* Press `F5` to open a new window with the extension loaded.
* Open `File > Preferences > Color Themes` and pick the "Vayeate" color theme.
* Open a file that has a language associated. The languages' configured grammar 
  will tokenize the text and assign 'scopes' to the tokens. To examine these 
  scopes, invoke the `Inspect TM Scopes` command from the Command Palette 
  (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).


* Changes to the theme file are automatically applied to the Extension 
  Development Host window.

* The token colorization is done based on standard TextMate themes. Colors are
  matched against one or more scopes.

To learn more about scopes and how they're used, check out:
* [Color theme documentation](https://code.visualstudio.com/api/extension-guides/color-theme)
* [Descriptions of the VS Code controls](https://vscode.readthedocs.io/en/latest/getstarted/theme-color-reference/)
* [Names of semantic highlighting tokens](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#semantic-token-scope-map)
* [TextMate scope selectors](https://macromates.com/manual/en/scope_selectors)

## Install the extension

* To start using the extension with Visual Studio Code copy it into the
  `<user home>/.vscode/extensions` folder and restart Code.
