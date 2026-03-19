"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import useSWR from "swr";
import gsap from "gsap";
import "./Dashboard.css";
import Transition from "../../../components/Transition/Transition";

const fetcher = (url) => fetch(url).then((res) => res.json());

const Toggle = ({ active, color, onChange }) => {
  const knobRef = useRef(null);

  useEffect(() => {
    if (active) {
      gsap.to(knobRef.current, { x: 20, duration: 0.3, ease: "back.out(1.7)" });
    } else {
      gsap.to(knobRef.current, { x: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [active]);

  return (
    <div className="toggle-wrapper" onClick={onChange}>
      <div className={`toggle-bg ${active ? (color === "gold" ? "active-gold" : "active") : ""}`}>
        <div className="toggle-knob" ref={knobRef}></div>
      </div>
    </div>
  );
};

const DashboardClient = () => {
  const { data: session, status } = useSession();
  const { data: teams, mutate } = useSWR(session ? "/api/admin/teams" : null, fetcher, { refreshInterval: 5000 });

  const [search, setSearch] = useState("");
  const [filterExpShortlisted, setFilterExpShortlisted] = useState("All");
  const [filterExpWinner, setFilterExpWinner] = useState("All");
  const [filterExpAttendance, setFilterExpAttendance] = useState("All");

  if (status === "loading") return <div className="admin-dashboard"><h2>Loading SECURE SYSTEM...</h2></div>;
  if (!session) {
    return (
      <div className="admin-dashboard">
        <h2>Unrecognized Credentials</h2>
        <button className="btn-action" onClick={() => signIn()}>Access Terminal</button>
      </div>
    );
  }

  const handleToggle = async (teamId, field, currentValue) => {
    // Optimistic UI update
    const updatedValue = !currentValue;
    mutate(teams.map(t => t._id === teamId ? { ...t, [field]: updatedValue } : t), false);

    await fetch("/api/admin/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, field, value: updatedValue })
    });
    
    // Re-verify
    mutate();
  };

  const exportCSV = () => {
    if (!teams) return;

    const filtered = teams.filter(team => {
      let pass = true;
      if (filterExpShortlisted !== "All") pass = pass && team.shortlisted === (filterExpShortlisted === "Yes");
      if (filterExpWinner !== "All") pass = pass && team.winner === (filterExpWinner === "Yes");
      if (filterExpAttendance !== "All") pass = pass && team.attendanceMarked === (filterExpAttendance === "Yes");
      return pass;
    });

    const headers = ["Team Name", "Registration ID", "Leader Name", "USN/CSN", "Phone", "Email", "Branch", "Members", "Stay Type", "Hostel", "Attendance", "Shortlisted", "Winner"];
    const rows = filtered.map(t => [
      t.teamName, t.registrationId, t.leader.name, t.leader.usn, t.leader.phone, t.leader.email, t.leader.branch,
      t.members.map(m=>m.name).join(' & '), t.leader.stayType, t.leader.hostelName || 'N/A', 
      t.attendanceMarked, t.shortlisted, t.winner
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `technophilia_export_${new Date().getTime()}.csv`;
    link.click();
  };

  const filteredTeams = teams?.filter(team => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return team.teamName.toLowerCase().includes(lowerSearch) || 
           team.leader.usn.toLowerCase().includes(lowerSearch) ||
           team.registrationId.toLowerCase().includes(lowerSearch);
  }) || [];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Command Center</h1>
        <div style={{display: 'flex', gap: '10px'}}>
          <a href="/admin/scanner" className="btn-action" style={{background: '#333', color: '#fff', textDecoration: 'none'}}>Open Scanner</a>
        </div>
      </div>

      <div className="control-panel">
        <input 
          type="text" 
          placeholder="Search Team, USN, or ID..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ flexGrow: 1 }}
        />
        <select value={filterExpAttendance} onChange={(e) => setFilterExpAttendance(e.target.value)}>
          <option value="All">All Attendance</option>
          <option value="Yes">Present</option>
          <option value="No">Absent</option>
        </select>
        <select value={filterExpShortlisted} onChange={(e) => setFilterExpShortlisted(e.target.value)}>
          <option value="All">All Shortlisted</option>
          <option value="Yes">Shortlisted Only</option>
        </select>
        <select value={filterExpWinner} onChange={(e) => setFilterExpWinner(e.target.value)}>
          <option value="All">All Winners</option>
          <option value="Yes">Winners Only</option>
        </select>
        <button className="btn-action" onClick={exportCSV}>Export CSV</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Team</th>
              <th>Leader & Contact</th>
              <th>Branch</th>
              <th>Attendance</th>
              <th>Shortlisted</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => (
              <tr key={team._id}>
                <td style={{fontWeight: 'bold', letterSpacing: '1px'}}>{team.registrationId}</td>
                <td style={{color: '#fff'}}>{team.teamName} <div style={{fontSize: '0.75rem', color: '#666'}}>Members: {team.members.map(m=>m.name).join(', ')}</div></td>
                <td>{team.leader.name} <br/><span style={{fontSize: '0.8rem', color: '#999'}}>{team.leader.usn} | {team.leader.phone}</span></td>
                <td>{team.leader.branch}</td>
                <td>
                  <span style={{ color: team.attendanceMarked ? 'lightgreen' : '#666', fontWeight: 'bold' }}>
                    {team.attendanceMarked ? "LOGGED IN" : "PENDING"}
                  </span>
                </td>
                <td>
                  <Toggle 
                    active={team.shortlisted} 
                    onChange={() => handleToggle(team._id, 'shortlisted', team.shortlisted)} 
                  />
                </td>
                <td>
                  <Toggle 
                    color="gold"
                    active={team.winner} 
                    onChange={() => handleToggle(team._id, 'winner', team.winner)} 
                  />
                </td>
              </tr>
            ))}
            {filteredTeams.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#666'}}>NO DATA FOUND</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transition(DashboardClient);
