"use client";

import Link from "next/link";
import { useGymAttendance, useGymClients } from "../../../data/gymData";

export default function CheckinsPage() {
  const [attendance] = useGymAttendance();
  const [clients] = useGymClients();

  const todayCheckins = attendance.filter((a) => a.status === "Checked In" || a.status === "Late");

  const checkinDetails = todayCheckins.map((c) => {
    const client = clients.find((cl) => cl.name === c.member);
    return {
      ...c,
      email: client?.email || "-",
      phone: client?.phone || "-",
    };
  });

  return (
    <div className="adminPage" style={{ padding: 24 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
        <Link href="/admin" className="adminPrimaryButton">
          Back to Dashboard
        </Link>
        <h1 style={{ margin: 0 }}>Today&apos;s Check-ins</h1>
      </header>

      <section style={{ marginBottom: 32 }}>
        <div
          style={{
            backgroundColor: "#1f2937",
            padding: 24,
            borderRadius: 8,
            border: "1px solid #374151",
            marginBottom: 24,
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#9ca3af", fontSize: "0.875rem" }}>Total Check-ins Today</p>
          <strong style={{ fontSize: "2rem", color: "#10b981" }}>{todayCheckins.length}</strong>
          <p style={{ margin: "12px 0 0 0", color: "#6b7280", fontSize: "0.875rem" }}>Members who checked in</p>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: 12 }}>Check-in Details</h2>
        <table className="adminTable" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {checkinDetails.map((c, index) => (
              <tr key={`${c.member}-${index}`}>
                <td>{c.member}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.plan}</td>
                <td>
                  <span
                    style={{
                      backgroundColor: c.status === "Late" ? "#fca5a5" : "#86efac",
                      color: c.status === "Late" ? "#991b1b" : "#15803d",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td>{c.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
