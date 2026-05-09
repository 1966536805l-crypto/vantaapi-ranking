export default function Loading() {
  return (
    <main className="apple-page flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--muted)] border-t-[color:var(--accent)]" />
        <p className="text-sm text-[color:var(--muted)]">Loading...</p>
      </div>
    </main>
  );
}
