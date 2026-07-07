"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaKey, FaCircleCheck, FaArrowLeft } from "react-icons/fa6";
import { useGymSettings } from "../data/gymData";

type Screen = "login" | "forgot" | "verify" | "reset" | "success";

export default function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [settings] = useGymSettings();
  const adminEmail = settings?.email || "info@fitnessbhaktapur.com";

  const [screen, setScreen] = useState<Screen>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Forgot password states
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email.trim().toLowerCase() !== adminEmail.toLowerCase()) {
      setError("Invalid admin email address.");
      return;
    }

    const savedPwd = localStorage.getItem("admin_password") || "admin1234";
    if (password !== savedPwd) {
      setError("Incorrect password.");
      return;
    }

    localStorage.setItem("admin_authenticated", "true");
    onLoginSuccess();
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (recoveryEmail.trim().toLowerCase() !== adminEmail.toLowerCase()) {
      setError("Email address does not match admin records.");
      return;
    }

    setScreen("verify");
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (verificationCode.trim().toUpperCase() !== "FIT2026") {
      setError("Invalid verification code. Please check the code and try again.");
      return;
    }

    setScreen("reset");
  };

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

    localStorage.setItem("admin_password", newPassword);
    setScreen("success");
  };

  return (
    <div className="adminLoginContainer">
      <div className="adminLoginCard">
        <div className="adminLoginLogo">
          <span>F</span>
          <h2>Fitness Bhaktapur</h2>
          <p>Admin Portal Security</p>
        </div>

        {screen === "login" && (
          <form onSubmit={handleLogin}>
            <h3>Sign In</h3>
            <p className="screenDesc">Access the management dashboard.</p>

            <div className="formGroup">
              <label htmlFor="login-email">
                <FaEnvelope className="icon" /> Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@fitnessbhaktapur.com"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="login-password">
                <FaLock className="icon" /> Password
              </label>
              <div className="passwordWrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="pwdToggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "🐵" : "🙈"}
                </button>
              </div>
            </div>

            {error && <div className="formError">{error}</div>}

            <button type="submit" className="adminSubmitBtn">
              Sign In
            </button>

            <div className="formFooter">
              <button type="button" className="textLink" onClick={() => { setScreen("forgot"); setError(""); }}>
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {screen === "forgot" && (
          <form onSubmit={handleForgotSubmit}>
            <button type="button" className="backBtn" onClick={() => { setScreen("login"); setError(""); }}>
              <FaArrowLeft /> Back to Login
            </button>
            <h3>Forgot Password</h3>
            <p className="screenDesc">Enter your admin email to receive a password reset code.</p>

            <div className="formGroup">
              <label htmlFor="forgot-email">
                <FaEnvelope className="icon" /> Admin Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="info@fitnessbhaktapur.com"
              />
            </div>

            {error && <div className="formError">{error}</div>}

            <button type="submit" className="adminSubmitBtn">
              Send Recovery Code
            </button>
          </form>
        )}

        {screen === "verify" && (
          <form onSubmit={handleVerifySubmit}>
            <button type="button" className="backBtn" onClick={() => { setScreen("forgot"); setError(""); }}>
              <FaArrowLeft /> Back
            </button>
            <h3>Verify Reset Code</h3>
            <p className="screenDesc">Enter the verification code.</p>

            <div className="infoAlert">
              <strong>[Demo Code Simulated]</strong>
              <p>A recovery code was simulated for <b>{recoveryEmail}</b>.</p>
              <p>Use code: <span className="highlightCode">FIT2026</span></p>
            </div>

            <div className="formGroup">
              <label htmlFor="verify-code">
                <FaKey className="icon" /> Verification Code
              </label>
              <input
                id="verify-code"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="FIT2026"
                maxLength={10}
                style={{ textTransform: "uppercase", letterSpacing: "2px", textAlign: "center" }}
              />
            </div>

            {error && <div className="formError">{error}</div>}

            <button type="submit" className="adminSubmitBtn">
              Verify Code
            </button>
          </form>
        )}

        {screen === "reset" && (
          <form onSubmit={handleResetSubmit}>
            <h3>Reset Password</h3>
            <p className="screenDesc">Choose a secure new password for your admin account.</p>

            <div className="formGroup">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </div>

            {error && <div className="formError">{error}</div>}

            <button type="submit" className="adminSubmitBtn">
              Update Password
            </button>
          </form>
        )}

        {screen === "success" && (
          <div className="successScreen">
            <FaCircleCheck className="successIcon" />
            <h3>Password Reset!</h3>
            <p className="screenDesc">Your password has been successfully updated. You can now sign in with your new password.</p>
            
            <button
              type="button"
              className="adminSubmitBtn"
              onClick={() => {
                setScreen("login");
                setEmail("");
                setPassword("");
                setRecoveryEmail("");
                setVerificationCode("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
              }}
            >
              Sign In Now
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .adminLoginContainer {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #071421;
          background-image: radial-gradient(circle at top right, #0d2030 0%, #071421 70%);
          padding: 24px;
          color: #f3f4f6;
          font-family: Arial, sans-serif;
        }

        .adminLoginCard {
          width: 100%;
          max-width: 440px;
          background: #0d2030;
          border: 1px solid #1a2e40;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .adminLoginLogo {
          text-align: center;
          margin-bottom: 32px;
        }

        .adminLoginLogo span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: #f05a28;
          color: #fff;
          font-size: 24px;
          font-weight: bold;
          border-radius: 8px;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(240, 90, 40, 0.3);
        }

        .adminLoginLogo h2 {
          font-size: 22px;
          margin: 0;
          color: #fff;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .adminLoginLogo p {
          font-size: 13px;
          color: #6b7280;
          margin: 4px 0 0;
        }

        h3 {
          font-size: 20px;
          margin: 0 0 6px 0;
          color: #fff;
          font-weight: 700;
        }

        .screenDesc {
          font-size: 14px;
          color: #9ca3af;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .formGroup {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .formGroup label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #9ca3af;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .formGroup label :global(.icon) {
          color: #f05a28;
        }

        .formGroup input {
          background: #050e17;
          border: 1px solid #1a2e40;
          color: #fff;
          padding: 12px 14px;
          border-radius: 6px;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .formGroup input:focus {
          outline: none;
          border-color: #f05a28;
          box-shadow: 0 0 0 3px rgba(240, 90, 40, 0.15);
        }

        .passwordWrapper {
          position: relative;
          display: flex;
        }

        .passwordWrapper input {
          width: 100%;
          padding-right: 44px;
        }

        .pwdToggle {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 44px;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .pwdToggle:hover {
          color: #fff;
        }

        .formError {
          color: #f87171;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 13px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .adminSubmitBtn {
          width: 100%;
          background: #f05a28;
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
          box-shadow: 0 4px 12px rgba(240, 90, 40, 0.2);
        }

        .adminSubmitBtn:hover {
          background: #e04e1d;
        }

        .adminSubmitBtn:active {
          transform: translateY(1px);
        }

        .formFooter {
          margin-top: 18px;
          text-align: center;
        }

        .textLink {
          background: transparent;
          border: none;
          color: #f05a28;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .textLink:hover {
          text-decoration: underline;
        }

        .backBtn {
          background: transparent;
          border: none;
          color: #9ca3af;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 0;
          margin-bottom: 24px;
        }

        .backBtn:hover {
          color: #fff;
        }

        .infoAlert {
          background: rgba(240, 90, 40, 0.08);
          border: 1px solid rgba(240, 90, 40, 0.2);
          border-radius: 6px;
          padding: 12px 14px;
          font-size: 13px;
          margin-bottom: 20px;
          color: #e5e7eb;
          line-height: 1.5;
        }

        .infoAlert strong {
          color: #f05a28;
          display: block;
          margin-bottom: 4px;
        }

        .infoAlert p {
          margin: 0;
        }

        .highlightCode {
          font-family: monospace;
          background: #111827;
          padding: 2px 6px;
          border-radius: 4px;
          color: #f05a28;
          font-weight: bold;
        }

        .successScreen {
          text-align: center;
        }

        .successIcon {
          font-size: 48px;
          color: #10b981;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
