export const site = {
  name: 'Theia Online',
  description: 'Explore a living world of adventure, conflict and ancient secrets. Discover the world, peoples and stories of Theia Online.',
  repository: 'https://github.com/code-studio-au/theia-mmo',
  // Add verified public URLs when hosted game distribution is available.
  downloads: { windows: '', macos: '', linux: '' },
};

export function url(path = ''): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export const formatDate = (date: Date) => new Intl.DateTimeFormat('en-AU', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(date);
