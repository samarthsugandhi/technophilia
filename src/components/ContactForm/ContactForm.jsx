import React from "react";
import "./ContactForm.css";

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

      <div className="contact-form-row">
        <div className="contact-form-col">
          <div className="contact-form-header">
            <h3>Start a Conversation</h3>

            <p>
              Questions about registration, events, or logistics? Drop us a
              message and our team will get back to you shortly.
            </p>
          </div>

          <div className="contact-form-availability">
            <p className="primary sm">Event: 1st &amp; 2nd April 2026</p>
            <p className="primary sm">Venue: ISE Dept. — BEC, Bagalkot</p>
          </div>
        </div>

        <div className="contact-form-col">
          <div className="form-item">
            <input type="text" placeholder="Name" />
          </div>

          <div className="form-item">
            <input type="text" placeholder="Email" />
          </div>

          <div className="form-item">
            <textarea type="text" rows={6} placeholder="Message" />
          </div>

          <div className="form-item">
            <button className="btn">Send Message</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
