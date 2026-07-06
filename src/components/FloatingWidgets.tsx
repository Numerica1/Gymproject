"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaXmark,
  FaTiktok,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaPaperPlane,
} from "react-icons/fa6";

import { useGymSettings } from "../data/gymData";

export default function FloatingWidgets() {
  const pathname = usePathname();
  const [content] = useGymSettings();
  const [isSocialOpen, setIsSocialOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const socialLinks = [
    {
      icon: <FaTiktok />,
      url: "https://www.tiktok.com/@fitness_bkt",
      label: "TikTok",
      id: "social-tiktok-link",
    },
    {
      icon: <FaInstagram />,
      url: "https://www.instagram.com/Fitness_bkt",
      label: "Instagram",
      id: "social-instagram-link",
    },
    {
      icon: <FaFacebookF />,
      url: "https://www.facebook.com/fitness_bkt",
      label: "Facebook",
      id: "social-facebook-link",
    },
  ];

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const encodedMessage = encodeURIComponent(chatMessage);
    const cleanPhone = content.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
    setChatMessage("");
    setIsChatOpen(false);
  };

  return (
    <>
      {/* 1. Floating Sticky Social Sidebar */}
      <div className="floating-social-container" id="floating-social-sidebar">
        {/* Toggle Button (Black Box) */}
        <button
          className="social-toggle-btn"
          onClick={() => setIsSocialOpen(!isSocialOpen)}
          aria-label={isSocialOpen ? "Close social links" : "Open social links"}
          id="social-toggle-button"
        >
          <motion.div
            animate={{ rotate: isSocialOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isSocialOpen ? <FaXmark /> : <FaPlus />}
          </motion.div>
        </button>

        {/* Yellow Social Content */}
        <AnimatePresence>
          {isSocialOpen && (
            <motion.div
              className="social-links-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-item"
                  title={link.label}
                  id={link.id}
                >
                  {link.icon}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. WhatsApp Support Widget */}
      <div className="whatsapp-widget-container">
        {/* Need Help Tooltip (Visible when Chat is Closed) */}
        <AnimatePresence>
          {!isChatOpen && (
            <motion.div
              className="whatsapp-tooltip"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: 0.5 }}
              onClick={() => setIsChatOpen(true)}
              id="whatsapp-tooltip-bubble"
            >
              Need Help?
              <div className="tooltip-arrow" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Widget Toggle Button */}
        <button
          className="whatsapp-bubble-btn"
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label="Toggle WhatsApp chat window"
          id="whatsapp-toggle-button"
        >
          {isChatOpen ? <FaXmark /> : <FaWhatsapp />}
        </button>

        {/* Floating Chat Box */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              className="whatsapp-chat-box"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Header */}
              <div className="chat-box-header">
                <div className="chat-header-info">
                  <div className="whatsapp-avatar">
                    <FaWhatsapp />
                    <span className="online-indicator" />
                  </div>
                  <div>
                    <h4>{content.gymName}</h4>
                    <span>Typically replies in minutes</span>
                  </div>
                </div>
                <button
                  className="chat-close-btn"
                  onClick={() => setIsChatOpen(false)}
                  aria-label="Close chat window"
                  id="whatsapp-chat-close-button"
                >
                  <FaXmark />
                </button>
              </div>

              {/* Chat Body */}
              <div className="chat-box-body">
                <div className="chat-bubble-received">
                  <p>
                    Hi there! 👋 Welcome to Fitness Bhaktapur. How can we help you
                    today? Feel free to ask about our memberships, programs, or trainers!
                  </p>
                  <span className="chat-timestamp">Just now</span>
                </div>
              </div>

              {/* Chat Footer */}
              <form onSubmit={handleSendWhatsApp} className="chat-box-footer">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="chat-input"
                  id="whatsapp-chat-input-field"
                  required
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  aria-label="Send message to WhatsApp"
                  id="whatsapp-chat-send-button"
                >
                  <FaPaperPlane />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
