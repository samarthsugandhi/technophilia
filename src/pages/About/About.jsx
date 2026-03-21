"use client";
import React from "react";
import "./About.css";

import AnimatedCopy from "../../components/AnimatedCopy/AnimatedCopy";
import ContactForm from "../../components/ContactForm/ContactForm";
import Footer from "../../components/Footer/Footer";

import ReactLenis from "lenis/react";

import Transition from "../../components/Transition/Transition";

const About = () => {
  return (
    <ReactLenis root>
      <div className="page about">
        <section className="about-header">
          <h1>Est</h1>
          <h1>1963</h1>
        </section>

        <section className="about-hero">
          <div className="about-hero-img">
            <img src="/about/about-hero.png" alt="" />
          </div>
        </section>

        <section className="about-me-copy">
          <div className="about-me-copy-wrapper">
            <AnimatedCopy animateOnScroll={true} tag="h3">
              Basaveshwar Engineering College (BEC), Bagalkot is undergoing
              unswerving growth since 1963. It started as a private institute
              with only three Engineering programs and came into Government
              grant-in-aid code from 1968.
            </AnimatedCopy>

            <AnimatedCopy animateOnScroll={true} tag="h3">
              Today, the institute offers 9 undergraduate and 8 post graduate
              programmes with 10 departments recognized as R&D centers. It is a
              matter of pride for BEC to be placed in the rank band of 201-250
              at all India level by NIRF.
            </AnimatedCopy>

            <AnimatedCopy animateOnScroll={true} tag="h3">
              The institution emphasizes teaching-learning, research and
              administrative processes, stimulating an academic environment for
              promotion of Quality and excellence in engineering education.
            </AnimatedCopy>
          </div>
        </section>

        <section className="services">
          <div className="services-col">
            <div className="services-banner">
              <img src="/about/services-banner.jpg" alt="" />
            </div>
            <p className="primary">Excellence in Education</p>
          </div>
          <div className="services-col">
            <h4>
              To be an institution of excellence in education, research and
              innovation for sustainable future. We strive to develop globally
              competent professionals through a culture of innovation.
            </h4>

            <div className="services-list">
              <div className="service-list-row">
                <div className="service-list-col">
                  <h5>Vision</h5>
                </div>
                <div className="service-list-col">
                  <p>
                    To be an institution of excellence in education, research
                    and innovation for sustainable future. We aim to nurture
                    talent that transforms the world.
                  </p>
                </div>
              </div>

              <div className="service-list-row">
                <div className="service-list-col">
                  <h5>Mission</h5>
                </div>
                <div className="service-list-col">
                  <p>
                    Develop globally competent professionals for future talent
                    requirements and nurture a culture of research, Innovation
                    and entrepreneurship while imbibing moral and ethical values.
                  </p>
                </div>
              </div>

              <div className="service-list-row">
                <div className="service-list-col">
                  <h5>Collaboration</h5>
                </div>
                <div className="service-list-col">
                  <p>
                    Promote collaborations, extension and outreach programs for
                    addressing industrial and societal needs, fostering
                    ecological and environmental consciousness in every step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-banner-img">
          <div className="about-banner-img-wrapper">
            <img src="/about/about-banner.jpg" alt="" />
          </div>
        </section>

        <section className="fav-tools">
          <div className="fav-tools-header">
            <AnimatedCopy tag="p" animateOnScroll={true} className="primary sm">
              Institutional Growth
            </AnimatedCopy>
            <AnimatedCopy tag="h2" animateOnScroll={true} delay={0.25}>
              Major Credentials
            </AnimatedCopy>
            <AnimatedCopy
              tag="p"
              animateOnScroll={true}
              className="secondary"
              delay={0.5}
            >
              Recognized by National Project Implementation Unit (NPIU) and
              awarded multiple TEQIP grants for excellence in R&D and academic
              growth.
            </AnimatedCopy>
          </div>

          <div className="fav-tools-list">
            <div className="fav-tools-list-row">
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/tool-1.jpg" alt="" />
                </div>
                <h4>TEQIP Supported</h4>
                <p className="primary sm">Academic Excellence</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/tool-2.jpg" alt="" />
                </div>
                <h4>NIRF Ranked</h4>
                <p className="primary sm">National Level Rank</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/tool-3.jpg" alt="" />
                </div>
                <h4>IDEA Lab</h4>
                <p className="primary sm">Innovation Center</p>
              </div>
            </div>
            <div className="fav-tools-list-row">
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/tool-4.jpg" alt="" />
                </div>
                <h4>Incubation Center</h4>
                <p className="primary sm">Entrepreneurship</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/tool-5.jpg" alt="" />
                </div>
                <h4>NBA Accredited</h4>
                <p className="primary sm">Quality Assurance</p>
              </div>
              <div className="fav-tool">
                <div className="fav-tool-img">
                  <img src="/about/tool-6.jpg" alt="" />
                </div>
                <h4>UGC Autonomous</h4>
                <p className="primary sm">Academic Freedom</p>
              </div>
            </div>
          </div>
        </section>

        <ContactForm />

        <Footer />
      </div>
    </ReactLenis>
  );
};

export default Transition(About);
