import { loadConfig } from '../config.js';
import { loadTemplateMeta } from '../templates.js';

export const command = 'pinned';
export const desc = 'List all pinned templates';

export const builder = (yargs) => {
  yargs.option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Show template descriptions',
    default: false,
  });
};

export const handler = async (argv) => {
  const { verbose } = argv;
  const config = loadConfig();
  const pinned = config.pinned || [];

  if (pinned.length === 0) {
    console.log('No pinned templates. Use `stacksnap pin <template>` to pin one.');
    return;
  }

  console.log('Pinned templates:\n');
  for (const name of pinned) {
    if (verbose) {
      try {
        const meta = loadTemplateMeta(name);
        console.log(`  📌 ${name} — ${meta.description || 'No description'}`);
      } catch {
        console.log(`  📌 ${name} — (metadata unavailable)`);
      }
    } else {
      console.log(`  📌 ${name}`);
    }
  }
};
