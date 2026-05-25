// notepadCommand.js — CLI handler for commit notepad commands

const { addNote, getNote, removeNote, listNotes, annotateCommitsWithNotes } = require('./commitNotepad');

function handleNotepadCommand(subArgs) {
  const [sub, ...rest] = subArgs;

  switch (sub) {
    case 'add': {
      const [hash, ...noteParts] = rest;
      const note = noteParts.join(' ');
      if (!hash || !note) {
        console.error('Usage: notepad add <hash> <note text>');
        process.exit(1);
      }
      const saved = addNote(hash, note);
      console.log(`Note saved for ${hash}: "${saved.note}"`);
      break;
    }
    case 'get': {
      const [hash] = rest;
      if (!hash) { console.error('Usage: notepad get <hash>'); process.exit(1); }
      const entry = getNote(hash);
      if (!entry) { console.log(`No note found for ${hash}`); }
      else { console.log(`[${hash}] ${entry.note}  (added ${entry.addedAt})`); }
      break;
    }
    case 'remove': {
      const [hash] = rest;
      if (!hash) { console.error('Usage: notepad remove <hash>'); process.exit(1); }
      const removed = removeNote(hash);
      console.log(removed ? `Note removed for ${hash}` : `No note found for ${hash}`);
      break;
    }
    case 'list': {
      const notes = listNotes();
      const entries = Object.entries(notes);
      if (entries.length === 0) { console.log('No notes saved.'); break; }
      console.log(`${'Hash'.padEnd(12)}  Note`);
      console.log('-'.repeat(50));
      for (const [hash, { note, addedAt }] of entries) {
        console.log(`${hash.slice(0, 10).padEnd(12)}  ${note}  (${addedAt.slice(0, 10)})`);
      }
      break;
    }
    default:
      console.log('notepad subcommands: add <hash> <note>, get <hash>, remove <hash>, list');
  }
}

module.exports = { handleNotepadCommand, annotateCommitsWithNotes };
