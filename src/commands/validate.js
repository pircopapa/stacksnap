import path from 'path';
import fs from 'fs';
import { templateExists, loadTemplateMeta, getTemplatePath } from '../templates.js';

export const command = 'validate <template>';
export const describe = 'Validate a template structure and metadata';

export function builder(yargs) {
  return yargs.positional('template', {
    describe: 'Template name to validate',
    type: 'string',
  });
}

function checkRequiredMetaFields(meta) {
  const required = ['name', 'description', 'version'];
  const missing = required.filter((f) => !meta[f]);
  return missing;
}

function checkTemplateFiles(templatePath) {
  const issues = [];
  if (!fs.existsSync(templatePath)) {
    issues.push('Template directory does not exist');
    return issues;
  }
  const files = fs.readdirSync(templatePath);
  if (files.length === 0) {
    issues.push('Template directory is empty');
  }
  return issues;
}

export async function handler({ template }) {
  if (!templateExists(template)) {
    throw new Error(`Template "${template}" not found.`);
  }

  const meta = loadTemplateMeta(template);
  const templatePath = getTemplatePath(template);

  const missingFields = checkRequiredMetaFields(meta);
  const fileIssues = checkTemplateFiles(templatePath);

  const allIssues = [
    ...missingFields.map((f) => `Missing metadata field: "${f}"`),
    ...fileIssues,
  ];

  if (allIssues.length > 0) {
    console.error(`\n❌ Validation failed for "${template}":`);
    allIssues.forEach((issue) => console.error(`  - ${issue}`));
    process.exitCode = 1;
  } else {
    console.log(`\n✅ Template "${template}" is valid.`);
  }
}
