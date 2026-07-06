import Navbar from "../../components/Navbar";
import Membership from "../../components/Membership";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Membership Plans | Fitness Bhaktapur",
  description:
    "Choose the best gym membership plan for you. We offer Basic, Premium, and Elite memberships with flexible options.",
};

export default function MembershipPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset" id="membership-page-main">
        <Membership isPageHeader={true} />
      </main>
      <Footer />
    </>
  );
}

