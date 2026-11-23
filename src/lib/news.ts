import { getCollection } from 'astro:content';

export async function publishedNews() {
  return (await getCollection('news', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id));
}
