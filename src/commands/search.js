import { listTemplates, loadTemplateMeta } from '../templates.js';

export const command = 'search <query>';
export const desc = 'Search templates by name or tag';

export const builder = (yargs) => {
  yargs
    .positional('query', {
      describe: 'Search term to match against template names and tags',
      type: 'string',
    })
    .option('tag', {
      alias: 't',
      describe: 'Filter by a specific tag',
      type: 'string',
    });
};

export const handler = async (argv) => {
  const { query, tag } = argv;
  const templates = listTemplates();

  const results = [];

  for (const name of templates) {
    const meta = loadTemplateMeta(name);
    const tags = meta.tags || [];

    const matchesQuery =
      !query ||
      name.toLowerCase().includes(query.toLowerCase()) ||
      (meta.description || '').toLowerCase().includes(query.toLowerCase());

    const matchesTag =
      !tag || tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase());

    if (matchesQuery && matchesTag) {
      results.push({ name, description: meta.description || '', tags });
    }
  }

  if (results.length === 0) {
    console.log('No templates matched your search.');
    return;
  }

  console.log(`Found ${results.length} template(s):\n`);
  for (const r of results) {
    const tagStr = r.tags.length ? `  [${r.tags.join(', ')}]` : '';
    console.log(`  ${r.name}${tagStr}`);
    if (r.description) {
      console.log(`    ${r.description}`);
    }
  }
};
