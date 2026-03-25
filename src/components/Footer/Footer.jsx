"use client";
import React from "react";
import "./Footer.css";

import Link from "next/link";

const mentors = [
  {
    name: "Prof. G. B. Shettar",
    role: "Coordinator, RISE Association",
    phone: "9620863183",
  },
  {
    name: "Prof. S. S. Hiremath",
    role: "Coordinator, RISE Association",
    phone: "8867348752",
  },
  {
    name: "Dr. L. B. Bhajantri",
    role: "Head of Department, ISE",
    phone: "8660772398",
  },
];

const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 .84h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.99 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16v.92z" />
  </svg>
);

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-row">
        <div className="footer-contact">
          <h3>Have Questions?</h3>

          <p className="secondary">
            Got a query about registration, events, or team formation? Reach out
            to our faculty mentors or coordinators directly.
          </p>

          <div className="footer-mentor-cards">
            {mentors.map((m) => (
              <a
                key={m.name}
                href={`tel:${m.phone}`}
                className="footer-mentor-card"
              >
                <div className="footer-mentor-info">
                  <span className="footer-mentor-name">{m.name}</span>
                  <span className="footer-mentor-role">{m.role}</span>
                </div>
                <div className="footer-mentor-phone">
                  <PhoneIcon />
                  <span>{m.phone}</span>
                </div>
              </a>
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
