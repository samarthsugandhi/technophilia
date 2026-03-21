"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./AdminLogin.css";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", data.token);
      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>TECHNOPHILIA 3.0</h1>
          <p>Admin Control Panel</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@test.com"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="admin-error">{error}</div>}

          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? "Logging in..." : "ACCESS CONTROL PANEL"}
          </button>
        </form>

        <div className="admin-credentials">
          <p>Demo Credentials:</p>
          <small>Email: admin@test.com</small>
          <small>Password: 123456</small>
        </div>
      </div>
    </div>
  );
}
