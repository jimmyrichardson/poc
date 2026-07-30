# AI context: poc monorepo

Instructions for future agents working in this repository. Prefer this folder over guessing from Vite defaults.

## What this repo is

- Multi-page collection of frontend POCs in one GitHub repo.
- Deployed to **GitHub Pages** at `https://jimmyrichardson.github.io/poc/`.
- Each subdirectory is an independent landing page (HTML + its own scripts/styles/assets).
- The repo root `index.html` is the collection home page.

Examples of live paths:

- `/poc/` → root
- `/poc/wooden-hand/`
- `/poc/clouds/`
- `/poc/breathe/`

## Vite base URL rules (critical)

Local and production path prefixes **differ**. Vite `base` must follow the command:

| Command | `base` | Example page URL |
| --- | --- | --- |
| `vite` / `yarn dev` (serve) | `'/'` | `http://localhost:5173/wooden-hand/` |
| `vite build` | `'/poc/...'` | `https://jimmyrichardson.github.io/poc/wooden-hand/` |

Root config (`vite.config.js`):

```js
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/poc/dist/',
  appType: 'mpa',
  // ...
}));
```

Per-project configs (e.g. `clouds/vite.config.js`):

```js
base: command === 'serve' ? '/' : '/poc/clouds/dist/',
```

### Do not

- Set a fixed production `base` like `'/poc/dist/'` without the serve branch. That makes the dev server announce `http://localhost:5173/poc/dist/` and redirect subdirectory visits with messages like: “did you mean to visit `/poc/dist/poc/wooden-hand/` instead?”
- Ask developers to manually comment/uncomment `base` for local vs production.
- Manually comment/uncomment source vs `dist` CSS/JS tags in `index.html` before committing.
- Use absolute `/poc/...` links in HTML when a relative path works (`./`, `../`). Relative paths keep local + GitHub Pages working together.

## HTML asset tags (dev vs GitHub Pages)

GitHub Pages serves the repo as static files (no Vite at runtime). Committed HTML must therefore reference built assets:

```html
<link rel="stylesheet" href="./dist/assets/main.css">
<script type="module" src="./dist/assets/main.js"></script>
```

`main.js` is the Vite entry (`import './src/styles/styles.css'` + `import './src/js/main.js'`). After build, CSS is extracted to `dist/assets/main.css`, so production HTML needs both tags.

During local serve, root `vite.config.js` loads `githubPagesDevAssets` from `vite.plugins.js`, which rewrites:

- removes the `./dist/assets/main.css` link
- changes `./dist/assets/main.js` → `./main.js`

So one HTML file works for both environments. Exceptions (no rewrite needed): pages that are CDN-only (`wooden-hand`), CSS-only (`breathe`), or not yet on the dist pattern.

## Local workflow

Always develop from the **repo root**:

```bash
yarn dev
```

Then open the subdirectory, e.g. `http://localhost:5173/wooden-hand/`.

Per-project `vite.config.js` files are primarily for **`vite build --config ...`**. Day-to-day serving uses the root config so the whole monorepo is available under `/`.

## Build workflow

- Root: `yarn build` → root `dist/`
- Named projects: `yarn build:clouds`, `yarn build:line-displacement`, `yarn build:image-depth-parallax`, etc.
- HTML stays on `./dist/assets/main.*` paths; rebuild and commit `dist/` when shipping.
- Built `dist/` folders for projects may be committed so GitHub Pages can serve them without a CI build step.

## Adding a new POC

1. Copy `starter/` (or a similar project).
2. Rename and replace `[PROJECT_NAME]` in that project's `vite.config.js` (keep the `command === 'serve' ? '/' : '/poc/<name>/dist/'` pattern).
3. Add a `build:<name>` script in root `package.json` when a Vite bundle is required.
4. Keep `index.html` on production `./dist/assets/main.css` + `./dist/assets/main.js` tags only.
5. Verify locally at `http://localhost:5173/<name>/` (plugin should rewrite to `./main.js`) before relying on production `/poc/<name>/`.

## Related files

- `vite.config.js` — root serve + root build
- `vite.plugins.js` — `githubPagesDevAssets` HTML rewrite for local serve
- `*/vite.config.js` — per-project production builds
- `starter/` — template for new projects
- `package.json` — `dev`, `build`, `build:*` scripts
- `README.md` — human-facing summary of the same rules
