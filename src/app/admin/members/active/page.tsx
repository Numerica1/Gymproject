"use client";

import Link from "next/link";
import { useGymClients } from "../../../../data/gymData";

export default function ActiveMembersPage() {
  const [clients] = useGymClients();
  const active = clients.filter((c) => c.package.status === "Active");

  return (
    <div className="adminPage" style={{ padding: 24 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
        <Link href="/admin" className="adminPrimaryButton">
          Back to Dashboard
        </Link>
        <h1 style={{ margin: 0 }}>Active Members</h1>
      </header>

      <section>
        <table className="adminTable" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Member Since</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            {active.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.memberSince}</td>
                <td>{c.package.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
