import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Privacy Policy | Fitness Bhaktapur",
  description:
    "Learn how Fitness Bhaktapur collects, uses, and secures your personal and registration data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="simplePage" id="privacy-page-main">
        <p className="eyebrow dark">Data Protection</p>
        <h1>Privacy Policy</h1>
        <div style={{ maxWidth: "800px", marginTop: "32px", display: "grid", gap: "24px", color: "var(--muted)", lineHeight: "1.7" }}>
          <section>
            <h3 style={{ color: "var(--ink)", marginBottom: "8px" }}>1. Information Collection</h3>
            <p>
              We collect information you provide directly to us when registering for membership, signing up for classes, or contacting support (such as name, email, phone number, and address).
            </p>
          </section>

          <section>
            <h3 style={{ color: "var(--ink)", marginBottom: "8px" }}>2. Use of Information</h3>
            <p>
              Your contact details are used to process membership registrations, secure bookings, send updates regarding scheduling/closures, and respond to your direct inquiries.
            </p>
          </section>

          <section>
            <h3 style={{ color: "var(--ink)", marginBottom: "8px" }}>3. Data Security</h3>
            <p>
              We prioritize the protection of your personal information. We employ secure industry practices and direct API integrations to protect registration transactions and keep data confidential.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
