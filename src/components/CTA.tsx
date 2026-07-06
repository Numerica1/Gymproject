"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaArrowRight,
  FaEnvelope,
  FaInstagram,
  FaLocationDot,
  FaPhone,
} from "react-icons/fa6";
import ContactForm from "./ContactForm";

import { useGymSettings } from "../data/gymData";

interface CTAProps {
  isPageHeader?: boolean;
}

export default function CTA({ isPageHeader = false }: CTAProps) {
  const [showForm, setShowForm] = useState(false);
  const Heading = isPageHeader ? "h1" : "h2";
  const [content] = useGymSettings();

  if (showForm) {
    return <ContactForm />;
  }

  return (
    <section id="contact" className="contact">
      <div>
        <p className="eyebrow">
          <FaArrowRight /> Ready to Transform Your Body?
        </p>
        <Heading>Join our community and start achieving your fitness goals today.</Heading>
        <div className="heroActions compact">
          <Link
            className="primaryButton"
            href="/join"
            id="cta-join-button"
          >
            Join Now <FaArrowRight />
          </Link>
          <button
            type="button"
            className="secondaryButton"
            id="cta-contact-button"
            onClick={() => setShowForm(true)}
            style={{ cursor: "pointer", border: "1px solid rgba(255, 255, 255, 0.42)", background: "transparent" }}
          >
            Contact Us
          </button>
        </div>
      </div>
      <div className="contactBox">
        <p>
          <FaPhone /> {content.phone}
        </p>
        <p>
          <FaEnvelope /> {content.email}
        </p>
        <p>
          <FaInstagram /> Fitness_bkt
        </p>
        <p>
          <FaLocationDot /> {content.address}
        </p>
        <a
          className="primaryButton"
          href={`tel:${content.phone.replace(/\s+/g, "")}`}
          id="cta-call-button"
        >
          Call Now <FaArrowRight />
        </a>
      </div>
    </section>
  );
}
