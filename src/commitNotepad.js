// commitNotepad.js — attach personal notes to commits by hash

const fs = require('fs');
const path = require('path');
const os = require('os');

function getNotepadPath() {
  return path.join(os.homedir(), '.git-standup', 'notepad.json');
}

function loadNotes() {
  const p = getNotepadPath();
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function saveNotes(notes) {
  const p = getNotepadPath();
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(notes, null, 2), 'utf8');
}

function addNote(hash, note) {
  if (!hash || !note) throw new Error('hash and note are required');
  const notes = loadNotes();
  notes[hash] = { note: note.trim(), addedAt: new Date().toISOString() };
  saveNotes(notes);
  return notes[hash];
}

function getNote(hash) {
  const notes = loadNotes();
  return notes[hash] || null;
}

function removeNote(hash) {
  const notes = loadNotes();
  if (!notes[hash]) return false;
  delete notes[hash];
  saveNotes(notes);
  return true;
}

function annotateCommitsWithNotes(commits) {
  const notes = loadNotes();
  return commits.map(c => {
    const entry = notes[c.hash];
    return entry ? { ...c, note: entry.note } : c;
  });
}

function listNotes() {
  return loadNotes();
}

module.exports = {
  getNotepadPath,
  loadNotes,
  saveNotes,
  addNote,
  getNote,
  removeNote,
  annotateCommitsWithNotes,
  listNotes,
};
