const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('./config');

function getLinksPath(templateName) {
  return path.join(getTemplatesDir(), templateName, '.links.json');
}

function loadLinks(templateName) {
  const linksPath = getLinksPath(templateName);
  if (!fs.existsSync(linksPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(linksPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveLinks(templateName, links) {
  const linksPath = getLinksPath(templateName);
  fs.writeFileSync(linksPath, JSON.stringify(links, null, 2));
}

function addLink(templateName, label, url) {
  const links = loadLinks(templateName);
  links[label] = url;
  saveLinks(templateName, links);
}

function removeLink(templateName, label) {
  const links = loadLinks(templateName);
  if (!(label in links)) return false;
  delete links[label];
  saveLinks(templateName, links);
  return true;
}

function getLinks(templateName) {
  return loadLinks(templateName);
}

function getLink(templateName, label) {
  const links = loadLinks(templateName);
  return links[label] || null;
}

module.exports = {
  getLinksPath,
  loadLinks,
  saveLinks,
  addLink,
  removeLink,
  getLinks,
  getLink,
};
