"use client";

import { useState } from "react";
import { useGymTrainers } from "../data/gymData";
import Image from "next/image";
import TrainerBookingModal from "./TrainerBookingModal";

export default function AboutTrainers() {
  const [allTrainers] = useGymTrainers();
  const [selectedTrainer, setSelectedTrainer] = useState<string | undefined>(undefined);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Filter only trainers with the category "Trainers" (head trainers)
  const mainTrainers = allTrainers.filter((t) => t.category === "Trainers");

  if (!mainTrainers || mainTrainers.length === 0) {
    return null; // Don't show default trainers; only show when database has them
  }

  const handleBookClick = (trainerName: string) => {
    setSelectedTrainer(trainerName);
    setIsBookingOpen(true);
  };

  return (
    <section className="about-trainers-section">
      <div className="about-trainers-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: "0.06em", textAlign: "center", textTransform: "uppercase", marginBottom: "12px", color: "#fff" }}>
          OUR <span style={{ color: "#f05a28" }}>HEAD TRAINERS</span>
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{ height: "2px", width: "32px", background: "#f05a28", borderRadius: "2px" }} />
          <svg viewBox="0 0 24 10" width="28" height="12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="3" width="5" height="4" rx="1" fill="#f05a28"/>
            <rect x="19" y="3" width="5" height="4" rx="1" fill="#f05a28"/>
            <rect x="5" y="4" width="14" height="2" fill="#f05a28"/>
          </svg>
          <div style={{ height: "2px", width: "32px", background: "#f05a28", borderRadius: "2px" }} />
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", textAlign: "center", margin: 0 }}>
          Learn from the best. Our certified trainers are here to guide you on your fitness journey.
        </p>
      </div>
      <div className="about-trainers-grid">
        {mainTrainers.map((trainer) => (
          <div className="about-trainer-card" key={trainer.name}>
            <Image
              src={trainer.image || "/images/fitness-logo.jpg"}
              alt={trainer.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="about-trainer-overlay">
              <h3>{trainer.name}</h3>
              <p>{trainer.specialty}</p>
              <button
                type="button"
                className="aboutTrainerBookBtn"
                onClick={() => handleBookClick(trainer.name)}
              >
                Book Now →
              </button>
            </div>
          </div>
        ))}
      </div>

      <TrainerBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialTrainerName={selectedTrainer}
      />

      <style jsx>{`
        .about-trainer-card:hover :global(.about-trainer-overlay) {
          pointer-events: auto;
        }
        .aboutTrainerBookBtn {
          margin-top: 12px;
          background: #ffe500;
          color: #000;
          border: none;
          padding: 8px 16px;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          text-transform: uppercase;
          transition: all 0.2s ease;
          display: inline-block;
          font-family: inherit;
        }

        .aboutTrainerBookBtn:hover {
          background: #f05a28;
          color: #fff;
          transform: translateY(-1px);
        }
      `}</style>
    </section>
  );
}
