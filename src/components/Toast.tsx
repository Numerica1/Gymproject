"use client";

import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const TOAST_EVENT = "fitness-bhaktapur-toast";
let counter = 0;

export function showToast(message: string, type: ToastType = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }));
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as { message: string; type: ToastType };
      const id = (counter += 1);
      setToasts((current) => [...current, { id, message: detail.message, type: detail.type }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 3800);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  const dismiss = (id: number) => setToasts((current) => current.filter((item) => item.id !== id));

  return (
    <div className="gymToastViewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon =
          toast.type === "success"
            ? FaCheckCircle
            : toast.type === "warning"
            ? FaExclamationTriangle
            : toast.type === "error"
            ? FaExclamationTriangle
            : FaInfoCircle;
        return (
          <div key={toast.id} className={`gymToast ${toast.type}`} role="status">
            <span className="gymToastIcon">
              <Icon />
            </span>
            <span className="gymToastMessage">{toast.message}</span>
            <button
              type="button"
              className="gymToastClose"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <FaTimes />
            </button>
          </div>
        );
      })}
    </div>
  );
}
