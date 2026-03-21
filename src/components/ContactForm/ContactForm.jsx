import React from "react";
import "./ContactForm.css";

const coordinators = [
  { name: "Vinayak", role: "Student Coordinator", phone: "6361767094" },
  { name: "Abhishek", role: "Student Coordinator", phone: "9620983157" },
  { name: "Bhavana", role: "Student Coordinator", phone: "9353089702" },
  { name: "Parth", role: "Student Coordinator", phone: "7760566090" },
];

const ContactForm = () => {
  return (
    <div className="contact-form">
      <div className="contact-form-row">
        <div className="contact-form-row-copy-item">
          <p className="primary sm">TECHNOPHILIA 3.0</p>
        </div>
        <div className="contact-form-row-copy-item">
          <p className="primary sm">1st &amp; 2nd April 2026</p>
        </div>
        <div className="contact-form-row-copy-item">
          <p className="primary sm">&copy; 2026</p>
        </div>
      </div>

      <div className="contact-form-row contact-row-main">
        <div className="contact-form-col">
          <div className="contact-form-header">
            <h3>Reach Out to Us</h3>
            <p>
              Have questions about registration, events, or logistics? Contact
              our student coordinators directly — we&apos;re happy to help.
            </p>
          </div>

          <div className="contact-form-availability">
            <p className="primary sm">Event: 1st &amp; 2nd April 2026</p>
            <p className="primary sm">Venue: ISE Dept. — BEC, Bagalkot</p>
          </div>
        </div>

        <div className="contact-form-col contact-cards-col">
          {coordinators.map((c) => (
            <a
              key={c.name}
              href={`tel:${c.phone}`}
              className="coordinator-card"
            >
              <div className="coordinator-info">
                <span className="coordinator-name">{c.name}</span>
                <span className="coordinator-role">{c.role}</span>
              </div>
              <div className="coordinator-phone">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                <span>{c.phone}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
