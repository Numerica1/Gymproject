"use client";

import { useState, FormEvent } from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";

import { useGymSettings, useGymContactMessages, type ContactMessage } from "../data/gymData";

/** Simple browser-compatible UUID generator (no external dep needed) */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function ContactForm() {
  const [content] = useGymSettings();
  const [contactMessages, setContactMessages] = useGymContactMessages();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Nepal: 10 digits, optionally prefixed with +977 or 977. Strip prefix then validate.
  const validateNepalPhone = (value: string): string => {
    const stripped = value.trim().replace(/^(\+977|977)/, "").replace(/\s/g, "");
    if (!stripped) return "Phone number is required.";
    if (!/^[9][6-9][0-9]{8}$/.test(stripped))
      return "Enter a valid Nepali number (e.g. 9812345678 or +977 9812345678).";
    return "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validateNepalPhone(phone);
    if (err) { setPhoneError(err); return; }
    setIsSending(true);

    const id = generateId();
    const date = new Date().toISOString();

    const newMsg: ContactMessage = {
      id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      date,
      status: "New",
    };

    // 1. Save to localStorage so admin panel updates immediately (optimistic)
    setContactMessages([newMsg, ...contactMessages]);

    // 2. Also persist to Supabase via the API route (fire-and-forget – failures are silent to UX)
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
    } catch {
      // Backend unreachable – localStorage copy is the fallback
    }

    setIsSending(false);
    setSubmitted(true);
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
  };


  return (
    <section className="contactPageSection">
      <div className="contactPageGrid">
        {/* Left Column: Info & Map */}
        <div className="contactInfoCol" id="contact-info-column">
          <div>
            <h2 className="contactInfoTitle">You Can Find Us At</h2>
            
            <div className="contactInfoColBody" style={{ display: "grid", gap: "24px" }}>
              <div className="contactInfoGroup">
                <label>Email</label>
                <a href={`mailto:${content.email}`}>{content.email}</a>
              </div>

              <div className="contactInfoGroup">
                <label>LOCATION</label>
                <p>{content.address}</p>
              </div>

              <div className="contactInfoGroup">
                <label>Phone Number</label>
                <a href={`tel:${content.phone.replace(/\s+/g, "")}`}>{content.phone}</a>
              </div>
            </div>
          </div>

          <div>
            <div className="contactSocialRow" aria-label="Social links">
              <a
                href="https://www.facebook.com/fitness_bkt"
                target="_blank"
                rel="noopener noreferrer"
                className="contactSocialCircle"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://www.instagram.com/Fitness_bkt"
                target="_blank"
                rel="noopener noreferrer"
                className="contactSocialCircle"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.tiktok.com/@fitness_bkt"
                target="_blank"
                rel="noopener noreferrer"
                className="contactSocialCircle"
                aria-label="TikTok"
              >
                <FaTiktok />
              </a>
            </div>
          </div>

          <div className="contactMapWrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.8647007788417!2d85.4298132!3d27.6713825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1aab9b66236b%3A0x8e5f2cf29d0092c4!2sBhaktapur%2C+Nepal!5e0!3m2!1sen!2snp!4v1717894500000!5m2!1sen!2snp"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Fitness Bhaktapur Gym Map Location"
            ></iframe>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="contactFormCol" id="contact-form-column">
          <div>
            <h2 className="contactFormTitle">Get In Touch</h2>
            <p className="contactFormDesc">
              If you want to learn more about us or have some queries, please send us a message here. We will get in touch with you as soon as possible.
            </p>
          </div>

          {submitted ? (
            <div className="contactSuccessMsg" id="contact-success-message">
              <strong>Thank you for contacting us!</strong>
              <p style={{ margin: "8px 0 0", color: "inherit" }}>
                We have received your message and will get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contactForm">
              <div className="contactFormRow">
                <div className="contactInputGroup">
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="contactInputGroup">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="contactFormRow">
                <div className="contactInputGroup">
                  <input
                    type="tel"
                    placeholder="Phone No."
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError(validateNepalPhone(e.target.value));
                    }}
                    required
                    style={phoneError ? { borderColor: "#f87171" } : {}}
                  />
                  {phoneError && (
                    <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "4px", display: "block" }}>
                      {phoneError}
                    </span>
                  )}
                </div>
                <div className="contactInputGroup">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="contactInputGroup">
                <textarea
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="yellowSubmitBtn" id="contact-submit-button" disabled={isSending}>
                {isSending ? "Sending..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
