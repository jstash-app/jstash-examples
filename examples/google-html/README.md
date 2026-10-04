# jstash Apps + Sign In With Google (plain HTML, no build step)

A notes page in one HTML file and one script. Sign in with Google, write something, save. Sign out and back in, or open the page in another browser, and the note comes back. Each person who signs in gets their own notes.

There’s no backend, no database and nothing to install. The browser sends the person’s Google ID token to jstash, jstash checks it, and the note is stored under that person.

## What it shows

- Sign In With Google with Google Identity Services ([app.js](app.js), `onSignIn`)
- Sending the Google ID token with each request (`token()`)
- `save()` and `load()` of a `notes` document with plain `fetch`: the same helpers as the starter code on your app’s page in the jstash dashboard
- `deleteMyData()`: `DELETE …/me` removes everything the person saved, for your app’s “delete my account”
- Signing in again when the token expires

## Setup

You need a Google Cloud project, a [jstash account](https://app.jstash.app) and any static file server. The commands below use Python 3; `npx serve -l 5173` works too.

1. **Google.** In the [Google Cloud console](https://console.cloud.google.com/apis/credentials), open **APIs & Services → Credentials → Create credentials → OAuth client ID** and choose **Web application**. (If Google asks, set up the consent screen first: an app name and your email are enough for testing.) Under **Authorized JavaScript origins**, add both `http://localhost` and `http://localhost:5173`. Copy the client ID.
2. **jstash.** In the [jstash dashboard](https://app.jstash.app), open **Apps → New app**. Pick **Google** and paste the same client ID. Create the app.
3. On the app’s page, turn on **Allow localhost**. Copy the app ID: the `app_…` under the app’s name in **Apps**.
4. Put both values at the top of [app.js](app.js):

   ```js
   const JSTASH_APP_ID = 'app_…';
   const GOOGLE_CLIENT_ID = '….apps.googleusercontent.com';
   ```

5. Serve this folder:

   ```sh
   python3 -m http.server 5173
   ```

6. Open http://localhost:5173 (not `file://`, which Google refuses). Sign in, write something and save. Sign out and sign in again, or open the page in another browser, and your note is there.

## Settings

With no build step there are no environment variables: the two settings are constants at the top of `app.js`.

| Name | What it is |
|---|---|
| `JSTASH_APP_ID` | Your jstash app’s ID, `app_…` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID, `….apps.googleusercontent.com` |

Neither is a secret: both are in the page every visitor loads. There’s no jstash API key anywhere in this example, and there never should be in a web page.

## Good to know

Google ID tokens last one hour, and a page can’t refresh them. This example keeps the token in memory, so people sign in again after an hour or after a reload. That suits short sessions. For an app people keep open, use Clerk, Supabase or Firebase: all three offer “Sign in with Google” and refresh tokens for you. See the [Clerk](../clerk-vite/) and [Supabase](../supabase-vite/) examples.

## Going live

- Add your site’s address, like `https://notes.example.com`, under **Website addresses** on the app’s page, and turn off **Allow localhost**. Addresses match exactly, with no wildcards.
- Add the same address to the client’s **Authorized JavaScript origins** in Google Cloud.

## Troubleshooting

- **No Google button?** Check the browser console. The usual cause is an origin missing from **Authorized JavaScript origins**: Google needs `http://localhost` and `http://localhost:5173`, exactly.
- **An error with a code, like `AUTH_INVALID` or `FORBIDDEN`?** The message says what to fix. The most common: the app is set up with a different client ID, or Allow localhost is off. See [Troubleshooting](https://jstash.app/docs/apps/#troubleshooting).

## Docs

- [Google setup in the jstash Apps guide](https://jstash.app/docs/apps/#google)
- [Endpoints](https://jstash.app/docs/apps/#endpoints), [limits](https://jstash.app/docs/apps/#limits) and [errors](https://jstash.app/docs/apps/#errors)
- [Google Identity Services for the web](https://developers.google.com/identity/gsi/web/guides/overview)
