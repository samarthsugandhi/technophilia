"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import "./AdminDashboard.css";

const fetcher = async (url, token) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const fetchError = new Error(payload?.error || "Failed to fetch teams");
    fetchError.status = res.status;
    throw fetchError;
  }

  const teams = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.teams)
      ? payload.teams
      : [];

  return { teams };
};

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState("teams");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegOpen, setIsRegOpen] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (!storedToken) {
      router.push("/admin/login");
      return;
    }
    setToken(storedToken);

    // Fetch the registration setting
    fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${storedToken}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isRegistrationOpen === "boolean") {
          setIsRegOpen(data.isRegistrationOpen);
        }
      })
      .catch((err) => console.error("Failed to load settings:", err));
  }, [router]);

  const {
    data,
    error,
    isLoading,
    mutate: reloadTeams,
  } = useSWR(
    token ? ["/api/admin/teams", token] : null,
    ([url, t]) => fetcher(url, t),
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (error?.status === 401) {
      localStorage.removeItem("adminToken");
      router.push("/admin/login");
    }
  }, [error, router]);

  const teams = data?.teams || [];
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  const toggleRegistration = async () => {
    const confirmMessage = isRegOpen
      ? "Are you sure you want to STOP the registration? (Users clicking \"Register\" will see a closed message)"
      : "Are you sure you want to OPEN the registration back up?";
      
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isRegistrationOpen: !isRegOpen }),
      });
      if (res.ok) {
        const updated = await res.json();
        const nextValue = typeof updated?.isRegistrationOpen === "boolean"
          ? updated.isRegistrationOpen
          : !isRegOpen;
        setIsRegOpen(nextValue);
        alert(`Registration has successfully been ${nextValue ? "OPENED" : "STOPPED"}.`);
      } else {
        alert("Failed to change registration status.");
      }
    } catch (e) {
      alert("Error reaching the server. Please check your connection.");
    }
  };

  if (!token) return <div className="admin-loading">Authorizing...</div>;
  if (isLoading && !data) return <div className="admin-loading">Loading teams...</div>;
  if (error && !data) {
    return (
      <div className="admin-loading admin-loading-error">
        <p>Unable to load admin data: {error.message}</p>
        <button className="btn-export" onClick={() => reloadTeams()}>
          Retry
        </button>
      </div>
    );
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTeams = teams.filter((team) => {
    if (!normalizedSearch) return true;
    const teamName = String(team?.teamName || "").toLowerCase();
    const regId = String(team?.registrationId || "").toLowerCase();
    const leaderName = String(team?.leader?.name || "").toLowerCase();
    return (
      teamName.includes(normalizedSearch) ||
      regId.includes(normalizedSearch) ||
      leaderName.includes(normalizedSearch)
    );
  });

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>TECHNOPHILIA 3.0 - CONTROL PANEL</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '4px' }}>
            <p style={{ margin: 0 }}>April 1-2, 2026</p>
            <button
              onClick={toggleRegistration}
              style={{
                backgroundColor: isRegOpen ? "#dc3545" : "#28a745",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.85rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              {isRegOpen ? "Registration: SET STOPPED" : "Registration: SET OPEN"}
            </button>
          </div>
        </div>
        <button onClick={handleLogout} className="admin-logout-btn">
          LOGOUT
        </button>
      </header>

      <div className="admin-container">
        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === "teams" ? "active" : ""}`}
            onClick={() => setActiveTab("teams")}
          >
            Teams ({teams.length})
          </button>
          <button
            className={`admin-nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            Attendance
          </button>
          <button
            className={`admin-nav-item ${activeTab === "shortlist" ? "active" : ""}`}
            onClick={() => setActiveTab("shortlist")}
          >
            Shortlist
          </button>
          <button
            className={`admin-nav-item ${activeTab === "winners" ? "active" : ""}`}
            onClick={() => setActiveTab("winners")}
          >
            Winners
          </button>
          <button
            className={`admin-nav-item ${activeTab === "export" ? "active" : ""}`}
            onClick={() => setActiveTab("export")}
          >
            Export
          </button>
        </nav>

        <main className="admin-content">
          <div className="admin-status-bar">
            {error && data && (
              <span className="admin-banner admin-banner-error">
                Live sync issue: {error.message}
              </span>
            )}
          </div>

          {activeTab === "teams" && (
            <TeamsSection
              teams={filteredTeams}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              token={token}
              onUpdate={reloadTeams}
            />
          )}
          {activeTab === "attendance" && (
            <AttendanceSection token={token} onUpdate={reloadTeams} />
          )}
          {activeTab === "shortlist" && (
            <ShortlistSection teams={teams} token={token} onUpdate={reloadTeams} />
          )}
          {activeTab === "winners" && (
            <WinnersSection teams={teams} token={token} onUpdate={reloadTeams} />
          )}
          {activeTab === "export" && (
            <ExportSection teams={teams} />
          )}
        </main>
      </div>
    </div>
  );
}

