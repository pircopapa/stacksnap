const { listTemplates } = require('../templates');
const { lintTemplate } = require('./lint');

const command = 'lint-all';
const describe = 'Lint all templates and report issues';
const builder = {
  strict: {
    type: 'boolean',
    default: false,
    description: 'Treat warnings as errors'
  }
};

function handler({ strict }) {
  const templates = listTemplates();

  if (templates.length === 0) {
    console.log('No templates found.');
    return;
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  const failed = [];

  for (const name of templates) {
    const { errors, warnings } = lintTemplate(name);
    totalErrors += errors.length;
    totalWarnings += warnings.length;

    if (errors.length > 0 || warnings.length > 0) {
      console.log(`\n📦 ${name}`);
      errors.forEach(e => console.error(`   ❌ ${e}`));
      warnings.forEach(w => console.warn(`   ⚠️  ${w}`));
    }

    if (errors.length > 0 || (strict && warnings.length > 0)) {
      failed.push(name);
    }
  }

  console.log(`\nScanned ${templates.length} template(s). Errors: ${totalErrors}, Warnings: ${totalWarnings}`);

  if (failed.length > 0) {
    console.error(`\nFailed: ${failed.join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log('✅ All templates passed lint.');
  }
}

module.exports = { command, describe, builder, handler };
