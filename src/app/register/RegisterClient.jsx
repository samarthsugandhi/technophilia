"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import Link from "next/link";
import "./Register.css";

const SEMESTERS = ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];
const HOSTELS = ["Netaji Boys Hostel", "Vishveshwarya Boys Hostel", "Girls Hostel"];
const BRANCH_OPTIONS = [
  "Computer Science and Engineering",
  "Information Science and Engineering",
  "Artificial Intelligence and Machine Learning",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biotechnology",
  "Electronics and Computer Science Engineering(ECS)",
  "Automobile Engineering",
  "Industrial and Production Engineering",
  "MCA",
  "Others",
];
const TOTAL_PAGES = 4; // 0=cover, 1=team+lead, 2=teammate(optional), 3=review
const DASH_PLACEHOLDER = "--------------------";

/* ── Field component ── */
const F = ({ label, name, value, onChange, type = "text", required, children, placeholder = DASH_PLACEHOLDER }) => (
  <div className="bk-field">
    <label>{label}{required && <span className="bk-req">*</span>}</label>
    {children || <input type={type} name={name} value={value} onChange={onChange} autoComplete="off" placeholder={placeholder} />}
  </div>
);

const RegisterClient = () => {
  const [page, setPage] = useState(0);
  const [flipKey, setFlipKey] = useState(0);
  const [flipDir, setFlipDir] = useState("right");
  const [formData, setFormData] = useState({
    teamName: "",
    leader: { name: "", usn: "", semester: "", email: "", phone: "", branch: "", otherBranch: "", stayType: "Local", hostel: "" },
    teammate: { name: "", semester: "", usn: "", email: "", phone: "", branch: "", otherBranch: "", stayType: "Local", hostel: "" },
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
    if (isSemOneOrTwo(semester)) return csnPattern.test(value) || usnPattern.test(value);
    return usnPattern.test(value);
  };

  const hasTeammateData = useCallback(() => {
    const t = formData.teammate;
    return [t.name, t.semester, t.usn, t.email, t.phone, t.branch, t.otherBranch, t.hostel]
      .some((v) => String(v || "").trim().length > 0);
  }, [formData.teammate]);

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

    if (currentPage >= 1) {
      usns.push(formData.leader.usn);
      emails.push(formData.leader.email);
    }
    if (currentPage >= 2 && hasTeammateData()) {
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
    const participants = [formData.leader, ...(hasTeammateData() ? [formData.teammate] : [])].filter(Boolean);
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
      if (!formData.leader.name.trim()) return "Leader name is required";
      if (!formData.leader.semester) return "Leader semester is required";
      if (!formData.leader.usn.trim()) return "Leader USN/CSN is required";
      if (!isValidUsnForSemester(formData.leader.usn, formData.leader.semester)) {
        return isSemOneOrTwo(formData.leader.semester)
          ? "For 1st/2nd semester, enter either a valid CSN (10 digits) or USN (example: 2BA23IS080)"
          : "Leader USN format must be like 2BA23IS080";
      }
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

    if (currentPage === 2 && hasTeammateData()) {
      if (!formData.teammate.name.trim()) return "Teammate name is required";
      if (!formData.teammate.semester) return "Teammate semester is required";
      if (!formData.teammate.usn.trim()) return "Teammate USN/CSN is required";
      if (!isValidUsnForSemester(formData.teammate.usn, formData.teammate.semester)) {
        return isSemOneOrTwo(formData.teammate.semester)
          ? "For 1st/2nd semester, teammate can enter either valid CSN (10 digits) or USN"
          : "Teammate USN format must be like 2BA23IS080";
      }
      if (!formData.teammate.email.trim()) return "Teammate email is required";
      if (!isValidEmail(formData.teammate.email)) return "Teammate email format is invalid";
      if (!formData.teammate.phone.trim()) return "Teammate phone is required";
      if (!/^\d{10}$/.test(formData.teammate.phone.trim())) return "Teammate phone must be 10 digits";
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
    const preSubmitValidation = validatePage(2);
    if (preSubmitValidation) {
      alert(preSubmitValidation);
      return;
    }

    const ids = getIdentifiersUptoPage(2);
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
          members: hasTeammateData()
            ? [
              {
                ...formData.teammate,
                branch: resolveBranch(formData.teammate),
                hostelName: formData.teammate.stayType === "Hostel" ? formData.teammate.hostel : "",
              },
            ]
            : [],
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
      window.open("https://chat.whatsapp.com/Bv389viETCV6BtzXC0k7Ep?mode=gi_t", "_blank");
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
          <a
            href="https://chat.whatsapp.com/Bv389viETCV6BtzXC0k7Ep?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="bk-homebtn bk-whatsapp"
            style={{
              background: "linear-gradient(135deg, #007bff, #0056b3)",
              color: "#fff",
              border: "none",
              marginBottom: "10px",
              textDecoration: "none",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)"
            }}
          >
            JOIN WHATSAPP GROUP FOR UPDATES
          </a>
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
                  <p className="bk-cover-tiny"><strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>RISE</strong>TECHNICAL FEST</p>
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
                    onChange={e => setFormData(p => ({ ...p, teamName: e.target.value }))} />
                  <h3 className="bk-head" style={{ marginTop: "8px" }}>Team-Lead Details</h3>
                  <F label="Full Name" name="name" value={formData.leader.name} onChange={uL} required />
                  <div className="bk-field">
                    <label>Semester<span className="bk-req">*</span></label>
                    <select name="semester" value={formData.leader.semester} onChange={uL}>
                      <option value="">---- Select Semester ----</option>
                      {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <F label="USN / CSN" name="usn" value={formData.leader.usn} onChange={uL} required />
                  <F label="Email" name="email" type="email" value={formData.leader.email} onChange={uL} required />
                  <F label="Phone Num" name="phone" value={formData.leader.phone} onChange={uL} required />
                  <div className="bk-field">
                    <label>Branch<span className="bk-req">*</span></label>
                    <select name="branch" value={formData.leader.branch} onChange={uL}>
                      <option value="">---- Select Branch ----</option>
                      {BRANCH_OPTIONS.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                    </select>
                  </div>
                  {formData.leader.branch === "Others" && (
                    <F label="Specify Branch" name="otherBranch" value={formData.leader.otherBranch} onChange={uL} required />
                  )}
                  <div className="bk-field">
                    <label>Stay Type</label>
                    <div className="bk-radio-group">
                      {["Local", "Hostel"].map(t => (
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
                        <option value="">---- Select Hostel ----</option>
                        {HOSTELS.map(h => <option key={h}>{h}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TEAMMATE ── */}
            {page === 2 && (
              <div className="bk-fields-wrap">
                <h3 className="bk-head">Teammate Details</h3>
                <div className="bk-fields">
                  <div className="bk-field" style={{ justifyContent: "center", height: "calc(var(--bk-line-gap) * 1.2)" }}>
                    <label style={{ marginBottom: 0 }}>Maximum 2 Members (Teammate Optional)</label>
                  </div>
                  <F label="Full Name" name="name" value={formData.teammate.name} onChange={u2} required />
                  <div className="bk-field">
                    <label>Semester<span className="bk-req">*</span></label>
                    <select name="semester" value={formData.teammate.semester} onChange={u2}>
                      <option value="">---- Select Semester ----</option>
                      {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <F label="CSN / USN" name="usn" value={formData.teammate.usn} onChange={u2} required />
                  <F label="Email" name="email" type="email" value={formData.teammate.email} onChange={u2} required />
                  <F label="Phone Num" name="phone" value={formData.teammate.phone} onChange={u2} required />
                  <div className="bk-field">
                    <label>Branch<span className="bk-req">*</span></label>
                    <select name="branch" value={formData.teammate.branch} onChange={u2}>
                      <option value="">---- Select Branch ----</option>
                      {BRANCH_OPTIONS.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                    </select>
                  </div>
                  {formData.teammate.branch === "Others" && (
                    <F label="Specify Branch" name="otherBranch" value={formData.teammate.otherBranch} onChange={u2} required />
                  )}
                  <div className="bk-field">
                    <label>Stay Type</label>
                    <div className="bk-radio-group">
                      {["Local", "Hostel"].map(t => (
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
                        <option value="">---- Select Hostel ----</option>
                        {HOSTELS.map(h => <option key={h}>{h}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── REVIEW ── */}
            {page === 3 && (
              <div className="bk-fields-wrap">
                <h3 className="bk-head">REVIEW &amp; SUBMIT</h3>
                <div className="bk-review">
                  {[
                    ["Team", formData.teamName],
                    ["Team Size", hasTeammateData() ? "2" : "1"],
                    ["Leader", `${formData.leader.name}`],
                    ["USN/CSN", formData.leader.usn],
                    ["Email", formData.leader.email],
                    ["Phone", formData.leader.phone],
                    ["Leader Branch", resolveBranch(formData.leader)],
                    ["Leader Stay", formatStay(formData.leader)],
                    ["Teammate", hasTeammateData() ? `${formData.teammate.name} · ${formData.teammate.usn} · ${formData.teammate.semester}` : "Not added"],
                    ["Teammate Branch", hasTeammateData() ? resolveBranch(formData.teammate) : "—"],
                    ["Teammate Stay", hasTeammateData() ? formatStay(formData.teammate) : "—"],
                    ["Team Stay Summary", getTeamStaySummary()],
                  ].map(([k, v]) => (
                    <div className="bk-review-row" key={k}>
                      <span>{k}</span><strong>{v || "—"}</strong>
                    </div>
                  ))}
                </div>
                {error && <p className="bk-error">{error}</p>}
                <button className="bk-submit" onClick={submit} disabled={loading}>
                  {loading ? <span className="bk-spinner" /> : "REGISTER TEAM"}
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
