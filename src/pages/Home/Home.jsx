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
  const contactRef = useRef(null);
  const [showRegisterBtn, setShowRegisterBtn] = useState(false); // hidden by default
  const heroRef = useRef(null);

  useEffect(() => {
    const target = new Date("2026-04-03T10:00:00").getTime();
    const interval = setInterval(() => {
      const distance = target - new Date().getTime();
      if (distance < 0) return clearInterval(interval);
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
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

    const stickySection = stickyTitlesRef.current;
    const titles = titlesRef.current.filter(Boolean);

    if (!stickySection || titles.length !== 3) {
      window.removeEventListener("resize", handleResize);
      return;
    }

    gsap.set(titles[0], { opacity: 1, scale: 1 });
    gsap.set(titles[1], { opacity: 0, scale: 0.75 });
    gsap.set(titles[2], { opacity: 0, scale: 0.75 });

    const pinTrigger = ScrollTrigger.create({
      trigger: stickySection,
      start: "top top",
      end: `+=${window.innerHeight * 5}`,
      pin: true,
      pinSpacing: true,
    });

    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: stickySection,
        start: "top top",
        end: `+=${window.innerHeight * 4}`,
        scrub: 0.5,
      },
    });

    masterTimeline
      .to(
        titles[0],
        {
          opacity: 0,
          scale: 0.75,
          duration: 0.3,
          ease: "power2.out",
        },
        1
      )

      .to(
        titles[1],
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.in",
        },
        1.25
      );

    masterTimeline
      .to(
        titles[1],
        {
          opacity: 0,
          scale: 0.75,
          duration: 0.3,
          ease: "power2.out",
        },
        2.5
      )

      .to(
        titles[2],
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.in",
        },
        2.75
      );

    const workHeaderSection = stickyWorkHeaderRef.current;
    const homeWorkSection = homeWorkRef.current;

    let workHeaderPinTrigger;
    if (workHeaderSection && homeWorkSection) {
      workHeaderPinTrigger = ScrollTrigger.create({
        trigger: workHeaderSection,
        start: "top top",
        endTrigger: homeWorkSection,
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
      });
    }


    return () => {
      pinTrigger.kill();
      if (workHeaderPinTrigger) {
        workHeaderPinTrigger.kill();
      }
      if (masterTimeline.scrollTrigger) {
        masterTimeline.scrollTrigger.kill();
      }
      masterTimeline.kill();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ReactLenis root>
      <div className="page home">
        <section ref={heroRef} className="hero">
          <div className="hero-img">
            <img src="/home/hero.png" alt="" />
          </div>

          <div className="hero-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AnimatedCopy tag="h1" animateOnScroll={false} delay={0.7} className="tech-title" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
              TECHNOPHILIA 3.0
            </AnimatedCopy>
            <AnimatedCopy tag="h2" animateOnScroll={false} delay={0.9} style={{ color: '#aaa', marginTop: '20px', fontFamily: 'monospace', fontSize: '2rem' }}>
              {timeLeft.days}D : {String(timeLeft.hours).padStart(2,'0')}H : {String(timeLeft.mins).padStart(2,'0')}M : {String(timeLeft.secs).padStart(2,'0')}S
            </AnimatedCopy>
            <Link href="/register" className="hero-register-btn">
              REGISTER NOW
            </Link>
          </div>
        </section>

        <section ref={stickyTitlesRef} className="sticky-titles">
          <div className="sticky-titles-nav">
            <p className="primary sm">ISE Dept. — BEC, Bagalkot</p>
            <p className="primary sm">3rd – 4th April 2026</p>
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
        </section>

        <section ref={stickyWorkHeaderRef} className="sticky-work-header">
          <AnimatedCopy tag="h1" animateOnScroll="true">
            Event Lineup
          </AnimatedCopy>
        </section>

        <section ref={homeWorkRef} className="home-work">
          <div className="home-work-list">
            {workItems.map((work, index) => (
              <Link
                href="/register"
                key={work.id}
                className="home-work-item"
              >
                <p className="primary sm">{`${String(index + 1).padStart(
                  2,
                  "0"
                )} - ${String(workItems.length).padStart(2, "0")}`}</p>
                <h3 style={{ fontSize: '2rem', marginBottom: '15px' }}>{work.title}</h3>
                <div className="work-item-img">
                  <img src={work.image} alt={work.title} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {liveData?.shortlisted?.length > 0 && (
          <section className="live-section shortlisted-live-section">
            <AnimatedCopy tag="h2" animateOnScroll={true} className="live-title">Shortlisted Teams</AnimatedCopy>
            <div className="live-grid">
              {liveData.shortlisted.map((st, i) => (
                <div key={i} className="live-shortlisted-item">
                  <h3>{st.teamName}</h3>
                  <p>{st.registrationId || "Registration ID pending"}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {liveData?.winners?.length > 0 && (
          <section className="live-section winners-live-section">
            <AnimatedCopy tag="h2" animateOnScroll={true} className="winners-title">★ Winner Announcement ★</AnimatedCopy>
            <p className="winner-legend">1st = Winner, 2nd = 1st Runner-up, 3rd = 2nd Runner-up</p>
            <div className="winners-grid">
              {liveData.winners.map((win, i) => (
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
        )}

        {showRegisterBtn && (
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
    </ReactLenis>
  );
};

export default Transition(Home);
