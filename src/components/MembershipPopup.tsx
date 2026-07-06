"use client";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function MembershipPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* ── auto-open after 5 s ── */
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  /* ── focus email input when modal opens ── */
  useEffect(() => {
    if (isOpen && !submitted) {
      const t = setTimeout(() => emailRef.current?.focus(), 600);
      return () => clearTimeout(t);
    }
  }, [isOpen, submitted]);

  /* ── close on Escape ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closePopup();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  /* ── lock body scroll when open ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function closePopup() {
    setIsOpen(false);
  }

  function isValidEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      emailRef.current?.focus();
      return;
    }
    setLoading(true);
    /* ── store submission (replace with real API call) ── */
    await new Promise((res) => setTimeout(res, 1400));
    console.log("📋 New membership offer submission:", {
      email: email.trim(),
      timestamp: new Date().toISOString(),
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("fitness-claimed-offer-email", email.trim());
    }
    setLoading(false);
    setSubmitted(true);
  }

  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        ref={overlayRef}
        className="popup-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-heading"
        onClick={(e) => { if (e.target === overlayRef.current) closePopup(); }}
      >
        <div className="popup-modal">

          {/* ── LEFT: Image column ── */}
          <div className="popup-image-col">
            <span className="popup-badge">🔥 Limited Time</span>
            <Image
              src="/images/gym-promo.jpg"
              alt="Fit female gym member holding a dumbbell in a dark gym"
              fill
              style={{ objectFit: "cover", objectPosition: "center top" }}
              priority
            />
          </div>

          {/* ── RIGHT: Content column ── */}
          <div className="popup-content-col">

            {/* Close button */}
            <button
              id="popup-close-btn"
              className="popup-close-btn"
              onClick={closePopup}
              aria-label="Close popup"
            >
              &#x2715;
            </button>

            {!submitted ? (
              /* ── FORM STATE ── */
              <>
                <p className="popup-eyebrow">Exclusive Offer</p>

                <h2 className="popup-heading" id="popup-heading">
                  <span className="popup-heading-white">WELCOME</span>
                  <br />
                  <span className="popup-heading-orange">OFFER!</span>
                </h2>

                {/* Promo box */}
                <div className="popup-promo-box">
                  <div className="popup-promo-icon" aria-hidden="true">🎁</div>
                  <div className="popup-promo-text">
                    <strong>Get 15% Off Your First Membership</strong>
                    <span>Exclusive for New Members Only!</span>
                  </div>
                </div>

                {/* Form */}
                <form className="popup-form" onSubmit={handleSubmit} noValidate>
                  <div className={`popup-input-wrapper${shake ? " popup-shake" : ""}`}>
                    <svg
                      className="popup-input-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                      ref={emailRef}
                      id="popup-email"
                      type="email"
                      className="popup-input"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      aria-label="Email address"
                    />
                  </div>

                  <button
                    id="popup-cta-btn"
                    type="submit"
                    className="popup-cta-btn"
                    disabled={loading}
                    aria-label="Claim 15% off offer"
                  >
                    {loading ? (
                      <span className="popup-spinner" role="status" aria-label="Loading" />
                    ) : (
                      "CLAIM OFFER NOW"
                    )}
                  </button>

                  <p className="popup-privacy">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    We respect your privacy. No spam, ever.
                  </p>
                </form>
              </>
            ) : (
              /* ── SUCCESS STATE ── */
              <div className="popup-success" aria-live="polite">
                <div className="popup-success-icon" aria-hidden="true">✓</div>
                <h3>You&apos;re In! 🎉</h3>
                <p>Check your inbox — your exclusive 15% off code is on its way.</p>
                <div className="popup-coupon-code">GYM15OFF</div>
                <p className="popup-coupon-note">Use this code at checkout</p>

                {/* Join Now CTA */}
                <Link
                  href={`/join?email=${encodeURIComponent(email)}`}
                  id="popup-join-now-btn"
                  className="popup-join-btn"
                  onClick={closePopup}
                  aria-label="Join now with 15% off"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Join Now &amp; Save 15%
                </Link>

                <button
                  className="popup-maybe-later"
                  onClick={closePopup}
                  aria-label="Close popup"
                >
                  Maybe Later
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
