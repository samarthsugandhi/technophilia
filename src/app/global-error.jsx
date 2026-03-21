"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h2>Something went wrong!</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          We're sorry for the inconvenience. The team has been notified.
        </p>
        <details style={{ whiteSpace: "pre-wrap", color: "#999", fontSize: "12px" }}>
          {error?.message}
        </details>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#f5d38a",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
