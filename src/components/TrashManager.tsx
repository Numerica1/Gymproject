"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaRestore,
  FaTrashAlt,
  FaSpinner,
  FaBox,
  FaTag,
  FaCertificate,
  FaDumbbell,
  FaUserTie,
  FaLayerGroup,
  FaStar,
  FaGift,
  FaNewspaper,
  FaInbox,
} from "react-icons/fa";
import {
  restoreByTable,
  permanentDeleteByTable,
} from "../data/supabaseClient";
import { GYM_DATA_CHANGED_EVENT } from "../data/gymData";
import { showToast } from "./Toast";
import { confirmDialog } from "./ConfirmDialog";

interface TrashItem {
  module: string;
  table: string;
  id: string;
  name: string;
  deletedAt: string | null;
  deletedBy: string | null;
  payload: unknown;
}

const MODULE_ORDER = [
  "Products",
  "Brands",
  "Categories",
  "Programs",
  "Trainers",
  "Memberships",
  "Reviews",
  "Offers",
  "Blogs",
];

const MODULE_ICON: Record<string, React.ReactNode> = {
  Products: <FaBox />,
  Brands: <FaTag />,
  Categories: <FaTag />,
  Programs: <FaDumbbell />,
  Trainers: <FaUserTie />,
  Memberships: <FaLayerGroup />,
  Reviews: <FaStar />,
  Offers: <FaGift />,
  Blogs: <FaNewspaper />,
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrashManager({
  onChanged,
  onRestoreMembership,
}: {
  onChanged: () => void;
  onRestoreMembership: (plan: unknown) => void;
}) {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trash", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load Trash.");
      const data = (await response.json()) as { items: TrashItem[] };
      setItems(data.items || []);
    } catch {
      setError("Could not load the Trash. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, TrashItem[]>();
    for (const item of items) {
      const list = map.get(item.module) || [];
      list.push(item);
      map.set(item.module, list);
    }
    return MODULE_ORDER.filter((module) => map.has(module)).map((module) => ({
      module,
      items: map.get(module) || [],
    }));
  }, [items]);

  const handleRestore = async (item: TrashItem) => {
    const confirmed = await confirmDialog({
      title: "Restore item?",
      message: `Restore "${item.name}"? It will reappear in ${item.module} and on the website.`,
      confirmLabel: "Restore",
      cancelLabel: "Cancel",
    });
    if (!confirmed) return;

    setBusyId(item.id);
    try {
      await restoreByTable(item.table, item.id);
      if (item.module === "Memberships" && item.payload) {
        onRestoreMembership(item.payload);
      }
      window.dispatchEvent(new CustomEvent(GYM_DATA_CHANGED_EVENT));
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      showToast(`"${item.name}" restored successfully.`, "success");
      onChanged();
    } catch {
      showToast("Could not restore the item. Please try again.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    const confirmed = await confirmDialog({
      title: "Delete permanently?",
      message: `This will permanently remove "${item.name}" from the database. This action cannot be undone.`,
      confirmLabel: "Delete Permanently",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!confirmed) return;

    setBusyId(item.id);
    try {
      await permanentDeleteByTable(item.table, item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      showToast(`"${item.name}" permanently deleted.`, "success");
      onChanged();
    } catch {
      showToast("Could not permanently delete the item. Please try again.", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="adminPage">
      <div className="trashHeader">
        <div>
          <h1>Trash</h1>
          <p>Items moved to Trash are hidden from the website and admin lists but can be restored.</p>
        </div>
        <button type="button" className="adminBtnCancel" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="trashLoading">
          <FaSpinner className="spin" />
          <span>Loading Trash…</span>
        </div>
      ) : error ? (
        <div className="trashEmpty">
          <FaInbox />
          <p>{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="trashEmpty">
          <FaInbox />
          <p>Trash is empty.</p>
          <span>Deleted items will appear here so you can restore or permanently remove them.</span>
        </div>
      ) : (
        <div className="trashGroups">
          {grouped.map((group) => (
            <section key={group.module} className="trashGroup">
              <div className="trashGroupHeader">
                <span className="trashGroupIcon">{MODULE_ICON[group.module]}</span>
                <h2>{group.module}</h2>
                <span className="trashGroupCount">{group.items.length}</span>
              </div>
              <div className="adminTableWrap">
                <table className="adminTable trashTable">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Date Deleted</th>
                      <th>Deleted By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {group.items.map((item) => (
                        <motion.tr
                          key={item.id}
                          layout
                          initial={{ opacity: 0, backgroundColor: "rgba(251,191,36,0.12)" }}
                          animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ duration: 0.25 }}
                        >
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>{formatDate(item.deletedAt)}</td>
                          <td>{item.deletedBy || "—"}</td>
                          <td>
                            <div className="adminTableActionRow">
                              <button
                                type="button"
                                className="adminActionBtn edit"
                                onClick={() => handleRestore(item)}
                                disabled={busyId === item.id}
                                aria-label={`Restore ${item.name}`}
                                title="Restore"
                              >
                                <FaRestore />
                              </button>
                              <button
                                type="button"
                                className="adminActionBtn delete"
                                onClick={() => handlePermanentDelete(item)}
                                disabled={busyId === item.id}
                                aria-label={`Permanently delete ${item.name}`}
                                title="Delete Permanently"
                              >
                                {busyId === item.id ? <FaSpinner className="spin" /> : <FaTrashAlt />}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
