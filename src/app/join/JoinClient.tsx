"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaArrowRight, FaSpinner, FaCircleCheck } from "react-icons/fa6";
import { useGymSettings, useGymClients, useGymPayments, getNextClientId, type PaymentLog } from "../../data/gymData";
import { clientStorageKey, type DemoClient } from "../../data/clientPortal";
import { formatCurrency } from "../../data/currency";

function JoinForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [content] = useGymSettings();
  const [clients, setClients] = useGymClients();
  const [payments, setPayments] = useGymPayments();

  // Selected plan from URL query params (default to premium)
  const planKey = searchParams?.get("plan") || "premium";

  // Form states matching screenshot
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [address, setAddress] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [planSelection, setPlanSelection] = useState(planKey.toLowerCase());

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlEmail = searchParams?.get("email");
    if (urlEmail && emailRegex.test(urlEmail) && urlEmail !== "new@gmail.com") {
      setEmail(urlEmail);
    } else {
      const storedEmail = window.localStorage.getItem("fitness-claimed-offer-email");
      if (storedEmail && emailRegex.test(storedEmail) && storedEmail !== "new@gmail.com") {
        setEmail(storedEmail);
        // Clear it immediately so it is not set as default next time!
        window.localStorage.removeItem("fitness-claimed-offer-email");
      } else if (storedEmail === "new@gmail.com") {
        // Clean up the dummy test email from localStorage
        window.localStorage.removeItem("fitness-claimed-offer-email");
      }
    }
  }, [searchParams]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registeredClient, setRegisteredClient] = useState<DemoClient | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const today = new Date();
      const renewDate = new Date(today);
      renewDate.setMonth(renewDate.getMonth() + 12);

      const activePlan = content.membershipPlans.find((p) => p.key === planSelection) || content.membershipPlans[0];
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      const createdClient: DemoClient = {
        id: getNextClientId(clients),
        name: fullName,
        email: email.trim(),
        phone: phone.trim(),
        memberSince: today.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        package: {
          key: activePlan.key,
          name: activePlan.name,
          price: activePlan.price,
          access: activePlan.access,
          status: "Pending", // Pending payment at gym desk
          startedOn: today.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          renewsOn: renewDate.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          paymentMethod: "GYM",
          sessionsUsed: 0,
          sessionsTotal: activePlan.sessionsTotal || 24,
          features: activePlan.features,
          upcomingClasses: activePlan.upcomingClasses,
          trainer: activePlan.trainer,
        },
        address: address.trim(),
        // Custom dynamic fields from screenshot
        weight: weight.trim(),
        height: height.trim(),
        specialRequest: specialRequest.trim(),
      } as any;

      // Save currently logged in user to local storage
      window.localStorage.setItem(clientStorageKey, JSON.stringify(createdClient));

      setClients([...clients, createdClient]);

      // Create a pending payment log in local storage
      const newPayment: PaymentLog = {
        txnId: `TXN${Math.floor(1000 + Math.random() * 9000)}`,
        member: fullName,
        amount: formatCurrency(activePlan.price),
        method: "GYM",
        status: "Pending",
        date: today.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
      setPayments([newPayment, ...payments]);

      setRegisteredClient(createdClient);
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted && registeredClient) {
    return (
      <div className="successCard">
        <style jsx>{`
          .successCard {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            max-width: 550px;
            margin: 40px auto;
            color: #111;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .successTitle {
            font-size: 24px;
            font-weight: 800;
            margin: 16px 0 8px;
            color: #000;
          }
          .successDesc {
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 24px;
            font-size: 15px;
          }
          .viewBtn {
            background: #ffe500;
            color: #000;
            font-size: 16px;
            font-weight: 700;
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: background 0.2s;
          }
          .viewBtn:hover {
            background: #e6ce00;
          }
        `}</style>
        <div style={{ fontSize: "56px", color: "#22c55e" }}>
          <FaCircleCheck style={{ display: "inline-block" }} />
        </div>
        <h2 className="successTitle">Application Submitted Successfully!</h2>
        <p className="successDesc">
          Thank you, <strong>{registeredClient.name}</strong>. Your membership application has been registered. Please complete your payment online to activate your package immediately.
        </p>
        <button className="viewBtn" onClick={() => router.push("/checkout")}>
          Continue to Pay <FaArrowRight />
        </button>
      </div>
    );
  }

  return (
    <div className="membershipFormContainer">
      <style jsx>{`
        .membershipFormContainer {
          max-width: 800px;
          margin: 40px auto;
          padding: 30px;
          background: #fff;
          border-radius: 8px;
          color: #111;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .membershipFormTitle {
          font-size: 38px;
          font-weight: 800;
          margin-bottom: 30px;
          color: #000;
          letter-spacing: -0.5px;
        }
        .membershipForm {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .formRow {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 600px) {
          .formRow {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .membershipFormContainer {
            margin: 20px 12px;
            padding: 20px 16px;
          }
          .membershipFormTitle {
            font-size: 28px;
            margin-bottom: 20px;
          }
          .formSubmitBtn {
            width: 100%;
            justify-content: center;
            align-self: stretch;
          }
        }
        .formGroup {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .formGroup label {
          font-size: 15px;
          font-weight: 700;
          color: #000;
        }
        .formGroup label span {
          color: #ef4444;
          margin-left: 2px;
        }
        .formInput {
          padding: 12px 16px;
          font-size: 15px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fafafa;
          color: #111;
          width: 100%;
          transition: border-color 0.2s, background 0.2s;
        }
        .formInput::placeholder {
          color: #9ca3af;
        }
        .formInput:focus {
          border-color: #ffe500;
          outline: none;
          background: #fff;
        }
        .formTextarea {
          padding: 12px 16px;
          font-size: 15px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fafafa;
          color: #111;
          width: 100%;
          min-height: 140px;
          resize: vertical;
          transition: border-color 0.2s, background 0.2s;
        }
        .formTextarea::placeholder {
          color: #9ca3af;
        }
        .formTextarea:focus {
          border-color: #ffe500;
          outline: none;
          background: #fff;
        }
        .formSubmitBtn {
          background: #ffe500;
          color: #000;
          font-size: 16px;
          font-weight: 700;
          padding: 14px 44px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          align-self: flex-start;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .formSubmitBtn:hover {
          background: #e6ce00;
        }
        .formSubmitBtn:disabled {
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
      `}</style>

      <h1 className="membershipFormTitle">Membership Application</h1>

      <form className="membershipForm" onSubmit={handleSubmit}>
        {/* Name Fields Row */}
        <div className="formGroup">
          <label>Name <span>*</span></label>
          <div className="formRow">
            <div>
              <input
                type="text"
                className="formInput"
                placeholder="First name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
                }}
              />
              {errors.firstName && <span className="errorMsg">{errors.firstName}</span>}
            </div>
            <div>
              <input
                type="text"
                className="formInput"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: "" }));
                }}
              />
              {errors.lastName && <span className="errorMsg">{errors.lastName}</span>}
            </div>
          </div>
        </div>

        {/* Contact Info Row */}
        <div className="formRow">
          <div className="formGroup">
            <label>Phone Number <span>*</span></label>
            <input
              type="tel"
              className={`formInput${errors.phone ? " inputError" : ""}`}
              placeholder="e.g. 9812345678"
              value={phone}
              maxLength={10}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                setPhone(digits);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
            />
            {errors.phone && <span className="errorMsg">{errors.phone}</span>}
          </div>
          <div className="formGroup">
            <label>Email <span>*</span></label>
            <input
              type="email"
              className="formInput"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
            {errors.email && <span className="errorMsg">{errors.email}</span>}
          </div>
        </div>

        {/* Weight & Height Row */}
        <div className="formRow">
          <div className="formGroup">
            <label>Weight (kg)</label>
            <input
              type="text"
              className="formInput"
              placeholder="Weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="formGroup">
            <label>Height (ft)</label>
            <input
              type="text"
              className="formInput"
              placeholder="Height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>

        {/* Membership Plan Select Dropdown */}
        <div className="formGroup">
          <label>Membership Plan <span>*</span></label>
          <select
            className="formInput"
            style={{ appearance: "auto" }}
            value={planSelection}
            onChange={(e) => setPlanSelection(e.target.value)}
            required
          >
            {content.membershipPlans.map((plan) => (
              <option key={plan.key} value={plan.key}>
                {plan.name} ({formatCurrency(plan.price)}/month)
              </option>
            ))}
          </select>
        </div>

        {/* Address Field */}
        <div className="formGroup">
          <label>Address</label>
          <input
            type="text"
            className="formInput"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Special Request Field */}
        <div className="formGroup">
          <label>Any Special Request?</label>
          <textarea
            className="formTextarea"
            placeholder="Let us know..."
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
          />
        </div>

        {/* Submit button */}
        <button type="submit" className="formSubmitBtn" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <FaSpinner className="spinnerIcon" style={{ animation: "spin 1s linear infinite" }} /> Sending...
            </>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}

export default function JoinClient() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <FaSpinner style={{ fontSize: "28px", animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <JoinForm />
    </Suspense>
  );
}
