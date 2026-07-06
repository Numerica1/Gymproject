import Link from "next/link";
import { FaArrowRight, FaBolt } from "react-icons/fa6";

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="heroSlides" aria-hidden="true">
        <span className="heroSlide heroSlideOne" />
        <span className="heroSlide heroSlideTwo" />
        <span className="heroSlide heroSlideThree" />
      </div>
      <div className="heroContent">
        <p className="eyebrow">
          <FaBolt /> Fitness Bhaktapur
        </p>
        <h1>
          <span>Transform Your Body</span>
          <span>Transform Your Life</span>
        </h1>
        <p className="heroText">
          Join our fitness community and achieve your goals with expert
          trainers, modern equipment, and programs built for real progress.
        </p>
        <div className="heroActions">
          <Link className="primaryButton" href="/services">
            View Programs <FaArrowRight />
          </Link>
          <Link className="secondaryButton" href="/join">
            Join Now
          </Link>
        </div>
        <div className="stats">
          <div>
            <strong>24/7</strong>
            <span>Flexible hours</span>
          </div>
          <div>
            <strong>4</strong>
            <span>Featured programs</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Membership plans</span>
          </div>
        </div>
      </div>
    </section>
  );
}
