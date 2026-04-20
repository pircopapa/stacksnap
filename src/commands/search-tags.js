import { listTemplates } from '../templates.js';
import { loadConfig } from '../config.js';

export const command = 'search-tags <tags..>';
export const desc = 'Search templates by one or more tags';

export const builder = (yargs) => {
  yargs
    .positional('tags', {
      describe: 'Tags to search for',
      type: 'array',
    })
    .option('match', {
      alias: 'm',
      describe: 'Match strategy: any or all',
      choices: ['any', 'all'],
      default: 'any',
    });
};

export const handler = async (argv) => {
  const { tags, match } = argv;

  const config = loadConfig();
  const configTags = config.tags || {};
  const allTemplates = listTemplates();

  const results = allTemplates.filter((tmpl) => {
    const tmplTags = configTags[tmpl] || [];
    if (match === 'all.every((t) => tmplTags.includes(t));
    }
    return tags.some((t) => tmplTags.includes(t));
  });

  if (results.length === 0) {
    console.logNo templates found matching tags: ${tags.join(', ')}`);
    return;
  }

  console.log(`Templates matching [${tags.join(', ')}] (${match):`);
  for (const tmpl of results) {
    const tmplTags = configTags[tmpl] || [];
    console.log(`  ${tmpl}  [', ')}]`);
  }
};
