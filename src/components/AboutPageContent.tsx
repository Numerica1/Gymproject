"use client";

import Image from "next/image";
import Link from "next/link";
import { useAboutPageContent } from "../data/gymData";

export default function AboutPageContent() {
  const [content] = useAboutPageContent();

  return (
    <>
      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="abt-hero">
        <div className="abt-hero-text">
          <h1 className="abt-hero-title">
            ABOUT <span className="abt-accent">US</span>
          </h1>
          <p className="abt-hero-body">
            At FITZONE, we believe fitness is more than just workouts – it's a
            way of life. We are here to inspire, motivate, and help you become
            the strongest version of yourself.
          </p>
        </div>
        <div className="abt-hero-image-wrap">
          <Image
            src={content.introImage}
            alt="Fitness Bhaktapur Trainers"
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized
          />
        </div>
      </section>

      {/* ── MISSION / VISION / MOTTO ─────────────────────────────── */}
      <section className="abt-mv-section">
        {/* Mission card */}
        <div className="abt-mv-card">
          <div className="abt-mv-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" fill="currentColor"/>
              <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2"/>
              <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h2 className="abt-mv-heading">OUR <span className="abt-accent">MISSION</span></h2>
          <p className="abt-mv-body">
            To empower individuals to achieve their fitness goals by providing
            the best facilities, expert guidance, and a supportive community.
          </p>
        </div>

        {/* Vision card */}
        <div className="abt-mv-card">
          <div className="abt-mv-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h2 className="abt-mv-heading">OUR <span className="abt-accent">VISION</span></h2>
          <p className="abt-mv-body">
            To be the leading fitness destination known for transforming lives
            and building a healthier, stronger, and happier society.
          </p>
        </div>

        {/* Motto panel */}
        <div className="abt-motto-panel">
          <div className="abt-motto-image-wrap">
            <Image
              src={content.missionImageTwo}
              alt="Gym discipline"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
            />
          </div>
          <div className="abt-motto-overlay">
            <p className="abt-motto-text">DISCIPLINE<br/>TODAY<br/>STRENGTH<br/>TOMORROW</p>
          </div>
        </div>
      </section>

      {/* ── VALUES + STATS ROW ───────────────────────────────────── */}
      <section className="abt-vs-row">
        {/* Values box */}
        <div className="abt-values-box">
          <h2 className="abt-values-title">
            OUR <span className="abt-accent">VALUES</span>
          </h2>
          <div className="abt-values-grid">
            <div className="abt-value-item">
              <div className="abt-value-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#f05a28" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h3>QUALITY</h3>
              <p>We provide top-quality equipment and services to ensure the best fitness experience.</p>
            </div>
            <div className="abt-value-item">
              <div className="abt-value-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#f05a28" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h3>COMMITMENT</h3>
              <p>We are committed to your progress and support you every step of the way.</p>
            </div>
            <div className="abt-value-item">
              <div className="abt-value-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#f05a28" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="#f05a28" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#f05a28" strokeWidth="2"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#f05a28" strokeWidth="2"/>
                </svg>
              </div>
              <h3>COMMUNITY</h3>
              <p>We believe in the power of community that motivates and drives results.</p>
            </div>
            <div className="abt-value-item">
              <div className="abt-value-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="30" height="30">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#f05a28" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h3>INTEGRITY</h3>
              <p>We operate with honesty and transparency in everything we do.</p>
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="abt-stats-panel">
          <div className="abt-stat-item">
            <div className="abt-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span className="abt-stat-number">5000+</span>
            <span className="abt-stat-label">HAPPY MEMBERS</span>
          </div>
          <div className="abt-stat-item">
            <div className="abt-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <path d="M6 4h12M6 4v16M18 4v16M4 8h2M18 8h2M4 12h2M18 12h2M4 16h2M18 16h2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="abt-stat-number">50+</span>
            <span className="abt-stat-label">EXPERT TRAINERS</span>
          </div>
          <div className="abt-stat-item">
            <div className="abt-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="white" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span className="abt-stat-number">200+</span>
            <span className="abt-stat-label">WEEKLY CLASSES</span>
          </div>
          <div className="abt-stat-item">
            <div className="abt-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <span className="abt-stat-number">10+</span>
            <span className="abt-stat-label">YEARS OF EXCELLENCE</span>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section className="abt-cta-banner">
        <div className="abt-cta-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
            <circle cx="12" cy="12" r="10" stroke="#f05a28" strokeWidth="2"/>
            <path d="M8 12l3 3 5-6" stroke="#f05a28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="abt-cta-text">
          <h2>READY TO TRANSFORM YOUR LIFE?</h2>
          <p>Join FITZONE today and start your journey towards a stronger, healthier you!</p>
        </div>
        <Link href="/join" className="abt-cta-btn">
          JOIN NOW &nbsp;→
        </Link>
      </section>
    </>
  );
}
