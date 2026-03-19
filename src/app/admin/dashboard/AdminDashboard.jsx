"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import "./AdminDashboard.css";

const fetcher = (url, token) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) =>
    res.json()
  );

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

  const { data: teams, mutate: reloadTeams } = useSWR(
    token ? ["/api/admin/teams", token] : null,
    ([url, t]) => fetcher(url, t),
    { refreshInterval: 5000 }
  );

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  if (!token) return <div className="admin-loading">Loading...</div>;

  const filteredTeams = teams?.filter(
    (team) =>
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.registrationId.includes(searchQuery) ||
      team.leader.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
            Teams ({teams?.length || 0})
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
            <AttendanceSection token={token} />
          )}
          {activeTab === "shortlist" && (
            <ShortlistSection teams={teams} token={token} onUpdate={reloadTeams} />
          )}
          {activeTab === "winners" && (
            <WinnersSection teams={teams} token={token} onUpdate={reloadTeams} />
          )}
          {activeTab === "export" && (
            <ExportSection teams={teams} token={token} />
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
        {teams?.map((team) => (
          <div key={team._id} className="teams-row">
            <div className="team-id">{team.registrationId}</div>
            <div>{team.teamName}</div>
            <div>{team.leader.name}</div>
            <div>
              {team.members?.map((m) => m.name).join(", ")}
            </div>
            <div className="team-status">
              {team.attendanceMarked && <span className="badge present">✓ Present</span>}
              {team.shortlisted && <span className="badge shortlist">⭐ Shortlisted</span>}
              {team.winner && <span className="badge winner">🏆 Winner</span>}
              {!team.attendanceMarked && !team.shortlisted && !team.winner && (
                <span className="badge pending">⏳ Pending</span>
              )}
            </div>
            <div>
              <DeleteTeamBtn team={team} token={token} onDelete={onUpdate} />
            </div>
          </div>
        ))}
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
    } catch (err) {
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

function AttendanceSection({ token }) {
  return (
    <div className="admin-section">
      <h2>QR Attendance Tracking</h2>
      <p style={{ color: "#aaa", marginTop: "20px" }}>
        ✓ Navigate to /admin/scanner for QR scanning
      </p>
      <p style={{ color: "#aaa", marginTop: "10px" }}>
        ✓ Scan team QR codes to mark attendance
      </p>
    </div>
  );
}

function ShortlistSection({ teams, token, onUpdate }) {
  return (
    <div className="admin-section">
      <h2>Shortlist Management</h2>
      <div className="shortlist-grid">
        {teams?.map((team) => (
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
    } catch (err) {
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
        {teams?.map((team) => (
          <WinnerCard key={team._id} team={team} token={token} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}

function WinnerCard({ team, token, onUpdate }) {
  const [updating, setUpdating] = useState(false);

  const toggleWinner = async () => {
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
          field: "winner",
          value: !team.winner,
        }),
      });
      if (res.ok) onUpdate();
    } catch (err) {
      alert("Failed to update");
    }
    setUpdating(false);
  };

  return (
    <div className={`winner-card ${team.winner ? "active" : ""}`}>
      <h3>{team.teamName}</h3>
      <div className="winner-members">
        {team.members?.map((m) => (
          <small key={m.usn}>{m.name}</small>
        ))}
      </div>
      <button
        onClick={toggleWinner}
        disabled={updating}
        className={`btn-winner ${team.winner ? "active" : ""}`}
      >
        {team.winner ? "🏆 WINNER" : "Mark Winner"}
      </button>
    </div>
  );
}

function ExportSection({ teams, token }) {
  const exportCSV = (filter) => {
    let data = teams || [];

    if (filter === "attendance") {
      data = data.filter((t) => t.attendanceMarked);
    } else if (filter === "shortlisted") {
      data = data.filter((t) => t.shortlisted);
    } else if (filter === "winners") {
      data = data.filter((t) => t.winner);
    }

    const csv = [
      [
        "Team Name",
        "Registration ID",
        "Leader",
        "Members",
        "Email",
        "Phone",
        "Branch",
        "Stay Type",
        "Attendance",
        "Shortlisted",
        "Winner",
      ],
      ...data.map((t) => [
        t.teamName,
        t.registrationId,
        t.leader.name,
        t.members?.map((m) => m.name).join("; ") || "",
        t.leader.email,
        t.leader.phone,
        t.leader.branch,
        t.leader.stayType,
        t.attendanceMarked ? "Yes" : "No",
        t.shortlisted ? "Yes" : "No",
        t.winner ? "Yes" : "No",
      ]),
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

  return (
    <div className="admin-section">
      <h2>Export Data</h2>
      <div className="export-buttons">
        <button onClick={() => exportCSV("all")} className="btn-export">
          Export All Teams
        </button>
        <button onClick={() => exportCSV("attendance")} className="btn-export">
          Export Attendance
        </button>
        <button onClick={() => exportCSV("shortlisted")} className="btn-export">
          Export Shortlisted
        </button>
        <button onClick={() => exportCSV("winners")} className="btn-export">
          Export Winners
        </button>
      </div>
    </div>
  );
}
