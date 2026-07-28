import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#07080F]">
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <span className="text-4xl">🔍</span>
      </div>
      <h2 className="text-xl font-semibold text-white">Page Not Found</h2>
      <p className="text-sm text-zinc-500 max-w-md text-center">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}
