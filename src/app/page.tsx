import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/chat/acheevy');
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-[#00A3FF] flex items-center justify-center text-white shadow-2xl shadow-[#00A3FF44]">
          <span className="font-bold text-2xl">G</span>
        </div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Initializing Circuit Box...</p>
      </div>
    </div>
  );
}
