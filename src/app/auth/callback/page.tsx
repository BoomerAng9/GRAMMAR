'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSession = async (session: { accessToken?: string; access_token?: string } | null) => {
      const accessToken = session?.accessToken || session?.access_token;
      if (!accessToken) {
        return;
      }

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to persist authenticated session.');
      }

      router.replace('/chat/librechat');
    };

    const checkSession = async () => {
      try {
        if (!insforge) {
          router.replace('/chat/librechat');
          return;
        }

        const { data } = await insforge.auth.getCurrentSession();
        
        if (data?.session) {
          await handleSession(data.session as { accessToken?: string; access_token?: string });
        } else {
          // Check if onAuthStateChange exists on the auth object
          const authObj = insforge.auth as unknown as { 
            onAuthStateChange?: (cb: (event: string, session: { access_token: string } | null) => void) => void 
          };
          
          if (authObj.onAuthStateChange) {
            authObj.onAuthStateChange((event, session) => {
              if (event === 'SIGNED_IN' || session) {
                void handleSession(session);
              }
            });
          }

          setTimeout(() => {
            router.replace('/chat/librechat');
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
