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

  const source = res.headers.get("x-admin-data-source") || "database";
  return { teams, source };
};

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState("teams");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (!storedToken) {
      router.push("/admin/login");
      return;
    }
    setToken(storedToken);
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
  const dataSource = data?.source || "database";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
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
          <p>April 3-4, 2026</p>
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
            {dataSource === "mock" && (
              <span className="admin-banner admin-banner-warning">
                Running in test mode (seeded teams) because database is unavailable.
              </span>
            )}
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
        <input
          type="text"
          placeholder="Search by team name, ID, or leader..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
          <div key={team._id} className="teams-row">
            <div className="team-cell">
              <span className="cell-label">Team ID</span>
              <span className="cell-value team-id">{team.registrationId || "-"}</span>
            </div>
            <div className="team-cell">
              <span className="cell-label">Team Name</span>
              <span className="cell-value">{team.teamName || "-"}</span>
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
                {team.firstRunnerUp && <span className="badge winner">🥈 1st Runner-up</span>}
                {team.secondRunnerUp && <span className="badge winner">🥉 2nd Runner-up</span>}
                {!team.attendanceMarked && !team.shortlisted && !team.winner && !team.firstRunnerUp && !team.secondRunnerUp && (
                  <span className="badge pending">⏳ Pending</span>
                )}
              </span>
            </div>
            <div className="team-cell">
              <span className="cell-label">Action</span>
              <DeleteTeamBtn team={team} token={token} onDelete={onUpdate} />
            </div>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="teams-empty">No teams found for your current filter.</div>
        )}
      </div>
    </div>
  );
}

function DeleteTeamBtn({ team, token, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete ${team.teamName}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/teams/${team._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onDelete();
    } catch {
      alert("Failed to delete");
    }
    setDeleting(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="btn-delete"
    >
      {deleting ? "..." : "🗑"}
    </button>
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

    const match = input.match(/TECH2026-[A-Z0-9]+/i);
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
      }, 1200);
    }
  }, [extractRegistrationId, onUpdate, token]);

  useEffect(() => {
    if (mode !== "qr") return undefined;

    let mounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!mounted) return;

        const scanner = new Html5Qrcode("admin-attendance-qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (isProcessingRef.current) return;
            submitAttendance(decodedText);
          },
          () => {}
        );

        if (mounted) {
          setScannerState("Camera active. Show QR code to scan.");
        }
      } catch {
        if (mounted) {
          setScannerState("Unable to access camera. Check permissions and HTTPS/localhost.");
        }
      }
    };

    setScannerState("Initializing camera...");
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
          <p className="attendance-help">{scannerState}</p>
        </div>
      )}

      {mode === "manual" && (
        <form className="attendance-manual-form" onSubmit={handleManualSubmit}>
          <input
            type="text"
            placeholder="Enter Team Registration ID (e.g. TECH2026-AB12)"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            required
          />
          <button type="submit" className="btn-export">
            Mark Attendance
          </button>
        </form>
      )}

      <div className={`attendance-toast ${scanResult.state}`}>
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
    let data = teams || [];

    if (filter === "attendance") {
      data = data.filter((t) => t.attendanceMarked);
    } else if (filter === "shortlisted") {
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

  const exportCSV = (filter) => {
    const data = getExportData(filter);
    const rows = buildRows(data);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `technophilia-${filter}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const exportPDF = async (filter) => {
    if (typeof window === "undefined") return;

    const data = getExportData(filter);
    const rows = buildRows(data);

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

    autoTable(doc, {
      startY: 55,
      head: [headers],
      body: rows,
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

    doc.save(`technophilia-${filter}-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="admin-section">
      <h2>Export Data</h2>
      <div className="export-buttons">
        <div className="export-group">
          <h4>All Teams</h4>
          <div>
            <button onClick={() => exportCSV("all")} className="btn-export">CSV</button>
            <button onClick={() => void exportPDF("all")} className="btn-export">PDF</button>
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
