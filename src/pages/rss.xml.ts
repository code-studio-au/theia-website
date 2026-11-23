import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { publishedNews } from '../lib/news';
import { url } from '../lib/site';

export async function GET(context: APIContext) {
  return rss({
    title: 'Theia Online — News',
    description: 'Development updates, lore and community news from Theia Online.',
    site: new URL(url(), context.site!),
    items: (await publishedNews()).map((post) => ({
      title: post.data.title, description: post.data.description,
      pubDate: post.data.date, link: url(`news/${post.id}/`),
      categories: [post.data.category],
    })),
  });
}
