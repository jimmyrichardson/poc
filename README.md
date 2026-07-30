# poc

A collection of frontend proof-of-concepts. Each subdirectory is its own landing page with its own scripts and styles.

Published on GitHub Pages at:

**https://jimmyrichardson.github.io/poc/**

Examples:

- https://jimmyrichardson.github.io/poc/
- https://jimmyrichardson.github.io/poc/wooden-hand/
- https://jimmyrichardson.github.io/poc/clouds/

## Local development

From the repo root:

```bash
yarn
yarn dev
```

Vite serves the monorepo from `/` (not `/poc/`). Open any subdirectory directly:

| Local | Production |
| --- | --- |
| http://localhost:5173/ | https://jimmyrichardson.github.io/poc/ |
| http://localhost:5173/wooden-hand/ | https://jimmyrichardson.github.io/poc/wooden-hand/ |
| http://localhost:5173/clouds/ | https://jimmyrichardson.github.io/poc/clouds/ |
| http://localhost:5173/breathe/ | https://jimmyrichardson.github.io/poc/breathe/ |

### Dev vs production CSS/JS (no manual swapping)

Committed `index.html` files always point at the **production** bundles GitHub Pages can serve:

```html
<link rel="stylesheet" href="./dist/assets/main.css">
<script type="module" src="./dist/assets/main.js"></script>
```

During `yarn dev`, a Vite plugin (`vite.plugins.js` → `githubPagesDevAssets`) rewrites those tags to `./main.js` (which already imports CSS) so you get HMR. Do **not** comment source vs dist tags in and out before committing.

Prefer **relative** paths (`./dist/assets/...`, `../favicon.ico`) so local and GitHub Pages stay aligned.

## Building

Root assets:

```bash
yarn build
```

Per-project bundles (writes into that project's `dist/`):

```bash
yarn build:clouds
yarn build:image-depth-parallax
yarn build:line-displacement
```

Vite `base` is environment-aware:

- **`yarn dev` / serve** → `base: '/'` so local URLs stay short (`/wooden-hand/`)
- **`yarn build`** → `base: '/poc/...'` so production asset URLs match GitHub Pages

Do not hardcode a production-only `base` without the serve/`command === 'serve'` branch — that is what caused the “did you mean to visit `/poc/dist/...`” redirect locally.

## Adding a new POC

1. Copy `starter/` (or an existing project folder) to a new name, e.g. `my-demo/`.
2. Replace `[PROJECT_NAME]` in that project's `vite.config.js`.
3. Add a `build:<name>` script in root `package.json` if the project needs a Vite build.
4. Keep `index.html` on production asset tags (`./dist/assets/main.css` + `./dist/assets/main.js`). Local rewrite is automatic.
5. Develop at `http://localhost:5173/my-demo/`.
6. Run the project build, commit `dist/` if needed, then push — live at `https://jimmyrichardson.github.io/poc/my-demo/`.

## Agent context

Persistent instructions for AI agents live in [`ai-context/`](./ai-context/).
