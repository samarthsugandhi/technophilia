"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./About.css";
import Footer from "../../components/Footer/Footer";

gsap.registerPlugin(ScrollTrigger);

// ── Data ──────────────────────────────────────────────────────────────────────

const events = [
  {
    id: "tech1",
    title: "TECHNOPHILIA 1.0",
    edition: "Edition 1",
    date: "27th & 29th May 2022",
    tagline: "Where it all began.",
    description:
      "The inaugural edition of Technophilia brought together the brightest minds under one roof. Students competed across multiple thrilling rounds spanning hardcore problem-solving to creative design — setting the tone for what would become an annual tradition of technical excellence.",
    rounds: [
      "Blind Coding",
      "Technical Treasure Hunt",
      "Technical Video Round",
      "C Programming",
      "Technical Quiz",
      "Start Up Theme & GUI Design",
      "Scenario Based Coding",
      "Debugging",
    ],
    photoDir: "tech1",
    photoCount: 12, // 12 photos for Tech 1
  },
  {
    id: "tech2",
    title: "TECHNOPHILIA 2.0",
    edition: "Edition 2",
    date: "5th to 7th April 2023",
    tagline: "Bigger. Bolder. Better.",
    description:
      "Technophilia 2.0 raised the bar with an expanded 3-day lineup of intense competitions. Driven by creativity and deep technical grit, new challenges pushed participants from all dimensions of computer science to cement Technophilia as the premier technical fest.",
    rounds: [
      "Mind Maze",
      "Avid Tech",
      "Glitch Carping",
      "Quizzard",
      "Karel-the bot",
      "Web hunt",
      "Messy_Co",
      "Scenario-based coding",
      "inGenUIty",
    ],
    photoDir: "tech2",
    photoCount: 8, // 8 photos for Tech 2
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const GalleryCard = ({ src, index }) => {
  const [hasError, setHasError] = React.useState(false);

  // Determine span class for asymmetric grid based on index
  let spanClass = "span-1";
  if (index % 5 === 0) spanClass = "span-2-col span-2-row";
  else if (index % 7 === 0) spanClass = "span-2-col";
  else if (index % 4 === 0) spanClass = "span-2-row";

  if (src && !hasError) {
    return (
      <div className={`about-gallery-card ${spanClass}`}>
        <img 
          src={src} 
          alt="Event highlight" 
          onError={() => setHasError(true)}
          loading="lazy"
        />
        <div className="about-gallery-overlay"></div>
      </div>
    );
  }
  return (
    <div className={`about-gallery-card placeholder ${spanClass}`}>
      <div className="about-gallery-placeholder">
        <CameraIcon />
        <span>Photo missing</span>
      </div>
    </div>
  );
};

const EventSection = ({ event }) => {
  const photos = Array.from({ length: event.photoCount }, (_, i) => 
    `/about/${event.photoDir}/${i + 1}.jpg`
  );

  return (
    <section className="about-event-new" id={event.id}>
      <div className="about-event-inner">
        {/* Sticky Sidebar Header */}
        <div className="about-header-sidebar">
          <div className="sticky-header-content">
            <span className="ev-edition">{event.edition}</span>
            <h2 className="ev-title">{event.title}</h2>
            <p className="ev-date">{event.date}</p>
            <div className="ev-divider"></div>
            <p className="ev-tagline">"{event.tagline}"</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="about-content-main">
          <div className="ev-description-box">
            <p>{event.description}</p>
            <div className="ev-rounds-wrapper">
              <h4 className="ev-rounds-title">Featured Events</h4>
              <div className="ev-rounds-list">
                {event.rounds.map((round, idx) => (
                  <span key={idx} className="ev-round-pill">
                    {round}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Masonry Gallery */}
          <div className="ev-gallery-section">
            <h3 className="section-label">Event Highlights</h3>
            <div className="ev-masonry-gallery">
              {photos.map((src, i) => (
                <GalleryCard key={i} src={src} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AboutClient = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    // Reveal animation
    gsap.fromTo(
      ".about-hero-new h1 span",
      { y: 150, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out", delay: 0.2 }
    );
    gsap.fromTo(
      ".about-hero-sub",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: "power3.out" }
    );
  }, []);

  return (
    <>
      <div className="about-page-wrapper">
        {/* Splash Hero */}
        <section className="about-hero-new" ref={heroRef}>
          <div className="hero-noise"></div>
          <div className="hero-content">
            <div className="hero-eyebrow">
              RISE Association Presents
            </div>
            <h1>
              <span>Our</span> <span>Legacy</span>
            </h1>
            <div className="about-hero-sub">
              <p>
                Two chapters. Hundreds of minds. Countless innovations. Revisit the moments that defined BEC's ultimate technical battleground.
              </p>
              <Link href="/" className="btn-outline">
                ← Return to Home
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic Event Sections */}
        <div className="about-events-wrapper">
          {events.map((ev) => (
            <EventSection key={ev.id} event={ev} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutClient;

