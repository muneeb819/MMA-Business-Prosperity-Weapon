"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#07080F]">
      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
        <span className="text-4xl">⚠</span>
      </div>
      <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
      <p className="text-sm text-zinc-500 max-w-md text-center">An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors">
        Try Again
      </button>
    </div>
  );
}
