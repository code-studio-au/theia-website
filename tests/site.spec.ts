import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdir, readFile } from 'node:fs/promises';

test('every page, local link and local image resolves under the configured base path', async ({ page, request, baseURL }) => {
  const paths = ['', 'world/', 'races/', 'story/', 'gameplay/', 'media/', 'news/', 'download/', 'about/', 'community/', 'support/', 'account/', 'account/profile/', 'news/lore-spotlight-anchors/', 'news/a-world-worth-sharing/'];
  const checked = new Set<string>();
  for (const path of paths) {
    const response = await page.goto(path ? `./${path}` : './');
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const links = await page.locator('a[href],img[src],link[rel="stylesheet"]').evaluateAll(elements => elements.map(el => el.getAttribute('href') || el.getAttribute('src') || ''));
    for (const link of links) {
      if (!link.startsWith('/')) continue;
      expect(link.startsWith(new URL(baseURL!).pathname), `base path on ${path}: ${link}`).toBe(true);
      const target = link.split('#')[0];
      if (!checked.has(target)) { expect((await request.get(target)).status(), target).toBe(200); checked.add(target); }
    }
    const imagesLoaded = await page.locator('img[src]').evaluateAll(images => images.every(element => { const img = element as HTMLImageElement; return !img.complete || img.naturalWidth > 0; }));
    expect(imagesLoaded, path).toBe(true);
  }
});

test('homepage and news are built from the actual Markdown files; drafts never publish', async ({ page, request }) => {
  const files = await readdir('src/content/news');
  const published: { slug: string; title: string }[] = [];
  for (const file of files.filter(file => file.endsWith('.md'))) {
    const source = await readFile(`src/content/news/${file}`, 'utf8');
    const slug = file.replace(/\.md$/, '');
    if (/^draft: true$/m.test(source)) { expect((await request.get(`news/${slug}/`)).status()).toBe(404); continue; }
    const title = source.match(/^title: (.+)$/m)?.[1].replace(/^['"]|['"]$/g, '') || '';
    published.push({ slug, title });
    await page.goto(`./news/${slug}/`);
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.locator('.article-body h2').first()).toBeVisible();
  }
  await page.goto('./news/');
  await expect(page.locator('.news-card')).toHaveCount(published.length);
  await page.goto('./');
  await expect(page.locator('.news-card')).toHaveCount(Math.min(3, published.length));
  const rss = await request.get('rss.xml');
  expect(rss.status()).toBe(200);
  expect(await rss.text()).toContain('Theia Online');
});

test('news category filters work and restore all articles', async ({ page }) => {
  await page.goto('./news/');
  for (const category of ['Lore', 'Development', 'Release Notes', 'Community']) {
    const matching = await page.locator(`.news-card[data-category="${category}"]`).count();
    const button = page.getByRole('button', { name: category, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    const categories = await page.locator('.news-card:visible').evaluateAll(cards => cards.map(card => card.getAttribute('data-category')));
    expect(categories).toHaveLength(matching);
    expect(categories.every(value => value === category)).toBe(true);
  }
  await page.getByRole('button', { name: 'All', exact: true }).click();
  expect(await page.locator('.news-card:visible').count()).toBe(await page.locator('.news-card').count());
});

test('desktop and mobile layouts have no overflow or serious accessibility violations', async ({ page }) => {
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['./', './news/', './races/', './download/']) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} at ${width}px`).toBe(true);
    }
  }
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['./', './news/', './download/']) {
      await page.goto(path);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(result.violations, `${path} at ${width}px`).toEqual([]);
    }
    await page.goto('./');
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
  }
});

test('World artwork stays within the page on ultrawide displays', async ({ page }) => {
  for (const width of [3440, 2560, 1920]) {
    await page.setViewportSize({ width, height: 1440 });
    await page.goto('./world/');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.world-backdrop').evaluate((image: HTMLImageElement) => image.decode());
    const layout = await page.evaluate(() => {
      const art = document.querySelector('.world-backdrop')!.getBoundingClientRect();
      const world = document.querySelector('.world-page')!.getBoundingClientRect();
      const footer = document.querySelector('.site-footer')!.getBoundingClientRect();
      return { artBottom: art.bottom, worldBottom: world.bottom, footerBottom: footer.bottom, pageBottom: document.documentElement.scrollHeight, pageWidth: document.documentElement.scrollWidth };
    });
    expect(layout.artBottom, `art contained at ${width}px`).toBeLessThanOrEqual(layout.worldBottom + 1);
    expect(Math.abs(layout.pageBottom - layout.footerBottom), `no artwork below footer at ${width}px`).toBeLessThanOrEqual(1);
    expect(layout.pageWidth).toBeLessThanOrEqual(width);
  }
});

test('mobile menu opens, closes with Escape and navigates', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const toggle = page.locator('.menu-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'World', exact: true }).click();
  await expect(page).toHaveURL(/\/world\/$/);
});

test('Account opens on desktop and mobile and fits small screens', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 900 });
    await page.goto('./');
    if (width < 600) await page.locator('.menu-toggle').click();
    await page.locator(width < 600 ? '.mobile-login' : '.login-link').click();
    await expect(page).toHaveURL(/\/account\/$/);
    await expect(page.getByRole('heading', { name: 'Your Theia account' })).toBeVisible();
    const form = page.getByRole('heading', { name: 'Sign in to your account' });
    if (process.env.PUBLIC_THEIA_ACCOUNT_POOL_ID && process.env.PUBLIC_THEIA_ACCOUNT_CLIENT_ID) {
      await expect(form).toBeVisible();
      const continueButton = page.getByRole('button', { name: 'Continue', exact: true });
      await expect(continueButton).toBeVisible();
      await expect(continueButton).toHaveAttribute('type', 'submit');
      const playNowFill = await page.locator('.header-actions .button-primary > span')
        .evaluate(element => getComputedStyle(element).backgroundImage);
      const accountActions = page.locator('[data-account] .button-primary');
      expect(await accountActions.evaluateAll(actions => actions.map(action => {
        const fill = action.querySelector('span');
        return fill ? getComputedStyle(fill).backgroundImage : '';
      }))).toEqual(Array(await accountActions.count()).fill(playNowFill));
      const linkActions = page.locator('[data-account] button:not(.button-primary)');
      expect(await linkActions.allTextContents()).toEqual(['Skip for now', 'Sign out', 'Back to account setup']);
      for (const link of await linkActions.all()) {
        await expect(link).toHaveCSS('text-decoration-line', 'underline');
        await expect(link).toHaveCSS('background-image', 'none');
      }
      const back = page.locator('[data-action="start-over"]');
      await expect(back).toBeHidden();
      await page.getByRole('button', { name: 'Reset password', exact: true }).click();
      await expect(back).toBeVisible();
      await back.click();
      await expect(continueButton).toBeVisible();
      await expect(back).toBeHidden();
      await page.goto('./account/profile/');
      await expect(page).toHaveURL(/\/account\/$/);
      await expect(form).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Account overview' })).toBeHidden();
    } else {
      await expect(form).toBeHidden();
      await expect(page.getByText('Account setup is currently unavailable.')).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(axe.violations).toEqual([]);
  }
});
