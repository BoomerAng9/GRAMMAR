import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

function getInsforgeClient() {
  if (!baseUrl || !anonKey) {
    console.warn('[InsForge] Missing environment variables. Client will not be available.');
    return null;
  }
  return createClient({ baseUrl, anonKey });
}

export const insforge = getInsforgeClient();
