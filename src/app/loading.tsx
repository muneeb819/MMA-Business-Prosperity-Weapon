export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 animate-pulse opacity-50" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white font-bold text-2xl">M</div>
        </div>
        <p className="text-zinc-400 text-sm animate-pulse">Loading MBPW...</p>
      </div>
    </div>
  )
}