function TeamsSection({ teams, searchQuery, setSearchQuery, token, onUpdate }) {
  return (
    <div className="admin-section">
      <h2>Team Registrations</h2>
      <div className="admin-search">
        <div className="search-wrapper">
          <span className="search-icon">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by team name, ID, or leader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="teams-table">
        <div className="teams-header">
          <div>Team ID</div>
          <div>Team Name</div>
          <div>Leader</div>
          <div>Members</div>
          <div>Status</div>
          <div>Action</div>
        </div>
        {teams.map((team) => (
          <TeamRow key={team._id} team={team} token={token} onUpdate={onUpdate} />
        ))}
        {teams.length === 0 && (
          <div className="teams-empty">No teams found for your current filter.</div>
        )}
      </div>
    </div>
  );
}

function TeamRow({ team, token, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <div className={`teams-row ${expanded ? "expanded-active" : ""}`} onClick={() => setExpanded(!expanded)}>
        <div className="team-cell">
          <span className="cell-label">Team ID</span>
          <span className="cell-value team-id">{team.registrationId || "-"}</span>
        </div>
        <div className="team-cell">
          <span className="cell-label">Team Name</span>
          <span className="cell-value" style={{fontWeight: '700'}}>{team.teamName || "-"}</span>
        </div>
        <div className="team-cell">
          <span className="cell-label">Leader</span>
          <span className="cell-value">{team.leader?.name || "-"}</span>
        </div>
        <div className="team-cell">
          <span className="cell-label">Members</span>
          <span className="cell-value">
            {team.members?.map((m) => m.name).join(", ") || "-"}
          </span>
        </div>
        <div className="team-cell">
          <span className="cell-label">Status</span>
          <span className="team-status">
            {team.attendanceMarked && <span className="badge present">✓ Present</span>}
            {team.shortlisted && <span className="badge shortlist">⭐ Shortlisted</span>}
            {team.winner && <span className="badge winner">🏆 Winner</span>}
            {team.firstRunnerUp && <span className="badge winner">🥈 1st Runner</span>}
            {team.secondRunnerUp && <span className="badge winner">🥉 2nd Runner</span>}
            {!team.attendanceMarked && !team.shortlisted && !team.winner && !team.firstRunnerUp && !team.secondRunnerUp && (
              <span className="badge pending">⏳ Pending</span>
            )}
          </span>
        </div>
        <div className="team-cell" onClick={(e) => e.stopPropagation()}>
          <span className="cell-label">Action</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              className="btn-edit"
              onClick={() => setShowEdit(true)}
              title="Edit team details"
            >
              ✏️
            </button>
            <DeleteTeamBtn team={team} token={token} onDelete={onUpdate} />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="teams-row-expanded">
          <div className="expanded-section">
            <h4>Leader Details</h4>
            <p><strong>USN/CSN:</strong> {team.leader?.usn || team.leader?.csn || "-"}</p>
            <p><strong>Email:</strong> {team.leader?.email || "-"}</p>
            <p><strong>Phone:</strong> {team.leader?.phone || "-"}</p>
            <p><strong>Branch:</strong> {team.leader?.branch || "-"}</p>
            <p><strong>Stay:</strong> {team.leader?.stayType === "Hostel" ? `Hostel (${team.leader?.hostelName || "N/A"})` : "Local"}</p>
          </div>
          {team.members?.map((m, idx) => (
            <div className="expanded-section" key={idx}>
              <h4>Teammate Details</h4>
              <p><strong>USN/CSN:</strong> {m.usn || m.csn || "-"}</p>
              <p><strong>Email:</strong> {m.email || "-"}</p>
              <p><strong>Branch:</strong> {m.branch || "-"}</p>
              <p><strong>Stay:</strong> {m.stayType === "Hostel" ? `Hostel (${m.hostelName || "N/A"})` : "Local"}</p>
            </div>
          ))}
        </div>
      )}

      {showEdit && (
        <EditTeamModal
          team={team}
          token={token}
          onClose={() => setShowEdit(false)}
          onUpdate={() => { onUpdate(); setShowEdit(false); }}
        />
      )}
    </>
  );
}

