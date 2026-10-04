# jstash Apps + Supabase Auth (Vite, vanilla JS)

A notes page. Sign in with an email link from Supabase, write something, save. Sign out and back in, or open the page in another browser, and the note comes back. Each person who signs in gets their own notes.

Supabase handles sign-in only: there are no tables, no row-level security policies and no backend. The browser sends the person’s Supabase access token to jstash, jstash checks it, and the note is stored under that person.

## What it shows

- Supabase magic-link sign-in ([src/main.js](src/main.js))
- Getting the Supabase access token for each request ([src/jstash.js](src/jstash.js), `token()`)
- `save()` and `load()` of a `notes` document with plain `fetch`: the same helpers as the starter code on your app’s page in the jstash dashboard
- `deleteMyData()`: `DELETE …/me` removes everything the person saved, for your app’s “delete my account”
- Loading the right person’s notes as people sign in and out

## Setup

You need Node 22 or later, a [Supabase](https://supabase.com) project and a [jstash account](https://app.jstash.app).

1. **Supabase.** In your project:
   - Under **Authentication → URL Configuration**, add `http://localhost:5173` to the **Redirect URLs** (or make it the Site URL). The sign-in link in the email can only bring people back to an address listed there.
   - Email sign-in is on by default. Check it under **Authentication → Sign In / Providers**.
   - Click **Connect** and copy the Project URL and the publishable key.
2. **jstash.** In the [jstash dashboard](https://app.jstash.app), open **Apps → New app**. Pick **Supabase** and paste your Project URL. Create the app.
   - If jstash says your project uses the legacy JWT secret, open **Project Settings → JWT Keys** in Supabase, migrate to JWT signing keys with an RSA or ECC (P-256) key (a shared-secret key won’t work), and try again. jstash checks tokens with the public keys your project publishes, so it never holds a secret of yours.
3. On the app’s page, turn on **Allow localhost**. Copy the app ID: the `app_…` under the app’s name in **Apps**.
4. In this folder:

   ```sh
   cp .env.example .env.local   # then fill in all three values
   npm install
   npm run dev
   ```

5. Open http://localhost:5173 and enter your email. Open the link in the email, write something and save. Sign out and sign in again, or open the page in another browser, and your note is there.

## Environment variables

| Name | What it is |
|---|---|
| `VITE_JSTASH_APP_ID` | Your jstash app’s ID, `app_…` |
| `VITE_SUPABASE_URL` | Your Supabase Project URL, like `https://abcd1234.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key, `sb_publishable_…` (an older project’s anon key works too) |

None is a secret: they all end up in the page every visitor loads. There’s no jstash API key anywhere in this example, and there never should be in a web page.

## Prefer GitHub sign-in?

Turn on the GitHub provider in Supabase (**Authentication → Sign In / Providers**), then sign people in with:

```js
await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin } });
```

Nothing changes on the jstash side: it’s still a Supabase access token. jstash can’t check GitHub’s own tokens directly, which is why GitHub sign-in goes through Supabase, Firebase or Clerk.

## Going live

- Add your site’s address, like `https://notes.example.com`, under **Website addresses** on the app’s page, and turn off **Allow localhost**. Addresses match exactly, with no wildcards.
- Add the same address to the Redirect URLs in Supabase.

## Troubleshooting

- **Stuck on “Loading…”?** Open the browser console. A missing value in `.env.local` is reported there.
- **No email arriving?** Supabase’s built-in email sender is meant for testing and only sends a few emails an hour. Set up your own SMTP in Supabase for real use.
- **The link opens a page that doesn’t sign you in?** Check `http://localhost:5173` is in the Redirect URLs.
- **An error with a code, like `AUTH_INVALID` or `FORBIDDEN`?** The message says what to fix. The most common: the app is set up for a different Supabase project, or Allow localhost is off. See [Troubleshooting](https://jstash.app/docs/apps/#troubleshooting).

## Docs

- [Supabase setup in the jstash Apps guide](https://jstash.app/docs/apps/#supabase)
- [Endpoints](https://jstash.app/docs/apps/#endpoints), [limits](https://jstash.app/docs/apps/#limits) and [errors](https://jstash.app/docs/apps/#errors)
- [Supabase passwordless email sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless)
