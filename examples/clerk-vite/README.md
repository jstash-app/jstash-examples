# jstash Apps + Clerk (Vite, vanilla JS)

A notes page. Sign in with Clerk, write something, save. Sign out and back in, or open the page in another browser, and the note comes back. Each person who signs in gets their own notes.

There’s no backend and no database here. The browser sends the person’s Clerk session token to jstash, jstash checks it, and the note is stored under that person.

## What it shows

- Clerk sign-in with its prebuilt sign-in screen, in plain JavaScript ([src/clerk.js](src/clerk.js))
- Getting a Clerk session token for each request ([src/jstash.js](src/jstash.js), `token()`)
- `save()` and `load()` of a `notes` document with plain `fetch`: the same helpers as the starter code on your app’s page in the jstash dashboard
- `deleteMyData()`: `DELETE …/me` removes everything the person saved, for your app’s “delete my account”
- Loading the right person’s notes as people sign in and out ([src/main.js](src/main.js))

## Setup

You need Node 22 or later, a [Clerk](https://clerk.com) application and a [jstash account](https://app.jstash.app).

1. **Clerk.** In the Clerk Dashboard, create an application (or use one you have). On **API keys**, copy the publishable key. A development instance (`pk_test_…`) is fine.
2. **jstash.** In the [jstash dashboard](https://app.jstash.app), open **Apps → New app**. Pick **Clerk** and paste the same publishable key: jstash reads your Frontend API URL from it. (The Frontend API URL from Clerk’s **Domains** page works too.) Create the app.
3. On the app’s page, turn on **Allow localhost**. Copy the app ID: the `app_…` under the app’s name in **Apps**.
4. In this folder:

   ```sh
   cp .env.example .env.local   # then fill in VITE_JSTASH_APP_ID and VITE_CLERK_PUBLISHABLE_KEY
   npm install
   npm run dev
   ```

5. Open http://localhost:5173. Sign in, write something and save. Sign out and sign in again, or open the page in another browser, and your note is there.

## Environment variables

| Name | What it is |
|---|---|
| `VITE_JSTASH_APP_ID` | Your jstash app’s ID, `app_…` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key, `pk_test_…` or `pk_live_…` |

Neither is a secret: both end up in the page every visitor loads. There’s no jstash API key anywhere in this example, and there never should be in a web page.

## Going live

- Add your site’s address, like `https://notes.example.com`, under **Website addresses** on the app’s page, and turn off **Allow localhost**. Addresses match exactly, with no wildcards.
- Clerk’s production instance has its own Frontend API URL and its own users, so it needs its own jstash app; use that app’s ID with your `pk_live_…` key. Free includes 1 app, so delete the development app first (its notes go with it), or use Pro, which has 3 (see [pricing](https://jstash.app/pricing/)).
- Clerk tokens name the website they were made on, and jstash refuses tokens made on a website the app doesn’t list.

## Troubleshooting

- **Stuck on “Loading…”?** Open the browser console. A missing value in `.env.local` or a wrong key is reported there.
- **An error with a code, like `AUTH_INVALID` or `FORBIDDEN`?** The message says what to fix. The most common: a token from a different Clerk instance (development vs production), or Allow localhost is off. See [Troubleshooting](https://jstash.app/docs/apps/#troubleshooting).

## Docs

- [Clerk setup in the jstash Apps guide](https://jstash.app/docs/apps/#clerk)
- [Endpoints](https://jstash.app/docs/apps/#endpoints), [limits](https://jstash.app/docs/apps/#limits) and [errors](https://jstash.app/docs/apps/#errors)
- [Clerk’s JavaScript quickstart](https://clerk.com/docs/js-frontend/getting-started/quickstart)
