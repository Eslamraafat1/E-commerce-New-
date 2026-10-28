"use client";

/** Last-resort error boundary (replaces the root layout, so it renders its own <html>). */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#0a0a0c", color: "#f2f0ea", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: "2.4rem", margin: 0 }}>Something went wrong / حدث خطأ ما</h1>
          <p style={{ opacity: 0.7 }}>Please try again. / يرجى المحاولة مرة أخرى.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "14px 28px", borderRadius: 999, border: 0, background: "#d4ff3a", color: "#0e0e10", fontWeight: 700, cursor: "pointer" }}>Retry / إعادة المحاولة</button>
        </div>
      </body>
    </html>
  );
}
