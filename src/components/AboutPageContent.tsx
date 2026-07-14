"use client";

import Image from "next/image";
import { useAboutPageContent } from "../data/gymData";

export default function AboutPageContent() {
  const [content] = useAboutPageContent();

  return (
    <>
      <section className="about-intro-section">
        <div className="about-intro-text">
          <p style={{ color: "#f05a28", fontSize: "16px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>{content.introEyebrow}</p>
          <h1 style={{ fontSize: "clamp(28px, 3.5vw, 54px)", lineHeight: "1.1", textTransform: "uppercase", whiteSpace: "pre-line" }}>{content.introTitle}</h1>
          <p>{content.introBodyOne}</p>
          <p>{content.introBodyTwo}</p>
        </div>
        <div className="about-intro-image-wrapper">
          <Image src={content.introImage} alt="Fitness Bhaktapur Gym Floor" className="about-intro-image" fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 50vw" priority unoptimized />
        </div>
      </section>
      <section className="about-mission-section">
        <div className="about-mission-images">
          <div className="about-mission-img-card"><Image src={content.missionImageOne} alt="Wellness session" fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 50vw, 25vw" unoptimized /></div>
          <div className="about-mission-img-card"><Image src={content.missionImageTwo} alt="Strength conditioning" fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 50vw, 25vw" unoptimized /></div>
        </div>
        <div className="about-mission-text">
          <p style={{ color: "#f05a28", fontSize: "30px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>{content.missionHeading}</p>
          <p>{content.missionBodyOne}</p>
          <p>{content.missionBodyTwo}</p>
        </div>
      </section>
    </>
  );
}
