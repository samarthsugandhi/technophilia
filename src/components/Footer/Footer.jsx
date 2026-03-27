"use client";
import React from "react";
import "./Footer.css";

import Link from "next/link";

const mentors = [
  {
    name: "Prof. G. B. Shettar",
    role: "Coordinator, RISE Association",
  },
  {
    name: "Prof. S. S. Hiremath",
    role: "Coordinator, RISE Association",
  },
  {
    name: "Dr. L. B. Bhajantri",
    role: "Head of Department, ISE",
  },
];



const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-row">
        <div className="footer-contact">
          <h3>Have Questions?</h3>

          <p className="secondary">
            Got a query about registration, events, or team formation? Reach out
            to our student coordinators directly.
          </p>

          <div className="footer-mentor-cards">
            {mentors.map((m) => (
              <div
                key={m.name}
                className="footer-mentor-card"
              >
                <div className="footer-mentor-info">
                  <span className="footer-mentor-name">{m.name}</span>
                  <span className="footer-mentor-role">{m.role}</span>
                </div>
              </div>
            ))}
          </div>

          <Link href="/contact" className="btn">
            Student Coordinators →
          </Link>
        </div>

        <div className="footer-nav">
          <Link href="/" className="footer-nav-item">
            <span>Home</span>
            <span>&#8594;</span>
          </Link>

          <Link href="/register" className="footer-nav-item">
            <span>Register</span>
            <span>&#8594;</span>
          </Link>

          <Link href="/about" className="footer-nav-item">
            <span>About</span>
            <span>&#8594;</span>
          </Link>

          <Link href="/#events" className="footer-nav-item">
            <span>Events</span>
            <span>&#8594;</span>
          </Link>

          <Link href="/contact" className="footer-nav-item">
            <span>Contact</span>
            <span>&#8594;</span>
          </Link>

          <Link href="/faq" className="footer-nav-item">
            <span>FAQ</span>
            <span>&#8594;</span>
          </Link>
        </div>
      </div>
      <div className="footer-row">
        <div className="footer-header">
          <h1>TECHNOPHILIA</h1>
        </div>

        <div className="footer-copyright-line">
          <p className="primary sm">&copy; TECHNOPHILIA 3.0 &mdash; 2026</p>
          <p className="primary sm">Built by Samarth Sugandhi &mdash; Media, RISE Association, BEC</p>
          <p className="primary sm">Vinayak Killedar &mdash; Treasurer, RISE Association, BEC</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
