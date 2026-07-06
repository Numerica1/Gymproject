"use client";

import { useEffect, useState } from "react";
import { FaSpinner, FaCircleCheck, FaXmark } from "react-icons/fa6";
import { useGymTrainers, useGymBookings, type Trainer } from "../data/gymData";
import { clientStorageKey } from "../data/clientPortal";

interface TrainerBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrainerName?: string;
}

// Map trainers to their related programs
export function getProgramsForTrainer(trainerName: string, specialty: string): string[] {
  const spec = (specialty || "").toLowerCase();
  const programs: string[] = [];

  // Default mappings for the seeded trainers
  if (trainerName === "Mike Johnson") {
    return ["Strength Training", "Personal Training", "Weight Loss Program"];
  }
  if (trainerName === "Sarah Williams") {
    return ["Yoga & Wellness", "Nutrition Coaching"];
  }
  if (trainerName === "Emily Davis") {
    return ["HIIT Training", "Cardio Fitness", "Weight Loss Program"];
  }
  if (trainerName === "David Brown") {
    return ["Cardio Fitness", "HIIT Training"];
  }
  if (trainerName === "Coach Subash") {
    return ["CrossFit Training", "Strength Training"];
  }
  if (trainerName === "Coach Sneha") {
    return ["Yoga & Wellness", "Weight Loss Program", "Nutrition Coaching"];
  }

  // Keyword matching for any dynamically added trainers
  if (spec.includes("strength") || spec.includes("power") || spec.includes("lifting") || spec.includes("bodybuilding")) {
    programs.push("Strength Training", "Personal Training");
  }
  if (spec.includes("yoga") || spec.includes("wellness") || spec.includes("mobility") || spec.includes("flexibility") || spec.includes("stretch")) {
    programs.push("Yoga & Wellness");
  }
  if (spec.includes("cardio") || spec.includes("core") || spec.includes("run") || spec.includes("endurance") || spec.includes("stamina")) {
    programs.push("Cardio Fitness");
  }
  if (spec.includes("hiit") || spec.includes("interval") || spec.includes("burn") || spec.includes("metabolic") || spec.includes("conditioning")) {
    programs.push("HIIT Training");
  }
  if (spec.includes("crossfit")) {
    programs.push("CrossFit Training");
  }
  if (spec.includes("weight") || spec.includes("loss") || spec.includes("diet") || spec.includes("nutrition") || spec.includes("fat")) {
    programs.push("Weight Loss Program", "Nutrition Coaching");
  }

  // Fallback to all programs if no keywords match
  if (programs.length === 0) {
    return [
      "Strength Training",
      "Cardio Fitness",
      "Yoga & Wellness",
      "CrossFit Training",
      "HIIT Training",
      "Personal Training",
      "Weight Loss Program",
      "Nutrition Coaching"
    ];
  }

  // Add Personal Training as a default option for any trainer because they are a personal trainer
  if (!programs.includes("Personal Training")) {
    programs.push("Personal Training");
  }

  return Array.from(new Set(programs));
}

