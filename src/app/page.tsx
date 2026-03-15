import { AuthPromptTimer } from '@/components/auth/AuthPromptTimer';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 flex items-center justify-center font-sans overflow-hidden relative selection:bg-slate-200 selection:text-slate-900">
      {/* 45-second Auth Prompt Modal */}
      {!user && !loading && <AuthPromptTimer />}

      {/* Top Navbar */}
      <nav className="fixed top-0 inset-x-0 w-full flex items-center justify-between px-6 lg:px-12 py-6 z-50 bg-white/50 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-3 select-none">
          <div className="relative w-[120px] h-[32px] flex items-center">
            {/* Fallback Logo Icon if PNG fails */}
            <div className="absolute inset-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00A3FF] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#00A3FF33]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            {/* Try to load the logo image on top */}
            <Image 
              src="/grammar-logo.png" 
              alt="GRAMMAR Logo" 
              width={120} 
              height={32} 
              className="w-auto h-7 object-contain relative z-10 opacity-100"
              priority
              onError={(e) => {
                // If it fails, we just don't see the image, the fallback background remains
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link 
                href="/auth/login"
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200"
              >
                Log In
              </Link>
              <Link 
                href="/auth/login"
                className="text-sm font-bold bg-[#00A3FF] text-white px-5 py-2.5 rounded-full hover:bg-[#0089D9] hover:scale-105 transition-all duration-200 shadow-lg shadow-[#00A3FF33]"
              >
                Start Building
              </Link>
            </>
          ) : (
            <Link 
              href="/board"
              className="text-sm font-bold bg-[#0F172A] text-white px-6 py-2.5 rounded-full hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center justify-center text-center mt-[-5vh]">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00A3FF]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative group cursor-default">
          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-sans leading-[0.9] tracking-[-0.03em] font-bold text-slate-900 pb-4">
            Transform Intent<br/>
            Into Technical<br/>
            <span className="text-[#00A3FF] relative inline-block">
              Execution.
              <div className="absolute -bottom-4 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00A3FF]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </span>
          </h1>
        </div>

        <p className="mt-8 md:mt-12 text-slate-500 text-lg md:text-xl max-w-3xl leading-relaxed mx-auto font-medium tracking-wide">
          GRAMMAR acts as a living filter, converting natural human language into rigid, governed technical context via our proprietary index and engine. Prompt better and maximize your velocity across Claude, OpenAI, VS Code, terminal environments, and custom MCPs.
        </p>

        <div className="mt-14 flex items-center gap-6 flex-col sm:flex-row">
          <Link 
            href={user ? "/board" : "/auth/login"}
            className="text-base font-bold bg-[#0F172A] text-white px-8 py-4 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_10px_40px_-10px_rgba(15,23,42,0.3)] flex items-center gap-3"
          >
            {user ? "Enter Circuit Box" : "Initialize Circuit Box"}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </Link>
        </div>
      </main>

      {/* Decorative Bottom Elements */}
      <div className="fixed bottom-0 inset-x-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="fixed bottom-6 left-6 text-xs font-mono text-slate-400 font-bold tracking-wider">
        SYS.v0.1.0 // ACTIVE
      </div>
    </div>
  );
}
