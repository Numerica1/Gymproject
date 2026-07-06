"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { FaClock, FaGauge, FaUserGroup, FaCalendarDays, FaCheck, FaDumbbell } from "react-icons/fa6";
import JoinProgramButton from "../../../components/JoinProgramButton";
import { useGymClasses, parseScheduleTable } from "../../../data/gymData";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function ProgramDetailContent({ program }: { program: any }) {
  const displayImage = program.image || "/images/fitness-logo.jpg";
  const benefits = program.benefits ? program.benefits.split(",").map((b: string) => b.trim()).filter(Boolean) : [];

  return (
    <>
      <main id={`program-page-${program.className}`}>
        {/* Banner Section */}
        <section 
          className="programDetailHero"
          style={{ backgroundImage: `url(${displayImage})` }}
        >
          <div className="programDetailHeroContent">
            <p className="eyebrow">Featured Program</p>
            <h1>{program.className}</h1>
            
            <div className="programFactBadges">
              {program.duration && (
                <div className="programFactBadge">
                  <FaClock />
                  <span>{program.duration}</span>
                </div>
              )}
              {program.intensity && (
                <div className="programFactBadge">
                  <FaGauge />
                  <span>{program.intensity} Intensity</span>
                </div>
              )}
            </div>
          </div>
        </section>

          {/* Content Section */}
          <section className="programDetailContent">
            <div className="programDetailGrid">
              
              {/* Left Column: Details */}
              <div className="programDetailBody">
                
                {/* Description */}
                {program.description && (
                  <article className="programDetailSection">
                    <h2>About The Program</h2>
                    <p>{program.description}</p>
                  </article>
                )}

                {/* Target Audience */}
                {program.targetAudience && (
                  <article className="programDetailSection">
                    <h2>Who Is This For?</h2>
                    <p>{program.targetAudience}</p>
                  </article>
                )}

                {/* Benefits */}
                {benefits.length > 0 && (
                  <article className="programDetailSection">
                    <h2>Key Benefits</h2>
                    <ul className="benefitList">
                      {benefits.map((benefit: string, index: number) => (
                        <li key={index} className="benefitItem">
                          <FaCheck />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                )}

                {/* Weekly Times */}
                {program.time && (
                  <article className="programDetailSection">
                    <h2>Weekly Times</h2>
                    <div className="scheduleBox">
                      <FaClock style={{ color: "#fbbf24" }} />
                      <div className="scheduleText">
                        <p>{program.time}</p>
                      </div>
                    </div>
                  </article>
                )}

                {/* Class Schedule (Full Schedule Table) */}
                {(() => {
                  const rows = parseScheduleTable(program.schedule);
                  if (rows.length === 0) return null;
                  return (
                    <article className="programDetailSection fullScheduleSection">
                      <h2>Class Schedule</h2>
                      <div className="fullScheduleTableCard">
                        <div className="fullScheduleTableScroll">
                          <table className="fullScheduleTable">
                            <thead>
                              <tr>
                                <th>Day</th>
                                <th>Workout</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, idx) => (
                                <tr key={idx}>
                                  <td>{row.day}</td>
                                  <td>{row.workout}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </article>
                  );
                })()}

                {/* Trainer */}
                {program.trainer && (
                  <article className="programDetailSection">
                    <h2>Trainer</h2>
                    <p>{program.trainer}</p>
                  </article>
                )}

                {/* Capacity */}
                {program.capacity && (
                  <article className="programDetailSection">
                    <h2>Capacity</h2>
                    <p>{program.capacity}</p>
                  </article>
                )}

              </div>

              {/* Right Column: Sidebar CTA */}
              <aside className="programSidebar">
                <div className="programInfoCard">
                  <div className="cardIcon"><FaDumbbell /></div>
                  <h3>Start Your Journey</h3>
                  <p>
                    Ready to transform your lifestyle under the guidance of expert trainers at Fitness Bhaktapur? Register today and choose a plan that fits your schedule!
                  </p>
                  <div className="programSidebarActions">
                    <JoinProgramButton program={program} />
                    <Link href="/contact" className="secondaryButton">
                      Inquire Now
                    </Link>
                  </div>
                </div>
              </aside>

            </div>
          </section>
        </main>

        <Footer />
      </>
  );
}

export default function ProgramDetailPage({ params }: PageProps) {
  return (
    <>
      <Navbar />
      <ProgramDetailWrapper params={params} />
    </>
  );
}

function ProgramDetailWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const [classes] = useGymClasses();
  const [slug, setSlug] = useState<string>("");
  
  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  const program = classes.find((c) => {
    const classSlug = c.className.toLowerCase().replace(/\s+/g, "-");
    return classSlug === slug;
  });

  if (!program) {
    return (
      <>
        <main style={{ padding: "100px 20px", textAlign: "center" }}>
          <h1>Program Not Found</h1>
          <p>The requested program could not be found or has not been added by the admin yet.</p>
          <Link href="/programs" style={{ color: "#fbbf24", textDecoration: "underline" }}>
            View All Programs
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return <ProgramDetailContent program={program} />;
}
