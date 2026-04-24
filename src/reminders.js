const fs = require('fs');
const path = require('path');
const { getConfigPath } = require('./config');

function getRemindersPath() {
  return path.join(path.dirname(getConfigPath()), 'reminders.json');
}

function loadReminders() {
  const p = getRemindersPath();
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function saveReminders(reminders) {
  fs.writeFileSync(getRemindersPath(), JSON.stringify(reminders, null, 2));
}

function setReminder(templateName, message, dueDate) {
  const reminders = loadReminders();
  if (!reminders[templateName]) reminders[templateName] = [];
  reminders[templateName].push({ message, dueDate, createdAt: new Date().toISOString() });
  saveReminders(reminders);
}

function getReminders(templateName) {
  const reminders = loadReminders();
  return reminders[templateName] || [];
}

function removeReminder(templateName, index) {
  const reminders = loadReminders();
  if (!reminders[templateName]) return false;
  if (index < 0 || index >= reminders[templateName].length) return false;
  reminders[templateName].splice(index, 1);
  if (reminders[templateName].length === 0) delete reminders[templateName];
  saveReminders(reminders);
  return true;
}

function getDueReminders() {
  const reminders = loadReminders();
  const now = new Date();
  const due = [];
  for (const [template, list] of Object.entries(reminders)) {
    for (const r of list) {
      if (r.dueDate && new Date(r.dueDate) <= now) {
        due.push({ template, ...r });
      }
    }
  }
  return due;
}

module.exports = {
  getRemindersPath,
  loadReminders,
  saveReminders,
  setReminder,
  getReminders,
  removeReminder,
  getDueReminders,
};
