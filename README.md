Violentmonkey userscript for `m.youtube.com`. It sets the native player's `audio_only` argument before initialization and subsequent video loads. YouTube handles all media requests; the script uses no polling or DOM observers.

Install [Violentmonkey](https://violentmonkey.github.io/get-it/) and the [userscript](https://raw.githubusercontent.com/sashokey/youtube-mobile-audio-only/master/youtube-mobile-audio-only.user.js). Enable `Allow User Scripts` for Violentmonkey if required. Reload the mobile page so the page-context hook runs at document start.

The authoritative source is [youtube-mobile-audio-only.src.ts](youtube-mobile-audio-only.src.ts). Protected namespaces and immutable argument objects remain usable; unsupported mutations are skipped while native `this`, arguments, return values and exceptions are preserved.

Use Node.js 24:

```sh
npm ci --ignore-scripts
npm run build
npm run check
```

`check` runs type-aware lint, strict type checking, JavaScript syntax/metadata/build reproducibility checks, and 34 native-API contract tests against readable compiled and minified artifacts. Coverage includes both factory entry points, early and late API definitions, API replacement, subsequent loads, repeated installation, frozen arguments, protected globals, and native errors. GitHub Actions runs the same checks on pushes and pull requests.

All authored TypeScript, including tests and helpers, uses `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and type-aware unsafe-operation lint rules. `allowJs` is disabled. `skipLibCheck` applies only to overlapping third-party browser declarations; authored files remain checked. Dependencies and tool versions are pinned in `package-lock.json`.
