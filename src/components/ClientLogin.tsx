"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash, FaArrowLeft, FaCircleCheck } from "react-icons/fa6";
import { clientStorageKey } from "../data/clientPortal";
import { useGymClients } from "../data/gymData";

type Screen = "login" | "forgot" | "verify" | "reset" | "success";

// Simple deterministic code derived from the client's email so it's reproducible
function generateResetCode(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash * 31 + email.charCodeAt(i)) & 0xffffffff;
  }
  return "FB" + String(Math.abs(hash) % 900000 + 100000);
}

export default function ClientLogin() {
  const router = useRouter();
  const [clients, setClients] = useGymClients();

  const [screen, setScreen] = useState<Screen>("login");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [error, setError] = useState("");

  // Forgot-password fields
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const goTo = (s: Screen) => {
    setError("");
    setScreen(s);
  };

  // ── Login ────────────────────────────────────────────────────────────────────

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const client = clients.find(
      (member) =>
        member.email.toLowerCase() === email.trim().toLowerCase() ||
        (member.username &&
          member.username.toLowerCase() === email.trim().toLowerCase())
    );

    if (!client) {
      setError("Account not found. Please check your email.");
      return;
    }

    if (!client.password) {
      setError(
        "Your portal password is not set yet. Please complete checkout or contact the front desk."
      );
      return;
    }

    if (client.password !== password) {
      setError("Incorrect password.");
      return;
    }

    window.localStorage.setItem(clientStorageKey, JSON.stringify(client));
    if (client.package?.key === "none" || client.package?.name === "No Active Plan") {
      router.push("/shop-portal");
      return;
    }

    window.localStorage.setItem("hasClickedDashboard", "true");
    if (staySignedIn) {
      window.localStorage.setItem("staySignedIn", "true");
    }
    router.push("/client");
  };

  // ── Forgot – step 1: enter email ────────────────────────────────────────────

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const match = clients.find(
      (c) => c.email.toLowerCase() === recoveryEmail.trim().toLowerCase()
    );

    if (!match) {
      setError("No account found with that email address.");
      return;
    }

    goTo("verify");
  };

  // ── Forgot – step 2: verify code ────────────────────────────────────────────

  const expectedCode = generateResetCode(recoveryEmail.trim().toLowerCase());

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (verificationCode.trim().toUpperCase() !== expectedCode.toUpperCase()) {
      setError("Invalid reset code. Please try again.");
      return;
    }

    goTo("reset");
  };

  // ── Forgot – step 3: set new password ───────────────────────────────────────

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const updated = clients.map((c) =>
      c.email.toLowerCase() === recoveryEmail.trim().toLowerCase()
        ? { ...c, password: newPassword }
        : c
    );

    setClients(updated);
    goTo("success");
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <section className="signInPageContainer">
      <div className="signInFormWrapper">
        <h1>Fitness Bhaktapur</h1>

        {/* ── LOGIN ── */}
        {screen === "login" && (
          <>
            <p className="signInIntro">
              Enter your email address and password to sign in to your Fitness
              Bhaktapur account.
            </p>

            <form className="signInForm" onSubmit={handleSubmit} autoComplete="off">
              <div className="signInFormGroup">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="signInFormGroup">
                <label htmlFor="password">Password</label>
                <div className="passwordInputWrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="passwordToggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="signInCheckbox">
                <input
                  id="staySignedIn"
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(event) => setStaySignedIn(event.target.checked)}
                />
                <label htmlFor="staySignedIn">Stay signed in</label>
              </div>

              {error ? <div className="signInError">{error}</div> : null}

              <button type="submit" className="signInButton">
                Sign In
              </button>
            </form>

            <div className="signInFooter">
              <Link href="/join">Create an account</Link>
              <button
                type="button"
                className="clientForgotLink"
                onClick={() => { setRecoveryEmail(""); setVerificationCode(""); setNewPassword(""); setConfirmPassword(""); goTo("forgot"); }}
              >
                Forgot your password?
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT – enter email ── */}
        {screen === "forgot" && (
          <>
            <button
              type="button"
              className="clientBackBtn"
              onClick={() => goTo("login")}
            >
              <FaArrowLeft /> Back to Login
            </button>

            <p className="signInIntro" style={{ marginTop: 16 }}>
              Enter the email address linked to your account. We&apos;ll show you a reset code.
            </p>

            <form className="signInForm" onSubmit={handleForgotSubmit} autoComplete="off">
              <div className="signInFormGroup">
                <label htmlFor="recovery-email">Email Address</label>
                <input
                  id="recovery-email"
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="off"
                  required
                />
              </div>

              {error ? <div className="signInError">{error}</div> : null}

              <button type="submit" className="signInButton">
                Continue
              </button>
            </form>
          </>
        )}

        {/* ── VERIFY – enter reset code ── */}
        {screen === "verify" && (
          <>
            <button
              type="button"
              className="clientBackBtn"
              onClick={() => goTo("forgot")}
            >
              <FaArrowLeft /> Back
            </button>

            <p className="signInIntro" style={{ marginTop: 16 }}>
              A reset code has been generated for <strong>{recoveryEmail}</strong>.
            </p>

            <div className="clientResetCodeBox">
              <p className="clientResetCodeLabel">Your Reset Code</p>
              <p className="clientResetCode">{expectedCode}</p>
              <p className="clientResetCodeNote">
                (In a live system this code would be emailed to you.)
              </p>
            </div>

            <form className="signInForm" onSubmit={handleVerifySubmit} autoComplete="off">
              <div className="signInFormGroup">
                <label htmlFor="verify-code">Enter Reset Code</label>
                <input
                  id="verify-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="e.g. FB123456"
                  autoComplete="off"
                  required
                />
              </div>

              {error ? <div className="signInError">{error}</div> : null}

              <button type="submit" className="signInButton">
                Verify Code
              </button>
            </form>
          </>
        )}

        {/* ── RESET – set new password ── */}
        {screen === "reset" && (
          <>
            <button
              type="button"
              className="clientBackBtn"
              onClick={() => goTo("verify")}
            >
              <FaArrowLeft /> Back
            </button>

            <p className="signInIntro" style={{ marginTop: 16 }}>
              Choose a new password for your account.
            </p>

            <form className="signInForm" onSubmit={handleResetSubmit} autoComplete="off">
              <div className="signInFormGroup">
                <label htmlFor="new-password">New Password</label>
                <div className="passwordInputWrapper">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="passwordToggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label="Toggle new password visibility"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="signInFormGroup">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <div className="passwordInputWrapper">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="passwordToggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error ? <div className="signInError">{error}</div> : null}

              <button type="submit" className="signInButton">
                Reset Password
              </button>
            </form>
          </>
        )}

        {/* ── SUCCESS ── */}
        {screen === "success" && (
          <div className="clientResetSuccess">
            <FaCircleCheck className="clientResetSuccessIcon" />
            <h2>Password Reset!</h2>
            <p>
              Your password has been updated successfully. You can now sign in
              with your new password.
            </p>
            <button
              type="button"
              className="signInButton"
              style={{ marginTop: 8 }}
              onClick={() => { setEmail(""); setPassword(""); goTo("login"); }}
            >
              Sign In Now
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
