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
        <h2 style={{ color: "#f05a28", fontSize: "30px", fontWeight: 700, letterSpacing: "0.1em", textAlign: "center", textTransform: "uppercase", marginBottom: "12px" }}>
          Our Head Trainers
        </h2>
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
