"use client";
import React from "react";
import "./Footer.css";

import Link from "next/link";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-row">
        <div className="footer-contact">
          <h3>
            Have Questions? <br />
            contact<span>@</span>technophilia.com
          </h3>

          <p className="secondary">
            Got a query about registration, events, or team formation? Reach out
            to our coordinators — we&apos;re happy to help anytime.
          </p>

          <Link href="/contact" className="btn">
            Get in Touch
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
          <h1>TECHNO</h1>
          <h1>PHILIA</h1>
        </div>

        <div className="footer-copyright-line">
          <p className="primary sm">&copy; TECHNOPHILIA 3.0 &mdash; 2026</p>
          <p className="primary sm">Built by Samarth Sugandhi &mdash; RISE Association, BEC</p>
          <p className="primary sm">Prof. G. B. Shettar &mdash; Mentor, RISE Association, BEC</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
