"use client";

import { FaDumbbell, FaUserCheck, FaClipboardList, FaUsers } from "react-icons/fa6";
import { useWhyChooseUsContent } from "../data/gymData";

export default function WhyChooseUs() {
  const [content] = useWhyChooseUsContent();
  const icons = [<FaDumbbell key="equipment" />, <FaUserCheck key="trainers" />, <FaClipboardList key="plans" />, <FaUsers key="environment" />];
  return (
    <section className="whyChooseUsSection" id="why-choose-us">
      <div className="whyChooseUsContainer">
        <div className="whyChooseUsImagePanel" aria-label="Gym training area" style={{ backgroundImage: `linear-gradient(90deg, rgba(9, 10, 12, 0), rgba(9, 10, 12, 0.72)), url("${content.image || "/images/why-choose-us.jpg"}")` }} />
        <div className="whyChooseUsContent">
          <p className="eyebrow dark">{content.eyebrow}</p>
          <h2>{content.heading}</h2>
          <div className="whyChooseUsGrid">
            {content.reasons.map((reason, index) => (
              <article key={reason.title} className="whyChooseUsCard">
                <span className="whyChooseUsIcon">{icons[index] || <FaDumbbell />}</span>
                <h3>{reason.title}</h3>
                <p>{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
