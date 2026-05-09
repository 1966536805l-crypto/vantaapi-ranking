export default function DashboardLoading() {
  return (
    <main className="apple-page pb-12 pt-4">
      <div className="apple-shell py-7">
        <div className="apple-card soft-gradient p-5 animate-pulse">
          <div className="h-4 w-24 bg-[color:var(--muted)] rounded" />
          <div className="mt-3 h-10 w-64 bg-[color:var(--muted)] rounded" />
          <div className="mt-3 h-16 w-full max-w-2xl bg-[color:var(--muted)] rounded" />
          <div className="mt-5 flex flex-wrap gap-2">
            <div className="h-20 w-32 bg-[color:var(--muted)] rounded" />
            <div className="h-20 w-32 bg-[color:var(--muted)] rounded" />
            <div className="h-20 w-32 bg-[color:var(--muted)] rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}
