const fs = require('fs');
const path = require('path');
const { getConfigPath } = require('./config');

function getScoresPath() {
  return path.join(path.dirname(getConfigPath()), 'scores.json');
}

function loadScores() {
  const p = getScoresPath();
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function saveScores(scores) {
  fs.writeFileSync(getScoresPath(), JSON.stringify(scores, null, 2));
}

function setScore(templateName, score) {
  if (typeof score !== 'number' || score < 0 || score > 100) {
    throw new Error('Score must be a number between 0 and 100');
  }
  const scores = loadScores();
  scores[templateName] = { score, updatedAt: new Date().toISOString() };
  saveScores(scores);
}

function getScore(templateName) {
  const scores = loadScores();
  return scores[templateName] || null;
}

function removeScore(templateName) {
  const scores = loadScores();
  if (!scores[templateName]) return false;
  delete scores[templateName];
  saveScores(scores);
  return true;
}

function getAllScores() {
  return loadScores();
}

function topScored(n = 5) {
  const scores = loadScores();
  return Object.entries(scores)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, n)
    .map(([name, data]) => ({ name, ...data }));
}

module.exports = {
  getScoresPath,
  loadScores,
  saveScores,
  setScore,
  getScore,
  removeScore,
  getAllScores,
  topScored,
};
