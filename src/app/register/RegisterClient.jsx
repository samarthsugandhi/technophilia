"use client";

import React, { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import "./Register.css";

const SEMESTERS = ["1st Sem","2nd Sem","3rd Sem","4th Sem","5th Sem","6th Sem","7th Sem","8th Sem"];
const HOSTELS = ["Netaji Boys Hostel","Vishveshwarya Boys Hostel","Girls Hostel"];
const TOTAL_PAGES = 7; // 0=cover, 1=team, 2=leader1, 3=leader2, 4=mem2, 5=mem3, 6=review

/* ── Field component ── */
const F = ({ label, name, value, onChange, type="text", required, children }) => (
  <div className="bk-field">
    <label>{label}{required && <span className="bk-req">*</span>}</label>
    {children || <input type={type} name={name} value={value} onChange={onChange} autoComplete="off" />}
  </div>
);

const RegisterClient = () => {
  const [page, setPage] = useState(0);
  const [flipKey, setFlipKey] = useState(0);
  const [flipDir, setFlipDir] = useState("right");
  const [formData, setFormData] = useState({
    teamName: "",
    leader: { name: "", usn: "", semester: "", email: "", phone: "", branch: "", stayType: "Local", hostel: "" },
    member2: { name: "", semester: "", usn: "", email: "", branch: "", stayType: "Local", hostel: "" },
    member3: { name: "", semester: "", usn: "", email: "", branch: "", stayType: "Local", hostel: "" },
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [regId, setRegId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    try { audioRef.current = new Audio("/page-flip-01a.mp3"); } catch { audioRef.current = null; }
  }, []);

  const playFlip = () => {
    try { if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); } } catch { audioRef.current = null; }
  };

  const validatePage = (currentPage) => {
    if (currentPage === 1) {
      if (!formData.teamName.trim()) return "Team name is required";
    }

    if (currentPage === 2) {
      if (!formData.leader.name.trim()) return "Leader name is required";
      if (!formData.leader.semester) return "Leader semester is required";
      if (!formData.leader.usn.trim()) return "Leader USN/CSN is required";
    }

    if (currentPage === 3) {
      if (!formData.leader.email.trim()) return "Leader email is required";
      if (!formData.leader.phone.trim()) return "Leader phone is required";
      if (!formData.leader.branch.trim()) return "Leader branch is required";
      if (formData.leader.stayType === "Hostel" && !formData.leader.hostel) return "Please select hostel";
    }

    if (currentPage === 4) {
      if (!formData.member2.name.trim()) return "Member 2 name is required";
      if (!formData.member2.semester) return "Member 2 semester is required";
      if (!formData.member2.usn.trim()) return "Member 2 USN/CSN is required";
      if (!formData.member2.email.trim()) return "Member 2 email is required";
      if (!formData.member2.branch.trim()) return "Member 2 branch is required";
      if (formData.member2.stayType === "Hostel" && !formData.member2.hostel) return "Please select Member 2 hostel";
    }

    if (currentPage === 5) {
      if (!formData.member3.name.trim()) return "Member 3 name is required";
      if (!formData.member3.semester) return "Member 3 semester is required";
      if (!formData.member3.usn.trim()) return "Member 3 USN/CSN is required";
      if (!formData.member3.email.trim()) return "Member 3 email is required";
      if (!formData.member3.branch.trim()) return "Member 3 branch is required";
      if (formData.member3.stayType === "Hostel" && !formData.member3.hostel) return "Please select Member 3 hostel";
    }

    return "";
  };

  const goTo = (next) => {
    if (next === page || next < 0 || next > TOTAL_PAGES - 1) return;

    if (next > page) {
      const validationMessage = validatePage(page);
      if (validationMessage) {
        alert(validationMessage);
        return;
      }
    }

    playFlip();
    setFlipDir(next > page ? "right" : "left");
    setPage(next);
    setFlipKey(k => k + 1);
    setError("");
  };

  const uL = (e) => setFormData(p => ({ ...p, leader: { ...p.leader, [e.target.name]: e.target.value } }));
  const u2 = (e) => setFormData(p => ({ ...p, member2: { ...p.member2, [e.target.name]: e.target.value } }));
  const u3 = (e) => setFormData(p => ({ ...p, member3: { ...p.member3, [e.target.name]: e.target.value } }));

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const leaderPayload = {
        ...formData.leader,
        hostelName: formData.leader.stayType === "Hostel" ? formData.leader.hostel : "",
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: formData.teamName,
          leader: leaderPayload,
          members: [
            {
              ...formData.member2,
              hostelName: formData.member2.stayType === "Hostel" ? formData.member2.hostel : "",
            },
            {
              ...formData.member3,
              hostelName: formData.member3.stayType === "Hostel" ? formData.member3.hostel : "",
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const validationIssue = Array.isArray(data?.details) ? data.details[0]?.message : "";
        throw new Error(validationIssue || data?.error || "Registration failed");
      }
      setRegId(data.registrationId);
      setQrCode(data.registrationId);
      setSuccess(true);
    } catch (err) {
      if (/USN|CSN/i.test(err.message)) {
        alert("Duplicate USN/CSN detected. Please change it and try again.");
      }
      if (/email/i.test(err.message) && /duplicate|already registered/i.test(err.message)) {
        alert("Duplicate email detected. Please use a different email and try again.");
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success ── */
  if (success) {
    return (
      <div className="bk-root">
        <div className="bk-orb bk-orb1" /><div className="bk-orb bk-orb2" />
        <Link href="/" className="bk-homelink">← Home</Link>
        <div className="bk-success">
          <div className="bk-stamp">REGISTERED ✓</div>
          <p className="bk-regid">{regId}</p>
          <div className="bk-qr"><QRCodeSVG value={qrCode} size={180} /></div>
          <p className="bk-note">Confirmation email will be sent after registration closes.</p>
          <Link href="/" className="bk-homebtn">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const progress = Math.round((page / (TOTAL_PAGES - 1)) * 100);

  return (
    <div className="bk-root">
      <div className="bk-orb bk-orb1" /><div className="bk-orb bk-orb2" />
      <Link href="/" className="bk-homelink">← Home</Link>

      <div className="bk-scene">
        <div className="bk-book">
          <div className="bk-spine-strip"><span>TECHNOPHILIA 3.0</span></div>

          <div
            key={flipKey}
            className={`bk-page ${page === 0 ? "bk-is-cover" : "bk-is-paper"} bk-anim-${flipDir}`}
          >
            {/* Progress bar */}
            {page > 0 && (
              <div className="bk-progress"><div className="bk-progress-fill" style={{ width: `${progress}%` }} /></div>
            )}
            {page > 0 && <span className="bk-pg-lbl">{page} / {TOTAL_PAGES - 1}</span>}

            {/* ── COVER ── */}
            {page === 0 && (
              <div className="bk-cover-inner">
                <div className="bk-cover-frame">
                  <p className="bk-cover-tiny">TECHNOPHILIA</p>
                  <h1 className="bk-cover-h1">3.0</h1>
                  <div className="bk-cover-rule" />
                  <h2 className="bk-cover-h2">Registration</h2>
                  <p className="bk-cover-hint">Click › to open the book</p>
                </div>
              </div>
            )}

            {/* ── TEAM ── */}
            {page === 1 && (
              <div className="bk-fields-wrap">
                <h3 className="bk-head">Team Details</h3>
                <div className="bk-fields">
                  <F label="Team Name" name="teamName" value={formData.teamName} required
                    onChange={e => setFormData(p => ({...p, teamName: e.target.value}))} />
                  <div className="bk-field">
                    <label>Competition Format</label>
                    <p style={{ margin: 0, color: "#666", lineHeight: 1.6 }}>
                      Single registration for TECHNOPHILIA 3.0. All teams compete across 7 technical themes.
                      Shortlisted teams play 5 rounds, then finalists compete in the last 2 rounds for winner announcement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── LEADER PART 1 ── */}
            {page === 2 && (
              <div className="bk-fields-wrap">
                <h3 className="bk-head">Team Leader</h3>
                <div className="bk-fields">
                  <F label="Full Name" name="name" value={formData.leader.name} onChange={uL} required />
                  <div className="bk-field">
                    <label>Semester<span className="bk-req">*</span></label>
                    <select name="semester" value={formData.leader.semester} onChange={uL}>
                      <option value="">— Select Semester —</option>
                      {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <F label="CSN / USN" name="usn" value={formData.leader.usn} onChange={uL} required />
                </div>
              </div>
            )}

            {/* ── LEADER PART 2 ── */}
            {page === 3 && (
              <div className="bk-fields-wrap">
                <h3 className="bk-head">Leader — Continued</h3>
                <div className="bk-fields">
                  <F label="Email" name="email" type="email" value={formData.leader.email} onChange={uL} required />
                  <F label="Phone" name="phone" value={formData.leader.phone} onChange={uL} required />
                  <F label="Branch" name="branch" value={formData.leader.branch} onChange={uL} required />
                  <div className="bk-field">
                    <label>Stay Type</label>
                    <div className="bk-radio-group">
                      {["Local","Hostel"].map(t => (
                        <label key={t} className="bk-radio-label">
                          <input type="radio" name="stayType" value={t} checked={formData.leader.stayType === t} onChange={uL} />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.leader.stayType === "Hostel" && (
                    <div className="bk-field">
                      <label>Hostel</label>
                      <select name="hostel" value={formData.leader.hostel} onChange={uL}>
                        <option value="">— Select Hostel —</option>
                        {HOSTELS.map(h => <option key={h}>{h}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── MEMBER 2 ── */}
            {page === 4 && (
              <div className="bk-fields-wrap">
                <h3 className="bk-head">Member 2</h3>
                <div className="bk-fields">
                  <F label="Full Name" name="name" value={formData.member2.name} onChange={u2} required />
                  <div className="bk-field">
                    <label>Semester<span className="bk-req">*</span></label>
                    <select name="semester" value={formData.member2.semester} onChange={u2}>
                      <option value="">— Select Semester —</option>
                      {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <F label="CSN / USN" name="usn" value={formData.member2.usn} onChange={u2} required />
                  <F label="Email" name="email" type="email" value={formData.member2.email} onChange={u2} required />
                  <F label="Branch" name="branch" value={formData.member2.branch} onChange={u2} required />
                  <div className="bk-field">
                    <label>Stay Type</label>
                    <div className="bk-radio-group">
                      {["Local","Hostel"].map(t => (
                        <label key={t} className="bk-radio-label">
                          <input type="radio" name="stayType" value={t} checked={formData.member2.stayType === t} onChange={u2} />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.member2.stayType === "Hostel" && (
                    <div className="bk-field">
                      <label>Hostel</label>
                      <select name="hostel" value={formData.member2.hostel} onChange={u2}>
                        <option value="">— Select Hostel —</option>
                        {HOSTELS.map(h => <option key={h}>{h}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── MEMBER 3 ── */}
            {page === 5 && (
              <div className="bk-fields-wrap">
                <h3 className="bk-head">Member 3</h3>
                <div className="bk-fields">
                  <F label="Full Name" name="name" value={formData.member3.name} onChange={u3} required />
                  <div className="bk-field">
                    <label>Semester<span className="bk-req">*</span></label>
                    <select name="semester" value={formData.member3.semester} onChange={u3}>
                      <option value="">— Select Semester —</option>
                      {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <F label="CSN / USN" name="usn" value={formData.member3.usn} onChange={u3} required />
                  <F label="Email" name="email" type="email" value={formData.member3.email} onChange={u3} required />
                  <F label="Branch" name="branch" value={formData.member3.branch} onChange={u3} required />
                  <div className="bk-field">
                    <label>Stay Type</label>
                    <div className="bk-radio-group">
                      {["Local","Hostel"].map(t => (
                        <label key={t} className="bk-radio-label">
                          <input type="radio" name="stayType" value={t} checked={formData.member3.stayType === t} onChange={u3} />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.member3.stayType === "Hostel" && (
                    <div className="bk-field">
                      <label>Hostel</label>
                      <select name="hostel" value={formData.member3.hostel} onChange={u3}>
                        <option value="">— Select Hostel —</option>
                        {HOSTELS.map(h => <option key={h}>{h}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── REVIEW ── */}
            {page === 6 && (
              <div className="bk-fields-wrap">
                <h3 className="bk-head">Review & Submit</h3>
                <div className="bk-review">
                  {[
                    ["Team", formData.teamName],
                    ["Competition", "TECHNOPHILIA 3.0 (All 7 Technical Themes)"],
                    ["Leader", `${formData.leader.name}`],
                    ["USN/CSN", formData.leader.usn],
                    ["Email", formData.leader.email],
                    ["Member 2", `${formData.member2.name} · ${formData.member2.usn} · ${formData.member2.semester}`],
                    ["Member 3", `${formData.member3.name} · ${formData.member3.usn} · ${formData.member3.semester}`],
                    ["Stay", formData.leader.stayType === "Hostel" ? formData.leader.hostel : "Local"],
                  ].map(([k, v]) => (
                    <div className="bk-review-row" key={k}>
                      <span>{k}</span><strong>{v || "—"}</strong>
                    </div>
                  ))}
                </div>
                {error && <p className="bk-error">{error}</p>}
                <button className="bk-submit" onClick={submit} disabled={loading}>
                  {loading ? <span className="bk-spinner" /> : "✓ Register Team"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="bk-nav">
          <button type="button" className="bk-arrow" disabled={page === 0} onClick={() => goTo(page - 1)}>‹</button>
          <span className="bk-counter">{page === 0 ? "Cover" : `Page ${page} of ${TOTAL_PAGES - 1}`}</span>
          {page < TOTAL_PAGES - 1
            ? <button type="button" className="bk-arrow" onClick={() => goTo(page + 1)}>›</button>
            : <div style={{ width: 44 }} />}
        </div>
      </div>
    </div>
  );
};

export default RegisterClient;
