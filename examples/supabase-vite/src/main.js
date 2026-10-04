// The notes page. Supabase signs people in; ./jstash.js saves and loads their notes.
import { supabase } from './supabase.js';
import { deleteMyData, load, save } from './jstash.js';

const $ = (id) => document.getElementById(id);
const statusLine = $('status');
let shownUser; // the Supabase user ID whose notes are on screen; null when signed out

// Supabase calls this straight away, and again on every sign-in, sign-out and
// token refresh. It also picks up the session when someone arrives from the
// link in their email.
supabase.auth.onAuthStateChange((event, session) => {
  const user = session?.user ?? null;
  const id = user?.id ?? null;
  if (id === shownUser) return; // a token refresh: still the same person
  shownUser = id;
  // Run after the callback returns: calling Supabase from inside it can deadlock.
  setTimeout(() => (user ? showNotes(user) : showSignIn()), 0);
});

function showSignIn() {
  $('notes').hidden = true;
  $('text').value = '';
  $('sign-in').hidden = false;
  statusLine.textContent = '';
}

async function showNotes(user) {
  $('sign-in').hidden = true;
  $('who').textContent = user.email ?? user.id;
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

$('sign-in').addEventListener('submit', async (event) => {
  event.preventDefault();
  statusLine.textContent = 'Sending…';
  const { error } = await supabase.auth.signInWithOtp({
    email: $('email').value,
    // Where the link in the email brings people back to. It must be one of the
    // Redirect URLs in Supabase (Authentication → URL Configuration).
    options: { emailRedirectTo: window.location.origin },
  });
  statusLine.textContent = error ? error.message : 'Check your email and open the sign-in link.';
});

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

// 'local' signs out this browser only, so another browser you signed in with stays signed in.
$('sign-out').addEventListener('click', () => supabase.auth.signOut({ scope: 'local' }));

// jstash's messages name the problem and the fix. They're written for
// developers, so a real app would show people its own words.
function show(err) {
  console.error(err);
  statusLine.textContent = err.code ? `${err.code}: ${err.message}` : err.message;
}
