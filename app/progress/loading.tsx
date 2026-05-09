export default function ProgressLoading() {
  return (
    <main className="apple-page pb-12 pt-4">
      <div className="apple-shell py-7">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-[color:var(--muted)] rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="apple-card p-4">
                <div className="h-5 w-2/3 bg-[color:var(--muted)] rounded" />
                <div className="mt-2 h-4 w-1/2 bg-[color:var(--muted)] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
