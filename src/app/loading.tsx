export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#07080F]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Loading MBPW...</p>
      </div>
    </div>
  );
}
