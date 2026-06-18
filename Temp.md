instead of using code that knows about the bundled extensions and loads them, the extensions should come bundled in a way that they can be loaded the same way as custom extensions. The default extension configuration should include those bundled extensions. This keeps the code simple and avoids forking paths, and allows the user to remove or override the bundled extensions.

---

The update command doesn't need to - Writes `.bak` siblings for locally modified toolkit-owned files before overwrite (`src/updates/backup.ts`).

---

Support adding related projects that are used for additional context.