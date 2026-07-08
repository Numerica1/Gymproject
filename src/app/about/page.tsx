import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AboutTrainers from "../../components/AboutTrainers";
import Image from "next/image";

export const metadata = {
  title: "About Us | Fitness Bhaktapur",
  description:
    "Learn about the mission, values, and expert team behind Fitness Bhaktapur gym in Nepal.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="simplePage" id="about-page-main">
        
        {/* Short Introduction Section */}
        <section className="about-intro-section">
          <div className="about-intro-text">
            <p style={{ color: "#f05a28", fontSize: "16px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
              Welcome to Gym Fitness Bhaktapur
            </p>
            <h1 style={{ fontSize: "clamp(28px, 3.5vw, 54px)", lineHeight: "1.1", textTransform: "uppercase" }}>
              Transform Your Body,<br />Transform Your Life
            </h1>
            <p>
              Fitness Bhaktapur stands as a premier fitness destination in Nepal, dedicated to providing a comprehensive health and wellness experience. Equipped with modern strength-training gear, advanced cardiovascular machinery, and specialized zones for functional fitness, CrossFit, and yoga, we cater to all fitness levels.
            </p>
            <p>
              Our facility offers flexible hours and supportive, structured programs tailored to your personal goals. Whether you are aiming to build strength, enhance endurance, find mental peace, or reset your mobility, we provide the perfect space and guidance to elevate your lifestyle.
            </p>
          </div>
          <div className="about-intro-image-wrapper">
            <Image
              src="/images/gym-corner.jpg"
              alt="Fitness Bhaktapur Gym Floor"
              className="about-intro-image"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="about-mission-section">
          <div className="about-mission-images">
            <div className="about-mission-img-card">
              <Image
                src="/images/calm-yoga.jpg"
                alt="Yoga session representing wellness"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="about-mission-img-card">
              <Image
                src="/images/pullup-training.jpg"
                alt="Strength conditioning representing power"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          </div>
          <div className="about-mission-text">
            <p style={{ color: "#f05a28", fontSize: "30px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
             Our Mission
            </p>
            <p>
              At Fitness Bhaktapur, our mission is to empower individuals in our community to build lasting, healthy habits and achieve peak performance. We believe that true fitness goes beyond physical strength—it encompasses mental clarity, emotional balance, and a supportive network of like-minded people.
            </p>
            <p>
              We strive to lower the barriers to high-quality health training by delivering professional coaching, safe and clean facilities, and educational resources. By fostering an inclusive environment, we encourage every member to push their limits and lead a more active, vibrant, and fulfilling life.
            </p>
          </div>
        </section>

        {/* Our Head Trainers Section (Dynamic) */}
        <AboutTrainers />

      </main>
      <Footer />
    </>
  );
}


