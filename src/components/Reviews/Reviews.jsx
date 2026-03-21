import React, { useState, useEffect, useRef } from "react";
import "./Reviews.css";

import gsap from "gsap";

const banners = [
  {
    id: 1,
    image: "/reviews/tech1.jpg",
    alt: "Technophilia 1.0 Event Banner",
    title: "TECHNOPHILIA",
    description:
      "TECHNOPHILIA was a highly successful technical event that brought together innovation, competition, and coding excellence, engaging students through multiple challenging rounds and hands-on problem solving.",
  },
  {
    id: 2,
    image: "/reviews/tech2.jpg",
    alt: "Technophilia 2.0 Event Banner",
    title: "TECHNOPHILIA 2.0",
    description:
      "TECHNOPHILIA 2.0 set a strong benchmark with its dynamic challenges and enthusiastic participation, fostering a competitive spirit and technical growth among students.",
  },
];

const Reviews = () => {
  const [activeBanner, setActiveBanner] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [descBanner, setDescBanner] = useState(null);
  const animatingRef = useRef(false);
  const containerRef = useRef(null);

  // Auto-cycle banners every 5 seconds (only when description panel is closed)
  useEffect(() => {
    if (showDescription) return;
    const timer = setInterval(() => {
      if (!animatingRef.current) {
        setActiveBanner((prev) => (prev + 1) % banners.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [showDescription]);

  // Animate on banner switch
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const imgs = container.querySelectorAll(".banner-slide");
    if (imgs.length < 2) return;

    animatingRef.current = true;

    const outImg = imgs[imgs.length - 2];
    const inImg = imgs[imgs.length - 1];

    gsap.fromTo(
      outImg,
      { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" },
      {
        opacity: 0,
        clipPath: "inset(0% 100% 0% 0%)",
        duration: 0.8,
        ease: "power4.inOut",
      }
    );

    gsap.fromTo(
      inImg,
      { opacity: 1, clipPath: "inset(0% 0% 0% 100%)" },
      {
        opacity: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.8,
        ease: "power4.inOut",
        delay: 0.1,
        onComplete: () => {
          const allSlides = container.querySelectorAll(".banner-slide");
          for (let i = 0; i < allSlides.length - 1; i++) {
            allSlides[i].remove();
          }
          animatingRef.current = false;
        },
      }
    );
  }, [activeBanner]);

  const handleBannerClick = (index) => {
    // If clicking other thumbnail, switch banner first
    if (index !== activeBanner && !animatingRef.current) {
      setActiveBanner(index);
    }
    // Open description for the clicked banner
    setDescBanner(banners[index]);
    setShowDescription(true);
  };

  const closeDescription = () => {
    setShowDescription(false);
    setDescBanner(null);
  };

  return (
    <section className="reviews reviews--banners">
      {/* Main Banner Display */}
      <div className="banner-container" ref={containerRef}>
        <img
          key={activeBanner}
          src={banners[activeBanner].image}
          alt={banners[activeBanner].alt}
          className="banner-slide"
        />
      </div>

      {/* Description Overlay */}
      {showDescription && descBanner && (
        <div className="banner-desc-overlay" onClick={closeDescription}>
          <div
            className="banner-desc-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="banner-desc-close" onClick={closeDescription}>
              ✕
            </button>
            <h2 className="banner-desc-title">{descBanner.title}</h2>
            <p className="banner-desc-body">{descBanner.description}</p>
          </div>
        </div>
      )}

      {/* Thumbnail selectors */}
      <div className="reviews-list">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`review-thumbnail ${index === activeBanner ? "active" : ""}`}
            onClick={() => handleBannerClick(index)}
          >
            <img src={banner.image} alt={banner.alt} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Reviews;
