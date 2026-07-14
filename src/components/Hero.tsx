"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowRight, FaBolt } from "react-icons/fa6";
import { useHomePageContent } from "../data/gymData";

const SLIDE_DURATION = 6000; // ms each slide is shown
const FADE_DURATION = 1200;  // ms crossfade

export default function Hero() {
  const [content] = useHomePageContent();
  const slides = content.slides.filter(Boolean).slice(0, 3);
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setFading(false);
      }, FADE_DURATION);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (idx: number) => {
    if (idx === current) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, FADE_DURATION);
  };

  return (
    <section id="home" className="hero">
      {/* Background slides */}
      <div className="heroSlides" aria-hidden="true">
        {slides.map((slide, index) => (
          <span
            key={slide}
            className={`heroSlide${index === current ? " heroSlide--active" : ""}${fading && index === current ? " heroSlide--fading" : ""}`}
            style={{ backgroundImage: `url("${slide}")` }}
          />
        ))}
      </div>

      {/* Slide dots */}
      {slides.length > 1 && (
        <div className="heroDots" aria-label="Slideshow navigation">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`heroDot${i === current ? " heroDot--active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className="heroContent">
        <p className="eyebrow">
          <FaBolt /> {content.eyebrow}
        </p>
        <h1>
          <span>{content.headingFirstLine}</span>
          <span>{content.headingSecondLine}</span>
        </h1>
        <p className="heroText">{content.description}</p>
        <div className="heroActions">
          <Link className="primaryButton" href={content.primaryButtonLink || "/services"}>
            {content.primaryButtonLabel || "View Programs"} <FaArrowRight />
          </Link>
          <Link className="secondaryButton" href={content.secondaryButtonLink || "/join"}>
            {content.secondaryButtonLabel || "Join Now"}
          </Link>
        </div>
        <div className="stats">
          <div>
            <strong>24/7</strong>
            <span>Flexible hours</span>
          </div>
          <div>
            <strong>4</strong>
            <span>Featured programs</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Membership plans</span>
          </div>
        </div>
      </div>
    </section>
  );
}
