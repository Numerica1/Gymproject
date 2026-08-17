"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaArrowRight,
  FaCalendarDays,
  FaChevronLeft,
  FaChevronRight,
  FaDumbbell,
  FaHeartPulse,
  FaStar,
  FaUsers,
} from "react-icons/fa6";
import { useGymSettings } from "../data/gymData";
import { formatCurrency } from "../data/currency";

interface MembershipProps {
  isPageHeader?: boolean;
}

export default function Membership({ isPageHeader = false }: MembershipProps) {
  const Heading = "h2";
  const [content] = useGymSettings();
  const plans = content.membershipPlans;
  const [activePlan, setActivePlan] = useState(1);
  const planCount = plans.length;

  const showPreviousPlan = () =>
    setActivePlan((c) => (c - 1 + planCount) % planCount);

  const showNextPlan = () =>
    setActivePlan((c) => (c + 1) % planCount);

  const getSlidePosition = (index: number) => {
    if (index === activePlan) return "isCenter";
    if (index === (activePlan - 1 + planCount) % planCount) return "isLeft";
    return "isRight";
  };

  return (
    <>
      {isPageHeader && (
        <section className="membershipHero" aria-labelledby="membership-page-title">
          <div className="membershipHeroOverlay" />
          <div className="membershipHeroContent">
            <p className="membershipHeroEyebrow">Choose Your Plan</p>
            <h1 id="membership-page-title">Find the Right Plan for You</h1>
            <p className="membershipHeroDescription">
              Flexible plans designed for every fitness goal and lifestyle. All memberships include full gym access and our world-class facilities.
            </p>
            <div className="membershipBenefits" aria-label="Membership benefits">
              <div className="membershipBenefit">
                <FaUsers aria-hidden="true" />
                <span>Expert Trainers</span>
              </div>
              <div className="membershipBenefit">
                <FaDumbbell aria-hidden="true" />
                <span>Modern Equipment</span>
              </div>
              <div className="membershipBenefit">
                <FaCalendarDays aria-hidden="true" />
                <span>Flexible Schedule</span>
              </div>
              <div className="membershipBenefit">
                <FaHeartPulse aria-hidden="true" />
                <span>Better Results</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="plans" className="section pricingSection">
      {!isPageHeader && (
        <div className="sectionHeader">
          <p className="eyebrow dark">Choose Your Plan</p>
          <Heading className="membershipHeading">
            <span>Find the Right Plan for You</span>
          </Heading>
          <p className="membershipSubtitle">Flexible plans designed for every fitness goal and lifestyle. All memberships include full gym access and our world-class facilities.</p>
        </div>
      )}

      {/* ── Mobile carousel ── */}
      <div className="membershipShowcase" aria-label="Membership plan gallery">
        <button
          type="button"
          className="membershipCarouselBtn membershipCarouselPrev"
          aria-label="Previous membership plan"
          onClick={showPreviousPlan}
        >
          <FaChevronLeft />
        </button>

        <div className="membershipCardStage">
          {plans.map((plan, index) => (
            <article
              className={`planCard membershipPlanCardSlide ${getSlidePosition(index)}`}
              key={plan.name}
              tabIndex={0}
              onClick={() => setActivePlan(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActivePlan(index);
                }
              }}
            >
              {plan.highlighted && getSlidePosition(index) === "isCenter" && (
                <div className="carouselBadge"><FaStar /> Most Popular</div>
              )}
              <h3>{plan.name}</h3>
              <p className="planLabel">Features</p>
              <p className="price">
                {formatCurrency(plan.price)}
                <span>/month</span>
              </p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link
                href={`/join?plan=${plan.key}`}
                id={`select-plan-${plan.key}`}
                onClick={(e) => e.stopPropagation()}
              >
                Select Plan <FaArrowRight />
              </Link>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="membershipCarouselBtn membershipCarouselNext"
          aria-label="Next membership plan"
          onClick={showNextPlan}
        >
          <FaChevronRight />
        </button>

        <div className="membershipDots" aria-label="Choose membership plan">
          {plans.map((plan, index) => (
            <button
              type="button"
              className={index === activePlan ? "active" : ""}
              key={plan.name}
              aria-label={`Show ${plan.name}`}
              aria-pressed={index === activePlan}
              onClick={() => setActivePlan(index)}
            />
          ))}
        </div>
      </div>
      </section>
    </>
  );
}
