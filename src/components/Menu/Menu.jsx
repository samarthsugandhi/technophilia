"use client";
import React, { useEffect, useRef, useState } from "react";
import "./Menu.css";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";

const Menu = () => {
  const menuLinks = [
    { path: "/", label: "Home" },
    { path: "/#events", label: "Events" },
    { path: "/register", label: "Register" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
    { path: "/faq", label: "FAQ" },
  ];

  const pathname = usePathname();
  const menuContainer = useRef();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnimation = useRef();
  const menuLinksAnimation = useRef();
  const menuBarAnimation = useRef();
  const hamburgerRef = useRef(null);

  const lastScrollY = useRef(0);
  const menuBarRef = useRef();

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [shouldDelayClose, setShouldDelayClose] = useState(false);
  const previousPathRef = useRef(pathname);
  const scrollPositionRef = useRef(0);

  const toggleBodyScroll = (disableScroll) => {
    if (disableScroll) {
      scrollPositionRef.current = window.pageYOffset;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
      window.scrollTo(0, scrollPositionRef.current);
    }
  };

  const toggleMenu = () => {
    hamburgerRef.current?.classList.toggle("active");
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    toggleBodyScroll(newMenuState);
  };

  const closeMenu = () => {
    if (isMenuOpen) {
      hamburgerRef.current?.classList.remove("active");
      setIsMenuOpen(false);
      toggleBodyScroll(false);
    } else return;
  };

  const router = useRouter();
  
  const handleLinkClick = (e, path) => {
    e.preventDefault();
    closeMenu();
    if (path !== pathname) {
      setTimeout(() => {
        router.push(path);
      }, 1000);
    }
  };

  useEffect(() => {
    previousPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (pathname === '/register') {
      // Still set empty placeholders so isMenuOpen effect never crashes
      menuAnimation.current = gsap.timeline({ paused: true });
      menuBarAnimation.current = gsap.timeline({ paused: true });
      menuLinksAnimation.current = gsap.timeline({ paused: true });
      return;
    }

    // Kill any stale timelines before re-creating (important after navigation)
    menuAnimation.current?.kill();
    menuBarAnimation.current?.kill();
    menuLinksAnimation.current?.kill();

    gsap.set(".menu", { clearProps: "all" });
    gsap.set(".menu-bar", { clearProps: "all" });
    gsap.set(".menu-link-item-holder", { clearProps: "all" });

    gsap.set(".menu-link-item-holder", { y: 125 });

    menuAnimation.current = gsap.timeline({ paused: true }).to(".menu", {
      duration: 1,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      ease: "power4.inOut",
    });

    const heightValue =
      windowWidth < 1000 ? "calc(100% - 2.5em)" : "calc(100% - 4em)";

    menuBarAnimation.current = gsap
      .timeline({ paused: true })
      .to(".menu-bar", {
        duration: 1,
        height: heightValue,
        ease: "power4.inOut",
      });

    menuLinksAnimation.current = gsap
      .timeline({ paused: true })
      .to(".menu-link-item-holder", {
        y: 0,
        duration: 1.25,
        stagger: 0.075,
        ease: "power3.inOut",
        delay: 0.125,
      });
  }, [windowWidth, pathname]);

  useEffect(() => {
    if (pathname === '/register' || !menuAnimation.current) return;
    if (isMenuOpen) {
      menuAnimation.current.play();
      menuBarAnimation.current.play();
      menuLinksAnimation.current.play();
    } else {
      menuAnimation.current.reverse();
      menuBarAnimation.current.reverse();
      menuLinksAnimation.current.reverse();
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (pathname === '/register') return;
    const handleScroll = () => {
      if (isMenuOpen) return;

      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current) {
        gsap.to(".menu-bar", {
          y: -200,
          duration: 1,
          ease: "power2.out",
        });
      } else {
        gsap.to(".menu-bar", {
          y: 0,
          duration: 1,
          ease: "power2.out",
        });
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    return () => {
      if (document.body.style.position === "fixed") {
        toggleBodyScroll(false);
      }
    };
  }, []);

  if (pathname === '/register') return null;

  return (
    <div className="menu-container" ref={menuContainer}>
      <div className="menu-bar" ref={menuBarRef}>
        <div className="menu-bar-container">
          <div className="menu-logo" onClick={closeMenu}>
            <Link href="/">
              <h4>TECHNOPHILIA</h4>
            </Link>
          </div>
          <div className="menu-actions">
            <div className="menu-toggle">
              <button
                ref={hamburgerRef}
                className="hamburger-icon"
                onClick={toggleMenu}
              ></button>
            </div>
          </div>
        </div>
      </div>
      <div className="menu">
        <div className="menu-col">
          <div className="menu-sub-col">
            <div className="menu-links">
              {menuLinks.map((link, index) => (
                <div key={index} className="menu-link-item">
                  <div className="menu-link-item-holder">
                    <a
                      className="menu-link"
                      href={link.path}
                      onClick={(e) => handleLinkClick(e, link.path)}
                    >
                      {link.label}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
