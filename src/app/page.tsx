import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 selection:bg-slate-200 selection:text-slate-900">
      <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link href="/" className="inline-flex items-center" aria-label="GRAMMAR Home">
            <Image src="/grammar-logo-on-white.svg" alt="GRAMMAR" width={220} height={46} className="h-10 w-auto" priority />
      <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-12">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/grammar-logo.svg"
              alt="GRAMMAR"
              width={180}
              height={48}
              className="h-9 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/chat/acheevy"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              Start chatting
            </Link>
            <Link
              href="/research"
              className="rounded-full bg-[#0F172A] px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105"
            >
              Explore platform
            </Link>
              href="/auth/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              Log In
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full bg-[#0F172A] px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105"
            >
              Start Building
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center justify-center px-6 pb-24 pt-16 text-center lg:px-12">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.16),transparent_55%)]" />

        <Image
          src="/grammar-logo-on-white.svg"
          alt="Grammar logo"
          width={520}
          height={120}
          className="mb-10 h-auto w-[340px] sm:w-[460px]"
          priority
        />

        <h1 className="text-balance text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-slate-900 sm:text-6xl lg:text-7xl">
          Ordinary language in.
          <br />
          technical language out.
        </h1>

        <p className="mt-8 max-w-3xl text-pretty text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
          GRAMMAR is the execution engine for translating natural intent into governed technical context. Start chatting
          to route prompts through ACHEEVY, attach NotebookLM-backed sources, and shape output that your team can ship.
          src="/grammar-logo.svg"
          alt="Grammar logo"
          width={460}
          height={120}
          className="mb-10 h-auto w-[320px] sm:w-[420px]"
          priority
        />

        <h1 className="text-balance text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-slate-900 sm:text-6xl lg:text-7xl">
          Governed execution
          <br />
          from human intent.
        </h1>

        <p className="mt-8 max-w-3xl text-pretty text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
          GRAMMAR translates natural language into structured technical context so your team can ship faster with
          confidence. Build and route high-fidelity prompts across Claude, OpenAI, VS Code, terminal workflows, and
          custom MCP environments.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/chat/acheevy"
            className="inline-flex items-center gap-2 rounded-full bg-[#00A3FF] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#00A3FF33] transition hover:scale-105"
          >
            Start chatting
          </Link>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Explore platform
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-full bg-[#00A3FF] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#00A3FF33] transition hover:scale-105"
          >
            Initialize Circuit Box
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-400"
          >
            View Platform Access
          </Link>
        </div>
      </main>
    </div>
  );
}
