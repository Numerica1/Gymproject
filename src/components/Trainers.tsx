"use client";

import { useState } from "react";
import Link from "next/link";
import { useGymTrainers } from "../data/gymData";
import TrainerBookingModal from "./TrainerBookingModal";

type TeamMember = {
  image: string;
  name: string;
  specialty: string;
  certificate?: string;
  experienceYears?: string;
};

type TeamCarouselProps = {
  title: string;
  members: TeamMember[];
  onBookNow: (trainerName: string) => void;
  canBook?: boolean;
};

function TeamCarousel({ title, members, onBookNow, canBook = false }: TeamCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!members || members.length === 0) return null;

  // Ensure we don't index out of bounds if members count changed
  const safeActiveIndex = activeIndex % members.length;

  // Show up to 3 members, wrapping around if needed
  const visibleMembers = Array.from({ length: Math.min(3, members.length) }, (_, index) => {
    return members[(safeActiveIndex + index) % members.length];
  });

  const showPreviousMember = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? members.length - 1 : currentIndex - 1
    );
  };

  const showNextMember = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % members.length);
  };

  return (
    <div className="teamGroup">
      <h3 className="teamGroupTitle">{title}</h3>
      <div className="trainerCarousel">
        {members.length > 3 && (
          <button
            className="trainerControl trainerControlPrev"
            type="button"
            onClick={showPreviousMember}
            aria-label={`Show previous ${title}`}
            id={`carousel-${title.toLowerCase().replace(/\s+/g, "-")}-prev-btn`}
          >
            &lt;&lt;
          </button>
        )}
        <div className="trainerGrid" style={{ justifyContent: "center" }}>
          {visibleMembers.map((member) => (
            <article className="trainerCard" key={member.name}>
              <img src={member.image || "/images/fitness-logo.jpg"} alt="" />
              <div className="trainerCardBody">
                <h3>{member.name}</h3>
                {member.specialty && <p>{member.specialty}</p>}
                {(member.specialty || member.certificate || member.experienceYears) && (
                  <span className="trainerGoldRule" aria-hidden="true" />
                )}
                {(member.certificate || member.experienceYears || member.specialty) && (
                  <ul className="trainerCredentialList">
                    {member.certificate && <li>{member.certificate}</li>}
                    {member.experienceYears && <li>{member.experienceYears}</li>}
                    {member.specialty && <li>{member.specialty}</li>}
                  </ul>
                )}
                {canBook && (
                <button
                  type="button"
                  className="trainerBookButton"
                  style={{ border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  onClick={() => onBookNow(member.name)}
                >
                  Book Now <span aria-hidden="true">→</span>
                </button>
                )}
              </div>
            </article>
          ))}
        </div>
        {members.length > 3 && (
          <button
            className="trainerControl trainerControlNext"
            type="button"
            onClick={showNextMember}
            aria-label={`Show next ${title}`}
            id={`carousel-${title.toLowerCase().replace(/\s+/g, "-")}-next-btn`}
          >
            &gt;&gt;
          </button>
        )}
      </div>
    </div>
  );
}

interface TrainersProps {
  isPageHeader?: boolean;
}

export default function Trainers({ isPageHeader = false }: TrainersProps) {
  const Heading = isPageHeader ? "h1" : "h2";
  const [allTrainers] = useGymTrainers();

  const [selectedTrainer, setSelectedTrainer] = useState<string | undefined>(undefined);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookNow = (trainerName: string) => {
    setSelectedTrainer(trainerName);
    setIsBookingOpen(true);
  };

  // Filter list of trainers dynamically by category
  const mainTrainers = allTrainers.filter((t) => t.category === "Trainers");
  
  const categories = [
    { title: "Yoga Instructor", key: "Yoga Instructor", canBook: true },
    { title: "Front Desk", key: "Front Desk", canBook: false },
    { title: "Housekeeping", key: "Housekeeping", canBook: false },
    { title: "Franchise Manager", key: "Franchise Manager", canBook: false },
  ];

  const teamGroups = categories.map((cat) => ({
    title: cat.title,
    members: allTrainers.filter((t) => t.category === cat.key),
    canBook: cat.canBook,
  })).filter((group) => group.members.length > 0);

  return (
    <section id="trainers" className="section trainersSection">
      <div className="sectionHeader">
        <p className="eyebrow dark">Our Teams</p>
        <Heading>Meet The Fitness Bhaktapur Team</Heading>
      </div>
      <div className="teamGroups">
        {mainTrainers.length > 0 && (
          <TeamCarousel title="Trainers" members={mainTrainers} onBookNow={handleBookNow} canBook />
        )}
        {teamGroups.map((group) => (
          <TeamCarousel
            title={group.title}
            members={group.members}
            key={group.title}
            onBookNow={handleBookNow}
            canBook={group.canBook}
          />
        ))}
      </div>
      <TrainerBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialTrainerName={selectedTrainer}
      />
    </section>
  );
}
