"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Transition from "../../../components/Transition/Transition";

const ScannerClient = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("loading"); // loading, authenticated, unauthenticated
  const [manualId, setManualId] = useState("");
  const [scanResult, setScanResult] = useState({ state: "idle", message: "" });
  const scannerRef = useRef(null);
  const flashOverlayRef = useRef(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (!storedToken) {
      setStatus("unauthenticated");
      router.push("/admin/login");
      return;
    }
    setToken(storedToken);
    setStatus("authenticated");
  }, [router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    // Load Html5QrcodeScanner dynamically inside useEffect to avoid SSR window errors
    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      let scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;

      function onScanSuccess(decodedText) {
        if (isScanningRef.current) return;
        isScanningRef.current = true;
        processAttendance(decodedText);
      }

      function onScanFailure() {
        // Handle scan failure gracefully (mostly ignored to avoid spam)
      }
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [status]);

  const processAttendance = async (registrationId) => {
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ registrationId })
      });

      const data = await res.json();

      if (res.ok) {
        setScanResult({ state: "success", message: `✔ ${data.message} - ${data.teamName}` });
        triggerFlash("rgba(0, 255, 0, 0.4)");
      } else {
        setScanResult({ state: "error", message: `✖ ${data.error} ${data.teamName ? `(${data.teamName})` : ''}` });
        triggerFlash("rgba(255, 0, 0, 0.6)");
      }
    } catch {
      setScanResult({ state: "error", message: "✖ System Error processing attendance" });
      triggerFlash("rgba(255, 0, 0, 0.6)");
    }

    // Cooldown
    setTimeout(() => {
      isScanningRef.current = false;
      setScanResult({ state: "idle", message: "" });
    }, 3000);
  };

  const triggerFlash = (color) => {
    if (!flashOverlayRef.current) return;
    gsap.killTweensOf(flashOverlayRef.current);
    gsap.fromTo(flashOverlayRef.current, 
      { backgroundColor: color, opacity: 1 }, 
      { backgroundColor: "transparent", opacity: 0, duration: 1, ease: "power2.out" }
    );
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId || isScanningRef.current) return;
    isScanningRef.current = true;
    processAttendance(manualId);
    setManualId("");
  };

  if (status === "loading") return <div style={{ color: "white", padding: "50px", textAlign: "center" }}>Loading Optics...</div>;
  if (status === "unauthenticated") {
    return <div style={{ color: "white", padding: "50px", textAlign: "center" }}><h2>Restricted Area</h2><button onClick={() => router.push("/admin/login")}>Access Term</button></div>;
  }

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "50px", position: "relative" }}>
      <div ref={flashOverlayRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 999 }}></div>
      
      <a href="/admin/dashboard" style={{ color: "#888", marginBottom: "20px", textDecoration: "none" }}>← Back to Dashboard</a>
      
      <h2 style={{ textTransform: "uppercase", letterSpacing: "2px", marginBottom: "30px" }}>Secure Entry Scanner</h2>

      <div style={{ padding: "20px", background: "#111", border: "1px solid #333", borderRadius: "8px", width: "100%", maxWidth: "400px", textAlign: "center" }}>
        
        <div id="qr-reader" style={{ width: "100%", background: "#fff", marginBottom: "20px", color: "#000" }}></div>

        <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <input 
            type="text" 
            placeholder="Manual TECH ID..." 
            value={manualId} 
            onChange={(e) => setManualId(e.target.value)}
            style={{ flexGrow: 1, padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", outline: "none" }}
          />
          <button type="submit" style={{ padding: "10px 20px", background: "#fff", color: "#000", border: "none", fontWeight: "bold", cursor: "pointer" }}>LOG</button>
        </form>

        <div style={{ marginTop: "20px", width: "100%", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "#050505", border: "1px solid #222" }}>
          {scanResult.state !== "idle" && (
            <p style={{ margin: 0, fontWeight: "bold", color: scanResult.state === "success" ? "lightgreen" : "red" }}>
              {scanResult.message}
            </p>
          )}
          {scanResult.state === "idle" && <p style={{ margin: 0, color: "#555" }}>READY FOR SCAN</p>}
        </div>

      </div>
    </div>
  );
};

export default Transition(ScannerClient);
