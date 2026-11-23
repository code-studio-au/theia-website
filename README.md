# Theia Online website

A static Astro + TypeScript website matching the supplied Theia Online visual reference. Node.js builds every page to HTML in `dist/`; GitHub Pages serves those files. No application server, database or client framework is required.

## Local development

```sh
nvm use
npm ci
npm run dev
```

Open `http://localhost:4321/theia-website/`. In a restricted environment, prefix Astro commands with `ASTRO_TELEMETRY_DISABLED=1`.

```sh
npm run check
npm run build
npm run preview
```

## Publish or change news

**News is real Markdown content, not part of a background image.** Every file in `src/content/news/` becomes an article. The homepage automatically shows the three newest published entries. The news archive, categories and RSS feed use the same collection.

Create a draft:

```sh
npm run news:new -- my-update "My Update"
```

Or create `src/content/news/my-update.md` yourself:

```md
---
title: "My Update"
description: "A short summary for the homepage and news listing."
date: 2026-11-23
category: Development
image: images/my-update.webp
imageAlt: "A useful description of the artwork."
draft: false
---

Your article goes here. Use ordinary **Markdown**.

## A heading

More details, lists and links can follow.
```

- Put the image at `public/images/my-update.webp`. The image can be different for every post; it is not tied to the original design. Wide images around 840 × 300 work well for cards.
- Categories: `Development`, `Lore`, `Community`.
- `draft: true` excludes a post from the homepage, archive, RSS, sitemap and generated article routes.
- Set `draft: false` and commit/push to `main` to publish. The filename becomes the URL: `/theia-website/news/my-update/`.
- Newest dates appear first. Future dates do not schedule publication; use `draft` to hold an article back.
- Edit an existing `.md` file to update news. GitHub's file editor works too: commit to `main` and the workflow rebuilds the site.
- The `news:new` helper refuses to overwrite an existing post and validates the filename.
- Markdown links between posts can use `../other-post/`. Root-relative Markdown links must include `/theia-website/` for this deployment.

## GitHub Pages deployment

The deployment workflow is `.github/workflows/deploy.yml`. It installs Node from `.nvmrc`, runs `npm ci`, checks Astro/TypeScript, builds static HTML and uploads `dist/` using GitHub Pages artifacts. Pull requests build without deploying; pushes to `main` deploy.

Destination: `https://code-studio-au.github.io/theia-website/`.

Repository **Settings → Pages → Build and deployment → Source** must be **GitHub Actions**. No credentials belong in the source tree; deployments use the workflow's limited `GITHUB_TOKEN` permissions.

`astro.config.mjs` sets the Pages site and base path. All shared links, images, canonical URLs and the RSS feed respect that base. For a custom domain, set `site` to its origin and `base` to `/`, configure the domain in GitHub Pages, and add the corresponding `public/CNAME` file. Local overrides are available as `SITE_URL` and `BASE_PATH`.

## Content and availability

- Homepage: `src/pages/index.astro`.
- World, races, story, gameplay and other static pages: `src/pages/`.
- Download links and shared metadata: `src/lib/site.ts`. Set `downloads.windows` and/or `downloads.linux` to verified HTTPS releases when public packages exist. Until then, the download page accurately shows development status.
- The header's Log In link explains client sign-in on the download page. There is no fake web login or password form.
- Source references and artwork provenance: [docs/CONTENT_SOURCES.md](docs/CONTENT_SOURCES.md), [docs/ASSETS.md](docs/ASSETS.md).

## Browser validation

```sh
npm run build
npm test
```

Tests use an installed Chrome (`/usr/bin/google-chrome`, or set `CHROME_PATH`) through Playwright. They check static routes, local links/assets under the Pages subpath, Markdown article output, news filters, responsive overflow, mobile navigation and axe accessibility. Screenshots are saved to ignored `test-results/`. Browser tests are local; the deployment workflow runs the type/content checks and production build.

## Rendering references

- [Astro rendering](https://docs.astro.build/en/guides/on-demand-rendering/): this project uses build-time static rendering.
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/): schema-validated Markdown news.
- [Astro on GitHub Pages](https://docs.astro.build/en/guides/deploy/github/): static deployment configuration.
