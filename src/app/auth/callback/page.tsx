'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * OAuth callback handler.
 * InsForge automatically handles the token exchange via the SDK.
 * This page just waits for the session to settle and redirects.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Give the SDK a moment to process the OAuth tokens from the URL hash
    const timer = setTimeout(() => {
      router.replace('/board');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00A3FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Completing sign-in...</p>
      </div>
    </div>
  );
}
