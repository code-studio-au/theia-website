# Theia Online website

A static Astro + TypeScript website matching the supplied Theia Online visual reference. Node.js builds every page to HTML in `dist/`; GitHub Pages serves those files. No application server, database or client framework is required.

## Local development

```sh
nvm use
npm ci
npm run dev
```

Open `http://localhost:4321/`. In a restricted environment, prefix Astro commands with `ASTRO_TELEMETRY_DISABLED=1`.

```sh
npm run check
npm run build
npm run preview
```

## Publish or change news

**News is real Markdown content, not part of a background image.** Every file in `src/content/news/` becomes an article. The homepage automatically shows the three newest published entries. The news archive, categories and RSS feed use the same collection.

Article artwork spans the full page width with soft top and bottom fades. This is the shared style for every news post; use a high-resolution landscape image (around 3:1) with room for cropping on mobile and ultrawide screens.

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
- Categories: `Development`, `Release Notes`, `Lore`, `Community`.
- For a development release, use `category: Release Notes` and include the product and version in the title. Summarize what changed and say who can access the build.
- `draft: true` excludes a post from the homepage, archive, RSS, sitemap and generated article routes.
- Set `draft: false` and commit/push to `main` to publish. The filename becomes the URL: `/news/my-update/`.
- Newest dates appear first. Future dates do not schedule publication; use `draft` to hold an article back.
- Edit an existing `.md` file to update news. GitHub's file editor works too: commit to `main` and the workflow rebuilds the site.
- The `news:new` helper refuses to overwrite an existing post and validates the filename.
- Markdown links between posts can use `../other-post/`. Root-relative Markdown links start at `/` for this deployment, for example `/world/`.

## GitHub Pages deployment

The deployment workflow is `.github/workflows/deploy.yml`. It installs Node from `.nvmrc`, runs `npm ci`, checks Astro/TypeScript, builds static HTML and uploads `dist/` using GitHub Pages artifacts. Pull requests build without deploying. Deployment is disabled until the repository Actions variable `ENABLE_PAGES` is set to `true`; after that, pushes to `main` deploy.

Destination: `https://theiaonline.com/`, with `www.theiaonline.com` redirecting to it once DNS is connected.

To enable publication, configure **Settings → Pages → Build and deployment → Source** as **GitHub Actions**, then create the repository Actions variable `ENABLE_PAGES` with value `true`. Until publication is configured, pushes only build and save an artifact. No credentials belong in the source tree; deployments use the workflow's limited `GITHUB_TOKEN` permissions.

`astro.config.mjs` sets the site to `https://theiaonline.com` and the base path to `/`. All shared links, images, canonical URLs and the RSS feed respect that base. The custom domain is configured in GitHub Pages settings; a `CNAME` file is not required for Actions deployments. Local overrides are available as `SITE_URL` and `BASE_PATH`.

### Domain DNS (VentraIP)

In VIPcontrol, open **Domains → DNS** for `theiaonline.com`. Keep the current nameservers and unrelated email/TXT records. Replace the existing apex A record with these four A records (leave the hostname blank for the root domain), and set `www` to the CNAME below. Leave TTL at its default.

| Type | Hostname | Value |
| --- | --- | --- |
| A | blank | 185.199.108.153 |
| A | blank | 185.199.109.153 |
| A | blank | 185.199.110.153 |
| A | blank | 185.199.111.153 |
| CNAME | www | code-studio-au.github.io |

After DNS propagates, check **Settings → Pages** for domain validation and enable **Enforce HTTPS** when GitHub's certificate is ready. DNS and certificate provisioning can take up to 24 hours.

References: [VentraIP DNS management](https://ventraip.com.au/support-centre/add-remove-or-manage-dns-records-within-vipcontrol/), [GitHub Pages custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Content and availability

- Homepage: `src/pages/index.astro`.
- World, races, story, gameplay and other static pages: `src/pages/`.
- Download links and shared metadata: `src/lib/site.ts`. Set `downloads.windows` and/or `downloads.linux` to verified HTTPS releases when public packages exist. Until then, the download page accurately shows development status.
- The header's Log In button (also available in the mobile menu) opens `src/components/LoginDialog.astro`. Website authentication is not connected: fields and submission are disabled, and the dialog explains client sign-in. Connect a verified authentication service before enabling the form; it currently sends and stores no credentials.
- Source references and artwork provenance: [docs/CONTENT_SOURCES.md](docs/CONTENT_SOURCES.md), [docs/ASSETS.md](docs/ASSETS.md).

## Browser validation

```sh
npm run build
npm test
```

Tests use an installed Chrome (`/usr/bin/google-chrome`, or set `CHROME_PATH`) through Playwright. Set `PREVIEW_PORT` to an unused port if the default test port 4321 is occupied. They check static routes, local links/assets under the configured base path, Markdown article output, news filters, responsive overflow, mobile navigation and axe accessibility. Screenshots are saved to ignored `test-results/`. Browser tests are local; the deployment workflow runs the type/content checks and production build.

## Rendering references

- [Astro rendering](https://docs.astro.build/en/guides/on-demand-rendering/): this project uses build-time static rendering.
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/): schema-validated Markdown news.
- [Astro on GitHub Pages](https://docs.astro.build/en/guides/deploy/github/): static deployment configuration.
