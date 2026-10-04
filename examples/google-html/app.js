// A notes page with Sign In With Google and jstash Apps. No build step: serve
// this folder and open it. Guide: https://jstash.app/docs/apps/

// ---------------------------------------------------------------------------
// Your settings. Neither is a secret: both are in the page every visitor loads.
// ---------------------------------------------------------------------------

// Your jstash app's ID (app_…): it's under the app's name in Apps in the jstash dashboard.
const JSTASH_APP_ID = '';
// Your Google OAuth client ID (….apps.googleusercontent.com): the same one you gave jstash.
const GOOGLE_CLIENT_ID = '';

// ---------------------------------------------------------------------------
// jstash: plain fetch, no SDK. save(), load() and failure() are the starter
// code from your app's page in the jstash dashboard; token() is the Google part.
// ---------------------------------------------------------------------------

// The signed-in person's documents live under this address, by name: …/me/notes.
const JSTASH = `https://api.jstash.app/v1/apps/${JSTASH_APP_ID}/me`;

// The signed-in person's Google ID token, set by the Sign In With Google
// callback below. It's kept in memory only, so reloading the page signs out.
let idToken = null;

// Unsaved text from a sign-in that ran out, and whose it was. It's put back only
// if the same Google account signs in again, never for someone else.
let pending = null;

// Every request sends the Google ID token (never a jstash API key). It's valid
// for one hour and the page can't refresh it, so people sign in again after that.
function token() {
  if (!idToken) throw new Error('Not signed in');
  return idToken;
}

/** Creates or replaces the whole document. Any JSON value works. */
async function save(name, value) {
  const res = await fetch(`${JSTASH}/${name}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${await token()}` },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw await failure(res);
}

/** The document, or null if this person hasn't saved one yet. */
async function load(name) {
  const res = await fetch(`${JSTASH}/${name}`, {
    headers: { Authorization: `Bearer ${await token()}` },
  });
  if (res.ok) return res.json();
  const err = await failure(res);
  if (err.code === 'DOC_NOT_FOUND') return null; // nothing saved yet
  throw err;
}

/**
 * Deletes every document this person saved in this app. In a real app, call
 * it as part of "delete my account".
 */
async function deleteMyData() {
  const res = await fetch(JSTASH, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${await token()}` },
  });
  if (!res.ok) throw await failure(res);
}

// jstash errors are JSON: {"error": {"code", "message"}}. Branch on the code.
// The message says what went wrong and how to fix it.
async function failure(res) {
  const { error } = await res.json()
    .catch(() => ({ error: { message: `jstash returned ${res.status}` } }));
  return Object.assign(new Error(error.message), { code: error.code });
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);
const statusLine = $('status');

if (!JSTASH_APP_ID || !GOOGLE_CLIENT_ID) {
  statusLine.textContent = 'Set JSTASH_APP_ID and GOOGLE_CLIENT_ID at the top of app.js, then reload.';
} else {
  showSignIn();
  google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onSignIn });
  google.accounts.id.renderButton($('sign-in'), { theme: 'outline', size: 'large' });
}

// Sign In With Google calls this with the ID token in response.credential.
function onSignIn(response) {
  idToken = response.credential;
  showNotes();
}

function signOut() {
  idToken = null;
  google.accounts.id.disableAutoSelect(); // don't sign them straight back in
  showSignIn();
}

function showSignIn() {
  $('notes').hidden = true;
  $('text').value = '';
  $('sign-in').hidden = false;
  statusLine.textContent = '';
}

async function showNotes() {
  const signedIn = idToken; // to notice a sign-out while the notes load
  $('sign-in').hidden = true;
  $('text').value = '';
  $('notes').hidden = false;
  // Keep the editor off until the notes load, so an empty box can't be saved over them.
  $('editor').disabled = true;
  statusLine.textContent = 'Loading your notes…';
  try {
    const notes = await load('notes'); // null: nothing saved yet
    if (idToken !== signedIn) return; // they signed out while it loaded
    const keep = pending?.sub && pending.sub === subOf(signedIn) ? pending.text : null;
    pending = null;
    $('text').value = keep ?? notes?.text ?? '';
    statusLine.textContent = keep !== null
      ? 'Signed in again. Press Save to keep your changes.'
      : notes
        ? `Loaded your notes, saved ${new Date(notes.saved_at).toLocaleString()}.`
        : 'Nothing saved yet. Write something and save it.';
    $('editor').disabled = false;
  } catch (err) {
    if (idToken === signedIn) show(err);
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

$('sign-out').addEventListener('click', signOut);

// jstash's messages name the problem and the fix. They're written for
// developers, so a real app would show people its own words.
function show(err) {
  console.error(err);
  // After an hour the Google token has expired, and only signing in again gets a new one.
  if (err.code === 'AUTH_INVALID') {
    // Only text the person could edit, not the empty box shown while notes load.
    if (!$('editor').disabled) pending = { sub: subOf(idToken), text: $('text').value };
    signOut();
  }
  statusLine.textContent = err.code ? `${err.code}: ${err.message}` : err.message;
}

// The Google account's ID (sub) from an ID token. Its middle part is base64url JSON.
function subOf(jwt) {
  try {
    return JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub;
  } catch {
    return null;
  }
}
