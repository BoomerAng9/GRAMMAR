'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSession = (session: { access_token: string } | null) => {
      if (session) {
        // Set cookie manually for middleware to see it immediately
        const expires = new Date();
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        document.cookie = `insforge-auth-token=${session.access_token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax; Secure`;
        router.replace('/board');
      }
    };

    const checkSession = async () => {
      try {
        if (!insforge) {
          router.replace('/board');
          return;
        }

        const { data } = await insforge.auth.getCurrentSession();
        
        if (data?.session) {
          handleSession(data.session as unknown as { access_token: string });
        } else {
          // Check if onAuthStateChange exists on the auth object
          const authObj = insforge.auth as unknown as { 
            onAuthStateChange?: (cb: (event: string, session: { access_token: string } | null) => void) => void 
          };
          
          if (authObj.onAuthStateChange) {
            authObj.onAuthStateChange((event, session) => {
              if (event === 'SIGNED_IN' || session) {
                handleSession(session);
              }
            });
          }

          setTimeout(() => {
            router.replace('/board');
          }, 3000);
        }
      } catch (err) {
        console.error('Error during auth callback:', err);
        router.replace('/auth/login');
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#00A3FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm animate-pulse tracking-wide">Authenticating...</p>
      </div>
    </div>
  );
}
