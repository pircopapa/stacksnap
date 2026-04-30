const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('./config');

function getWorkflowsPath(templateName) {
  return path.join(getTemplatesDir(), templateName, '.workflows.json');
}

function loadWorkflows(templateName) {
  const filePath = getWorkflowsPath(templateName);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveWorkflows(templateName, workflows) {
  const filePath = getWorkflowsPath(templateName);
  fs.writeFileSync(filePath, JSON.stringify(workflows, null, 2));
}

function addWorkflow(templateName, workflowName, steps) {
  const workflows = loadWorkflows(templateName);
  workflows[workflowName] = { steps, createdAt: new Date().toISOString() };
  saveWorkflows(templateName, workflows);
}

function removeWorkflow(templateName, workflowName) {
  const workflows = loadWorkflows(templateName);
  if (!workflows[workflowName]) return false;
  delete workflows[workflowName];
  saveWorkflows(templateName, workflows);
  return true;
}

function getWorkflow(templateName, workflowName) {
  const workflows = loadWorkflows(templateName);
  return workflows[workflowName] || null;
}

function listWorkflows(templateName) {
  return Object.keys(loadWorkflows(templateName));
}

module.exports = {
  getWorkflowsPath,
  loadWorkflows,
  saveWorkflows,
  addWorkflow,
  removeWorkflow,
  getWorkflow,
  listWorkflows,
};
