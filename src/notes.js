const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('./config');

function getNotesPath(templateName) {
  return path.join(getTemplatesDir(), templateName, '.notes.json');
}

function loadNotes(templateName) {
  const notesPath = getNotesPath(templateName);
  if (!fs.existsSync(notesPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(notesPath, 'utf8'));
  } catch {
    return [];
  }
}

function saveNotes(templateName, notes) {
  const notesPath = getNotesPath(templateName);
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
}

function addNote(templateName, text) {
  const notes = loadNotes(templateName);
  const note = { id: Date.now(), text, createdAt: new Date().toISOString() };
  notes.push(note);
  saveNotes(templateName, notes);
  return note;
}

function removeNote(templateName, id) {
  const notes = loadNotes(templateName);
  const filtered = notes.filter(n => n.id !== id);
  if (filtered.length === notes.length) return false;
  saveNotes(templateName, filtered);
  return true;
}

function getNotes(templateName) {
  return loadNotes(templateName);
}

module.exports = { getNotesPath, loadNotes, saveNotes, addNote, removeNote, getNotes };
