"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaArrowRightFromBracket,
  FaBagShopping,
  FaBox,
  FaBoxOpen,
  FaCartShopping,
  FaCircleCheck,
  FaChevronDown,
  FaChevronUp,
  FaCircleUser,
  FaClockRotateLeft,
  FaEnvelope,
  FaHouse,
  FaPhone,
  FaShieldHalved,
  FaSpinner,
  FaTruck,
  FaUser,
  FaXmark,
} from "react-icons/fa6";
import { clientStorageKey, type DemoClient } from "../data/clientPortal";
import { useGymOrders, type OrderLog } from "../data/gymData";
import { formatCurrency } from "../data/currency";

/* ──────────────────────────────────────────────
   Helpers
────────────────────────────────────────────── */
function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "delivered": return { bg: "rgba(52,211,153,0.12)", color: "#34d399", icon: <FaCircleCheck /> };
    case "shipped":   return { bg: "rgba(96,165,250,0.12)",  color: "#60a5fa", icon: <FaTruck /> };
    default:          return { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", icon: <FaClockRotateLeft /> };
  }
}

/* ──────────────────────────────────────────────
   OrderCard
────────────────────────────────────────────── */
type ParsedItem = { name: string; quantity: number; price?: string; brand?: string; image?: string };

function parseItems(order: OrderLog): ParsedItem[] {
  if (order.cartItems && Array.isArray(order.cartItems) && order.cartItems.length > 0) {
    return order.cartItems.map((i) => ({
      name: (i as Record<string, unknown>).productName as string || "Product",
      quantity: (i as Record<string, unknown>).quantity as number || 1,
      price:  (i as Record<string, unknown>).price as string | undefined,
      brand:  (i as Record<string, unknown>).brand as string | undefined,
      image:  (i as Record<string, unknown>).image as string | undefined,
    }));
  }
  if (!order.items) return [{ name: "Gym Shop Order", quantity: 1 }];
  return order.items.split(/,\s*/).map((part) => {
    const m = part.match(/\s*x(\d+)$/i);
    if (m) return { name: part.replace(/\s*x\d+$/i, "").trim(), quantity: parseInt(m[1]) };
    return { name: part.trim(), quantity: 1 };
  });
}

