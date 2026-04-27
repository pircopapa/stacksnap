const fs = require('fs');
const path = require('path');
const { getConfigPath } = require('./config');

function getSnapshotsDir() {
  return path.join(path.dirname(getConfigPath()), 'snapshots');
}

function getSnapshotPath(templateName, snapshotName) {
  return path.join(getSnapshotsDir(), templateName, snapshotName);
}

function listSnapshots(templateName) {
  const dir = path.join(getSnapshotsDir(), templateName);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());
}

function snapshotExists(templateName, snapshotName) {
  return fs.existsSync(getSnapshotPath(templateName, snapshotName));
}

function deleteSnapshot(templateName, snapshotName) {
  const snapPath = getSnapshotPath(templateName, snapshotName);
  if (!fs.existsSync(snapPath)) throw new Error(`Snapshot '${snapshotName}' not found for template '${templateName}'`);
  fs.rmSync(snapPath, { recursive: true, force: true });
}

function getSnapshotMeta(templateName, snapshotName) {
  const metaPath = path.join(getSnapshotPath(templateName, snapshotName), '_meta.json');
  if (!fs.existsSync(metaPath)) return {};
  return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
}

function saveSnapshotMeta(templateName, snapshotName, meta) {
  const snapPath = getSnapshotPath(templateName, snapshotName);
  fs.mkdirSync(snapPath, { recursive: true });
  fs.writeFileSync(path.join(snapPath, '_meta.json'), JSON.stringify(meta, null, 2));
}

module.exports = {
  getSnapshotsDir,
  getSnapshotPath,
  listSnapshots,
  snapshotExists,
  deleteSnapshot,
  getSnapshotMeta,
  saveSnapshotMeta,
};
