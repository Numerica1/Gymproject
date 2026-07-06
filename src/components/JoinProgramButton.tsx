"use client";

import { useEffect, useState } from "react";
import { FaCheck, FaXmark, FaCreditCard, FaLock, FaBuildingColumns, FaWallet } from "react-icons/fa6";
import { useGymTrainers, useGymOrders, useGymPayments, useGymClients, type OrderLog, type PaymentLog } from "../data/gymData";
import { type DemoClient } from "../data/clientPortal";

interface Program {
  slug: string;
  title: string;
  duration: string;
}

interface JoinProgramButtonProps {
  program: Program;
}

// Reasonable monthly base prices in Nepalese Rupees (Rs)
const basePrices: Record<string, number> = {
  "strength-training": 3500,
  "cardio-fitness": 3000,
  "yoga-wellness": 2500,
  "crossfit-training": 4500,
  "hiit-training": 3000,
  "personal-training": 8000,
  "weight-loss-program": 5000,
  "nutrition-coaching": 2500,
};

export default function JoinProgramButton({ program }: JoinProgramButtonProps) {
  const [allTrainers] = useGymTrainers();
  const [orders, setOrders] = useGymOrders();
  const [payments, setPayments] = useGymPayments();
  const [clients, setClients] = useGymClients();

  // Modal & form states
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"form" | "credentials" | "payment" | "success">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [trainer, setTrainer] = useState("");
  const [duration, setDuration] = useState(1); // in months
  const [paymentOption, setPaymentOption] = useState<"gym" | "online">("gym");
  const [onlineMethod, setOnlineMethod] = useState<"card" | "esewa" | "khalti">("card");

  // Payment field states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [walletPhone, setWalletPhone] = useState("");
  const [walletPhoneError, setWalletPhoneError] = useState("");

  // Credentials step states
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [credError, setCredError] = useState("");
  const [formError, setFormError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [txnId, setTxnId] = useState("");

  // Nepal phone: 10 digits, starts with 9 followed by 6–9, optional +977/977 prefix.
  const validateNepalPhone = (value: string): string => {
    const stripped = value.trim().replace(/^(\+977|977)/, "").replace(/\s/g, "");
    if (!stripped) return "Phone number is required.";
    if (!/^[9][6-9][0-9]{8}$/.test(stripped))
      return "Enter a valid 10-digit Nepali number (e.g. 9812345678).";
    return "";
  };

  const basePrice = basePrices[program.slug] || 3000;

  // Filter dynamic trainers categorized as "Trainers" or "Yoga Instructor" etc.
  const availableTrainers = allTrainers.filter(
    (t) => t.category === "Trainers" || t.category === "Yoga Instructor"
  );

  // Set default trainer
  useEffect(() => {
    if (availableTrainers.length > 0 && !trainer) {
      setTrainer(availableTrainers[0].name);
    } else if (!trainer) {
      setTrainer("Default Gym Coach");
    }
  }, [allTrainers, trainer]);

  // Calculate pricing & discounts
  const subtotal = basePrice * duration;
  let discountPercent = 0;
  if (duration >= 12) {
    discountPercent = 20;
  } else if (duration >= 6) {
    discountPercent = 15;
  } else if (duration >= 3) {
    discountPercent = 10;
  }
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalPrice = subtotal - discountAmount;

  const handleOpen = () => {
    setIsOpen(true);
    setStep("form");
    setName("");
    setEmail("");
    setPhone("");
    setDuration(1);
    setPaymentOption("gym");
    setOnlineMethod("card");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setWalletPhone("");
    setUsername("");
    setNewPassword("");
    setConfirmPassword("");
    setCredError("");
    setFormError("");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    // Validate phone number — Nepal: 10 digits starting with 96–99
    const phoneErr = validateNepalPhone(phone);
    if (phoneErr) {
      setFormError(phoneErr);
      return;
    }

    // Always go to credentials step first
    setStep("credentials");
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError("");
    if (!username.trim()) { setCredError("Please choose a username."); return; }
    if (newPassword.length < 6) { setCredError("Password must be at least 6 characters."); return; }
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecialChar) {
      setCredError("Password must be strong: include uppercase, lowercase, numbers, and special characters.");
      return;
    }
    if (newPassword !== confirmPassword) { setCredError("Passwords do not match."); return; }
    if (paymentOption === "online") {
      setStep("payment");
    } else {
      processRegistration(false);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processRegistration(true);
  };

  const processRegistration = (paidOnline: boolean) => {
    setIsSubmitting(true);

    const generatedOrderId = `PRG-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedTxnId = paidOnline ? `TXN${Math.floor(100000 + Math.random() * 900000)}` : "";
    const clientId = `CLT-${Math.floor(10000 + Math.random() * 90000)}`;
    const todayStr = new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
    const renewsStr = new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

    setOrderId(generatedOrderId);
    setTxnId(generatedTxnId);

    // Save registration order in admin dashboard
    const newOrder: OrderLog = {
      orderId: generatedOrderId,
      customer: name.trim(),
      items: `Program: ${program.title} (${duration} Month${duration > 1 ? "s" : ""}) - Trainer: ${trainer}`,
      total: `Rs ${totalPrice.toLocaleString()}`,
      payment: paidOnline ? "Paid" : "Pending",
      status: "Processing",
      date: todayStr,
      email: email.trim(),
      address: `Phone: ${phone.trim()} | Method: ${paidOnline ? "Paid Online (" + onlineMethod.toUpperCase() + ")" : "Pay at Gym"}`,
    };

    setOrders([newOrder, ...orders]);

    // Register client in members/clients list (persisted to Supabase via useGymClients)
    const newClient: DemoClient = {
      id: clientId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      memberSince: todayStr,
      address: `Program enrollment via ${program.title}`,
      username: username.trim(),
      password: newPassword,
      package: {
        key: program.slug,
        name: program.title,
        price: totalPrice,
        access: `${duration} Month${duration > 1 ? "s" : ""} Program Access`,
        status: "Active",
        startedOn: todayStr,
        renewsOn: renewsStr,
        paymentMethod: paidOnline ? onlineMethod.toUpperCase() : "Pay at Gym",
        sessionsUsed: 0,
        sessionsTotal: duration * 4 * 2, // ~2 sessions/week
        trainer: trainer,
        features: [
          `${program.title} access`,
          `Trainer: ${trainer}`,
          `Duration: ${duration} Month${duration > 1 ? "s" : ""}`,
          `Discount: ${discountPercent > 0 ? discountPercent + "% applied" : "None"}`,
        ],
        upcomingClasses: [program.title],
      },
    };

    // Avoid duplicate entries for same email
    const alreadyExists = clients.some((c) => c.email === email.trim());
    if (!alreadyExists) {
      setClients([newClient, ...clients]);
    }

    // If paid online, log payment transaction to admin panel payments
    if (paidOnline) {
      const newPayment: PaymentLog = {
        txnId: generatedTxnId,
        member: name.trim(),
        amount: String(totalPrice),
        method: onlineMethod === "card" ? "Card" : onlineMethod === "esewa" ? "eSewa" : "Khalti",
        status: "Paid",
        date: new Date().toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
      setPayments([newPayment, ...payments]);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setStep("success");
    }, 1200);
  };

  return (
    <>
      <button onClick={handleOpen} className="primaryButton" style={{ width: "100%", cursor: "pointer" }}>
        Join This Program
      </button>

      {isOpen && (
        <div className="joinProgramOverlay" onClick={handleClose}>
          <style dangerouslySetInnerHTML={{ __html: `
            .joinProgramOverlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.85);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
              padding: 20px;
            }
            .joinProgramModal {
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 16px;
              width: 100%;
              max-width: 550px;
              max-height: 90vh;
              overflow-y: auto;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(245, 158, 11, 0.12);
              animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes modalSlideIn {
              from { opacity: 0; transform: translateY(12px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .joinModalHeader {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 20px 24px;
              border-bottom: 1px solid #27272a;
            }
            .joinModalHeader h2 {
              margin: 0;
              font-size: 1.25rem;
              color: #f4f4f5;
              font-weight: 700;
            }
            .joinModalClose {
              background: transparent;
              border: none;
              color: #a1a1aa;
              cursor: pointer;
              font-size: 1.2rem;
              display: flex;
              align-items: center;
              padding: 4px;
              transition: color 0.2s;
            }
            .joinModalClose:hover {
              color: #ef4444;
            }
            .joinModalBody {
              padding: 24px;
            }
            .formSectionTitle {
              font-size: 0.85rem;
              font-weight: 700;
              color: #fbbf24;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 16px;
              border-left: 3px solid #fbbf24;
              padding-left: 8px;
            }
            .joinFormGrid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 16px;
              margin-bottom: 20px;
            }
            @media (min-width: 480px) {
              .joinFormGrid {
                grid-template-columns: 1fr 1fr;
              }
              .fullWidthField {
                grid-column: span 2;
              }
            }
            .joinFormGroup {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .joinFormGroup label {
              font-size: 0.8rem;
              color: #a1a1aa;
              font-weight: 500;
            }
            .joinFormInput, .joinFormSelect {
              background: #09090b;
              border: 1px solid #27272a;
              border-radius: 8px;
              padding: 10px 12px;
              color: #f4f4f5;
              font-size: 0.9rem;
              transition: border-color 0.2s;
              width: 100%;
              box-sizing: border-box;
            }
            .joinFormInput:focus, .joinFormSelect:focus {
              border-color: #fbbf24;
              outline: none;
            }
            .paymentSelectorWrapper {
              display: flex;
              gap: 12px;
              margin-bottom: 20px;
            }
            .paymentSelectorCard {
              flex: 1;
              background: #09090b;
              border: 1px solid #27272a;
              border-radius: 8px;
              padding: 12px;
              cursor: pointer;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 6px;
              color: #a1a1aa;
              transition: all 0.2s ease;
            }
            .paymentSelectorCard:hover {
              border-color: #3f3f46;
              color: #e4e4e7;
            }
            .paymentSelectorCard.active {
              border-color: #fbbf24;
              background: rgba(251, 191, 36, 0.04);
              color: #fbbf24;
            }
            .paymentSelectorCard svg {
              font-size: 1.3rem;
            }
            .paymentSelectorCard span {
              font-size: 0.8rem;
              font-weight: 600;
            }
            .pricingDetailCard {
              background: #09090b;
              border: 1px solid #27272a;
              border-radius: 10px;
              padding: 16px;
              margin-bottom: 20px;
            }
            .pricingDetailRow {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 0.85rem;
              color: #a1a1aa;
              padding: 6px 0;
            }
            .pricingDetailRow.total {
              border-top: 1px solid #27272a;
              padding-top: 12px;
              margin-top: 6px;
              font-size: 1.05rem;
              font-weight: 700;
              color: #fbbf24;
            }
            .discountBadge {
              background: rgba(16, 185, 129, 0.15);
              color: #10b981;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 0.75rem;
              font-weight: 700;
            }
            .joinModalFooter {
              display: flex;
              justify-content: flex-end;
              gap: 12px;
              border-top: 1px solid #27272a;
              padding-top: 18px;
              margin-top: 12px;
            }
            .joinCancelBtn {
              background: #27272a;
              border: 1px solid #3f3f46;
              color: #e4e4e7;
              padding: 10px 18px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 0.85rem;
            }
            .joinCancelBtn:hover {
              background: #3f3f46;
            }
            .joinSubmitBtn {
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              border: none;
              color: #000;
              padding: 10px 20px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 700;
              font-size: 0.85rem;
            }
            .joinSubmitBtn:hover {
              box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
            }
            .joinSubmitBtn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            .successContainer {
              text-align: center;
              padding: 24px 12px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
            }
            .successCircle {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: rgba(16, 185, 129, 0.15);
              color: #10b981;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.8rem;
            }
            .successContainer h3 {
              margin: 0;
              color: #f4f4f5;
              font-size: 1.3rem;
            }
            .successContainer p {
              margin: 0;
              color: #a1a1aa;
              font-size: 0.9rem;
              line-height: 1.6;
            }
            .onlineMethodWrapper {
              display: flex;
              gap: 10px;
              margin-bottom: 20px;
            }
            .onlineMethodCard {
              flex: 1;
              background: #09090b;
              border: 1px solid #27272a;
              border-radius: 8px;
              padding: 10px;
              cursor: pointer;
              text-align: center;
              font-size: 0.8rem;
              font-weight: 700;
              color: #a1a1aa;
              transition: all 0.2s;
            }
            .onlineMethodCard.active {
              border-color: #fbbf24;
              color: #fbbf24;
              background: rgba(251, 191, 36, 0.04);
            }
          ` }} />

          <div className="joinProgramModal" onClick={(e) => e.stopPropagation()}>
            <div className="joinModalHeader">
              <h2>Enroll in Program: {program.title}</h2>
              <button className="joinModalClose" onClick={handleClose} aria-label="Close modal">
                <FaXmark />
              </button>
            </div>

            <div className="joinModalBody">
              {step === "success" && (
                <div className="successContainer">
                  <div className="successCircle">
                    <FaCheck />
                  </div>
                  <h3>Enrollment Successful!</h3>
                  <p>
                    Thank you, <strong>{name}</strong>! Your application for <strong>{program.title}</strong> has been received under reference <strong>#{orderId}</strong>.
                  </p>
                  <p style={{ fontSize: "0.85rem" }}>
                    Selected Coach: <strong>{trainer}</strong> | Duration: <strong>{duration} Month{duration > 1 ? "s" : ""}</strong>
                  </p>
                  <p style={{ fontSize: "0.85rem", background: "#09090b", padding: "10px 16px", borderRadius: "6px", border: "1px solid #27272a", width: "100%", boxSizing: "border-box" as const }}>
                    Total: <strong>Rs {totalPrice.toLocaleString()}</strong> <br />
                    Payment: <span style={{ color: txnId ? "#10b981" : "#fbbf24", fontWeight: 700 }}>{txnId ? `Paid Online (${txnId})` : "Pending (Pay at Gym)"}</span>
                  </p>

                  {/* Login credentials box */}
                  <div style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "10px", padding: "14px 16px", width: "100%", boxSizing: "border-box" as const, textAlign: "left" as const }}>
                    <p style={{ margin: "0 0 10px", fontSize: "0.82rem", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Your Portal Login Credentials</p>
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: "6px", fontSize: "0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#a1a1aa" }}>Email</span>
                        <span style={{ color: "#f4f4f5", fontWeight: 600 }}>{email}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#a1a1aa" }}>Username</span>
                        <span style={{ color: "#f4f4f5", fontWeight: 600 }}>{username}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#a1a1aa" }}>Password</span>
                        <span style={{ color: "#f4f4f5", fontWeight: 600, letterSpacing: "0.15em" }}>{"•".repeat(newPassword.length)}</span>
                      </div>
                    </div>
                    <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: "#71717a" }}>
                      You can sign in using your email address or username.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "4px" }}>
                    <button onClick={handleClose} className="joinCancelBtn" style={{ flex: 1 }}>
                      Close
                    </button>
                    <a href="/login" className="joinSubmitBtn" style={{ flex: 1, textAlign: "center" as const, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      Sign In to Portal →
                    </a>
                  </div>
                </div>
              )}

              {step === "form" && (
                <form onSubmit={handleFormSubmit}>
                  {/* Contact Info */}
                  <h4 className="formSectionTitle">1. Personal Information</h4>
                  <div className="joinFormGrid">
                    <div className="joinFormGroup fullWidthField">
                      <label>Full Name</label>
                      <input
                        type="text"
                        className="joinFormInput"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                      />
                    </div>
                    <div className="joinFormGroup">
                      <label>Email Address</label>
                      <input
                        type="email"
                        className="joinFormInput"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="joinFormGroup">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        className="joinFormInput"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 13))}
                        placeholder="Phone No."
                        maxLength={13}
                        required
                      />
                      <span style={{ fontSize: "0.75rem", color: "#71717a" }}>10-digit Nepali number (e.g. 98XXXXXXXX).</span>
                    </div>
                  </div>

                  {/* Program Options */}
                  <h4 className="formSectionTitle">2. Enrollment Plan & Coach</h4>
                  <div className="joinFormGrid">
                    <div className="joinFormGroup">
                      <label>Selected Coach / Trainer</label>
                      <select
                        className="joinFormSelect"
                        value={trainer}
                        onChange={(e) => setTrainer(e.target.value)}
                      >
                        {availableTrainers.length > 0 ? (
                          availableTrainers.map((t) => (
                            <option key={t.name} value={t.name}>
                              {t.name} ({t.specialty})
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Mike Johnson">Mike Johnson (Strength)</option>
                            <option value="Sarah Williams">Sarah Williams (Yoga)</option>
                            <option value="Emily Davis">Emily Davis (HIIT/Cardio)</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="joinFormGroup">
                      <label>Duration / Period</label>
                      <select
                        className="joinFormSelect"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                      >
                        <option value={1}>1 Month</option>
                        <option value={2}>2 Months</option>
                        <option value={3}>3 Months (10% Off)</option>
                        <option value={6}>6 Months (15% Off)</option>
                        <option value={12}>12 Months (20% Off)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Selection */}
                  <h4 className="formSectionTitle">3. Payment Preference</h4>
                  <div className="paymentSelectorWrapper">
                    <div
                      className={`paymentSelectorCard ${paymentOption === "gym" ? "active" : ""}`}
                      onClick={() => setPaymentOption("gym")}
                    >
                      <FaBuildingColumns />
                      <span>Pay at Gym</span>
                    </div>
                    <div
                      className={`paymentSelectorCard ${paymentOption === "online" ? "active" : ""}`}
                      onClick={() => setPaymentOption("online")}
                    >
                      <FaWallet />
                      <span>Pay Online Now</span>
                    </div>
                  </div>

                  {/* Pricing Overview */}
                  <h4 className="formSectionTitle">4. Billing Summary</h4>
                  <div className="pricingDetailCard">
                    <div className="pricingDetailRow">
                      <span>Selected Program</span>
                      <span style={{ color: "#fbbf24", fontWeight: 600 }}>{program.title}</span>
                    </div>
                    <div className="pricingDetailRow">
                      <span>Monthly Base Rate</span>
                      <span>Rs {basePrice.toLocaleString()} / mo</span>
                    </div>
                    <div className="pricingDetailRow">
                      <span>Duration</span>
                      <span>{duration} Month{duration > 1 ? "s" : ""}</span>
                    </div>
                    <div className="pricingDetailRow">
                      <span>Subtotal</span>
                      <span>Rs {subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="pricingDetailRow">
                        <span style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          Multi-Month Discount <span className="discountBadge">-{discountPercent}%</span>
                        </span>
                        <span style={{ color: "#10b981" }}>-Rs {discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pricingDetailRow total">
                      <span>Total Due</span>
                      <span>Rs {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {formError && (
                    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.85rem", color: "#ef4444", marginBottom: "16px" }}>
                      {formError}
                    </div>
                  )}

                  <div className="joinModalFooter">
                    <button type="button" className="joinCancelBtn" onClick={handleClose}>
                      Cancel
                    </button>
                    <button type="submit" className="joinSubmitBtn">
                      {paymentOption === "online" ? "Proceed to Payment" : "Submit Enrollment"}
                    </button>
                  </div>
                </form>
              )}

              {step === "credentials" && (
                <form onSubmit={handleCredentialsSubmit}>
                  <h4 className="formSectionTitle">Set Up Your Portal Login</h4>
                  <p style={{ fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "20px", lineHeight: 1.6 }}>
                    Create login credentials so you can sign in to <strong style={{ color: "#f4f4f5" }}>your client portal</strong> anytime to view your package, sessions, and trainer details.
                  </p>

                  <div className="joinFormGrid">
                    <div className="joinFormGroup fullWidthField">
                      <label>Username</label>
                      <input
                        type="text"
                        className="joinFormInput"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                        placeholder="e.g. johndoe123"
                        autoComplete="username"
                        required
                      />
                      <span style={{ fontSize: "0.75rem", color: "#71717a" }}>No spaces. Lowercase letters, numbers and underscores only.</span>
                    </div>
                    <div className="joinFormGroup">
                      <label>Password</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="joinFormInput"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{ position: "absolute", right: "10px", top: "10px", background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: "1rem" }}
                          aria-label="Toggle password visibility"
                        >
                          {showNewPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "4px", display: "block" }}>
                        Min. 6 characters, must include uppercase, lowercase, numbers, and special characters.
                      </span>
                    </div>
                    <div className="joinFormGroup">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        className="joinFormInput"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  {credError && (
                    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.85rem", color: "#ef4444", marginBottom: "16px" }}>
                      {credError}
                    </div>
                  )}

                  {/* Summary reminder */}
                  <div className="pricingDetailCard" style={{ marginBottom: "20px" }}>
                    <div className="pricingDetailRow">
                      <span>Program</span>
                      <span style={{ color: "#fbbf24", fontWeight: 600 }}>{program.title}</span>
                    </div>
                    <div className="pricingDetailRow">
                      <span>Duration</span>
                      <span>{duration} Month{duration > 1 ? "s" : ""}</span>
                    </div>
                    <div className="pricingDetailRow total">
                      <span>Total Due</span>
                      <span>Rs {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="joinModalFooter">
                    <button type="button" className="joinCancelBtn" onClick={() => setStep("form")}>
                      Back
                    </button>
                    <button type="submit" className="joinSubmitBtn">
                      {paymentOption === "online" ? "Proceed to Payment →" : "Complete Enrollment →"}
                    </button>
                  </div>
                </form>
              )}

              {step === "payment" && (
                <form onSubmit={handlePaymentSubmit}>
                  <h4 className="formSectionTitle">Online Payment Gateway</h4>
                  
                  <div className="onlineMethodWrapper">
                    <div
                      className={`onlineMethodCard ${onlineMethod === "card" ? "active" : ""}`}
                      onClick={() => setOnlineMethod("card")}
                    >
                      Credit/Debit Card
                    </div>
                    <div
                      className={`onlineMethodCard ${onlineMethod === "esewa" ? "active" : ""}`}
                      onClick={() => setOnlineMethod("esewa")}
                    >
                      eSewa Wallet
                    </div>
                    <div
                      className={`onlineMethodCard ${onlineMethod === "khalti" ? "active" : ""}`}
                      onClick={() => setOnlineMethod("khalti")}
                    >
                      Khalti Wallet
                    </div>
                  </div>

                  <div className="pricingDetailCard" style={{ padding: "12px 16px", marginBottom: "16px", background: "rgba(251, 191, 36, 0.02)" }}>
                    <div className="pricingDetailRow" style={{ padding: 0 }}>
                      <span style={{ color: "#f4f4f5", fontWeight: 600 }}>Amount to Pay:</span>
                      <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "1.1rem" }}>Rs {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {onlineMethod === "card" && (
                    <div className="joinFormGrid" style={{ gap: "12px" }}>
                      <div className="joinFormGroup fullWidthField">
                        <label>Card Number</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            className="joinFormInput"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim())}
                            placeholder="4111 2222 3333 4444"
                            maxLength={19}
                            required
                          />
                          <FaCreditCard style={{ position: "absolute", right: "12px", top: "12px", color: "#71717a" }} />
                        </div>
                      </div>
                      <div className="joinFormGroup">
                        <label>Expiration Date</label>
                        <input
                          type="text"
                          className="joinFormInput"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.replace(/\s?/g, "").replace(/^(\d{2})/, "$1/").trim())}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="joinFormGroup">
                        <label>CVV / CVC</label>
                        <input
                          type="password"
                          className="joinFormInput"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          placeholder="123"
                          maxLength={3}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {(onlineMethod === "esewa" || onlineMethod === "khalti") && (
                    <div className="joinFormGroup" style={{ marginBottom: "20px" }}>
                      <label>{onlineMethod === "esewa" ? "eSewa" : "Khalti"} Registered Mobile Number</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="tel"
                          className="joinFormInput"
                          value={walletPhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setWalletPhone(val);
                            setWalletPhoneError(validateNepalPhone(val));
                          }}
                          placeholder="Phone No."
                          maxLength={10}
                          required
                          style={walletPhoneError ? { borderColor: "#f87171" } : {}}
                        />
                        <span style={{ position: "absolute", right: "12px", top: "10px", fontSize: "0.8rem", color: "#fbbf24", fontWeight: 700 }}>
                          {onlineMethod.toUpperCase()}
                        </span>
                      </div>
                      {walletPhoneError && (
                        <span style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "4px", display: "block" }}>
                          {walletPhoneError}
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#a1a1aa", margin: "10px 0 20px" }}>
                    <FaLock style={{ color: "#10b981" }} />
                    <span>Secure 256-bit SSL encrypted connection. Payment is simulated for demo purposes.</span>
                  </div>

                  <div className="joinModalFooter">
                    <button type="button" className="joinCancelBtn" onClick={() => setStep("form")}>
                      Back
                    </button>
                    <button type="submit" className="joinSubmitBtn" disabled={isSubmitting}>
                      {isSubmitting ? "Processing Payment..." : `Pay Rs ${totalPrice.toLocaleString()}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
