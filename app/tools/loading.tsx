export default function ToolsLoading() {
  return (
    <main className="apple-page pb-12 pt-4">
      <div className="apple-shell py-7">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-[color:var(--muted)] rounded" />
          <div className="h-20 w-full max-w-2xl bg-[color:var(--muted)] rounded" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="apple-card p-5">
                <div className="h-6 w-3/4 bg-[color:var(--muted)] rounded" />
                <div className="mt-3 h-12 w-full bg-[color:var(--muted)] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
