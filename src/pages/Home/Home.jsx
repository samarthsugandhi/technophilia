"use client";
import workList from "../../data/workList";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import "./Home.css";

import AnimatedCopy from "../../components/AnimatedCopy/AnimatedCopy";
import Reviews from "../../components/Reviews/Reviews";
import ContactForm from "../../components/ContactForm/ContactForm";
import Footer from "../../components/Footer/Footer";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ReactLenis from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

import Transition from "../../components/Transition/Transition";

const fetcher = (url) => fetch(url).then((res) => res.json());

const Home = () => {
  const { data: liveData } = useSWR("/api/public/live", fetcher, { refreshInterval: 5000 });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  
  const workItems = Array.isArray(workList) ? workList : [];
  const stickyTitlesRef = useRef(null);
  const titlesRef = useRef([]);
  const stickyWorkHeaderRef = useRef(null);
  const homeWorkRef = useRef(null);
  const firstEventRef = useRef(null);
  const hintWrapperRef = useRef(null);
  const shortlistedRef = useRef(null);
  const winnersRef = useRef(null);
  const contactRef = useRef(null);
  const [showRegisterBtn, setShowRegisterBtn] = useState(false); // hidden by default
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [savedScroll, setSavedScroll] = useState(0);

  const scrollToWinners = () => {
    winnersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  
  const handleEventClick = (work) => {
    setSavedScroll(window.scrollY);
    setSelectedEvent(work);
    setTimeout(() => {
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    }, 10);
  };

  const handleBack = () => {
    setSelectedEvent(null);
    setTimeout(() => {
      ScrollTrigger.refresh();
      window.scrollTo(0, savedScroll);
    }, 10);
  };

  const heroRef = useRef(null);

  useEffect(() => {
    const target = new Date("2026-04-01T17:30:00+05:30").getTime();

    const updateCountdown = () => {
      const distance = target - new Date().getTime();
      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return false;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });

      return true;
    };

    updateCountdown();

    const interval = setInterval(() => {
      const isActive = updateCountdown();
      if (!isActive) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Show register button ONLY while Event Lineup section is in view
  useEffect(() => {
    const eventLineup = homeWorkRef.current;
    const eventHeader = stickyWorkHeaderRef.current;
    if (!eventLineup && !eventHeader) return;

    let inHeader = false;
    let inLineup = false;

    const syncVisibility = () => {
      setShowRegisterBtn(inHeader || inLineup);
    };

    const lineupObserver = eventLineup
      ? new IntersectionObserver(([entry]) => {
          inLineup = Boolean(entry?.isIntersecting);
          syncVisibility();
        }, { threshold: 0.08 })
      : null;

    const headerObserver = eventHeader
      ? new IntersectionObserver(([entry]) => {
          inHeader = Boolean(entry?.isIntersecting);
          syncVisibility();
        }, { threshold: 0.08 })
      : null;

    if (lineupObserver && eventLineup) lineupObserver.observe(eventLineup);
    if (headerObserver && eventHeader) headerObserver.observe(eventHeader);

    return () => {
      lineupObserver?.disconnect();
      headerObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    const titles = titlesRef.current.filter(Boolean);

    if (titles.length !== 3) {
      window.removeEventListener("resize", handleResize);
      return;
    }

    // Start: show title[0], hide others
    gsap.set(titles[0], { opacity: 1, scale: 1 });
    gsap.set(titles[1], { opacity: 0, scale: 0.75 });
    gsap.set(titles[2], { opacity: 0, scale: 0.75 });

    let current = 0;

    const showNext = () => {
      const next = (current + 1) % titles.length;
      // Fade out current
      gsap.to(titles[current], {
        opacity: 0,
        scale: 0.75,
        duration: 0.5,
        ease: "power2.out",
      });
      // Fade in next
      gsap.to(titles[next], {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.in",
        delay: 0.25,
      });
      current = next;
    };

    // Change title every 2.5 seconds
    const intervalId = setInterval(showNext, 2500);

    const workHeaderSection = stickyWorkHeaderRef.current;
    const homeWorkSection = homeWorkRef.current;
    const firstEventItem = firstEventRef.current;
    const scrollHintWrap = hintWrapperRef.current;

    let workHeaderPinTrigger;
    let hintFadeTrigger;
    if (workHeaderSection && homeWorkSection) {
      workHeaderPinTrigger = ScrollTrigger.create({
        trigger: workHeaderSection,
        start: "top top",
        endTrigger: homeWorkSection,
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
      });
      
      const fadeTargets = [scrollHintWrap].filter(Boolean);
      if (fadeTargets.length > 0) {
        hintFadeTrigger = gsap.to(fadeTargets, {
          opacity: 0,
          scrollTrigger: {
            trigger: firstEventItem || homeWorkSection,
            start: "top 88%",
            end: "top 58%",
            scrub: true,
          }
        });
      }
    }

    return () => {
      clearInterval(intervalId);
      if (workHeaderPinTrigger) workHeaderPinTrigger.kill();
      if (hintFadeTrigger && hintFadeTrigger.scrollTrigger) hintFadeTrigger.scrollTrigger.kill();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ReactLenis root>
      <div className="page home">
        <div style={{ display: selectedEvent ? 'none' : 'block', width: '100%' }}>
          <section ref={heroRef} className="hero">
          <div className="hero-img">
            <img src="/home/hero.png" alt="" />
          </div>

          <div className="hero-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AnimatedCopy tag="h1" animateOnScroll={false} delay={0.7} className="tech-title" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
              TECHNOPHILIA 3.0
            </AnimatedCopy>
            <h2 style={{ marginTop: '20px' }}>
              {timeLeft.days}D:{String(timeLeft.hours).padStart(2,'0')}H:{String(timeLeft.mins).padStart(2,'0')}M:{String(timeLeft.secs).padStart(2,'0')}S
            </h2>
            <Link href="/register" className="hero-register-btn">
              REGISTER NOW
            </Link>
            {liveData?.winners?.length > 0 && (
              <button
                type="button"
                className="hero-winners-popup"
                onClick={scrollToWinners}
              >
                🏆 Winners Released — Tap to View
              </button>
            )}
          </div>
        </section>

        <section ref={stickyTitlesRef} className="sticky-titles">
          <div className="blinking-banner">
            ⚡ HURRY! LIMITED SLOTS — FIRST COME, FIRST SERVED ⚡
          </div>
          <div className="sticky-titles-nav" style={{ marginTop: '50px' }}>
            <p className="primary sm">GALLERY HALL, BEC</p>
            <p className="primary sm">1st – 2nd April 2026</p>
          </div>
          <div className="sticky-titles-footer">
            <p className="primary sm">RISE Association Presents</p>
            <p className="primary sm">Free Registration — Limited Slots</p>
          </div>
          <h2 ref={(el) => (titlesRef.current[0] = el)}>
            Where coders, builders, and problem-solvers collide.
          </h2>
          <h2 ref={(el) => (titlesRef.current[1] = el)}>
            7 events. 2 days. One massive prize pool awaits.
          </h2>
          <h2 ref={(el) => (titlesRef.current[2] = el)}>
            Register your team. Enter the arena. Own TECHNOPHILIA 3.0.
          </h2>

          <button
            className="scroll-down-arrow"
            aria-label="Scroll down"
            onClick={() => {
              stickyWorkHeaderRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </section>

        <section
          ref={shortlistedRef}
          className="live-section shortlisted-live-section"
          style={{ display: liveData?.shortlisted?.length > 0 ? "block" : "none" }}
          aria-hidden={!(liveData?.shortlisted?.length > 0)}
          suppressHydrationWarning
        >
          <AnimatedCopy tag="h2" animateOnScroll={true} className="live-title">Shortlisted Teams</AnimatedCopy>
          <div className="live-grid">
            {(liveData?.shortlisted || []).map((st, i) => (
              <div key={`${st.teamName}-${i}`} className="live-shortlisted-item">
                <h3>{st.teamName}</h3>
                <p>{st.registrationId || "Registration ID pending"}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="winner-feature-section"
          style={{ display: liveData?.winners?.length > 0 ? "block" : "none" }}
          aria-hidden={!(liveData?.winners?.length > 0)}
          suppressHydrationWarning
        >
          <div className="winner-feature-card">
            <div className="winner-feature-media">
              <img src="/home/winners-banner.png" alt="Technophilia winners banner" />
            </div>
            <div className="winner-feature-copy">
              <p className="winner-feature-kicker">Results Released</p>
              <AnimatedCopy tag="h2" animateOnScroll={true} className="winner-feature-title">
                Winners Spotlight
              </AnimatedCopy>
              <div className="winner-feature-quotes">
                <p className="winner-feature-text">“Champions are built one bold decision at a time.”</p>
                <p className="winner-feature-text">“Today we celebrate code, courage, and teamwork.”</p>
              </div>
              <a href="#winners" className="winner-feature-link">
                View Winner Board →
              </a>
            </div>
          </div>
        </section>

        <section
          ref={winnersRef}
          className="live-section winners-live-section"
          id="winners"
          style={{ display: liveData?.winners?.length > 0 ? "block" : "none" }}
          aria-hidden={!(liveData?.winners?.length > 0)}
          suppressHydrationWarning
        >
          <AnimatedCopy tag="h2" animateOnScroll={true} className="winners-title">★ Winner Announcement ★</AnimatedCopy>
          <p className="winner-legend">1st = Winner, 2nd = 1st Runner-up, 3rd = 2nd Runner-up, 4th = Consolation Award</p>
          <div className="winners-grid">
            {(liveData?.winners || []).map((win, i) => (
              <div key={`${win.teamName}-${i}`} className="live-winner-item">
                <span className="winner-rank-pill">{win.awardLabel || "Winner"}</span>
                <h3>{win.teamName}</h3>
                <div className="winner-names">
                  {[win.leader?.name, ...(win.members || []).map((m) => m.name)]
                    .filter(Boolean)
                    .map((name, idx, arr) => (
                      <React.Fragment key={`${win.teamName}-${name}-${idx}`}>
                        <span className="teammate-name">{name}</span>
                        {idx < arr.length - 1 ? " & " : ""}
                      </React.Fragment>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section ref={stickyWorkHeaderRef} className="sticky-work-header">
          <AnimatedCopy tag="h1" animateOnScroll="true" style={{ position: 'relative', zIndex: 2 }}>
            Event Lineup
          </AnimatedCopy>
          <div ref={hintWrapperRef} style={{ position: 'absolute', bottom: '3em', left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
            <div className="event-scroll-hint" style={{ bottom: '0' }}>
              <span>Scroll Down</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </section>

        <section ref={homeWorkRef} className="home-work" id="events">
          <div className="home-work-list">
            {workItems.map((work, index) => (
              <div
                key={work.id}
                ref={index === 0 ? firstEventRef : null}
                className="home-work-item"
                onClick={() => handleEventClick(work)}
                style={{ cursor: 'pointer' }}
              >
                <p className="primary sm">{`${String(index + 1).padStart(
                  2,
                  "0"
                )} - ${String(workItems.length).padStart(2, "0")}`}</p>
                <h3 style={{ fontSize: '2rem', marginBottom: '15px' }}>{work.title}</h3>
                <div className="work-item-img">
                  <img src={work.image} alt={work.title} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0 60px', position: 'relative', zIndex: 10 }}>
            <Link href="/event-flow" className="event-flow-cta-btn">
              VIEW EVENT FLOW →
            </Link>
          </div>
        </section>

        {showRegisterBtn && !selectedEvent && (
          <Link
            href="/register"
            className="floating-register-btn"
          >
            REGISTER NOW
          </Link>
        )}

        <div ref={contactRef}>
          <Reviews />
          <ContactForm />
          <Footer />
        </div>

        </div>

        {selectedEvent && (
          <div className="event-details-page-view" style={{ width: '100%', minHeight: '100vh', backgroundColor: '#fff', color: '#000', padding: '60px 0' }}>
            <div className="event-details-container">
              <button 
                className="back-btn-new" 
                onClick={handleBack}
              >
                <span className="back-arrow">←</span> Back to Events
              </button>
              
              <div className="event-details-content">
                <div className="event-details-img">
                  <img src={selectedEvent.image} alt={selectedEvent.title} />
                </div>
                <div className="event-details-text">
                  <h2 className="event-details-title">{selectedEvent.title}</h2>
                  <div className="event-description">
                    {selectedEvent.description || "Description coming soon..."}
                  </div>
                  {selectedEvent.title === "MIND YOUR MANOR" && (
                    <div className="event-demo-video-wrapper">
                      <h3 className="event-demo-video-title">Demo Video</h3>
                      <video className="event-demo-video" controls preload="metadata">
                        <source src="/home/mind-your-manor-demo.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(() => {
              const currentIndex = workItems.findIndex(w => w.id === selectedEvent.id);
              const isLastEvent = currentIndex === workItems.length - 1;
              const nextEvent = workItems[(currentIndex + 1) % workItems.length];
              
              if (isLastEvent) {
                return (
                  <div className="next-event-section final-register-section">
                    <div className="final-register-content">
                      <div className="final-register-glow"></div>
                      <h2 className="next-event-title final-register-title">READY TO COMPETE?</h2>
                      <p className="final-register-subtitle">Join the ultimate tech showdown. Prove your skills and win huge prizes.</p>
                      <Link href="/register" className="register-btn-event final-register-btn">
                        REGISTER YOUR TEAM NOW
                        <span className="btn-arrow">→</span>
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <div className="next-event-section">
                  <h2 className="next-event-title">NEXT</h2>
                  <div className="next-event-card" onClick={() => handleEventClick(nextEvent)}>
                    <img src={nextEvent.image} alt={nextEvent.title} />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </ReactLenis>
  );
};

export default Transition(Home);
