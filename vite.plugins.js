/**
 * Committed HTML always references production assets for GitHub Pages:
 *   ./dist/assets/main.css
 *   ./dist/assets/main.js
 *
 * During `yarn dev`, rewrite those to the Vite entry (`./main.js`), which
 * already imports CSS — so you get HMR without commenting tags in and out.
 */
export function githubPagesDevAssets() {
  return {
    name: 'github-pages-dev-assets',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.server) return html;

        return html
          .replace(
            /<link\b[^>]*href=["']\.\/dist\/assets\/main\.css["'][^>]*>\s*/gi,
            ''
          )
          .replace(
            /(<script\b[^>]*\bsrc=["'])\.\/dist\/assets\/main\.js(["'][^>]*>)/gi,
            '$1./main.js$2'
          );
      },
    },
  };
}
