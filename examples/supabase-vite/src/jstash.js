// Saving and loading with jstash: plain fetch, no SDK. save(), load() and
// failure() are the starter code from your app's page in the jstash
// dashboard; token() is the Supabase part. Guide: https://jstash.app/docs/apps/
import { supabase } from './supabase.js';

const APP_ID = import.meta.env.VITE_JSTASH_APP_ID;
if (!APP_ID) {
  throw new Error('Add VITE_JSTASH_APP_ID to .env.local: the app_… ID from Apps in the jstash dashboard.');
}

// The signed-in person's documents live under this address, by name: …/me/notes.
const JSTASH = `https://api.jstash.app/v1/apps/${APP_ID}/me`;

// Every request sends the signed-in person's Supabase access token (never a
// jstash API key). getSession() returns the current token and refreshes it
// when it's about to expire, so call it before each request.
async function token() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Not signed in');
  return data.session.access_token;
}

/** Creates or replaces the whole document. Any JSON value works. */
export async function save(name, value) {
  const res = await fetch(`${JSTASH}/${name}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${await token()}` },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw await failure(res);
}

/** The document, or null if this person hasn't saved one yet. */
export async function load(name) {
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
 * it as part of "delete my account", before the user is deleted in Supabase.
 */
export async function deleteMyData() {
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
