"use client";

import { FaArrowLeft, FaArrowRight, FaBolt, FaClock, FaDumbbell, FaFire, FaHeart, FaOm, FaStar, FaThumbsUp, FaUsers } from "react-icons/fa6";
import { useState, type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGymClasses } from "../data/gymData";

interface FeaturesProps {
  isPageHeader?: boolean;
}

const visibleProgramCount = 4;

export default function Features({ isPageHeader = false }: FeaturesProps) {
  const Heading = isPageHeader ? "h1" : "h2";
  const [firstVisibleProgram, setFirstVisibleProgram] = useState(0);
  const [classes] = useGymClasses();

  // Use admin-added classes instead of static programs
  const visiblePrograms = classes.length > 0 
    ? (classes.length <= visibleProgramCount 
        ? classes 
        : Array.from({ length: visibleProgramCount }, (_, index) => {
            return classes[(firstVisibleProgram + index) % classes.length];
          })
      )
    : [];

  const showPreviousPrograms = () => {
    if (classes.length <= visibleProgramCount) return;
    setFirstVisibleProgram((current) => (current - 1 + classes.length) % classes.length);
  };

  const showNextPrograms = () => {
    if (classes.length <= visibleProgramCount) return;
    setFirstVisibleProgram((current) => (current + 1) % classes.length);
  };

  // Only show carousel navigation buttons if we have more programs than the visible count
  const showNavigation = classes.length > visibleProgramCount;

  const tagIcons: Record<string, ReactElement> = {
    "Popular": <FaFire />,
    "New": <FaStar />,
    "Top Rated": <FaStar />,
    "Fat Burn": <FaThumbsUp />,
    "Strength": <FaDumbbell />,
    "Cardio": <FaHeart />,
    "Yoga": <FaOm />,
    "HIIT": <FaBolt />,
  };

  return (
    <section id="programs" className="section featuredProgramsPremium">
      <div className="featuredProgramsHeader">
        <p className="featuredProgramsEyebrow">Train with purpose</p>
        <Heading className="featuredProgramsTitle">Featured <em>Programs</em></Heading>
        <p className="featuredProgramsDescription">
          Expert-led sessions built to push your limits, sharpen your focus, and deliver lasting results.
        </p>
      </div>

      <div className="featuredProgramCarousel">
        {showNavigation && (
          <button
            type="button"
            className="programCarouselBtn programCarouselPrev"
            aria-label="Show previous featured programs"
            onClick={showPreviousPrograms}
          >
            <FaArrowLeft />
          </button>
        )}

        <div className="programGrid" style={{ justifyContent: "center" }}>
          {visiblePrograms.length > 0 ? (
            visiblePrograms.map((program, idx) => {
              const slug = program.className.toLowerCase().replace(/\s+/g, "-");
              const category = program.tag || ["Popular", "New", "Top Rated", "Fat Burn"][idx % 4];
              const difficulty = program.intensity || ["Beginner", "Intermediate", "Advanced", "Intermediate"][idx % 4];
              const duration = program.duration || "60 min";
              const memberCount = Number(String(program.capacity || "").replace(/\D/g, "")) || 20;
              return (
                <article className="premiumProgramCard" key={`${program.className}-${idx}`} id={`program-card-${slug}`}>
                  <div className="premiumProgramImageWrap">
                    <Image src={program.image || "/images/fitness-logo.jpg"} alt={program.className} className="premiumProgramImage" width={600} height={440} unoptimized />
                    <div className="premiumProgramGradient" />
                    <span className="premiumProgramBadge">{tagIcons[category] || <FaFire />} {category}</span>
                    <span className="premiumProgramRating"><FaStar /> 4.8</span>
                  </div>
                  <div className="premiumProgramBody">
                    <h3>{program.className}</h3>
                    <p>{program.description || "A focused training experience designed to build strength, confidence, and momentum."}</p>
                    <div className="premiumProgramDetails">
                      <span><FaClock /> {duration}</span>
                      <span><FaDumbbell /> {difficulty}</span>
                      <span><FaUsers /> {memberCount}+ members</span>
                    </div>
                    <div className="premiumProgramFooter">
                      <span>with <strong>{program.trainer || "Fitness Bhaktapur Coach"}</strong></span>
                      <Link href={`/programs/${slug}`} className="premiumProgramCta">Learn More <FaArrowRight /></Link>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#71717a" }}>
              <p>No programs available yet. Admin will add programs soon.</p>
            </div>
          )}
        </div>

        {showNavigation && (
          <button
            type="button"
            className="programCarouselBtn programCarouselNext"
            aria-label="Show next featured programs"
            onClick={showNextPrograms}
          >
            <FaArrowRight />
          </button>
        )}
      </div>
    </section>
  );
}
