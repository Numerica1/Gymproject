"use client";

import { useState, useEffect } from "react";
import AdminLogin from "../../components/AdminLogin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("admin_authenticated");
    setIsAuthenticated(auth === "true");
  }, []);

  if (isAuthenticated === null) {
    // Prevent screen flicker by showing a loader while checking auth state
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#071421",
          color: "#fff",
          fontSize: "18px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Checking authorization...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}