function DeleteTeamBtn({ team, token, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteConfirmed = async () => {
    setShowConfirm(false);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/teams/${team._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onDelete();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete team.");
      }
    } catch {
      alert("Network error. Could not delete team.");
    }
    setDeleting(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={deleting}
        className="btn-delete"
        title="Delete team"
      >
        {deleting ? "⏳" : "🗑"}
      </button>
      {showConfirm && (
        <ConfirmModal
          message={`Permanently delete "${team.teamName}"?`}
          subMessage={`Team ID: ${team.registrationId} — This action cannot be undone. All their data will be erased.`}
          confirmLabel="Yes, Delete"
          cancelLabel="No, Cancel"
          dangerous={true}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

function ConfirmModal({ message, subMessage, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, dangerous = false }) {
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-confirm-icon">{dangerous ? "⚠️" : "❓"}</div>
        <h3 className="admin-confirm-title">{message}</h3>
        {subMessage && <p className="admin-confirm-sub">{subMessage}</p>}
        <div className="admin-confirm-actions">
          <button className="admin-btn-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button className={`admin-btn-confirm ${dangerous ? "danger" : ""}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function EditTeamModal({ team, token, onClose, onUpdate }) {
  const hasMember = Array.isArray(team.members) && team.members.length > 0;
  const [form, setForm] = useState({
    teamName: team.teamName || "",
    "leader.name": team.leader?.name || "",
    "leader.usn": team.leader?.usn || "",
    "leader.email": team.leader?.email || "",
    "leader.phone": team.leader?.phone || "",
    ...(hasMember ? {
      "members.0.name": team.members[0]?.name || "",
      "members.0.usn": team.members[0]?.usn || "",
      "members.0.email": team.members[0]?.email || "",
      "members.0.phone": team.members[0]?.phone || "",
    } : {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const doSave = async () => {
    setShowConfirmSave(false);
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/teams/${team._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ updates: form }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        onUpdate();
      } else {
        setError(data.error || "Failed to update. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    }
    setSaving(false);
  };

  return (
    <>
      <div className="admin-modal-overlay" onClick={onClose}>
        <div className="admin-edit-modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-edit-header">
            <h3>✏️ Edit Team — <span style={{ color: '#c8a97a' }}>{team.registrationId}</span></h3>
            <button className="admin-edit-close" onClick={onClose}>×</button>
          </div>
          <div className="admin-edit-body">
            <div className="admin-edit-group">
              <label>Team Name</label>
              <input value={form.teamName} onChange={(e) => handleChange("teamName", e.target.value)} />
            </div>

            <h4 className="admin-edit-section-title">Leader Details</h4>
            <div className="admin-edit-grid">
              <div className="admin-edit-group">
                <label>Name</label>
                <input value={form["leader.name"]} onChange={(e) => handleChange("leader.name", e.target.value)} />
              </div>
              <div className="admin-edit-group">
                <label>USN / CSN</label>
                <input value={form["leader.usn"]} onChange={(e) => handleChange("leader.usn", e.target.value)} />
              </div>
              <div className="admin-edit-group">
                <label>Email</label>
                <input type="email" value={form["leader.email"]} onChange={(e) => handleChange("leader.email", e.target.value)} />
              </div>
              <div className="admin-edit-group">
                <label>Phone</label>
                <input value={form["leader.phone"]} onChange={(e) => handleChange("leader.phone", e.target.value)} />
              </div>
            </div>

            {hasMember && (
              <>
                <h4 className="admin-edit-section-title">Teammate Details</h4>
                <div className="admin-edit-grid">
                  <div className="admin-edit-group">
                    <label>Name</label>
                    <input value={form["members.0.name"]} onChange={(e) => handleChange("members.0.name", e.target.value)} />
                  </div>
                  <div className="admin-edit-group">
                    <label>USN / CSN</label>
                    <input value={form["members.0.usn"]} onChange={(e) => handleChange("members.0.usn", e.target.value)} />
                  </div>
                  <div className="admin-edit-group">
                    <label>Email</label>
                    <input type="email" value={form["members.0.email"]} onChange={(e) => handleChange("members.0.email", e.target.value)} />
                  </div>
                  <div className="admin-edit-group">
                    <label>Phone</label>
                    <input value={form["members.0.phone"]} onChange={(e) => handleChange("members.0.phone", e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {error && <p className="admin-edit-error">{error}</p>}
          </div>
          <div className="admin-edit-footer">
            <button className="admin-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="admin-btn-confirm" onClick={() => setShowConfirmSave(true)} disabled={saving}>
              {saving ? "Saving..." : "✓ Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {showConfirmSave && (
        <ConfirmModal
          message={`Save changes to "${form.teamName || team.teamName}"?`}
          subMessage="Only the fields you edited will be updated. All other team data and other teams remain untouched."
          confirmLabel="Yes, Save"
          cancelLabel="No, Go Back"
          onConfirm={doSave}
          onCancel={() => setShowConfirmSave(false)}
        />
      )}
    </>
  );
}

function AttendanceSection({ token, onUpdate }) {
  const [mode, setMode] = useState("qr");
  const [manualId, setManualId] = useState("");
  const [scanResult, setScanResult] = useState({ state: "idle", message: "Ready" });
  const [scannerState, setScannerState] = useState("Initializing camera...");
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const extractRegistrationId = useCallback((rawValue) => {
    const input = String(rawValue || "").trim();
    if (!input) return "";

    const match = input.match(/IS-TP-\d+/i);
    if (match?.[0]) {
      return match[0].toUpperCase();
    }

    return input.toUpperCase();
  }, []);

  const submitAttendance = useCallback(async (rawRegistrationId) => {
    const registrationId = extractRegistrationId(rawRegistrationId);
    if (!registrationId || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setScanResult({ state: "loading", message: `Processing ${registrationId}...` });

    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ registrationId }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorText = String(payload?.error || "Failed to mark attendance");
        const teamName = payload?.teamName ? ` (${payload.teamName})` : "";

        if (errorText.toLowerCase().includes("already marked")) {
          alert(`Duplicate attendance: ${registrationId}${teamName}`);
        }

        setScanResult({
          state: "error",
          message: `${errorText}${teamName}`,
        });
      } else {
        setScanResult({
          state: "success",
          message: `Attendance marked for ${payload.teamName || registrationId}`,
        });
        onUpdate?.();
      }
    } catch {
      setScanResult({ state: "error", message: "System error while marking attendance" });
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
        setScanResult({ state: "idle", message: "Ready" });
      }, 800);
    }
  }, [extractRegistrationId, onUpdate, token]);

  useEffect(() => {
    if (mode !== "qr") return undefined;

    let mounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
        if (!mounted) return;

        const scanner = new Html5Qrcode("admin-attendance-qr-reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 25,
            qrbox: { width: 200, height: 200 },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          (decodedText) => {
            if (isProcessingRef.current) return;
            submitAttendance(decodedText);
          },
          () => {}
        );

        if (mounted) {
          setScannerState("✅ Camera active — show QR code to scan");
        }
      } catch {
        if (mounted) {
          setScannerState("⚠️ Unable to access camera. Check permissions and HTTPS/localhost.");
        }
      }
    };

    setScannerState("⏳ Initializing camera...");
    startScanner();

    return () => {
      mounted = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (scanner) {
        const safeClear = () => {
          const clearResult = scanner.clear?.();
          if (clearResult && typeof clearResult.catch === "function") {
            clearResult.catch(() => {});
          }
        };

        const stopResult = scanner.stop?.();
        if (stopResult && typeof stopResult.catch === "function") {
          stopResult.catch(() => {}).finally(safeClear);
        } else {
          safeClear();
        }
      }
    };
  }, [mode, submitAttendance]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    await submitAttendance(manualId);
    setManualId("");
  };

  return (
    <div className="admin-section">
      <h2>Attendance Management</h2>

      <div className="attendance-mode-switch">
        <button
          className={`admin-nav-item ${mode === "qr" ? "active" : ""}`}
          onClick={() => setMode("qr")}
          type="button"
        >
          QR Scanner
        </button>
        <button
          className={`admin-nav-item ${mode === "manual" ? "active" : ""}`}
          onClick={() => setMode("manual")}
          type="button"
        >
          Manual Entry
        </button>
      </div>

      {mode === "qr" && (
        <div className="attendance-card">
          <div id="admin-attendance-qr-reader" className="attendance-qr-reader" />
          <p className="attendance-help" style={{
            color: scannerState.startsWith("✅") ? "#4ade80" :
                   scannerState.startsWith("⚠️") ? "#f87171" : "#aaa",
          }}>
            {scannerState}
          </p>
        </div>
      )}

      {mode === "manual" && (
        <form className="attendance-manual-form" onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="Enter Team Registration ID (e.g. IS-TP-001)"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            required
          />
          <button type="submit" className="btn-export">
            Mark Attendance
          </button>
        </form>
      )}

      <div
        className={`attendance-toast ${scanResult.state}`}
        style={{
          fontSize: scanResult.state !== "idle" ? "1.15rem" : undefined,
          fontWeight: scanResult.state !== "idle" ? "800" : undefined,
          border: scanResult.state === "success" ? "2px solid #4ade80" :
                  scanResult.state === "error" ? "2px solid #f87171" : undefined,
          background: scanResult.state === "success" ? "rgba(74,222,128,0.08)" :
                      scanResult.state === "error" ? "rgba(248,113,113,0.08)" : undefined,
          color: scanResult.state === "success" ? "#4ade80" :
                 scanResult.state === "error" ? "#f87171" : "#aaa",
          transition: "all 0.2s ease",
          padding: "16px 20px",
          borderRadius: "8px",
          textAlign: "center",
          marginTop: "12px",
          minHeight: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {scanResult.state === "success" && <span style={{ marginRight: "8px", fontSize: "1.4rem" }}>✅</span>}
        {scanResult.state === "error" && <span style={{ marginRight: "8px", fontSize: "1.4rem" }}>❌</span>}
        {scanResult.message}
      </div>
    </div>
  );
}

function ShortlistSection({ teams, token, onUpdate }) {
  return (
    <div className="admin-section">
      <h2>Shortlist Management</h2>
      <div className="shortlist-grid">
        {teams.map((team) => (
          <ShortlistCard key={team._id} team={team} token={token} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}

function ShortlistCard({ team, token, onUpdate }) {
  const [updating, setUpdating] = useState(false);

  const toggleShortlist = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamId: team._id,
          field: "shortlisted",
          value: !team.shortlisted,
        }),
      });
      if (res.ok) onUpdate();
    } catch {
      alert("Failed to update");
    }
    setUpdating(false);
  };

  return (
    <div className={`shortlist-card ${team.shortlisted ? "active" : ""}`}>
      <h3>{team.teamName}</h3>
      <p>{team.leader.name}</p>
      <button
        onClick={toggleShortlist}
        disabled={updating}
        className={`btn-shortlist ${team.shortlisted ? "active" : ""}`}
      >
        {team.shortlisted ? "✓ Shortlisted" : "Mark Shortlist"}
      </button>
    </div>
  );
}

function WinnersSection({ teams, token, onUpdate }) {
  return (
    <div className="admin-section">
      <h2>Winner Announcement</h2>
      <div className="winners-grid">
        {teams.map((team) => (
          <WinnerCard key={team._id} team={team} token={token} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}

function WinnerCard({ team, token, onUpdate }) {
  const [updating, setUpdating] = useState(false);

  const getAwardLabel = (item) => {
    if (item.winner) return "Winner";
    if (item.firstRunnerUp) return "1st Runner-up";
    if (item.secondRunnerUp) return "2nd Runner-up";
    return "Not announced";
  };

  const updateAward = async (field, nextValue) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamId: team._id,
          field,
          value: nextValue,
        }),
      });
      if (res.ok) onUpdate();
    } catch {
      alert("Failed to update");
    }
    setUpdating(false);
  };

  return (
    <div className={`winner-card ${team.winner || team.firstRunnerUp || team.secondRunnerUp ? "active" : ""}`}>
      <h3>{team.teamName}</h3>
      <p className="winner-rank">{getAwardLabel(team)}</p>
      <div className="winner-members">
        {team.members?.map((m) => (
          <small key={m.usn}>{m.name}</small>
        ))}
      </div>

      <div className="winner-actions">
        <button
          onClick={() => updateAward("winner", !team.winner)}
          disabled={updating}
          className={`btn-winner ${team.winner ? "active" : ""}`}
        >
          {team.winner ? "🏆 Winner" : "Mark Winner"}
        </button>
        <button
          onClick={() => updateAward("firstRunnerUp", !team.firstRunnerUp)}
          disabled={updating}
          className={`btn-winner ${team.firstRunnerUp ? "active" : ""}`}
        >
          {team.firstRunnerUp ? "🥈 1st Runner-up" : "Mark 1st Runner-up"}
        </button>
        <button
          onClick={() => updateAward("secondRunnerUp", !team.secondRunnerUp)}
          disabled={updating}
          className={`btn-winner ${team.secondRunnerUp ? "active" : ""}`}
        >
          {team.secondRunnerUp ? "🥉 2nd Runner-up" : "Mark 2nd Runner-up"}
        </button>
      </div>
    </div>
  );
}

function ExportSection({ teams }) {
  const getStaySummary = (team) => {
    const participants = [team?.leader, ...(team?.members || [])].filter(Boolean);
    const total = participants.length;

    let localCount = 0;
    let hostelCount = 0;
    const hostelMap = new Map();

    participants.forEach((person) => {
      const isHostel = person?.stayType === "Hostel";
      if (isHostel) {
        hostelCount += 1;
        const hostelName = String(person?.hostelName || "Unspecified Hostel").trim();
        hostelMap.set(hostelName, (hostelMap.get(hostelName) || 0) + 1);
      } else {
        localCount += 1;
      }
    });

    const base = `${localCount},${hostelCount}(${total})`;
    const hostelBreakdown = [...hostelMap.entries()]
      .map(([name, count]) => `${name}:${count}`)
      .join("; ");

    return hostelBreakdown ? `${base} [${hostelBreakdown}]` : `${base} [No Hostel]`;
  };

  const getExportData = (filter) => {
    let data = Array.isArray(teams) ? teams : [];

    // NOTE: For "attendance" we export ALL teams (with Present/Absent in the column)
    // so that it acts as a full attendance register sheet.
    if (filter === "shortlisted") {
      data = data.filter((t) => t.shortlisted);
    } else if (filter === "winners") {
      data = data.filter((t) => t.winner);
    }

    return data;
  };

  const buildRows = (data) => {
    return data.map((t) => [
      t.teamName,
      t.registrationId,
      t.leader?.name,
      t.leader?.usn,
      t.leader?.semester,
      t.leader?.phone,
      t.leader?.email,
      t.leader?.branch,
      t.members?.map((m) => `${m.name} (${m.usn})`).join("; ") || "",
      getStaySummary(t),
      t.leader?.stayType,
      t.leader?.hostelName || "N/A",
      t.attendanceMarked ? "Yes" : "No",
      t.shortlisted ? "Yes" : "No",
      t.winner ? "Yes" : "No",
      t.firstRunnerUp ? "Yes" : "No",
      t.secondRunnerUp ? "Yes" : "No",
    ]);
  };

  const headers = [
    "Team Name",
    "Registration ID",
    "Leader Name",
    "USN/CSN",
    "Semester",
    "Phone",
    "Email",
    "Branch",
    "Members",
    "Team Stay Summary (Local,Hostel(Total) [Hostel:Count])",
    "Stay Type",
    "Hostel",
    "Attendance",
    "Shortlisted",
    "Winner",
    "1st Runner-up",
    "2nd Runner-up",
  ];

  // ─── ATTENDANCE-SPECIFIC: build two sub-rows per team ───────────────────────
  // Columns: Team-ID | Team Name | Team Members | USN/CSN | Semester | Branch | Gmail | Phone Number | Stay | Attendance
  const buildAttendanceSubRows = (data) => {
    const rows = [];
    (data || []).forEach((t) => {
      const mate = t.members?.[0];
      const attendanceVal = t.attendanceMarked ? "Present" : "Absent";

      const leaderStay = t.leader?.stayType === "Hostel"
        ? `Hostel (${t.leader?.hostelName || "N/A"})`
        : (t.leader?.stayType || "Local");
      const mateStay = mate
        ? (mate.stayType === "Hostel" ? `Hostel (${mate.hostelName || "N/A"})` : (mate.stayType || "Local"))
        : "";

      // Row 1: Leader
      rows.push([
        t.registrationId || "-",     // Team-ID
        t.teamName || "-",           // Team Name
        t.leader?.name || "-",       // Team Members (Lead Name)
        t.leader?.usn || t.leader?.csn || "-",  // USN/CSN
        t.leader?.semester || "-",   // Semester
        t.leader?.branch || "-",     // Branch
        t.leader?.email || "-",      // Gmail
        t.leader?.phone || "-",      // Phone Number
        leaderStay,                  // Stay
        attendanceVal,               // Attendance
      ]);

      // Row 2: Teammate (same Team-ID & Team Name repeated, Attendance repeated)
      rows.push([
        t.registrationId || "-",
        t.teamName || "-",
        mate ? (mate.name || "-") : "(No Teammate)",
        mate ? (mate.usn || mate.csn || "-") : "-",
        mate ? (mate.semester || "-") : "-",
        mate ? (mate.branch || "-") : "-",
        mate ? (mate.email || "-") : "-",
        mate ? (mate.phone || "-") : "-",
        mateStay || "-",
        attendanceVal,
      ]);
    });
    return rows;
  };

  const attendanceCSVHeaders = [
    "Team-ID",
    "Team Name",
    "Team Members",
    "USN/CSN",
    "Semester",
    "Branch",
    "Gmail",
    "Phone Number",
    "Stay",
    "Attendance",
  ];
  // ────────────────────────────────────────────────────────────────────────────

  const exportCSV = (filter) => {
    let csvHeaders;
    let rows;

    if (filter === "attendance") {
      const data = getExportData(filter);
      csvHeaders = attendanceCSVHeaders;
      rows = buildAttendanceSubRows(data);
    } else {
      const data = getExportData(filter);
      csvHeaders = headers;
      rows = buildRows(data);
    }

    const csv = [
      csvHeaders,
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `technophilia-${filter}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPDF = async (filter) => {
    if (typeof window === "undefined") return;

    let data = getExportData(filter);
    let printRoutes = [];
    let printHeaders = [];

    if (filter === "attendance") {
      printHeaders = attendanceCSVHeaders;
      printRoutes = buildAttendanceSubRows(data);
    } else if (filter === "all_basic") {
      printHeaders = ["Team Name", "Registration ID", "Leader Email"];
      printRoutes = (data || []).map((t) => [
        t.teamName || "-",
        t.registrationId || "-",
        t.leader?.email || "-",
      ]);
    } else {
      printHeaders = headers;
      printRoutes = buildRows(data);
    }

    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf/dist/jspdf.umd.min.js"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(13);
    doc.text(
      `Technophilia 3.0 - ${filter.toUpperCase()} Export (${new Date().toLocaleDateString()})`,
      40,
      40
    );

    if (filter === "attendance") {
      // Draw table with sub-row grouping: shade every even pair of rows differently
      autoTable(doc, {
        startY: 55,
        head: [printHeaders],
        body: printRoutes,
        styles: {
          fontSize: 8,
          cellPadding: 5,
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [20, 20, 20],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5,
        },
        // Shade team pairs (row 0-1 white, row 2-3 light gray, ...)
        didParseCell: function (hookData) {
          const teamIndex = Math.floor(hookData.row.index / 2);
          if (teamIndex % 2 === 0) {
            hookData.cell.styles.fillColor = [255, 255, 255];
          } else {
            hookData.cell.styles.fillColor = [240, 244, 250];
          }
          // Sub-row label: italicize second row of each team pair
          if (hookData.row.index % 2 === 1 && hookData.column.index === 2) {
            hookData.cell.styles.fontStyle = "italic";
            hookData.cell.styles.textColor = [100, 100, 160];
          }
        },
        columnStyles: {
          0: { cellWidth: 65 },  // Team-ID
          1: { cellWidth: 75 },  // Team Name
          2: { cellWidth: 80 },  // Team Members
          3: { cellWidth: 65 },  // USN/CSN
          4: { cellWidth: 48 },  // Semester
          5: { cellWidth: 60 },  // Branch
          6: { cellWidth: 110 }, // Gmail
          7: { cellWidth: 65 },  // Phone
          8: { cellWidth: 70 },  // Stay
          9: { cellWidth: 55 },  // Attendance
        },
        margin: { left: 14, right: 14 },
      });
    } else {
      autoTable(doc, {
        startY: 55,
        head: [printHeaders],
        body: printRoutes,
        styles: {
          fontSize: 7,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [30, 30, 30],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 18, right: 18 },
      });
    }

    doc.save(`technophilia-${filter}-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="admin-section">
      <h2>Export Data</h2>
      <div className="export-buttons">
        <div className="export-group">
          <h4>All Teams (Comprehensive)</h4>
          <div>
            <button onClick={() => exportCSV("all")} className="btn-export">CSV</button>
            <button onClick={() => void exportPDF("all")} className="btn-export">PDF</button>
          </div>
        </div>
        <div className="export-group">
          <h4>All Teams (Basic Info)</h4>
          <div>
            <button onClick={() => void exportPDF("all_basic")} className="btn-export">PDF (Basic)</button>
          </div>
        </div>
        <div className="export-group">
          <h4>Attendance</h4>
          <div>
            <button onClick={() => exportCSV("attendance")} className="btn-export">CSV</button>
            <button onClick={() => void exportPDF("attendance")} className="btn-export">PDF</button>
          </div>
        </div>
        <div className="export-group">
          <h4>Shortlisted</h4>
          <div>
            <button onClick={() => exportCSV("shortlisted")} className="btn-export">CSV</button>
            <button onClick={() => void exportPDF("shortlisted")} className="btn-export">PDF</button>
          </div>
        </div>
        <div className="export-group">
          <h4>Winners</h4>
          <div>
            <button onClick={() => exportCSV("winners")} className="btn-export">CSV</button>
            <button onClick={() => void exportPDF("winners")} className="btn-export">PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
