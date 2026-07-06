import AdminPanel from "../../components/AdminPanel";

export const metadata = {
  title: "Gym Admin Panel | Fitness Bhaktapur",
  description: "Management dashboard for Fitness Bhaktapur",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminPanel />;
}
