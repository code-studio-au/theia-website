import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [slug, ...words] = process.argv.slice(2);
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('Usage: npm run news:new -- my-post-slug "My Post Title"');
  process.exit(1);
}
const title = words.join(' ') || slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const file = resolve('src/content/news', `${slug}.md`);
const content = `---
title: ${JSON.stringify(title)}
description: "Write a short summary for the news card."
date: ${date}
category: Development
image: images/news-development.webp
imageAlt: "Describe the image for readers using assistive technology."
draft: true
---

Write your news here. Set \`draft: false\` above when you are ready to publish.

## What’s new

Your update goes here.
`;
try {
  await writeFile(file, content, { flag: 'wx' });
  console.log(`Created ${file}\nThis is a draft. Edit the content and set draft: false to publish.`);
} catch (error) {
  console.error(error.code === 'EEXIST' ? `A post already exists at ${file}. Nothing was overwritten.` : error.message);
  process.exit(1);
}
