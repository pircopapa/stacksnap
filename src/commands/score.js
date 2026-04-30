const { templateExists } = require('../templates');
const { setScore, getScore, removeScore, getAllScores, topScored } = require('../scores');

const command = 'score <template> [value]';
const desc = 'Set or view a quality score (0-100) for a template';

const builder = (yargs) =>
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('value', { describe: 'Score value (0-100)', type: 'number' })
    .option('remove', { alias: 'r', type: 'boolean', describe: 'Remove the score for this template' })
    .option('all', { alias: 'a', type: 'boolean', describe: 'List all scored templates' })
    .option('top', { alias: 't', type: 'number', describe: 'Show top N scored templates', default: 0 });

async function handler(argv) {
  const { template, value, remove, all, top } = argv;

  if (all) {
    const scores = getAllScores();
    const entries = Object.entries(scores);
    if (entries.length === 0) {
      console.log('No scores recorded.');
    } else {
      entries
        .sort((a, b) => b[1].score - a[1].score)
        .forEach(([name, data]) => console.log(`${name}: ${data.score}`));
    }
    return;
  }

  if (top > 0) {
    const results = topScored(top);
    if (results.length === 0) {
      console.log('No scores recorded.');
    } else {
      results.forEach((r) => console.log(`${r.name}: ${r.score}`));
    }
    return;
  }

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (remove) {
    const removed = removeScore(template);
    if (removed) {
      console.log(`Score removed for "${template}".`);
    } else {
      console.log(`No score found for "${template}".`);
    }
    return;
  }

  if (value !== undefined) {
    try {
      setScore(template, value);
      console.log(`Score for "${template}" set to ${value}.`);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
    return;
  }

  const existing = getScore(template);
  if (existing) {
    console.log(`${template}: ${existing.score} (updated ${existing.updatedAt})`);
  } else {
    console.log(`No score set for "${template}".`);
  }
}

module.exports = { command, desc, builder, handler };
