"use client";

export default function Error({ error, reset }) {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Something went wrong</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        {error?.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 20px",
          backgroundColor: "#f5d38a",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
