"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import "./EventFlow.css";
import Footer from "../../components/Footer/Footer";
import Transition from "../../components/Transition/Transition";
import ReactLenis from "lenis/react";

const day1Events = [
  { name: "SPINIGMA",        icon: "🎡" }, // Spinning wheel / random challenge
  { name: "MIND YOUR MANOR", icon: "🏰" }, // Virtual manor / escape room
  { name: "SECRET SYNDICATE",icon: "🕵️" }, // Detective / decode hidden messages
  { name: "CAROLLE MAZE",    icon: "🦾" }, // Robot arm / programming challenge
  { name: "CODE CHAOS",      icon: "🌪️" }, // Scrambled code / chaos
];

const day2Events = [
  { name: "CODELEAGUE",    icon: "🖥️" }, // Competitive coding on screen
  { name: "IDEA TO IMPACT", icon: "🚀" }, // Launch / innovation / impact
];

const instructions = [
  "Each team consist of maximum 2 members.",
  "Same team must continue throughout the event.",
  "Participants must report to the venue on time for each event.",
  "Participants must follow the instructions given by the event coordinators and judges.",
  "Any form of malpractice, use of unfair means, or misconduct will lead to disqualification.",
  "The decision of the judges will be final and binding.",
  "Participants must carry their college ID cards at all times.",
  "Participants must follow coordinator instructions at all times.",
  "Participants must bring their fully charged laptops and chargers.",
  "Participation Certificates will be provided to everyone.",
];

function EventFlowClient() {
  const lineRef1 = useRef(null);
  const lineRef2 = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("line-animate");
          }
        });
      },
      { threshold: 0.1 }
    );
    if (lineRef1.current) observer.observe(lineRef1.current);
    if (lineRef2.current) observer.observe(lineRef2.current);
    return () => observer.disconnect();
  }, []);

  return (
    <ReactLenis root>
      <div className="ef-page" suppressHydrationWarning>

        {/* Hero */}
        <section className="ef-hero">
          <div className="ef-hero-glow" />
          <p className="ef-hero-eyebrow">RISE Association Presents</p>
          <h1 className="ef-hero-title">EVENT FLOW</h1>
          <p className="ef-hero-sub">TECHNOPHILIA 3.0 · 1st–2nd April 2026 · Gallery Hall, BEC</p>
          <div className="ef-hero-divider" />
          <p className="ef-hero-desc">
            A two-day journey of code, creativity, and problem-solving. Every team competes across
            five mini-events on Day 1 to qualify for the grand finals on Day 2.
          </p>
        </section>

        {/* Overview pills */}
        <section className="ef-overview">
          <div className="ef-overview-pill">
            <span className="ef-pill-num">7</span>
            <span className="ef-pill-label">Events</span>
          </div>
          <div className="ef-overview-pill">
            <span className="ef-pill-num">2</span>
            <span className="ef-pill-label">Days</span>
          </div>
          <div className="ef-overview-pill">
            <span className="ef-pill-num">2</span>
            <span className="ef-pill-label">Members / Team</span>
          </div>
          <div className="ef-overview-pill">
            <span className="ef-pill-num">FREE</span>
            <span className="ef-pill-label">Registration</span>
          </div>
        </section>

        {/* Day 1 */}
        <section className="ef-day-section">
          <div className="ef-day-badge day1">DAY 1</div>
          <h2 className="ef-day-title">Preliminary &amp; Engagement Rounds</h2>
          <p className="ef-day-desc">
            All registered teams participate in a series of interactive technical mini-events designed
            to test diverse skill sets and shortlist top performers.
          </p>

          <div className="ef-timeline" ref={lineRef1}>
            <div className="ef-timeline-line" />
            {day1Events.map((ev, i) => (
              <div key={i} className={`ef-timeline-item ${i % 2 === 0 ? "left" : "right"}`}>
                <div className="ef-timeline-dot">
                  <span>{ev.icon}</span>
                </div>
                <div className="ef-timeline-card">
                  <span className="ef-card-num">0{i + 1}</span>
                  <h3 className="ef-card-title">{ev.name}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="ef-day-note">
            <div className="ef-note-item">📊 Teams earn marks/points in each event.</div>
            <div className="ef-note-item">🔢 Cumulative total from all Day 1 events determines qualification.</div>
            <div className="ef-note-item">⭐ Top-performing teams advance to Day 2.</div>
          </div>
        </section>

        {/* Connector arrow */}
        <div className="ef-connector">
          <div className="ef-connector-line" />
          <div className="ef-connector-arrow">▼</div>
          <div className="ef-connector-label">TOP TEAMS ADVANCE</div>
        </div>

        {/* Day 2 */}
        <section className="ef-day-section ef-day-section--gold">
          <div className="ef-day-badge day2">DAY 2</div>
          <h2 className="ef-day-title">Qualifier Rounds</h2>
          <p className="ef-day-desc">
            Selected teams advance to the main competitive rounds where deeper technical and creative
            evaluation takes place.
          </p>

          <div className="ef-timeline" ref={lineRef2}>
            <div className="ef-timeline-line gold" />
            {day2Events.map((ev, i) => (
              <div key={i} className={`ef-timeline-item ${i % 2 === 0 ? "left" : "right"}`}>
                <div className="ef-timeline-dot gold">
                  <span>{ev.icon}</span>
                </div>
                <div className="ef-timeline-card gold">
                  <span className="ef-card-num">0{i + 1}</span>
                  <h3 className="ef-card-title">{ev.name}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="ef-day-note gold">
            <div className="ef-note-item">🏆 Winners determined based on performance in CodeLeague &amp; Idea to Impact.</div>
            <div className="ef-note-item">📋 Day 1 acts as a qualification stage only.</div>
          </div>
        </section>

        {/* General Instructions */}
        <section className="ef-instructions">
          <div className="ef-instructions-header">
            <span className="ef-scroll-icon">📜</span>
            <h2>General Instructions</h2>
          </div>
          <div className="ef-instructions-grid">
            {instructions.map((instr, i) => (
              <div key={i} className="ef-instr-card">
                <span className="ef-instr-num">{String(i + 1).padStart(2, "0")}</span>
                <p>{instr}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="ef-cta">
          <h2>Ready to compete?</h2>
          <p>Secure your spot before slots run out.</p>
          <Link href="/register" className="ef-cta-btn">
            REGISTER NOW ⚡
          </Link>
        </section>

        <Footer />
      </div>
    </ReactLenis>
  );
}

export default Transition(EventFlowClient);
