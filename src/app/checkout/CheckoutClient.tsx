"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaLock,
  FaCreditCard,
  FaCircleCheck,
  FaSpinner,
  FaArrowLeft,
  FaCheck,
  FaWallet,
  FaQrcode,
} from "react-icons/fa6";
import { clientStorageKey, type DemoClient } from "../../data/clientPortal";
import {
  useGymClients,
  useGymPayments,
  useGymOffers,
  type PaymentLog,
  type Offer,
} from "../../data/gymData";
import { formatCurrency } from "../../data/currency";

export default function CheckoutClient() {
  const router = useRouter();
  const [clients, setClients] = useGymClients();
  const [payments, setPayments] = useGymPayments();
  const [client, setClient] = useState<DemoClient | null>(null);
  const [activeTab, setActiveTab] = useState<"card" | "esewa" | "khalti" | "qr">("card");

  // Promo code / Offer states
  const [offers] = useGymOffers();
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [showAvailableOffers, setShowAvailableOffers] = useState(false);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Wallet details state
  const [walletPhone, setWalletPhone] = useState("");
  const [walletPin, setWalletPin] = useState("");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Credentials setup state
  const [username, setUsername] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [credsError, setCredsError] = useState("");
  const [credsSaving, setCredsSaving] = useState(false);
  const [credsSaved, setCredsSaved] = useState(false);

  useEffect(() => {
    const storedClient = window.localStorage.getItem(clientStorageKey);
    if (storedClient) {
      try {
        const parsed = JSON.parse(storedClient) as DemoClient;
        setClient(parsed);
        setEmailInput(parsed.email || "");
        if (parsed.name) {
          const suggestedUsername = parsed.name.toLowerCase().replace(/[^a-z0-9]/g, "");
          setUsername(suggestedUsername);
        }
      } catch (e) {
        console.error("Error parsing stored client", e);
      }
    }
  }, []);

  if (!client) {
    return (
      <div className="noClientCard">
        <style jsx>{`
          .noClientCard {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 45px 30px;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            max-width: 550px;
            margin: 80px auto;
            color: #111;
            font-family: system-ui, -apple-system, sans-serif;
          }
          h2 {
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 12px;
          }
          p {
            color: #6b7280;
            margin-bottom: 24px;
            font-size: 15px;
          }
          .btn {
            background: #ffe500;
            color: #000;
            font-weight: 700;
            padding: 12px 28px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: background 0.2s;
          }
          .btn:hover {
            background: #e6ce00;
          }
        `}</style>
        <h2>No Active Checkout Found</h2>
        <p>You need to register for a gym membership before completing payment.</p>
        <button className="btn" onClick={() => router.push("/join")}>
          Join Now
        </button>
      </div>
    );
  }

  const activePackage = client.package;

  const activeOffers = offers.filter((o) => o.status === "Active");

  const calculateDiscount = (price: number, offer: Offer) => {
    if (offer.type === "Percentage") {
      const pct = parseFloat(offer.discount.replace(/[^0-9.]/g, "")) || 0;
      return (price * pct) / 100;
    } else {
      const val = parseFloat(offer.discount.replace(/[^0-9.]/g, "")) || 0;
      return val;
    }
  };

  const discountAmount = appliedOffer ? calculateDiscount(activePackage.price, appliedOffer) : 0;
  const finalAmount = Math.max(0, activePackage.price - discountAmount);

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a promo code.");
      return;
    }

    const matchedOffer = activeOffers.find(
      (o) => o.code.toUpperCase() === code
    );

    if (!matchedOffer) {
      setPromoError("Invalid or expired promo code.");
      setPromoSuccess("");
      setAppliedOffer(null);
      return;
    }

    setAppliedOffer(matchedOffer);
    setPromoSuccess(`Promo code "${matchedOffer.code}" applied successfully!`);
    setPromoError("");
  };

  const handleRemovePromo = () => {
    setAppliedOffer(null);
    setPromoSuccess("");
    setPromoError("");
    setPromoCodeInput("");
  };

  const paymentMethodName = (tab: string) => {
    switch (tab) {
      case "card":
        return "Card";
      case "esewa":
        return "eSewa";
      case "khalti":
        return "Khalti";
      case "qr":
        return "Fonepay QR";
      default:
        return "Online";
    }
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const parts = [];
    for (let i = 0; i < digits.length && i < 16; i += 4) {
      parts.push(digits.substring(i, i + 4));
    }
    return parts.join(" ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    }
    return digits;
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingStep(0);

    // Advance processing messages
    setTimeout(() => setProcessingStep(1), 800);
    setTimeout(() => setProcessingStep(2), 1600);
    setTimeout(() => setProcessingStep(3), 2400);

    setTimeout(() => {
      // Create updated client
      const updatedClient: DemoClient = {
        ...client,
        package: {
          ...client.package,
          status: "Active" as const,
          paymentMethod: paymentMethodName(activeTab),
        },
      };

      const updatedClientsList = clients.map((c) =>
        c.id === client.id ? updatedClient : c
      );
      setClients(updatedClientsList);

      // Update current active client storage
      window.localStorage.setItem(clientStorageKey, JSON.stringify(updatedClient));

      let updatedPaymentsList = [...payments];
      const pendingIdx = payments.findIndex(
        (p) => p.member === client.name && p.status === "Pending"
      );

      if (pendingIdx !== -1) {
        updatedPaymentsList[pendingIdx] = {
          ...payments[pendingIdx],
          status: "Paid",
          amount: formatCurrency(finalAmount),
          method: paymentMethodName(activeTab),
        };
      } else {
        // Fallback: create payment log if somehow not found
        const newPayment: PaymentLog = {
          txnId: `TXN${Math.floor(1000 + Math.random() * 9000)}`,
          member: client.name,
          amount: formatCurrency(finalAmount),
          method: paymentMethodName(activeTab),
          status: "Paid",
          date: new Date().toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        };
        updatedPaymentsList = [newPayment, ...updatedPaymentsList];
      }
      setPayments(updatedPaymentsList);

      setIsProcessing(false);
      setIsCompleted(true);
    }, 3200);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setCredsError("Username is required.");
      return;
    }
    if (username.trim().length < 3) {
      setCredsError("Username must be at least 3 characters.");
      return;
    }
    if (!emailInput.trim()) {
      setCredsError("Email is required.");
      return;
    }
    if (passwordInput.length < 4) {
      setCredsError("Password must be at least 4 characters.");
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setCredsError("Passwords do not match.");
      return;
    }

    setCredsSaving(true);

    setTimeout(() => {
      // Check if username or email is already taken by ANOTHER client
      const usernameExists = clients.some(
        (c) => c.id !== client.id && c.username && c.username.toLowerCase() === username.trim().toLowerCase()
      );
      if (usernameExists) {
        setCredsError("Username is already taken.");
        setCredsSaving(false);
        return;
      }

      const emailExists = clients.some(
        (c) => c.id !== client.id && c.email.toLowerCase() === emailInput.trim().toLowerCase()
      );
      if (emailExists) {
        setCredsError("Email is already registered by another account.");
        setCredsSaving(false);
        return;
      }

      const updatedClient: DemoClient = {
        ...client,
        email: emailInput.trim(),
        username: username.trim().toLowerCase(),
        password: passwordInput,
      };

      const updatedClientsList = clients.map((c) =>
        c.id === client.id ? updatedClient : c
      );
      setClients(updatedClientsList);

      // Update current active client storage
      window.localStorage.setItem(clientStorageKey, JSON.stringify(updatedClient));

      setCredsSaving(false);
      setCredsSaved(true);

      setTimeout(() => {
        router.push("/client");
      }, 1500);
    }, 1000);
  };

  const getProcessingMessage = () => {
    switch (processingStep) {
      case 0:
        return "Establishing secure gateway connection...";
      case 1:
        return "Verifying card details and credentials...";
      case 2:
        return "Authorizing funds transfer...";
      case 3:
        return "Success! Finalizing membership activation...";
      default:
        return "Processing payment...";
    }
  };

  if (isCompleted) {
    return (
      <div className="statusCard">
        <style jsx>{`
          .statusCard {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 40px 30px;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            max-width: 550px;
            margin: 40px auto;
            color: #111;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .iconWrapper {
            font-size: 56px;
            color: #22c55e;
            margin-bottom: 16px;
            animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          h2 {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 12px;
            color: #000;
          }
          p {
            color: #4b5563;
            font-size: 15px;
            margin-bottom: 16px;
            line-height: 1.6;
          }
          .credsForm {
            text-align: left;
            margin-top: 24px;
            border-top: 1px solid #f3f4f6;
            padding-top: 24px;
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
            font-size: 13.5px;
            font-weight: 700;
            color: #374151;
          }
          .input {
            padding: 10px 14px;
            font-size: 14px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: #fafafa;
            width: 100%;
            transition: border-color 0.2s;
            color: #111;
          }
          .input:focus {
            border-color: #ffe500;
            outline: none;
            background: #fff;
          }
          .submitBtn {
            background: #ffe500;
            color: #000;
            font-weight: 700;
            font-size: 15px;
            padding: 12px;
            border: none;
            border-radius: 6px;
            width: 100%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: background 0.2s;
            margin-top: 8px;
          }
          .submitBtn:hover {
            background: #e6ce00;
          }
          .submitBtn:disabled {
            background: #e5e7eb;
            color: #9ca3af;
            cursor: not-allowed;
          }
          .errorMsg {
            color: #ef4444;
            font-size: 13px;
            font-weight: 500;
            margin-top: 4px;
          }
          .successText {
            color: #22c55e;
            font-size: 14px;
            font-weight: 600;
            margin-top: 16px;
            text-align: center;
          }
          @keyframes scaleIn {
            0% { transform: scale(0); }
            100% { transform: scale(1); }
          }
        `}</style>
        <div className="iconWrapper">
          <FaCircleCheck style={{ display: "inline-block" }} />
        </div>
        <h2>Payment Successful!</h2>
        <p>
          Thank you, <strong>{client.name}</strong>. Your payment of <strong>{formatCurrency(finalAmount)}</strong> has been received.
        </p>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          Please set up your login credentials below so you can sign in to view your package, renewal dates, and class schedules in the future.
        </p>

        {credsSaved ? (
          <div className="successText">
            Account login credentials saved! Redirecting to dashboard...
          </div>
        ) : (
          <form className="credsForm" onSubmit={handleSaveCredentials}>
            <div className="formGroup">
              <label htmlFor="username-creds-input">Username</label>
              <input
                type="text"
                id="username-creds-input"
                className="input"
                placeholder="e.g. johndoe123"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""));
                  if (credsError) setCredsError("");
                }}
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="email-creds-input">Email Address</label>
              <input
                type="email"
                id="email-creds-input"
                className="input"
                placeholder="john@example.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (credsError) setCredsError("");
                }}
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="password-creds-input">Password</label>
              <input
                type="password"
                id="password-creds-input"
                className="input"
                placeholder="Minimum 4 characters"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (credsError) setCredsError("");
                }}
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="confirm-password-creds-input">Confirm Password</label>
              <input
                type="password"
                id="confirm-password-creds-input"
                className="input"
                placeholder="Re-enter password"
                value={confirmPasswordInput}
                onChange={(e) => {
                  setConfirmPasswordInput(e.target.value);
                  if (credsError) setCredsError("");
                }}
                required
              />
            </div>

            {credsError && <div className="errorMsg">{credsError}</div>}

            <button type="submit" className="submitBtn" disabled={credsSaving}>
              {credsSaving ? (
                <>
                  <FaSpinner className="spinnerIcon" style={{ animation: "spin 1s linear infinite" }} /> Creating Account...
                </>
              ) : (
                "Save & Continue to Dashboard"
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="statusCard">
        <style jsx>{`
          .statusCard {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 60px 30px;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            max-width: 550px;
            margin: 60px auto;
            color: #111;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .spinnerWrapper {
            font-size: 50px;
            color: #ffe500;
            margin-bottom: 25px;
            animation: spin 1.2s linear infinite;
          }
          h2 {
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 12px;
            color: #000;
          }
          p {
            color: #4b5563;
            font-size: 15px;
            font-weight: 500;
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="spinnerWrapper">
          <FaSpinner style={{ display: "inline-block" }} />
        </div>
        <h2>Processing Payment</h2>
        <p>{getProcessingMessage()}</p>
      </div>
    );
  }

  return (
    <div className="checkoutContainer">
      <style jsx>{`
        .checkoutContainer {
          max-width: 900px;
          margin: 40px auto;
          padding: 0 20px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #111;
        }
        .backButton {
          background: transparent;
          border: none;
          color: #6b7280;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 24px;
          transition: color 0.2s;
        }
        .backButton:hover {
          color: #000;
        }
        .title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 28px;
          color: #000;
          letter-spacing: -0.5px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 32px;
        }
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
        @media (max-width: 480px) {
          .checkoutContainer {
            margin: 20px auto;
            padding: 0 12px;
          }
          .title {
            font-size: 24px;
            margin-bottom: 18px;
          }
          .sectionPanel {
            padding: 16px;
          }
          .paymentTabs {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          .tabButton {
            padding: 12px 6px;
          }
          .row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .payButton {
            padding: 14px;
            font-size: 14px;
          }
        }
        .sectionPanel {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .sectionPanelTitle {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #000;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 12px;
        }
        .planSummary {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .summaryRow {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
        }
        .summaryTotal {
          border-top: 1px dashed #e5e7eb;
          margin-top: 8px;
          padding-top: 16px;
          font-weight: 700;
          font-size: 18px;
          color: #000;
        }
        .benefitList {
          list-style: none;
          padding: 0;
          margin: 16px 0 0 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .benefitItem {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
          color: #4b5563;
        }
        .benefitItem svg {
          color: #22c55e;
          flex-shrink: 0;
        }
        .paymentTabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        .tabButton {
          padding: 10px 4px;
          border: 1.5px solid #e5e7eb;
          border-radius: 6px;
          background: #fff;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-size: 11px;
          transition: all 0.2s;
        }
        .tabButton:hover {
          border-color: #ffe500;
          background: #fafafa;
        }
        .tabButton.active {
          border-color: #000;
          background: #fff;
          box-shadow: 0 0 0 1px #000;
        }
        .tabButton.card.active { border-color: #2563eb; box-shadow: 0 0 0 1px #2563eb; }
        .tabButton.esewa.active { border-color: #60b246; box-shadow: 0 0 0 1px #60b246; }
        .tabButton.khalti.active { border-color: #5c2d91; box-shadow: 0 0 0 1px #5c2d91; }
        .tabButton.qr.active { border-color: #d32f2f; box-shadow: 0 0 0 1px #d32f2f; }

        .tabIcon {
          font-size: 16px;
        }
        .tabText {
          text-align: center;
        }
        .esewaColor { color: #60b246; }
        .khaltiColor { color: #5c2d91; }
        .qrColor { color: #d32f2f; }
        .cardColor { color: #2563eb; }

        .formGroup {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .formGroup label {
          font-size: 13.5px;
          font-weight: 700;
          color: #374151;
        }
        .input {
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fafafa;
          width: 100%;
          transition: border-color 0.2s;
        }
        .input:focus {
          border-color: #000;
          outline: none;
          background: #fff;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .payButton {
          background: #ffe500;
          color: #000;
          font-weight: 700;
          font-size: 15px;
          padding: 13px;
          border: none;
          border-radius: 6px;
          width: 100%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s;
          margin-top: 8px;
        }
        .payButton:hover {
          background: #e6ce00;
        }
        .secureBadge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
          margin-top: 16px;
        }
        .secureBadge svg {
          color: #22c55e;
        }
        .qrCodeWrapper {
          text-align: center;
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .qrText {
          font-size: 13px;
          color: #4b5563;
          line-height: 1.5;
          max-width: 250px;
        }
      `}</style>

      <button className="backButton" onClick={() => router.push("/join")}>
        <FaArrowLeft /> Edit Application Info
      </button>

      <h1 className="title">Secure Checkout</h1>

      <div className="grid">
        {/* Left Side: Payment Form */}
        <article className="sectionPanel">
          <h2 className="sectionPanelTitle">Select Payment Method</h2>

          {/* Tabs */}
          <div className="paymentTabs">
            <button
              type="button"
              className={`tabButton card ${activeTab === "card" ? "active" : ""}`}
              onClick={() => setActiveTab("card")}
            >
              <FaCreditCard className="tabIcon cardColor" />
              <span className="tabText">Credit Card</span>
            </button>
            <button
              type="button"
              className={`tabButton esewa ${activeTab === "esewa" ? "active" : ""}`}
              onClick={() => setActiveTab("esewa")}
            >
              <FaWallet className="tabIcon esewaColor" />
              <span className="tabText">eSewa Wallet</span>
            </button>
            <button
              type="button"
              className={`tabButton khalti ${activeTab === "khalti" ? "active" : ""}`}
              onClick={() => setActiveTab("khalti")}
            >
              <FaWallet className="tabIcon khaltiColor" />
              <span className="tabText">Khalti Wallet</span>
            </button>
            <button
              type="button"
              className={`tabButton qr ${activeTab === "qr" ? "active" : ""}`}
              onClick={() => setActiveTab("qr")}
            >
              <FaQrcode className="tabIcon qrColor" />
              <span className="tabText">Fonepay QR</span>
            </button>
          </div>

          <form onSubmit={handlePayment}>
            {/* Tab 1: Credit Card */}
            {activeTab === "card" && (
              <div className="tabContent">
                <div className="formGroup">
                  <label htmlFor="card-name-input">Cardholder Name</label>
                  <input
                    type="text"
                    id="card-name-input"
                    className="input"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="card-number-input">Card Number</label>
                  <input
                    type="text"
                    id="card-number-input"
                    className="input"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    required
                  />
                </div>
                <div className="row">
                  <div className="formGroup">
                    <label htmlFor="card-expiry-input">Expiry Date</label>
                    <input
                      type="text"
                      id="card-expiry-input"
                      className="input"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label htmlFor="card-cvv-input">CVV</label>
                    <input
                      type="password"
                      id="card-cvv-input"
                      className="input"
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: eSewa */}
            {activeTab === "esewa" && (
              <div className="tabContent">
                <div className="formGroup">
                  <label htmlFor="esewa-id-input">eSewa ID (Mobile Number)</label>
                  <input
                    type="tel"
                    id="esewa-id-input"
                    className="input"
                    placeholder="Phone No."
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="esewa-pin-input">eSewa MPIN / Password</label>
                  <input
                    type="password"
                    id="esewa-pin-input"
                    className="input"
                    placeholder="••••"
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Khalti */}
            {activeTab === "khalti" && (
              <div className="tabContent">
                <div className="formGroup">
                  <label htmlFor="khalti-id-input">Khalti ID (Mobile Number)</label>
                  <input
                    type="tel"
                    id="khalti-id-input"
                    className="input"
                    placeholder="Phone No."
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="khalti-pin-input">Khalti Transaction PIN</label>
                  <input
                    type="password"
                    id="khalti-pin-input"
                    className="input"
                    placeholder="••••"
                    value={walletPin}
                    onChange={(e) => setWalletPin(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Tab 4: Fonepay QR */}
            {activeTab === "qr" && (
              <div className="qrCodeWrapper">
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 100 100"
                  style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}
                >
                  {/* Outer Frame */}
                  <rect x="5" y="5" width="90" height="90" fill="none" stroke="#d32f2f" strokeWidth="2.5" />
                  {/* QR Pattern Mocks */}
                  {/* Top-Left Finder */}
                  <rect x="10" y="10" width="20" height="20" fill="#000" />
                  <rect x="13" y="13" width="14" height="14" fill="#fff" />
                  <rect x="16" y="16" width="8" height="8" fill="#000" />
                  {/* Top-Right Finder */}
                  <rect x="70" y="10" width="20" height="20" fill="#000" />
                  <rect x="73" y="13" width="14" height="14" fill="#fff" />
                  <rect x="76" y="16" width="8" height="8" fill="#000" />
                  {/* Bottom-Left Finder */}
                  <rect x="10" y="70" width="20" height="20" fill="#000" />
                  <rect x="13" y="73" width="14" height="14" fill="#fff" />
                  <rect x="16" y="76" width="8" height="8" fill="#000" />
                  {/* Random QR pixels */}
                  <rect x="35" y="12" width="6" height="6" fill="#000" />
                  <rect x="45" y="15" width="4" height="4" fill="#000" />
                  <rect x="55" y="10" width="8" height="6" fill="#000" />
                  <rect x="38" y="25" width="8" height="4" fill="#000" />
                  <rect x="50" y="22" width="12" height="6" fill="#000" />
                  <rect x="15" y="38" width="6" height="10" fill="#000" />
                  <rect x="25" y="45" width="8" height="6" fill="#000" />
                  <rect x="10" y="55" width="10" height="4" fill="#000" />
                  <rect x="35" y="35" width="30" height="30" fill="none" stroke="#d32f2f" strokeWidth="2" />
                  <rect x="42" y="42" width="16" height="16" fill="#d32f2f" />
                  <polygon points="50,45 57,55 43,55" fill="#fff" />
                  <rect x="72" y="35" width="6" height="12" fill="#000" />
                  <rect x="82" y="42" width="8" height="6" fill="#000" />
                  <rect x="75" y="52" width="10" height="10" fill="#000" />
                  <rect x="38" y="72" width="10" height="8" fill="#000" />
                  <rect x="52" y="78" width="12" height="10" fill="#000" />
                  <rect x="40" y="88" width="18" height="4" fill="#000" />
                  <rect x="72" y="72" width="8" height="8" fill="#000" />
                  <rect x="82" y="82" width="8" height="8" fill="#000" />
                </svg>
                <p className="qrText">
                  Scan the QR code with your mobile banking app or payment wallet to transfer the amount, then click the button below.
                </p>
              </div>
            )}

            <button type="submit" className="payButton">
              Pay {formatCurrency(finalAmount)} Now
            </button>

            <div className="secureBadge">
              <FaLock /> Secured by 256-bit SSL Encryption
            </div>
          </form>
        </article>

        {/* Right Side: Offer Summary */}
        <article className="sectionPanel">
          <h2 className="sectionPanelTitle">Offer Summary</h2>
          <div className="planSummary">
            <div className="summaryRow">
              <span style={{ color: "#4b5563" }}>Member Name</span>
              <strong style={{ color: "#000" }}>{client.name}</strong>
            </div>
            <div className="summaryRow">
              <span style={{ color: "#4b5563" }}>Selected Plan</span>
              <strong style={{ color: "#000" }}>{activePackage.name}</strong>
            </div>
            <div className="summaryRow">
              <span style={{ color: "#4b5563" }}>Billing Cycle</span>
              <span style={{ color: "#4b5563" }}>1 Year (Annual renewal)</span>
            </div>
            <div className="summaryRow">
              <span style={{ color: "#4b5563" }}>Duration</span>
              <span style={{ color: "#4b5563" }}>{activePackage.startedOn} - {activePackage.renewsOn}</span>
            </div>

            {/* Promo Code Section */}
            <div className="promoSection" style={{ borderTop: "1px dashed #e5e7eb", padding: "16px 0", marginTop: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px", color: "#374151" }}>
                Promo / Offer Code
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  className="input"
                  style={{ textTransform: "uppercase", padding: "8px 12px", fontSize: "13px" }}
                  value={promoCodeInput}
                  onChange={(e) => {
                    setPromoCodeInput(e.target.value.toUpperCase());
                    setPromoError("");
                  }}
                  disabled={!!appliedOffer}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="applyBtn"
                  style={{
                    background: !!appliedOffer ? "#e5e7eb" : "#ffe500",
                    color: !!appliedOffer ? "#9ca3af" : "#000",
                    fontWeight: "700",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: !!appliedOffer ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    transition: "background 0.2s"
                  }}
                  disabled={!!appliedOffer}
                >
                  Apply
                </button>
              </div>

              {promoError && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px", fontWeight: "500" }}>{promoError}</p>}
              {promoSuccess && <p style={{ color: "#22c55e", fontSize: "12px", marginTop: "6px", fontWeight: "500" }}>{promoSuccess}</p>}

              {appliedOffer && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", background: "#f0fdf4", padding: "8px 12px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                  <span style={{ fontSize: "12px", color: "#166534", fontWeight: "600" }}>
                    Code Applied: {appliedOffer.code} ({appliedOffer.discount} Off)
                  </span>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    style={{ background: "transparent", border: "none", color: "#ef4444", fontWeight: "700", cursor: "pointer", fontSize: "11px" }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Accordion for Available Offers */}
              <div style={{ marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAvailableOffers(!showAvailableOffers)}
                  style={{ background: "transparent", border: "none", color: "#2563eb", fontSize: "12px", cursor: "pointer", padding: "0", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {showAvailableOffers ? "Hide Available Offers" : "View Available Offers"}
                </button>
                {showAvailableOffers && (
                  <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "8px 12px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {activeOffers.length === 0 ? (
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>No active offers at the moment.</span>
                    ) : (
                      activeOffers.map((o) => (
                        <button
                          key={o.code}
                          type="button"
                          onClick={() => {
                            if (!appliedOffer) {
                              setPromoCodeInput(o.code);
                              // Auto-apply code
                              const matchedOffer = activeOffers.find((x) => x.code === o.code);
                              if (matchedOffer) {
                                setAppliedOffer(matchedOffer);
                                setPromoSuccess(`Promo code "${matchedOffer.code}" applied successfully!`);
                                setPromoError("");
                              }
                            }
                          }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "12px",
                            background: hoveredCode === o.code ? "#e5e7eb" : "none",
                            border: "none",
                            padding: "6px 8px",
                            width: "100%",
                            cursor: !!appliedOffer ? "not-allowed" : "pointer",
                            textAlign: "left",
                            borderRadius: "4px",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={() => setHoveredCode(o.code)}
                          onMouseLeave={() => setHoveredCode(null)}
                          disabled={!!appliedOffer}
                        >
                          <div>
                            <span style={{ fontWeight: "700", color: "#2563eb", textDecoration: "underline" }}>{o.code}</span>
                            <span style={{ color: "#4b5563", marginLeft: "6px" }}>({o.name})</span>
                          </div>
                          <span style={{ color: "#166534", fontWeight: "700" }}>{o.discount} Off</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {appliedOffer && (
              <div className="summaryRow" style={{ borderTop: "1px dashed #e5e7eb", paddingTop: "12px", color: "#166534" }}>
                <span>Discount ({appliedOffer.code})</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="summaryRow summaryTotal" style={{ borderTop: "1px dashed #e5e7eb", paddingTop: "12px" }}>
              <span>Amount Due</span>
              <span>{formatCurrency(finalAmount)}</span>
            </div>

            <div style={{ marginTop: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "10px" }}>
                Included Benefits:
              </span>
              <ul className="benefitList">
                {activePackage.features.map((feature) => (
                  <li key={feature} className="benefitItem">
                    <FaCheck />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
