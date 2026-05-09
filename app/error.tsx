"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="apple-page flex min-h-screen items-center justify-center px-4">
      <div className="apple-card max-w-md p-8 text-center">
        <h1 className="font-serif text-4xl">Something went wrong</h1>
        <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={reset}
            className="apple-button-primary px-4 py-2 text-sm"
          >
            Try again
          </button>
          <Link href="/" className="apple-button-secondary px-4 py-2 text-sm">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
