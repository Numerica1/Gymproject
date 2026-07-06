import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Terms & Conditions | Fitness Bhaktapur",
  description:
    "Review the Terms and Conditions of membership, facility rules, and services at Fitness Bhaktapur gym.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="simplePage" id="terms-page-main">
        <p className="eyebrow dark">Legal Terms</p>
        <h1>Terms & Conditions</h1>
        <div style={{ maxWidth: "800px", marginTop: "32px", display: "grid", gap: "24px", color: "var(--muted)", lineHeight: "1.7" }}>
          <section>
            <h3 style={{ color: "var(--ink)", marginBottom: "8px" }}>1. Membership Agreement</h3>
            <p>
              By joining Fitness Bhaktapur, you agree to abide by all club rules, safety guidelines, and payment schedules. Memberships are non-transferable and subject to our cancellation policies.
            </p>
          </section>
          
          <section>
            <h3 style={{ color: "var(--ink)", marginBottom: "8px" }}>2. Code of Conduct</h3>
            <p>
              We strive to maintain a clean, respectful, and safe training environment. Any behavior that compromises safety, cleanliness, or the comfort of other members will result in immediate termination of access.
            </p>
          </section>

          <section>
            <h3 style={{ color: "var(--ink)", marginBottom: "8px" }}>3. Liability Release</h3>
            <p>
              Physical exercise involves risks. By utilizing our facility, equipment, or participating in fitness programs, you acknowledge and accept these inherent risks and release Fitness Bhaktapur and its trainers from any liability.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
