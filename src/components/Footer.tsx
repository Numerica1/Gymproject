"use client";

import Link from "next/link";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLocationDot,
  FaPhone,
  FaTiktok,
} from "react-icons/fa6";

import { useGymSettings } from "../data/gymData";

export default function Footer() {
  const [content] = useGymSettings();

  return (
    <footer className="footer">
      <div className="footerBrand">
        <Link className="brand" href="/">
          <span>F</span> {content.gymName}
        </Link>
        <p>Transform Your Body, Transform Your Life</p>
      </div>
      <div className="footerLinks">
        <h3>Quick Links</h3>
        <Link href="/">Home</Link>
        <Link href="/services">Program</Link>
        <Link href="/trainers">Trainers</Link>
        <Link href="/membership">Membership</Link>
      </div>
      <div className="footerLinks">
        <h3>Policy</h3>
        <Link href="/terms" id="footer-link-terms">Terms & Conditions</Link>
        <Link href="/privacy" id="footer-link-privacy">Privacy Policy</Link>
      </div>
      <div className="footerLinks footerContact">
        <h3>Contact</h3>
        <address>
          <span className="footerContactLine">
            <FaLocationDot />
            <span>{content.address}</span>
          </span>
          <a className="footerContactLine" href={`tel:${content.phone.replace(/\s+/g, "")}`}>
            <FaPhone />
            <span>{content.phone}</span>
          </a>
          <a className="footerContactLine" href={`mailto:${content.email}`}>
            <FaEnvelope />
            <span>{content.email}</span>
          </a>
        </address>
        <div className="footerSocials" aria-label="Social links">
          <a href="https://www.instagram.com/Fitness_bkt" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="https://www.facebook.com/fitness_bkt" aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="https://www.tiktok.com/@fitness_bkt" aria-label="TikTok">
            <FaTiktok />
          </a>
        </div>
      </div>
      <p className="copyright">© 2026 Fitness Gym. All Rights Reserved.</p>
    </footer>
  );
}
