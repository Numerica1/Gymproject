"use client";

import { useEffect, useState } from "react";
import {
  FaStar,
  FaQuoteRight,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaChartLine,
  FaCalendarDays,
  FaPen,
} from "react-icons/fa6";
import { FaTimes as FaTimesReg } from "react-icons/fa";
import { useGymReviews, type Review } from "../data/gymData";
import { clientStorageKey } from "../data/clientPortal";

const stats = [
  { icon: <FaStar />, value: "4.9/5", label: "Average Rating" },
  { icon: <FaUsers />, value: "500+", label: "Happy Members" },
  { icon: <FaChartLine />, value: "95%", label: "Renewal Rate" },
  { icon: <FaCalendarDays />, value: "10+", label: "Years Experience" },
];

// Avatar helpers
const getInitials = (name: string) => {
  if (!name) return "GB";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const getAvatarBg = (name: string) => {
  if (!name) return "#f59e0b";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#06b6d4"];
  return colors[Math.abs(hash) % colors.length];
};

const getAvatarSrc = (name: string) => {
  if (name === "Sarah Johnson") return "/images/member-sarah.jpg";
  if (name === "Michael Thompson") return "/images/member-michael.jpg";
  if (name === "Emily Davis") return "/images/member-emily.jpg";
  return null;
};

const getRatingNumber = (rating: any): number => {
  if (typeof rating === "number") return rating;
  if (typeof rating === "string") {
    return (rating.match(/★/g) || []).length || parseInt(rating, 10) || 5;
  }
  return 5;
};

export default function Testimonials() {
  const [reviews, setReviews] = useGymReviews();
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [product, setProduct] = useState("Gym Membership");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [loggedInClientName, setLoggedInClientName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedClient = window.localStorage.getItem(clientStorageKey);
      if (storedClient) {
        try {
          const parsed = JSON.parse(storedClient);
          if (parsed && parsed.name) {
            setLoggedInClientName(parsed.name);
          }
        } catch (e) {}
      }
    }
  }, []);

  const approvedReviews = reviews.filter((r) => r.status === "Approved");
  const maxIndex = Math.max(0, approvedReviews.length - cardsToShow);

  // Responsive cards count based on screen width
  useEffect(() => {
    const updateCards = () => {
      if (window.innerWidth < 768) setCardsToShow(1);
      else if (window.innerWidth < 1024) setCardsToShow(2);
      else setCardsToShow(3);
    };
    updateCards();
    window.addEventListener("resize", updateCards);
    return () => window.removeEventListener("resize", updateCards);
  }, []);

  // Clamp activeIndex when maxIndex changes
  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
    }
  }, [maxIndex, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setName(loggedInClientName || "");
    setProduct("Gym Membership");
    setRating(5);
    setReviewText("");
    setSubmitSuccess(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) return;
    const ratingStars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const newReview: Review = {
      customer: name.trim(),
      product,
      rating: ratingStars,
      reviewText: reviewText.trim(),
      date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Pending", // Admin approval required!
    };
    setReviews([newReview, ...reviews]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitSuccess(false);
    }, 2500);
  };

  return (
    <section className="section testimonialsSection" id="testimonials" style={{ position: "relative" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Write Review Button */
        .writeReviewBtn {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #000 !important;
          font-weight: 700;
          padding: 10px 22px;
          border-radius: 30px;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(245,158,11,0.25);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .writeReviewBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(245,158,11,0.45);
        }
        /* Centered button layout spacing */

        /* Slider layouts */
        .testimonialsSliderWrapper {
          overflow: hidden;
          width: 100%;
          padding: 10px 0;
        }
        .testimonialsSliderTrack {
          display: flex;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          will-change: transform;
        }
        .testimonialSlide {
          padding: 0 11px;
          box-sizing: border-box;
        }

        /* Modal styling */
        .reviewModalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .reviewModal {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 92vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.12);
          animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .reviewModalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #27272a;
        }
        .reviewModalHeader h3 { margin: 0; font-size: 1.2rem; color: #f4f4f5; font-weight: 700; }
        .closeBtn {
          background: transparent; border: none; color: #71717a;
          cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; padding: 4px;
          transition: color 0.2s;
        }
        .closeBtn:hover { color: #ef4444; }
        .reviewModalBody { padding: 22px 24px; }
        .reviewFormGroup { margin-bottom: 16px; }
        .reviewFormGroup label { display: block; font-size: 0.82rem; color: #a1a1aa; margin-bottom: 6px; font-weight: 500; }
        .reviewFormInput, .reviewFormSelect, .reviewFormTextarea {
          width: 100%; background: #09090b; border: 1px solid #27272a; border-radius: 8px;
          padding: 11px 12px; color: #f4f4f5; font-size: 0.93rem; transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .reviewFormInput:focus, .reviewFormSelect:focus, .reviewFormTextarea:focus { border-color: #fbbf24; outline: none; }
        .starSelector { display: flex; gap: 8px; font-size: 1.7rem; margin-top: 4px; }
        .starSelectIcon { cursor: pointer; transition: transform 0.12s; }
        .starSelectIcon:hover { transform: scale(1.2); }
        .reviewModalFooter { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .cancelBtn {
          background: #27272a; border: 1px solid #3f3f46; color: #e4e4e7;
          padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.88rem;
          transition: background 0.2s;
        }
        .cancelBtn:hover { background: #3f3f46; }
        .submitBtn {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border: none; color: #000; padding: 10px 20px; border-radius: 8px;
          cursor: pointer; font-weight: 700; font-size: 0.88rem; transition: all 0.2s;
        }
        .submitBtn:hover { box-shadow: 0 4px 14px rgba(245,158,11,0.3); }
        .successMessage {
          text-align: center; padding: 30px 12px; display: flex;
          flex-direction: column; align-items: center; gap: 14px;
        }
        .successIcon { font-size: 2.8rem; color: #10b981; }
      ` }} />

      <div className="sectionHeader" style={{ textAlign: "center", margin: "0 auto 48px" }}>
        <p className="eyebrow dark">What Our Members Say</p>
        <h2>Real People, Real Results</h2>
        <p style={{ margin: "0 auto", maxWidth: "600px" }}>
          Don't just take our word for it. Hear from our members who have achieved their fitness goals with us.
        </p>
        {/* Button moved below reviews */}
      </div>

      <div className="testimonialsCarouselContainer">
        <button
          className="carouselNavBtn prevBtn"
          onClick={handlePrev}
          aria-label="Previous testimonial"
          id="testimonial-prev-btn"
          disabled={maxIndex === 0}
        >
          <FaChevronLeft />
        </button>

        <div className="testimonialsSliderWrapper">
          <div
            className="testimonialsSliderTrack"
            style={{
              transform: `translateX(-${activeIndex * (100 / cardsToShow)}%)`,
            }}
          >
            {approvedReviews.map((item, idx) => {
              const ratingNum = getRatingNumber(item.rating);
              const avatarSrc = getAvatarSrc(item.customer);
              return (
                <div
                  className="testimonialSlide"
                  key={`${item.customer}-${idx}`}
                  style={{
                    flex: `0 0 ${100 / cardsToShow}%`,
                  }}
                >
                  <article className="testimonialCard">
                    <div className="testimonialCardHeader">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={item.customer} className="testimonialAvatar" />
                      ) : (
                        <div
                          className="testimonialAvatar initialsAvatar"
                          style={{
                            backgroundColor: getAvatarBg(item.customer),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "1.2rem",
                            borderRadius: "50%",
                            width: "60px",
                            height: "60px",
                            border: "2px solid #fcd34d",
                          }}
                        >
                          {getInitials(item.customer)}
                        </div>
                      )}
                      <div className="starsRow">
                        {Array.from({ length: ratingNum }).map((_, i) => (
                          <FaStar key={i} className="starIcon" />
                        ))}
                      </div>
                    </div>
                    <p className="testimonialText">"{item.reviewText}"</p>
                    <div className="testimonialCardFooter">
                      <div>
                        <h3 className="testimonialName">{item.customer}</h3>
                        <span className="testimonialStatus">{item.product}</span>
                      </div>
                      <FaQuoteRight className="quoteIcon" />
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        <button
          className="carouselNavBtn nextBtn"
          onClick={handleNext}
          aria-label="Next testimonial"
          id="testimonial-next-btn"
          disabled={maxIndex === 0}
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Center aligned Write a Review button below the reviews slider */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "12px", marginBottom: "48px" }}>
        <button className="writeReviewBtn" onClick={handleOpenModal} id="write-review-btn">
          <FaPen style={{ fontSize: "0.8rem" }} /> Write a Review
        </button>
      </div>

      {/* Stats Summary Block */}
      <div className="statsSummaryBlock">
        {stats.map((stat) => (
          <div className="statsSummaryItem" key={stat.label}>
            <span className="statsSummaryIcon">{stat.icon}</span>
            <div className="statsSummaryText">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Review Submission Modal overlay */}
      {isModalOpen && (
        <div className="reviewModalOverlay" onClick={handleCloseModal}>
          <div className="reviewModal" onClick={(e) => e.stopPropagation()}>
            <div className="reviewModalHeader">
              <h3>Write Your Review</h3>
              <button className="closeBtn" onClick={handleCloseModal} aria-label="Close modal">
                <FaTimesReg />
              </button>
            </div>
            <div className="reviewModalBody">
              {submitSuccess ? (
                <div className="successMessage">
                  <FaStar className="successIcon" />
                  <div>
                    <h4 style={{ color: "#10b981", margin: "0 0 6px" }}>Thank you!</h4>
                    <p style={{ fontSize: "0.88rem", color: "#a1a1aa" }}>
                      Your review has been submitted and will be displayed once approved by an admin.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="reviewFormGroup">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="reviewFormInput"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      required
                      disabled={!!loggedInClientName}
                      style={loggedInClientName ? { backgroundColor: "rgba(255,255,255,0.05)", color: "#a1a1aa", cursor: "not-allowed" } : {}}
                    />
                  </div>
                  <div className="reviewFormGroup">
                    <label>Membership / Service Rated</label>
                    <select
                      className="reviewFormSelect"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                    >
                      <option value="Gym Membership">Gym Membership</option>
                      <option value="Personal Training">Personal Training</option>
                      <option value="Group Classes">Group Classes</option>
                      <option value="Yoga Classes">Yoga Classes</option>
                      <option value="Facilities & Equipment">Facilities & Equipment</option>
                      <option value="General Gym Experience">General Gym Experience</option>
                    </select>
                  </div>
                  <div className="reviewFormGroup">
                    <label>Your Rating</label>
                    <div className="starSelector">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = hoveredRating !== null ? star <= hoveredRating : star <= rating;
                        return (
                          <FaStar
                            key={star}
                            className="starSelectIcon"
                            color={isFilled ? "#fbbf24" : "#3f3f46"}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(null)}
                            onClick={() => setRating(star)}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="reviewFormGroup">
                    <label>Your Review</label>
                    <textarea
                      className="reviewFormTextarea"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your fitness journey or feedback..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="reviewModalFooter">
                    <button type="button" className="cancelBtn" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="submitBtn">
                      Submit Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
