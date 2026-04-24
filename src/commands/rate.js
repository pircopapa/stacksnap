const { templateExists } = require('../templates');
const { setRating, getRating, removeRating } = require('../ratings');

const command = 'rate <template> [score]';
const describe = 'Rate a template from 1 to 5, or view/remove its rating';

const builder = (yargs) =>
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('score', { describe: 'Rating score (1-5)', type: 'number' })
    .option('remove', { alias: 'r', type: 'boolean', describe: 'Remove the rating for this template' });

async function handler(argv) {
  const { template, score, remove } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (remove) {
    const removed = removeRating(template);
    if (removed) {
      console.log(`Rating removed for "${template}".`);
    } else {
      console.log(`No rating found for "${template}".`);
    }
    return;
  }

  if (score === undefined) {
    const existing = getRating(template);
    if (!existing) {
      console.log(`No rating set for "${template}".`);
    } else {
      console.log(`Rating for "${template}": ${existing.score}/5 (set ${existing.updatedAt})`);
    }
    return;
  }

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    console.error('Score must be an integer between 1 and 5.');
    process.exit(1);
  }

  const result = setRating(template, score);
  console.log(`Rated "${template}" ${result.score}/5.`);
}

module.exports = { command, describe, builder, handler };
