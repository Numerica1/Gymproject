"use client";

import Link from "next/link";
import { useGymClients } from "../../../data/gymData";

export default function RevenuePage() {
  const [clients] = useGymClients();
  const activeClients = clients.filter((c) => c.package.status === "Active");

  const monthlyRevenue = activeClients.reduce((acc, c) => {
    return acc + (c.package.price || 0);
  }, 0);

  const revenueByPlan: Record<string, { count: number; total: number }> = {};
  activeClients.forEach((c) => {
    const planName = c.package.name;
    if (!revenueByPlan[planName]) {
      revenueByPlan[planName] = { count: 0, total: 0 };
    }
    revenueByPlan[planName].count += 1;
    revenueByPlan[planName].total += c.package.price || 0;
  });

  return (
    <div className="adminPage" style={{ padding: 24 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
        <Link href="/admin" className="adminPrimaryButton">
          Back to Dashboard
        </Link>
        <h1 style={{ margin: 0 }}>Monthly Revenue</h1>
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
          <p style={{ margin: "0 0 8px 0", color: "#9ca3af", fontSize: "0.875rem" }}>Total Monthly Revenue</p>
          <strong style={{ fontSize: "2rem", color: "#fcd34d" }}>Rs {monthlyRevenue.toLocaleString()}</strong>
          <p style={{ margin: "12px 0 0 0", color: "#6b7280", fontSize: "0.875rem" }}>
            From {activeClients.length} active member{activeClients.length !== 1 ? "s" : ""}
          </p>
        </div>

        <h2 style={{ marginBottom: 12 }}>Revenue by Plan</h2>
        <table className="adminTable" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Members</th>
              <th>Price per Member</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(revenueByPlan).map(([planName, data]) => {
              const pricePerMember = Math.round(data.total / data.count);
              return (
                <tr key={planName}>
                  <td>{planName}</td>
                  <td>{data.count}</td>
                  <td>Rs {pricePerMember.toLocaleString()}</td>
                  <td>Rs {data.total.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h2 style={{ marginBottom: 12 }}>Active Members Contributing to Revenue</h2>
        <table className="adminTable" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Monthly Amount</th>
            </tr>
          </thead>
          <tbody>
            {activeClients.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.package.name}</td>
                <td>Rs {(c.package.price || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
