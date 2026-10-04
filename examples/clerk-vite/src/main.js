// The notes page. Clerk signs people in; ./jstash.js saves and loads their notes.
import { clerk } from './clerk.js';
import { deleteMyData, load, save } from './jstash.js';

const $ = (id) => document.getElementById(id);
const statusLine = $('status');
let shownUser; // the Clerk user ID whose notes are on screen; null when signed out
let signInMounted = false;

// Clerk calls this straight away, and again whenever someone signs in or out.
clerk.addListener(({ user }) => {
  const id = user?.id ?? null;
  if (id === shownUser) return; // Clerk also calls it when it refreshes a token
  shownUser = id;
  if (user) showNotes(user);
  else showSignIn();
});

function showSignIn() {
  $('notes').hidden = true;
  $('text').value = '';
  statusLine.textContent = '';
  clerk.mountSignIn($('sign-in'));
  signInMounted = true;
}

async function showNotes(user) {
  if (signInMounted) clerk.unmountSignIn($('sign-in'));
  signInMounted = false;
  $('who').textContent = user.primaryEmailAddress?.emailAddress ?? user.id;
  $('text').value = '';
  $('notes').hidden = false;
  // Keep the editor off until the notes load, so an empty box can't be saved over them.
  $('editor').disabled = true;
  statusLine.textContent = 'Loading your notes…';
  try {
    const notes = await load('notes'); // null: nothing saved yet
    if (user.id !== shownUser) return; // they signed out while it loaded
    $('text').value = notes?.text ?? '';
    statusLine.textContent = notes
      ? `Loaded your notes, saved ${new Date(notes.saved_at).toLocaleString()}.`
      : 'Nothing saved yet. Write something and save it.';
    $('editor').disabled = false;
  } catch (err) {
    if (user.id === shownUser) show(err);
  }
}

$('save').addEventListener('click', async () => {
  statusLine.textContent = 'Saving…';
  try {
    // PUT replaces the whole document, so save everything the note needs.
    await save('notes', { text: $('text').value, saved_at: new Date().toISOString() });
    statusLine.textContent = 'Saved. Sign out and back in, or open this page in another browser, and it’ll be here.';
  } catch (err) {
    show(err);
  }
});

$('delete').addEventListener('click', async () => {
  if (!confirm('Delete everything this app has saved for you?')) return;
  try {
    await deleteMyData();
    $('text').value = '';
    statusLine.textContent = 'Deleted. Nothing is saved for you now.';
  } catch (err) {
    show(err);
  }
});

$('sign-out').addEventListener('click', () => clerk.signOut());

// jstash's messages name the problem and the fix. They're written for
// developers, so a real app would show people its own words.
function show(err) {
  console.error(err);
  statusLine.textContent = err.code ? `${err.code}: ${err.message}` : err.message;
}