export default function TrainerBookingModal({
  isOpen,
  onClose,
  initialTrainerName,
}: TrainerBookingModalProps) {
  const [allTrainers] = useGymTrainers();
  const [bookings, setBookings] = useGymBookings();

  // Filter bookable trainers (trainers and yoga instructors)
  const bookableTrainers = allTrainers.filter(
    (t) => t.category === "Trainers" || t.category === "Yoga Instructor"
  );

  // Form fields state
  const [selectedTrainerName, setSelectedTrainerName] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("07:30 AM - 08:30 AM");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Fetch related programs based on the selected trainer
  const currentTrainer = bookableTrainers.find((t) => t.name === selectedTrainerName);
  const relatedPrograms = currentTrainer
    ? getProgramsForTrainer(currentTrainer.name, currentTrainer.specialty)
    : [
        "Strength Training",
        "Cardio Fitness",
        "Yoga & Wellness",
        "CrossFit Training",
        "HIIT Training",
        "Personal Training",
        "Weight Loss Program",
        "Nutrition Coaching",
      ];

  // Prefill logged-in user profile & initial trainer name
  useEffect(() => {
    if (isOpen) {
      // 1. Set trainer pre-selection
      if (initialTrainerName) {
        setSelectedTrainerName(initialTrainerName);
      } else if (bookableTrainers.length > 0) {
        setSelectedTrainerName(bookableTrainers[0].name);
      }

      // 2. Prefill client information if logged in
      const storedClient = window.localStorage.getItem(clientStorageKey);
      if (storedClient) {
        try {
          const client = JSON.parse(storedClient);
          if (client.name) setClientName(client.name);
          if (client.email) setClientEmail(client.email);
          if (client.phone) setClientPhone(client.phone);
        } catch (e) {
          console.error("Error parsing logged in client info:", e);
        }
      }

      // 3. Set tomorrow as default booking date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const dd = String(tomorrow.getDate()).padStart(2, "0");
      setBookingDate(`${yyyy}-${mm}-${dd}`);

      // Reset success & errors state
      setIsSuccess(false);
      setCreatedBooking(null);
      setErrors({});
      setNotes("");
    }
  }, [isOpen, initialTrainerName, allTrainers]);

  // Handle program pre-selection when relatedPrograms list updates
  useEffect(() => {
    if (relatedPrograms.length > 0) {
      // Keep selected program if it is in the new list, otherwise pick the first one
      if (!relatedPrograms.includes(selectedProgram)) {
        setSelectedProgram(relatedPrograms[0]);
      }
    } else {
      setSelectedProgram("");
    }
  }, [selectedTrainerName, relatedPrograms]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!clientName.trim()) newErrors.clientName = "Full name is required";
    if (!clientEmail.trim()) {
      newErrors.clientEmail = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(clientEmail)) {
      newErrors.clientEmail = "Please enter a valid email address";
    }
    if (!clientPhone.trim()) {
      newErrors.clientPhone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(clientPhone.trim())) {
      newErrors.clientPhone = "Enter a valid 10-digit phone number";
    }
    if (!bookingDate) newErrors.bookingDate = "Booking date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate saving delay for premium UX feedback
    setTimeout(() => {
      const bId = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
      const formattedDate = new Date(bookingDate).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const newBooking = {
        bookingId: bId,
        member: clientName.trim(),
        service: `${selectedTrainerName} - ${selectedProgram}`,
        date: `${formattedDate} at ${timeSlot}`,
        // Extra payload metadata to be saved in Supabase jsonb
        trainer: selectedTrainerName,
        program: selectedProgram,
        email: clientEmail.trim(),
        phone: clientPhone.trim(),
        notes: notes.trim(),
      };

      setBookings([newBooking, ...bookings]);
      setCreatedBooking(newBooking);
      setIsSubmitting(false);
      setIsSuccess(true);

      fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      }).catch(() => {
        // Backend unreachable – local state is the fallback
      });
    }, 1200);
  };

  return (
    <div
      className="modalBackdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modalContent">
        <button className="closeButton" onClick={onClose} aria-label="Close modal">
          <FaXmark />
        </button>

        {!isSuccess ? (
          <>
            <div className="modalHeader">
              <h2>Book A Trainer</h2>
            </div>
            <form className="bookingForm" onSubmit={handleSubmit}>
              {/* Trainer Select Dropdown */}
              <div className="formGroup">
                <label>
                  Select Trainer <span>*</span>
                </label>
                <select
                  className="formInput"
                  value={selectedTrainerName}
                  onChange={(e) => setSelectedTrainerName(e.target.value)}
                  required
                >
                  {bookableTrainers.length > 0 ? (
                    bookableTrainers.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.specialty})
                      </option>
                    ))
                  ) : (
                    <option value="">No trainers available</option>
                  )}
                </select>
              </div>

              {/* Dynamic Program Dropdown */}
              <div className="formGroup">
                <label>
                  Select Program <span>*</span>
                </label>
                <select
                  className="formInput"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  required
                >
                  {relatedPrograms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <small className="helpText">
                  Showing programs related to {selectedTrainerName}&apos;s specialty only.
                </small>
              </div>

              {/* Client Info Grid */}
              <div className="formGroup">
                <label>
                  Your Full Name <span>*</span>
                </label>
                <input
                  type="text"
                  className={`formInput ${errors.clientName ? "inputError" : ""}`}
                  placeholder="e.g. Ram Bahadur"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (errors.clientName) setErrors((prev) => ({ ...prev, clientName: "" }));
                  }}
                />
                {errors.clientName && <span className="errorMsg">{errors.clientName}</span>}
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label>
                    Email Address <span>*</span>
                  </label>
                  <input
                    type="email"
                    className={`formInput ${errors.clientEmail ? "inputError" : ""}`}
                    placeholder="name@domain.com"
                    value={clientEmail}
                    onChange={(e) => {
                      setClientEmail(e.target.value);
                      if (errors.clientEmail) setErrors((prev) => ({ ...prev, clientEmail: "" }));
                    }}
                  />
                  {errors.clientEmail && <span className="errorMsg">{errors.clientEmail}</span>}
                </div>
                <div className="formGroup">
                  <label>
                    Phone Number <span>*</span>
                  </label>
                  <input
                    type="tel"
                    className={`formInput ${errors.clientPhone ? "inputError" : ""}`}
                    placeholder="98XXXXXXXX"
                    value={clientPhone}
                    maxLength={10}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, "");
                      setClientPhone(num);
                      if (errors.clientPhone) setErrors((prev) => ({ ...prev, clientPhone: "" }));
                    }}
                  />
                  {errors.clientPhone && <span className="errorMsg">{errors.clientPhone}</span>}
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="formRow">
                <div className="formGroup">
                  <label>
                    Booking Date <span>*</span>
                  </label>
                  <input
                    type="date"
                    className={`formInput ${errors.bookingDate ? "inputError" : ""}`}
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      if (errors.bookingDate) setErrors((prev) => ({ ...prev, bookingDate: "" }));
                    }}
                  />
                  {errors.bookingDate && <span className="errorMsg">{errors.bookingDate}</span>}
                </div>
                <div className="formGroup">
                  <label>
                    Preferred Time Slot <span>*</span>
                  </label>
                  <select
                    className="formInput"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    required
                  >
                    <option value="06:00 AM - 07:00 AM">06:00 AM - 07:00 AM</option>
                    <option value="07:30 AM - 08:30 AM">07:30 AM - 08:30 AM</option>
                    <option value="08:30 AM - 09:30 AM">08:30 AM - 09:30 AM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM</option>
                    <option value="06:30 PM - 07:30 PM">06:30 PM - 07:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Special request/notes */}
              <div className="formGroup">
                <label>Special Instructions / Message (Optional)</label>
                <textarea
                  className="formTextarea"
                  placeholder="Tell your coach about any previous injuries, physical goals, or expectations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Submit btn */}
              <button type="submit" className="submitButton" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinAnimation" style={{ animation: "spin 1s linear infinite" }} /> Booking Session...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="successView">
            <FaCircleCheck className="successIcon" />
            <h2 className="successTitle">Booking Successful!</h2>
            <p className="successDesc">
              Your appointment has been registered. Your trainer has been notified.
            </p>

            <div className="bookingDetailsTable">
              <div className="detailRow">
                <span className="detailLabel">Booking ID</span>
                <span className="detailValue" style={{ color: "#ffe500" }}>
                  {createdBooking.bookingId}
                </span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">Client</span>
                <span className="detailValue">{createdBooking.member}</span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">Trainer</span>
                <span className="detailValue">{createdBooking.trainer}</span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">Program</span>
                <span className="detailValue">{createdBooking.program}</span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">Schedule</span>
                <span className="detailValue">{createdBooking.date}</span>
              </div>
            </div>

            <button className="doneButton" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .modalBackdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          animation: fadeIn 0.25s ease-out forwards;
        }

        .modalContent {
          width: 100%;
          max-width: 540px;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          color: #f4f4f5;
          position: relative;
          transform: scale(0.93);
          opacity: 0;
          animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .closeButton {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: 1px solid #3f3f46;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a1a1aa;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .closeButton:hover {
          border-color: #f05a28;
          color: #fff;
          background: rgba(240, 90, 40, 0.1);
        }

        .modalHeader {
          margin-bottom: 20px;
          border-bottom: 1px solid #27272a;
          padding-bottom: 12px;
        }

        .modalHeader h2 {
          font-size: 22px;
          font-weight: 800;
          margin: 0;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }

        .bookingForm {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .formGroup {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .formGroup label {
          font-size: 13px;
          font-weight: 700;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .formGroup label span {
          color: #f05a28;
          margin-left: 2px;
        }

        .formInput {
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid #3f3f46;
          border-radius: 6px;
          background: #09090b;
          color: #fff;
          width: 100%;
          transition: all 0.2s ease;
        }

        .formInput:focus {
          border-color: #f05a28;
          outline: none;
          box-shadow: 0 0 0 2px rgba(240, 90, 40, 0.2);
        }

        .inputError {
          border-color: #ef4444;
        }

        .formTextarea {
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid #3f3f46;
          border-radius: 6px;
          background: #09090b;
          color: #fff;
          width: 100%;
          min-height: 80px;
          resize: vertical;
          transition: all 0.2s ease;
        }

        .formTextarea:focus {
          border-color: #f05a28;
          outline: none;
          box-shadow: 0 0 0 2px rgba(240, 90, 40, 0.2);
        }

        .formRow {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .helpText {
          font-size: 11px;
          color: #ffe500;
          margin-top: 4px;
        }

        @media (max-width: 600px) {
          .formRow {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .submitButton {
          background: #ffe500;
          color: #000;
          font-weight: 800;
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        .submitButton:hover:not(:disabled) {
          background: #e6ce00;
          transform: translateY(-1px);
        }

        .submitButton:disabled {
          background: #3f3f46;
          color: #71717a;
          cursor: not-allowed;
        }

        .errorMsg {
          color: #ef4444;
          font-size: 11px;
          font-weight: 500;
          margin-top: 2px;
        }

        .successView {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 16px 0;
        }

        .successIcon {
          font-size: 56px;
          color: #22c55e;
          margin-bottom: 12px;
          animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.15);
          }
          80% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .successTitle {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 8px;
          text-transform: uppercase;
        }

        .successDesc {
          color: #a1a1aa;
          font-size: 13px;
          line-height: 1.5;
          margin: 0 0 20px;
        }

        .bookingDetailsTable {
          width: 100%;
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: left;
        }

        .detailRow {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          border-bottom: 1px dashed #27272a;
          padding-bottom: 6px;
        }

        .detailRow:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .detailLabel {
          color: #71717a;
          font-weight: 500;
        }

        .detailValue {
          color: #e4e4e7;
          font-weight: 600;
        }

        .doneButton {
          background: #f05a28;
          color: #fff;
          font-weight: 700;
          padding: 10px 28px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          font-size: 13px;
          letter-spacing: 0.5px;
        }

        .doneButton:hover {
          background: #d84b1d;
        }

        :global(.spinAnimation) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
