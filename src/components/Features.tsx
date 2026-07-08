"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaDumbbell } from "react-icons/fa6";
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

  return (
    <section id="programs" className="section">
      <div className="sectionHeader">
        <p className="eyebrow dark">Our Programs</p>
        <Heading className="programsHeading">Featured Programs</Heading>
        <p className="programsDescription">
          Explore our wide range of fitness programs designed to help you
          achieve your goals and transform your life.
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
            &lt;&lt;
          </button>
        )}

        <div className="programGrid" style={{ justifyContent: "center" }}>
          {visiblePrograms.length > 0 ? (
            visiblePrograms.map((program, idx) => {
              const slug = program.className.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  href={`/programs/${slug}`}
                  className="programCard"
                  key={`${program.className}-${idx}`}
                  id={`program-card-${slug}`}
                >
                  <Image src={program.image || "/images/fitness-logo.jpg"} alt={program.className} className="programImage" width={400} height={190} unoptimized />
                  <div className="cardIcon"><FaDumbbell /></div>
                  <h3>{program.className}</h3>
                  <span className="textLink programLearnMoreBtn">
                    Learn More <FaArrowRight />
                  </span>
                </Link>
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
            &gt;&gt;
          </button>
        )}
      </div>
    </section>
  );
}
