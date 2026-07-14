"use client";

import { useEffect, useState } from "react";
import { FaTrashAlt, FaTimes } from "react-icons/fa";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

const CONFIRM_EVENT = "fitness-bhaktapur-confirm";
let activeResolver: ((value: boolean) => void) | null = null;

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    activeResolver = resolve;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CONFIRM_EVENT, { detail: options }));
    }
  });
}

export function ConfirmDialogHost() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      setOptions((event as CustomEvent).detail as ConfirmOptions);
    };
    window.addEventListener(CONFIRM_EVENT, handler);
    return () => window.removeEventListener(CONFIRM_EVENT, handler);
  }, []);

  if (!options) return null;

  const close = (value: boolean) => {
    setOptions(null);
    setProcessing(false);
    const resolver = activeResolver;
    activeResolver = null;
    resolver?.(value);
  };

  return (
    <div
      className="adminModalOverlay"
      style={{ zIndex: 2000 }}
      onClick={() => {
        if (!processing) close(false);
      }}
    >
      <div
        className="adminModal confirmModal"
        role="alertdialog"
        aria-modal="true"
        aria-label={options.title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="adminModalHeader">
          <h2>{options.title}</h2>
          <button type="button" className="adminModalClose" onClick={() => close(false)} aria-label="Cancel">
            <FaTimes />
          </button>
        </div>
        <div className="adminModalBody">
          <div className="confirmModalIcon">
            <FaTrashAlt />
          </div>
          <p className="confirmModalMessage">{options.message}</p>
          <div className="adminFormActions">
            <button type="button" className="adminBtnCancel" onClick={() => close(false)} disabled={processing}>
              {options.cancelLabel || "Cancel"}
            </button>
            <button
              type="button"
              className={options.danger ? "adminBtnDanger" : "adminBtnSubmit"}
              onClick={() => close(true)}
              disabled={processing}
            >
              {options.confirmLabel || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
