import Navbar from "../../components/Navbar";
import Trainers from "../../components/Trainers";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Meet Our Team & Coaches | Fitness Bhaktapur",
  description:
    "Get to know our certified trainers, yoga instructors, and front desk staff at Fitness Bhaktapur.",
};

export default function TrainersPage() {
  return (
    <>
      <Navbar />
      <main className="pageOffset" id="trainers-page-main">
        <Trainers isPageHeader={true} />
      </main>
      <Footer />
    </>
  );
}

