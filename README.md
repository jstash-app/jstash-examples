# jstash examples

[jstash Apps](https://jstash.app/apps/) gives each person who signs in to your web app their own private JSON documents.
Your app keeps the login it already has (Clerk, Supabase Auth, Firebase Auth or Sign In With Google): the browser sends that login’s token, and jstash checks it.
No database, no backend and no security rules to write: each signed-in person can read and write only their own documents.

## Examples

Each one is the same small notes page: sign in, write something, save. Sign out and back in, in any browser, and the note comes back.

| Example | Login | Build step |
|---|---|---|
| [`examples/clerk-vite`](examples/clerk-vite/) | Clerk | Vite |
| [`examples/google-html`](examples/google-html/) | Sign In With Google | None: one HTML page and one script |
| [`examples/supabase-vite`](examples/supabase-vite/) | Supabase Auth (email link) | Vite |

Firebase works the same way; the [guide](https://jstash.app/docs/apps/#firebase) has its token code.

## How they talk to jstash

There’s no jstash SDK to install. Each example has the same three helpers, written with plain `fetch`, plus one `token()` function for its login:

```js
await save('notes', { text: 'Hello' });  // PUT    …/v1/apps/{appId}/me/notes
await load('notes');                     // GET    …/v1/apps/{appId}/me/notes (null if nothing is saved yet)
await deleteMyData();                    // DELETE …/v1/apps/{appId}/me (everything this person saved)
```

`save` and `load` are the starter code from your app’s page in the [jstash dashboard](https://app.jstash.app), so what you copy there works the same way.

Apps are free to try. See [pricing](https://jstash.app/pricing/) for the plans and their limits.

## Is it the right fit?

jstash Apps does one thing: private data for each signed-in person. If your app needs data people share, search or queries across documents, or live sync between devices, use a full database such as Supabase or Firebase instead. See [what Apps isn’t for](https://jstash.app/apps/#not-for).

## Links

- [jstash Apps overview](https://jstash.app/apps/)
- [jstash Apps guide](https://jstash.app/docs/apps/): setup for each login, endpoints, limits, errors
- [Pricing](https://jstash.app/pricing/)

## Licence

The example code in this repository is MIT licensed: copy it into your own projects. See [LICENSE](LICENSE). Using the jstash service is covered by the [jstash Terms](https://jstash.app/terms/).
