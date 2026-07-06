"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowRightFromBracket,
  FaCalendarCheck,
  FaCheck,
  FaClock,
  FaCreditCard,
  FaDumbbell,
  FaLayerGroup,
  FaCartShopping,
  FaUserTie,
  FaWallet,
} from "react-icons/fa6";
import { clientStorageKey, clientPackages, type ClientPackage, type DemoClient } from "../data/clientPortal";
import { useGymClients, useGymClasses, parseScheduleTable } from "../data/gymData";
import { formatCurrency } from "../data/currency";

type UpgradePlan = Omit<ClientPackage, "startedOn" | "renewsOn" | "paymentMethod">;

export default function ClientPortal() {
  const router = useRouter();
  const [clients] = useGymClients();
  const [classes] = useGymClasses();
  const [client, setClient] = useState<DemoClient | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const getUpgradePlans = (currentKey: string): UpgradePlan[] => {
    const upgradeOrder = ["basic", "premium", "elite"];
    const currentIndex = upgradeOrder.indexOf(currentKey);
    if (currentIndex === -1) return [];
    return upgradeOrder
      .slice(currentIndex + 1)
      .map((key) => clientPackages[key])
      .filter(Boolean);
  };

  useEffect(() => {
    const storedClient = window.localStorage.getItem(clientStorageKey);
    let loggedInId = "";
    if (storedClient) {
      try {
        const parsed = JSON.parse(storedClient);
        loggedInId = parsed.id;
      } catch (e) {}
    }

    // Find the latest copy of this client from the dynamic clients list
    const latestClient = clients.find((c) => c.id === loggedInId) || clients.find((c) => c.email === "john@example.com") || clients[0] || null;
    setClient(latestClient);
  }, [clients]);

  const logout = () => {
    window.localStorage.removeItem(clientStorageKey);
    router.push("/login");
  };

  if (!client) {
    return <div className="clientPortalLoading">Loading package...</div>;
  }

  const activePackage = client.package;
  const upgradePlans = getUpgradePlans(activePackage.key);
  const usagePercent = Math.round(
    (activePackage.sessionsUsed / activePackage.sessionsTotal) * 100
  );

  return (
    <section className="clientPortalPage">
      <header className="clientPortalHero">
        <div>
          <h1>Welcome back, {client.name}</h1>
          <p>
            Your current package, renewal timeline, access benefits, and class
            details are ready below.
          </p>
        </div>
        <div className="clientPortalHeroActions">
          <button type="button" onClick={() => router.push("/shop")}>
            <FaCartShopping /> Shop
          </button>
          <button type="button" onClick={logout}>
            <FaArrowRightFromBracket /> Logout
          </button>
        </div>
      </header>

      <section className="clientPackageCard">
        <div className="clientPackageHeader">
          <span>
            <FaLayerGroup />
          </span>
          <div>
            <p>Active Package</p>
            <h2>{activePackage.name}</h2>
            <small>{activePackage.access}</small>
          </div>
          <strong>{activePackage.status}</strong>
        </div>

        {upgradePlans.length > 0 && (
          <div className="clientUpgradeBanner">
            <p>
              Upgrade available! We recommend the next plan{upgradePlans.length > 1 ? "s" : ""} for better access.
            </p>
            <button type="button" onClick={() => setShowUpgradeModal(true)}>
              View Upgrade Options
            </button>
          </div>
        )}

        <div className="clientPackageStats">
          <article>
            <FaWallet />
            <span>Monthly Fee</span>
            <strong>{formatCurrency(activePackage.price)}</strong>
          </article>
          <article>
            <FaCalendarCheck />
            <span>Renews On</span>
            <strong>{activePackage.renewsOn}</strong>
          </article>
          <article>
            <FaUserTie />
            <span>Trainer</span>
            <strong>{activePackage.trainer}</strong>
          </article>
          <article>
            <FaCreditCard />
            <span>Payment</span>
            <strong>{activePackage.paymentMethod}</strong>
          </article>
        </div>

        <div className="clientUsageBlock">
          <div>
            <h3>Session Usage</h3>
            <p>
              {activePackage.sessionsUsed} of {activePackage.sessionsTotal} package
              sessions used this cycle.
            </p>
          </div>
          <strong>{usagePercent}%</strong>
          <div className="clientUsageTrack">
            <span style={{ width: `${usagePercent}%` }} />
          </div>
        </div>
      </section>

      <section className="clientPortalGrid">
        <article className="clientPortalPanel">
          <h2>Package Benefits</h2>
          <ul>
            {activePackage.features.map((feature) => (
              <li key={feature}>
                <FaCheck /> {feature}
              </li>
            ))}
          </ul>
        </article>

        <article className="clientPortalPanel">
          <h2>Class Schedule</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {classes.length > 0 ? (
              classes.map((cls) => {
                const rows = parseScheduleTable(cls.schedule || cls.time);
                return (
                  <div key={cls.className} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "1.05rem", color: "#fbbf24" }}>
                      <FaDumbbell /> {cls.className}
                    </div>
                    {rows.length > 0 ? (
                      <div style={{ marginLeft: "24px", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", marginTop: "4px", border: "1px solid #27272a", borderRadius: "6px", overflow: "hidden" }}>
                          <thead>
                            <tr style={{ background: "#18181b", borderBottom: "1px solid #27272a" }}>
                              <th style={{ textAlign: "left", padding: "6px 12px", color: "#a1a1aa", fontWeight: "600" }}>Day</th>
                              <th style={{ textAlign: "left", padding: "6px 12px", color: "#a1a1aa", fontWeight: "600" }}>Workout</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, rIdx) => (
                              <tr key={rIdx} style={{ borderBottom: rIdx < rows.length - 1 ? "1px solid #27272a" : "none", background: rIdx % 2 === 0 ? "transparent" : "#09090b" }}>
                                <td style={{ padding: "6px 12px", color: "#e4e4e7" }}>{row.day}</td>
                                <td style={{ padding: "6px 12px", color: "#e4e4e7" }}>{row.workout}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "#71717a", marginLeft: "24px", fontStyle: "italic" }}>
                        No schedule specified.
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#71717a", fontStyle: "italic", margin: 0 }}>
                No programs available yet. Admin will add programs soon.
              </p>
            )}
          </div>
        </article>

        <article className="clientPortalPanel clientProfilePanel">
          <h2>Member Details</h2>
          <div>
            <span>Member ID</span>
            <strong>{client.id}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{client.email}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{client.phone}</strong>
          </div>
          {client.weight && (
            <div>
              <span>Weight</span>
              <strong>{client.weight} kg</strong>
            </div>
          )}
          {client.height && (
            <div>
              <span>Height</span>
              <strong>{client.height} ft</strong>
            </div>
          )}
          <div>
            <span>Member Since</span>
            <strong>{client.memberSince}</strong>
          </div>
          {client.specialRequest && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px", width: "100%", marginTop: "12px", borderTop: "1px dashed #27272a", paddingTop: "12px" }}>
              <span style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Special Request:</span>
              <strong style={{ fontSize: "0.9rem", color: "#e4e4e7", fontWeight: "normal", textAlign: "left", whiteSpace: "pre-wrap" }}>{client.specialRequest}</strong>
            </div>
          )}
        </article>

        <article className="clientPortalPanel">
          <h2>Package Timeline</h2>
          <div className="clientTimeline">
            <span><FaClock /></span>
            <div>
              <strong>Started {activePackage.startedOn}</strong>
              <p>Current billing cycle is active and ready for gym check-ins.</p>
            </div>
          </div>
          <div className="clientTimeline">
            <span><FaCalendarCheck /></span>
            <div>
              <strong>Renews {activePackage.renewsOn}</strong>
              <p>Renew before this date to keep class access uninterrupted.</p>
            </div>
          </div>
        </article>
      </section>

      {showUpgradeModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "16px",
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#111827",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 20px 80px rgba(0,0,0,0.4)",
              color: "#f8fafc",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <div>
                <h2 style={{ margin: 0 }}>Recommended Upgrade</h2>
                <p style={{ margin: "6px 0 0", color: "#cbd5e1" }}>
                  Based on your current package, these plan upgrades can give you more gym access and premium perks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #475569",
                  borderRadius: "9999px",
                  color: "#f8fafc",
                  padding: "8px 14px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {upgradePlans.map((plan) => (
                <div
                  key={plan.key}
                  style={{
                    border: "1px solid #334155",
                    borderRadius: "14px",
                    padding: "18px",
                    background: "#0f172a",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{plan.name}</h3>
                      <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>{plan.access}</p>
                    </div>
                    <strong style={{ fontSize: "1.25rem" }}>{formatCurrency(plan.price)}</strong>
                  </div>
                  <ul style={{ margin: "16px 0 0", paddingLeft: "20px", color: "#e2e8f0" }}>
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => router.push(`/join?plan=${plan.key}`)}
                    style={{
                      marginTop: "16px",
                      width: "100%",
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Upgrade to {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
