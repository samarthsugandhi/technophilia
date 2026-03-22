"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import Link from "next/link";
import "./Register.css";

const SEMESTERS = ["1st Sem","2nd Sem","3rd Sem","4th Sem","5th Sem","6th Sem","7th Sem","8th Sem"];
const HOSTELS = ["Netaji Boys Hostel","Vishveshwarya Boys Hostel","Girls Hostel"];
const BRANCH_OPTIONS = [
  "Computer Science and Engineering",
  "Information Science and Engineering",
  "Artificial Intelligence and Machine Learning",
  "Artificial Intelligence and Data Science",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Aerospace Engineering",
  "Industrial and Production Engineering",
  "Others",
];
const TOTAL_PAGES = 6; // 0=cover, 1=team, 2=leader1, 3=leader2, 4=mem2, 5=review

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
    leader: { name: "", usn: "", semester: "", email: "", phone: "", branch: "", otherBranch: "", stayType: "Local", hostel: "" },
    teammate: { name: "", semester: "", usn: "", email: "", branch: "", otherBranch: "", stayType: "Local", hostel: "" },
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [regId, setRegId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const audioRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const successNoticeShownRef = useRef(false);

  useEffect(() => {
    try { audioRef.current = new Audio("/page-flip-01a.mp3"); } catch { audioRef.current = null; }
  }, []);

  const playFlip = () => {
    try { if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); } } catch { audioRef.current = null; }
  };

  const isSemOneOrTwo = (semester) => ["1st Sem", "2nd Sem"].includes(semester);
  const usnPattern = /^2BA\d{2}[A-Z]{2}\d{3}$/i;
  const csnPattern = /^\d{10}$/;
  const isValidUsnForSemester = (usn, semester) => {
    const value = String(usn || "").trim().toUpperCase();
    if (!value || !semester) return false;
    if (isSemOneOrTwo(semester)) return csnPattern.test(value);
    return usnPattern.test(value);
  };

  const resolveBranch = (person) => {
    const selected = String(person?.branch || "").trim();
    if (selected !== "Others") return selected;
    return String(person?.otherBranch || "").trim();
  };

  const isValidEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(String(email || "").trim());

  const duplicateValueFromList = (values) => {
    const normalized = values
      .map((v) => String(v || "").trim().toUpperCase())
      .filter(Boolean);

    const seen = new Set();
    for (const value of normalized) {
      if (seen.has(value)) return value;
      seen.add(value);
    }
    return "";
  };

  const getIdentifiersUptoPage = (currentPage) => {
    const usns = [];
    const emails = [];

    if (currentPage >= 2) {
      usns.push(formData.leader.usn);
    }
    if (currentPage >= 3) {
      emails.push(formData.leader.email);
    }
    if (currentPage >= 4) {
      usns.push(formData.teammate.usn);
      emails.push(formData.teammate.email);
    }

    return {
      usns: usns.map((u) => String(u || "").trim()).filter(Boolean),
      emails: emails.map((e) => String(e || "").trim()).filter(Boolean),
    };
  };

  const checkServerDuplicates = async ({ usns, emails }) => {
    if (!usns.length && !emails.length) {
      return { hasDuplicate: false };
    }

    const res = await fetch("/api/register/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usns, emails }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) return { hasDuplicate: false };

    const duplicateUsn = payload?.duplicateUsn || "";
    const duplicateEmail = payload?.duplicateEmail || "";
    return {
      hasDuplicate: Boolean(duplicateUsn || duplicateEmail),
      duplicateUsn,
      duplicateEmail,
    };
  };

  const formatStay = (person) => {
    if (!person) return "-";
    if (person.stayType === "Hostel") {
      return `Hostel${person.hostel ? ` (${person.hostel})` : ""}`;
    }
    return "Local";
  };

  const getTeamStaySummary = () => {
    const participants = [formData.leader, formData.teammate].filter(Boolean);
    const total = participants.length;

    const localCount = participants.filter((p) => p.stayType !== "Hostel").length;
    const hostelMembers = participants.filter((p) => p.stayType === "Hostel");
    const hostelCount = hostelMembers.length;

    const hostelMap = hostelMembers.reduce((acc, person) => {
      const hostelName = String(person.hostel || "Unspecified Hostel").trim();
      acc[hostelName] = (acc[hostelName] || 0) + 1;
      return acc;
    }, {});

    const hostelBreakdown = Object.entries(hostelMap)
      .map(([name, count]) => `${name}:${count}`)
      .join("; ");

    return hostelBreakdown
      ? `${localCount},${hostelCount}(${total}) [${hostelBreakdown}]`
      : `${localCount},${hostelCount}(${total}) [No Hostel]`;
  };

  const buildAndDownloadEventPass = useCallback(() => {
    const qrCanvas = qrCanvasRef.current;
    if (!qrCanvas || !regId) return;

    const card = document.createElement("canvas");
    card.width = 1200;
    card.height = 700;
    const ctx = card.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, card.width, card.height);

    ctx.fillStyle = "#f5d7a8";
    ctx.font = "bold 56px Georgia";
    ctx.fillText("TECHNOPHILIA 3.0", 60, 120);

    ctx.fillStyle = "#d4d4d4";
    ctx.font = "28px Georgia";
    ctx.fillText("EVENT PASS", 60, 175);

    ctx.fillStyle = "#b4b4b4";
    ctx.font = "24px Georgia";
    ctx.fillText(`Team: ${formData.teamName}`, 60, 250);
    ctx.fillText(`Registration ID: ${regId}`, 60, 300);
    ctx.fillText("Carry this pass (QR / Registration ID) at event entry.", 60, 360);

    ctx.drawImage(qrCanvas, 840, 160, 280, 280);

    ctx.fillStyle = "#9f9f9f";
    ctx.font = "20px Georgia";
    ctx.fillText("April 1-2, 2026", 60, 620);

    card.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${regId}-event-pass.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }, [formData.teamName, regId]);

  const validatePage = (currentPage) => {
    if (currentPage === 1) {
      if (!formData.teamName.trim()) return "Team name is required";
    }

    if (currentPage === 2) {
      if (!formData.leader.name.trim()) return "Leader name is required";
      if (!formData.leader.semester) return "Leader semester is required";
      if (!formData.leader.usn.trim()) return "Leader USN/CSN is required";
      if (!isValidUsnForSemester(formData.leader.usn, formData.leader.semester)) {
        return isSemOneOrTwo(formData.leader.semester)
          ? "Leader CSN must be a valid 10-digit number (example: 2025010590)"
          : "Leader USN format must be like 2BA23IS080";
      }
    }

    if (currentPage === 3) {
      if (!formData.leader.email.trim()) return "Leader email is required";
      if (!isValidEmail(formData.leader.email)) return "Leader email format is invalid";
      if (!formData.leader.phone.trim()) return "Leader phone is required";
      if (!/^\d{10}$/.test(formData.leader.phone.trim())) return "Leader phone must be 10 digits";
      if (!formData.leader.branch.trim()) return "Leader branch is required";
      if (formData.leader.branch === "Others" && !formData.leader.otherBranch.trim()) {
        return "Please specify leader branch";
      }
      if (formData.leader.stayType === "Hostel" && !formData.leader.hostel) return "Please select hostel";
    }

    if (currentPage === 4) {
      if (!formData.teammate.name.trim()) return "Teammate name is required";
      if (!formData.teammate.semester) return "Teammate semester is required";
      if (!formData.teammate.usn.trim()) return "Teammate USN/CSN is required";
      if (!isValidUsnForSemester(formData.teammate.usn, formData.teammate.semester)) {
        return isSemOneOrTwo(formData.teammate.semester)
          ? "Teammate CSN must be a valid 10-digit number (example: 2025010590)"
          : "Teammate USN format must be like 2BA23IS080";
      }
      if (!formData.teammate.email.trim()) return "Teammate email is required";
      if (!isValidEmail(formData.teammate.email)) return "Teammate email format is invalid";
      if (!formData.teammate.branch.trim()) return "Teammate branch is required";
      if (formData.teammate.branch === "Others" && !formData.teammate.otherBranch.trim()) {
        return "Please specify Teammate branch";
      }
      if (formData.teammate.stayType === "Hostel" && !formData.teammate.hostel) return "Please select Teammate hostel";
    }

    return "";
  };

  const goTo = async (next) => {
    if (next === page || next < 0 || next > TOTAL_PAGES - 1) return;

    if (next > page) {
      const validationMessage = validatePage(page);
      if (validationMessage) {
        alert(validationMessage);
        return;
      }

      const ids = getIdentifiersUptoPage(page);
      const localDupUsn = duplicateValueFromList(ids.usns);
      const localDupEmail = duplicateValueFromList(ids.emails);

      if (localDupUsn) {
        alert(`Duplicate USN/CSN in this team: ${localDupUsn}`);
        return;
      }
      if (localDupEmail) {
        alert(`Duplicate email in this team: ${localDupEmail}`);
        return;
      }

      const serverDup = await checkServerDuplicates(ids);
      if (serverDup.hasDuplicate) {
        if (serverDup.duplicateUsn) {
          alert(`USN/CSN already registered: ${serverDup.duplicateUsn}`);
          return;
        }
        if (serverDup.duplicateEmail) {
          alert(`Email already registered: ${serverDup.duplicateEmail}`);
          return;
        }
      }
    }

    playFlip();
    setFlipDir(next > page ? "right" : "left");
    setPage(next);
    setFlipKey(k => k + 1);
    setError("");
  };

  const uL = (e) => setFormData(p => ({ ...p, leader: { ...p.leader, [e.target.name]: e.target.value } }));
  const u2 = (e) => setFormData(p => ({ ...p, teammate: { ...p.teammate, [e.target.name]: e.target.value } }));
  const submit = async () => {
    const preSubmitValidation = validatePage(4);
    if (preSubmitValidation) {
      alert(preSubmitValidation);
      return;
    }

    const ids = getIdentifiersUptoPage(4);
    const localDupUsn = duplicateValueFromList(ids.usns);
    const localDupEmail = duplicateValueFromList(ids.emails);
    if (localDupUsn) {
      alert(`Duplicate USN/CSN in this team: ${localDupUsn}`);
      return;
    }
    if (localDupEmail) {
      alert(`Duplicate email in this team: ${localDupEmail}`);
      return;
    }

    const serverDup = await checkServerDuplicates(ids);
    if (serverDup.hasDuplicate) {
      if (serverDup.duplicateUsn) {
        alert(`USN/CSN already registered: ${serverDup.duplicateUsn}`);
        return;
      }
      if (serverDup.duplicateEmail) {
        alert(`Email already registered: ${serverDup.duplicateEmail}`);
        return;
      }
    }

    setLoading(true); setError("");
    try {
      const leaderPayload = {
        ...formData.leader,
        branch: resolveBranch(formData.leader),
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
              ...formData.teammate,
              branch: resolveBranch(formData.teammate),
              hostelName: formData.teammate.stayType === "Hostel" ? formData.teammate.hostel : "",
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

  useEffect(() => {
    if (!success || !regId || successNoticeShownRef.current) return;
    successNoticeShownRef.current = true;

    setTimeout(() => {
      buildAndDownloadEventPass();
      alert(
        "You have registered successfully. Keep your Event Pass (QR code) / Registration ID with you while coming to the event. We will send a confirmation email to the team leader email provided, so keep it available to receive important messages."
      );
    }, 250);
  }, [buildAndDownloadEventPass, regId, success]);

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
          <QRCodeCanvas
            value={qrCode}
            size={320}
            includeMargin
            style={{ display: "none" }}
            ref={qrCanvasRef}
          />
          <p className="bk-note">Event pass downloaded. Keep this QR / Registration ID for event entry.</p>
          <button type="button" className="bk-homebtn bk-download" onClick={buildAndDownloadEventPass}>
            Download Event Pass Again
          </button>
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
                  <p className="bk-cover-tiny"><strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>RISE</strong>ANNUAL TECH FEST</p>
                  <h1 className="bk-cover-h1">TECHNOPHILIA</h1>
                  <div className="bk-cover-rule" />
                  <h2 className="bk-cover-h2">3.0 Registration</h2>
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
                  <div className="bk-field" style={{ height: "calc(var(--bk-line-gap) * 3)", justifyContent: "flex-start", paddingTop: "8px" }}>
                    <label>Competition Format</label>
                    <p style={{ margin: 0, color: "#4a2c16", lineHeight: "26px", fontSize: "0.95rem", fontWeight: "500" }}>
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
                  <div className="bk-field">
                    <label>Branch<span className="bk-req">*</span></label>
                    <select name="branch" value={formData.leader.branch} onChange={uL}>
                      <option value="">— Select Branch —</option>
                      {BRANCH_OPTIONS.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                    </select>
                  </div>
                  {formData.leader.branch === "Others" && (
                    <F label="Specify Branch" name="otherBranch" value={formData.leader.otherBranch} onChange={uL} required />
                  )}
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

            {/* ── TEAMMATE ── */}
            {page === 4 && (
              <div className="bk-fields-wrap">
                <h3 className="bk-head">Teammate</h3>
                <div className="bk-fields">
                  <F label="Full Name" name="name" value={formData.teammate.name} onChange={u2} required />
                  <div className="bk-field">
                    <label>Semester<span className="bk-req">*</span></label>
                    <select name="semester" value={formData.teammate.semester} onChange={u2}>
                      <option value="">— Select Semester —</option>
                      {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <F label="CSN / USN" name="usn" value={formData.teammate.usn} onChange={u2} required />
                  <F label="Email" name="email" type="email" value={formData.teammate.email} onChange={u2} required />
                  <div className="bk-field">
                    <label>Branch<span className="bk-req">*</span></label>
                    <select name="branch" value={formData.teammate.branch} onChange={u2}>
                      <option value="">— Select Branch —</option>
                      {BRANCH_OPTIONS.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                    </select>
                  </div>
                  {formData.teammate.branch === "Others" && (
                    <F label="Specify Branch" name="otherBranch" value={formData.teammate.otherBranch} onChange={u2} required />
                  )}
                  <div className="bk-field">
                    <label>Stay Type</label>
                    <div className="bk-radio-group">
                      {["Local","Hostel"].map(t => (
                        <label key={t} className="bk-radio-label">
                          <input type="radio" name="stayType" value={t} checked={formData.teammate.stayType === t} onChange={u2} />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.teammate.stayType === "Hostel" && (
                    <div className="bk-field">
                      <label>Hostel</label>
                      <select name="hostel" value={formData.teammate.hostel} onChange={u2}>
                        <option value="">— Select Hostel —</option>
                        {HOSTELS.map(h => <option key={h}>{h}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── REVIEW ── */}
            {page === 5 && (
              <div className="bk-fields-wrap">
                <h3 className="bk-head">Review & Submit</h3>
                <div className="bk-review">
                  {[
                    ["Team", formData.teamName],
                    ["Competition", "TECHNOPHILIA 3.0 (All 7 Technical Themes)"],
                    ["Leader", `${formData.leader.name}`],
                    ["USN/CSN", formData.leader.usn],
                    ["Email", formData.leader.email],
                    ["Leader Branch", resolveBranch(formData.leader)],
                    ["Leader Stay", formatStay(formData.leader)],
                    ["Teammate", `${formData.teammate.name} · ${formData.teammate.usn} · ${formData.teammate.semester}`],
                    ["Teammate Branch", resolveBranch(formData.teammate)],
                    ["Teammate Stay", formatStay(formData.teammate)],
                    ["Team Stay Summary", getTeamStaySummary()],
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
          <button type="button" className="bk-arrow" disabled={page === 0} onClick={() => { void goTo(page - 1); }}>‹</button>
          <span className="bk-counter">{page === 0 ? "Cover" : `Page ${page} of ${TOTAL_PAGES - 1}`}</span>
          {page < TOTAL_PAGES - 1
            ? <button type="button" className="bk-arrow" onClick={() => { void goTo(page + 1); }}>›</button>
            : <div style={{ width: 44 }} />}
        </div>
      </div>
    </div>
  );
};

export default RegisterClient;
