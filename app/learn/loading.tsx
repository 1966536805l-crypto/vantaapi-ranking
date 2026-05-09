export default function LearnLoading() {
  return (
    <main className="apple-page pb-12 pt-4">
      <div className="apple-shell py-7">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-[color:var(--muted)] rounded" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="apple-card p-5">
                <div className="h-6 w-3/4 bg-[color:var(--muted)] rounded" />
                <div className="mt-3 h-16 w-full bg-[color:var(--muted)] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
