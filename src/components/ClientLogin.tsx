"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { clientStorageKey } from "../data/clientPortal";
import { useGymClients } from "../data/gymData";

export default function ClientLogin() {
  const router = useRouter();
  const [clients] = useGymClients();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [error, setError] = useState("");

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
      setError("Your portal password is not set yet. Please complete checkout or contact the front desk.");
      return;
    }

    if (client.password !== password) {
      setError("Incorrect password.");
      return;
    }

    window.localStorage.setItem(clientStorageKey, JSON.stringify(client));
    if (staySignedIn) {
      window.localStorage.setItem("staySignedIn", "true");
    }
    router.push("/client");
  };

  return (
    <section className="signInPageContainer">
      <div className="signInFormWrapper">
        <h1>Fitness Bhaktapur</h1>
        <p className="signInIntro">Enter your email address and password to sign in to your Fitness Bhaktapur account.</p>

        <form className="signInForm" onSubmit={handleSubmit}>
          <div className="signInFormGroup">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
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
          <a href="#">Forgot your password?</a>
        </div>
      </div>
    </section>
  );
}
