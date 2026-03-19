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
    if (!eventLineup) return;

    const show = ([entry]) => {
      if (entry.isIntersecting) setShowRegisterBtn(true);
    };
    const hide = ([entry]) => {
      if (entry.isIntersecting) setShowRegisterBtn(false);
    };

    // Show when Event Lineup enters
    const lineupObserver = new IntersectionObserver(show, { threshold: 0.05 });
    // Also watch the header that precedes it
    const headerObserver = eventHeader
      ? new IntersectionObserver(show, { threshold: 0.05 })
      : null;
    // Hide when hero (top) or contact (bottom) are visible
    const heroObserver = heroRef.current
      ? new IntersectionObserver(hide, { threshold: 0.1 })
      : null;
    const contactObserver = contactRef.current
      ? new IntersectionObserver(hide, { threshold: 0.05 })
      : null;

    lineupObserver.observe(eventLineup);
    if (headerObserver && eventHeader) headerObserver.observe(eventHeader);
    if (heroObserver && heroRef.current) heroObserver.observe(heroRef.current);
    if (contactObserver && contactRef.current) contactObserver.observe(contactRef.current);

    return () => {
      lineupObserver.disconnect();
      headerObserver?.disconnect();
      heroObserver?.disconnect();
      contactObserver?.disconnect();
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
            <Link href="/register" style={{ marginTop: '40px', padding: '15px 40px', background: '#000', color: '#fff', border: '1px solid #fff', fontSize: '1.2rem', fontWeight: 'bold', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '2px', transition: 'background 0.3s, color 0.3s' }} onMouseEnter={(e) => { e.target.style.background = '#fff'; e.target.style.color = '#000'; }} onMouseLeave={(e) => { e.target.style.background = '#000'; e.target.style.color = '#fff'; }}>
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
          <section className="live-section" style={{ padding: '100px 5vw', background: '#050505', borderTop: '1px solid #222' }}>
            <AnimatedCopy tag="h2" animateOnScroll={true} style={{ fontSize: '3rem', color: '#fff', marginBottom: '40px', textTransform: 'uppercase' }}>Shortlisted Teams</AnimatedCopy>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {liveData.shortlisted.map((st, i) => (
                <div key={i} className="live-shortlisted-item" style={{ padding: '25px', background: '#111', border: '1px solid #333', borderLeft: '4px solid #fff' }}>
                  <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.4rem' }}>{st.teamName}</h3>
                  <p style={{ color: '#888', margin: '10px 0 0', fontSize: '0.9rem' }}>{st.leader.branch}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {liveData?.winners?.length > 0 && (
          <section className="live-section" style={{ padding: '100px 5vw', background: '#0a0a00', borderTop: '1px solid #330' }}>
            <AnimatedCopy tag="h2" animateOnScroll={true} style={{ fontSize: '4rem', color: 'gold', marginBottom: '40px', textShadow: '0 0 20px rgba(255,215,0,0.3)', textTransform: 'uppercase' }}>★ WINNERS ★</AnimatedCopy>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              {liveData.winners.map((win, i) => (
                <div key={i} className="live-winner-item" style={{ padding: '40px', background: 'linear-gradient(135deg, #111, #220)', border: '1px solid gold', position: 'relative', overflow: 'hidden' }}>
                  <h3 style={{ margin: 0, fontSize: '3rem', textTransform: 'uppercase', color: '#fff', zIndex: 2, position: 'relative' }}>{win.teamName}</h3>
                  <div style={{ color: '#ccc', marginTop: '20px', zIndex: 2, position: 'relative', fontSize: '1.2rem' }}>
                    <span style={{color: 'gold', fontWeight: 'bold'}}>{win.leader.name}</span> & {win.members.map(m=>m.name).join(' & ')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {showRegisterBtn && (
          <Link
            href="/register"
            style={{
              position: 'fixed',
              bottom: '36px',
              right: '36px',
              zIndex: 9999,
              padding: '16px 32px',
              background: '#fff',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '2px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              animation: 'fadeSlideUp 0.4s ease forwards',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 14px 40px rgba(0,0,0,0.7)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.5)'; }}
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
