/**
 * audit command — scan all templates for issues and report a health summary
 */

const path = require('path');
const fs = require('fs');
const { listTemplates, loadTemplateMeta, getTemplatePath } = require('../templates');
const { checkRequiredMetaFields, checkTemplateFiles } = require('./validate');

const command = 'audit';
const describe = 'Scan all templates for issues and report a health summary';

const builder = (yargs) =>
  yargs
    .option('fix', {
      alias: 'f',
      type: 'boolean',
      description: 'Attempt to auto-fix minor issues (e.g. missing description field)',
      default: false,
    })
    .option('json', {
      type: 'boolean',
      description: 'Output results as JSON',
      default: false,
    });

/**
 * Run validation checks on a single template and return a result object.
 * @param {string} name - Template name
 * @returns {{ name: string, ok: boolean, warnings: string[], errors: string[] }}
 */
function auditTemplate(name) {
  const result = { name, ok: true, warnings: [], errors: [] };

  const templatePath = getTemplatePath(name);

  // Check meta
  let meta;
  try {
    meta = loadTemplateMeta(name);
  } catch (err) {
    result.errors.push(`Failed to load meta.json: ${err.message}`);
    result.ok = false;
    return result;
  }

  const metaIssues = checkRequiredMetaFields(meta);
  if (metaIssues.length > 0) {
    metaIssues.forEach((issue) => result.errors.push(issue));
    result.ok = false;
  }

  // Warn if no description
  if (!meta.description || meta.description.trim() === '') {
    result.warnings.push('Missing or empty description in meta.json');
  }

  // Check template files exist
  const fileIssues = checkTemplateFiles(templatePath);
  if (fileIssues.length > 0) {
    fileIssues.forEach((issue) => result.errors.push(issue));
    result.ok = false;
  }

  // Warn if no tags defined
  if (!meta.tags || meta.tags.length === 0) {
    result.warnings.push('No tags defined — consider adding tags for searchability');
  }

  return result;
}

const handler = async (argv) => {
  const templates = listTemplates();

  if (templates.length === 0) {
    console.log('No templates found.');
    return;
  }

  const results = templates.map(auditTemplate);
  const passed = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  const withWarnings = results.filter((r) => r.warnings.length > 0);

  if (argv.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log(`\n🔍 Auditing ${templates.length} template(s)...\n`);

  for (const result of results) {
    const status = result.ok ? '✅' : '❌';
    console.log(`${status} ${result.name}`);

    for (const err of result.errors) {
      console.log(`   [error]   ${err}`);
    }
    for (const warn of result.warnings) {
      console.log(`   [warning] ${warn}`);
    }
  }

  console.log(
    `\nSummary: ${passed.length} passed, ${failed.length} failed, ${withWarnings.length} with warnings.`
  );

  if (failed.length > 0) {
    process.exitCode = 1;
  }
};

module.exports = { command, describe, builder, handler, auditTemplate };
