// Loads Clerk the way Clerk's JavaScript quickstart does:
// https://clerk.com/docs/js-frontend/getting-started/quickstart
import { Clerk } from '@clerk/clerk-js';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error('Add VITE_CLERK_PUBLISHABLE_KEY to .env.local (see .env.example).');
}

// Clerk's prebuilt sign-in screen is served by your Clerk instance, whose
// address is encoded in the publishable key.
const clerkDomain = atob(publishableKey.split('_')[2]).slice(0, -1);
await new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = `https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`;
  script.crossOrigin = 'anonymous';
  script.onload = resolve;
  script.onerror = () => reject(new Error('Couldn’t load Clerk’s sign-in screen. Check VITE_CLERK_PUBLISHABLE_KEY.'));
  document.head.append(script);
});

export const clerk = new Clerk(publishableKey);
await clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
