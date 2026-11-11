export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
      <div className="text-center">
        <div className="text-6xl animate-bounce">🐾</div>
        <div className="mt-4 h-1.5 w-40 mx-auto skeleton" />
      </div>
    </div>
  )
}