function OrderCard({ order }: { order: OrderLog }) {
  const [expanded, setExpanded] = useState(false);
  const items = parseItems(order);
  const { bg, color, icon } = statusColor(order.status);

  return (
    <article className="scpOrderCard">
      {/* Header row */}
      <div className="scpOrderCardHeader" onClick={() => setExpanded((v) => !v)}>
        <div className="scpOrderCardLeft">
          <span className="scpOrderId">{order.orderId}</span>
          <span className="scpOrderDate">{order.date}</span>
        </div>
        <div className="scpOrderCardRight">
          <span className="scpOrderTotal">{formatCurrency(order.total)}</span>
          <span className="scpOrderStatus" style={{ background: bg, color }}>
            {icon} {order.status}
          </span>
          <button className="scpExpandBtn" aria-label="Toggle details">
            {expanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="scpOrderCardBody">
          <div className="scpOrderItemsList">
            {items.map((item, idx) => (
              <div key={idx} className="scpOrderItem">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={48} height={48} unoptimized className="scpOrderItemImg" />
                ) : (
                  <span className="scpOrderItemIcon"><FaBox /></span>
                )}
                <div className="scpOrderItemInfo">
                  <strong>{item.name}</strong>
                  {item.brand && <span>{item.brand}</span>}
                </div>
                <div className="scpOrderItemQtyPrice">
                  <span className="scpQtyBadge">×{item.quantity}</span>
                  {item.price && <span className="scpItemPrice">{item.price}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="scpOrderMetaRow">
            {order.paymentMethod && (
              <div className="scpOrderMeta"><span>Payment</span><strong>{order.paymentMethod}</strong></div>
            )}
            {order.payment && (
              <div className="scpOrderMeta"><span>Status</span><strong>{order.payment}</strong></div>
            )}
            {(order.address || order.pickupPoint) && (
              <div className="scpOrderMeta"><span>Delivery Address</span><strong>{order.address || order.pickupPoint}</strong></div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/* ──────────────────────────────────────────────
   Edit Profile Modal
────────────────────────────────────────────── */
function EditProfileModal({
  client,
  onSave,
  onClose,
}: {
  client: DemoClient;
  onSave: (updates: Partial<DemoClient>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone || "");
  const [address, setAddress] = useState(client.address || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      onSave({ name: name.trim(), phone: phone.trim(), address: address.trim() });
      setSaving(false);
      onClose();
    }, 500);
  };

  return (
    <div className="scpModalOverlay" onClick={onClose}>
      <div className="scpModal" onClick={(e) => e.stopPropagation()}>
        <button className="scpModalClose" onClick={onClose} aria-label="Close"><FaXmark /></button>
        <h2 className="scpModalTitle">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="scpModalForm">
          <div className="scpFormField">
            <label htmlFor="scpName">Full Name</label>
            <input id="scpName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="scpFormField">
            <label htmlFor="scpPhone">Phone Number</label>
            <input id="scpPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit phone" />
          </div>
          <div className="scpFormField">
            <label htmlFor="scpAddress">Delivery Address</label>
            <input id="scpAddress" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your default address" />
          </div>
          <button type="submit" className="scpModalSaveBtn" disabled={saving}>
            {saving ? <><FaSpinner className="scpSpinAnim" /> Saving…</> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main ShopClientPortal
────────────────────────────────────────────── */
export default function ShopClientPortal() {
  const [client, setClient] = useState<DemoClient | null>(null);
  const [mounted, setMounted] = useState(false);
  const [orders] = useGymOrders();
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const stored = window.localStorage.getItem(clientStorageKey);
    if (!stored) return;
    try { setClient(JSON.parse(stored)); } catch {}
  }, [mounted]);

  const handleLogout = () => {
    window.localStorage.removeItem(clientStorageKey);
    setClient(null);
  };

  const handleProfileSave = (updates: Partial<DemoClient>) => {
    if (!client) return;
    const updated = { ...client, ...updates };
    window.localStorage.setItem(clientStorageKey, JSON.stringify(updated));
    setClient(updated);
  };

  // Filter orders for this client by name or email
  const myOrders = client
    ? orders.filter(
        (o) =>
          (client.email && o.email?.toLowerCase() === client.email.toLowerCase()) ||
          (client.name && o.customer?.toLowerCase() === client.name.toLowerCase()) ||
          (client.phone && o.phone === client.phone)
      )
    : [];

  const totalSpent = myOrders.reduce((sum, o) => {
    const num = parseFloat(String(o.total).replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  /* ── Not logged in ── */
  if (!mounted) {
    return (
      <div className="scpLoading">
        <FaSpinner className="scpSpinAnim" />
        <p>Loading your portal…</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="scpGuestScreen">
        <div className="scpGuestCard">
          <span className="scpGuestIcon"><FaCircleUser /></span>
          <h1>My Shop Portal</h1>
          <p>Sign in to track your orders, manage your profile, and see your purchase history.</p>
          <Link href="/shop" className="scpGuestBtn"><FaBagShopping /> Go to Shop & Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="scpPage">
      {/* ── Hero Header ── */}
      <header className="scpHero">
        <div className="scpHeroInner">
          <div className="scpHeroLeft">
            <div className="scpHeroAvatar">{getInitials(client.name)}</div>
            <div className="scpHeroInfo">
              <p className="scpHeroEyebrow">Welcome back</p>
              <h1 className="scpHeroName">{client.name}</h1>
              <p className="scpHeroEmail">{client.email}</p>
            </div>
          </div>
          <div className="scpHeroActions">
            <Link href="/shop" className="scpHeroActionBtn secondary">
              <FaBagShopping /> Browse Shop
            </Link>
            <Link href="/cart" className="scpHeroActionBtn secondary">
              <FaCartShopping /> My Cart
            </Link>
            <button type="button" className="scpHeroActionBtn danger" onClick={handleLogout}>
              <FaArrowRightFromBracket /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="scpStatBar">
          <div className="scpStat">
            <strong>{myOrders.length}</strong>
            <span>Total Orders</span>
          </div>
          <div className="scpStat">
            <strong>{myOrders.filter((o) => o.status === "Processing").length}</strong>
            <span>Processing</span>
          </div>
          <div className="scpStat">
            <strong>{myOrders.filter((o) => o.status === "Shipped").length}</strong>
            <span>In Transit</span>
          </div>
          <div className="scpStat">
            <strong>{myOrders.filter((o) => o.status === "Delivered").length}</strong>
            <span>Delivered</span>
          </div>
          <div className="scpStat">
            <strong>Rs {totalSpent.toLocaleString()}</strong>
            <span>Total Spent</span>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="scpBody">
        <nav className="scpTabs">
          <button
            className={`scpTab${activeTab === "orders" ? " active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <FaBoxOpen /> My Orders
          </button>
          <button
            className={`scpTab${activeTab === "profile" ? " active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FaShieldHalved /> My Profile
          </button>
        </nav>

        {/* ── Orders Tab ── */}
        {activeTab === "orders" && (
          <div className="scpTabContent">
            {myOrders.length === 0 ? (
              <div className="scpEmptyOrders">
                <FaBoxOpen className="scpEmptyIcon" />
                <h2>No orders yet</h2>
                <p>Looks like you haven&apos;t placed any orders. Head to the shop and get started!</p>
                <Link href="/shop" className="scpEmptyShopBtn"><FaBagShopping /> Browse Shop</Link>
              </div>
            ) : (
              <div className="scpOrdersList">
                <div className="scpOrdersHeader">
                  <h2>Order History</h2>
                  <span>{myOrders.length} order{myOrders.length !== 1 ? "s" : ""}</span>
                </div>
                {myOrders.map((order) => (
                  <OrderCard key={order.orderId || order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="scpTabContent">
            <div className="scpProfileCard">
              <div className="scpProfileHeader">
                <div className="scpProfileAvatar">{getInitials(client.name)}</div>
                <div>
                  <h2>{client.name}</h2>
                  <p>Member since {client.memberSince || "Recently"}</p>
                </div>
              </div>

              <div className="scpProfileFields">
                <div className="scpProfileField">
                  <FaEnvelope className="scpProfileFieldIcon" />
                  <div>
                    <span>Email Address</span>
                    <strong>{client.email}</strong>
                  </div>
                </div>
                <div className="scpProfileField">
                  <FaPhone className="scpProfileFieldIcon" />
                  <div>
                    <span>Phone Number</span>
                    <strong>{client.phone || "Not set"}</strong>
                  </div>
                </div>
                <div className="scpProfileField">
                  <FaHouse className="scpProfileFieldIcon" />
                  <div>
                    <span>Delivery Address</span>
                    <strong>{client.address || "Not set"}</strong>
                  </div>
                </div>
                {client.package?.name && client.package.name !== "No Active Plan" && (
                  <div className="scpProfileField">
                    <FaShieldHalved className="scpProfileFieldIcon" />
                    <div>
                      <span>Gym Membership</span>
                      <strong>{client.package.name}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="scpProfileActions">
                <button className="scpEditProfileBtn" onClick={() => setEditOpen(true)}>
                  <FaUser /> Edit Profile
                </button>
                {client.package?.name && client.package.name !== "No Active Plan" && (
                  <Link href="/client" className="scpGymPortalBtn">
                    <FaShieldHalved /> View Gym Membership Portal
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <EditProfileModal
          client={client}
          onSave={handleProfileSave}
          onClose={() => setEditOpen(false)}
        />
      )}
    </section>
  );
}
