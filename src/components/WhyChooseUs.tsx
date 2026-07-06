"use client";

import { FaDumbbell, FaUserCheck, FaClipboardList, FaUsers } from "react-icons/fa6";

const reasons = [
  {
    icon: <FaDumbbell />,
    title: "Modern Equipment",
    text: "Train with the latest high-quality equipment.",
  },
  {
    icon: <FaUserCheck />,
    title: "Certified Trainers",
    text: "Expert trainers to guide, motivate and support you.",
  },
  {
    icon: <FaClipboardList />,
    title: "Personalized Plans",
    text: "Custom workout and diet plans for your goals.",
  },
  {
    icon: <FaUsers />,
    title: "Friendly Environment",
    text: "A welcoming community that keeps you inspired.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="whyChooseUsSection" id="why-choose-us">
      <div className="whyChooseUsContainer">
        <div className="whyChooseUsImagePanel" aria-label="Gym training area" />
        <div className="whyChooseUsContent">
          <p className="eyebrow dark">Why Choose Us</p>
          <h2>Build Your Body, Build Your Confidence</h2>
          <div className="whyChooseUsGrid">
            {reasons.map((reason) => (
              <article key={reason.title} className="whyChooseUsCard">
                <span className="whyChooseUsIcon">{reason.icon}</span>
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
