"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  FaBars,
  FaBell,
  FaCalendarAlt,
  FaCalendarCheck,
  FaChartLine,
  FaCheckCircle,
  FaClipboardList,
  FaCog,
  FaCreditCard,
  FaDumbbell,
  FaGift,
  FaLayerGroup,
  FaPlus,
  FaSearch,
  FaShoppingCart,
  FaStar,
  FaTimes,
  FaTrashAlt,
  FaEdit,
  FaUserTie,
  FaUsers,
  FaWallet,
  FaImages,
  FaCamera,
  FaSignOutAlt,
  FaEnvelope,
  FaTrash,
} from "react-icons/fa";
import {
  useGymSettings,
  useGymClients,
  useGymTrainers,
  useGymBlogs,
  useGymPayments,
  useGymProducts,
  useGymBrands,
  useGymOffers,
  useGymOrders,
  useGymReviews,
  useGymAttendance,
  useGymClasses,
  useGymBookings,
  useGymGallery,
  useGymContactMessages,
  useGymShopCategories,
  getNextClientId,
  type Trainer,
  type BlogPost,
  type PaymentLog,
  type Product,
  type Brand,
  type Offer,
  type OrderLog,
  type Review,
  type AttendanceLog,
  type Booking,
  type ClassSchedule,
  type ContactMessage,
  type ShopCategory,
  parseScheduleTable,
  serializeScheduleTable,
} from "../data/gymData";

import type { DemoClient } from "../data/clientPortal";
import type { SharedMembershipPlan, SharedGymContent, Banner } from "../data/sharedGymContent";
import { formatCurrency } from "../data/currency";
import { programs } from "../data/programs";

const CLASS_SCHEDULE_DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Weekdays",
  "Weekend",
  "Daily",
];

function compressImage(base64: string, maxWidth = 1920): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxWidth) {
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = () => {
      resolve(base64);
    };
    img.src = base64;
  });
}

type AdminSection =
  | "dashboard"
  | "clients"
  | "trainers"
  | "memberships"
  | "attendance"
  | "classes"
  | "payments"
  | "offers"
  | "brands"
  | "blogs"
  | "shop"
  | "shopCategories"
  | "orders"
  | "reviews"
  | "bookings"
  | "gallery"
  | "contacts"
  | "settings"
  | "reports"
  | "stock"
  | "banners"
  | "announcements";

const navItems: { id: AdminSection; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <FaChartLine /> },
  { id: "clients", label: "Members", icon: <FaUsers /> },
  { id: "trainers", label: "Trainers", icon: <FaUserTie /> },
  { id: "attendance", label: "Attendance", icon: <FaCalendarCheck /> },
  { id: "classes", label: "Classes", icon: <FaDumbbell /> },
  { id: "memberships", label: "Memberships", icon: <FaLayerGroup /> },
  { id: "payments", label: "Payments", icon: <FaCreditCard /> },
  { id: "reports", label: "Reports", icon: <FaChartLine /> },
  { id: "shop", label: "Products", icon: <FaShoppingCart /> },
  { id: "brands", label: "Brands", icon: <FaLayerGroup /> },
  { id: "shopCategories", label: "Categories", icon: <FaImages /> },
  { id: "orders", label: "Orders", icon: <FaClipboardList /> },
  { id: "offers", label: "Coupons", icon: <FaGift /> },
  { id: "reviews", label: "Reviews", icon: <FaStar /> },
  { id: "stock", label: "Stock Management", icon: <FaClipboardList /> },
  { id: "banners", label: "Banners", icon: <FaImages /> },
  { id: "announcements", label: "Announcements", icon: <FaEnvelope /> },
  { id: "gallery", label: "Gallery", icon: <FaImages /> },
  { id: "contacts", label: "Contact Messages", icon: <FaEnvelope /> },
  { id: "settings", label: "Settings", icon: <FaCog /> },
];

const navGroups = [
  {
    title: "MAIN",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <FaChartLine /> },
      { id: "clients", label: "Members", icon: <FaUsers /> },
      { id: "trainers", label: "Trainers", icon: <FaUserTie /> },
      { id: "attendance", label: "Attendance", icon: <FaCalendarCheck /> },
      { id: "classes", label: "Classes", icon: <FaDumbbell /> },
      { id: "memberships", label: "Memberships", icon: <FaLayerGroup /> },
      { id: "payments", label: "Payments", icon: <FaCreditCard /> },
      { id: "reports", label: "Reports", icon: <FaChartLine /> },
      { id: "offers", label: "Coupons", icon: <FaGift /> },
      { id: "reviews", label: "Reviews", icon: <FaStar /> },
    ]
  },
  {
    title: "SHOP MANAGEMENT",
    items: [
      { id: "shop", label: "Products", icon: <FaShoppingCart /> },
      { id: "brands", label: "Brands", icon: <FaLayerGroup /> },
      { id: "shopCategories", label: "Categories", icon: <FaImages /> },
      { id: "banners", label: "Banners", icon: <FaImages /> },
      { id: "orders", label: "Orders", icon: <FaClipboardList /> },
      { id: "stock", label: "Stock Management", icon: <FaClipboardList /> },
    ]
  },
  {
    title: "CONTENT MANAGEMENT",
    items: [
      { id: "announcements", label: "Announcements", icon: <FaEnvelope /> },
      { id: "gallery", label: "Gallery", icon: <FaImages /> },
      { id: "settings", label: "Settings", icon: <FaCog /> },
    ]
  }
];

function Badge({ value, className }: { value: string; className?: string }) {
  const tone = ["Active", "Paid", "Published", "Delivered", "Approved", "Checked In"].includes(value)
    ? "good"
    : ["Inactive", "Draft", "Expired", "Late"].includes(value)
    ? "bad"
    : "warn";

  return <span className={`adminBadge ${tone} ${className || ""}`}>{value}</span>;
}

function PanelHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="adminPanelHeader">
      <div>
        <p>Fitness Bhaktapur</p>
        <h1>{title}</h1>
      </div>
      {action && onAction ? (
        <button className="adminPrimaryButton" onClick={onAction}>
          <FaPlus /> {action}
        </button>
      ) : null}
    </div>
  );
}
export type AdminItem =
  | DemoClient
  | Trainer
  | BlogPost
  | PaymentLog
  | Product
  | Brand
  | ShopCategory
  | Offer
  | OrderLog
  | Review
  | AttendanceLog
  | Booking
  | ClassSchedule
  | ContactMessage
  | SharedMembershipPlan
  | Banner;

function isDemoClientItem(item: AdminItem | null): item is DemoClient {
  return !!item && "package" in item && "memberSince" in item;
}

function fixedMembershipSessions(planKey?: string, planName?: string, fallback = 24) {
  const normalized = `${planKey || ""} ${planName || ""}`.toLowerCase();
  if (normalized.includes("basic")) return 15;
  if (normalized.includes("standard")) return 20;
  if (normalized.includes("premium")) return 30;
  return fallback;
}

export default function AdminPanel() {
  const [active, setActive] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load dynamic data hooks
  const [settings, setSettings] = useGymSettings();
  const [clients, setClients] = useGymClients();
  const [trainers, setTrainers] = useGymTrainers();
  const [blogs, setBlogs] = useGymBlogs();
  const [payments, setPayments] = useGymPayments();
  const [products, setProducts] = useGymProducts();
  const [brands, setBrands] = useGymBrands();
  const [offers, setOffers] = useGymOffers();
  const [orders, setOrders] = useGymOrders();
  const [reviews, setReviews] = useGymReviews();
  const [attendance, setAttendance] = useGymAttendance();
  const [classes, setClasses] = useGymClasses();
  const [bookings, setBookings] = useGymBookings();
  const [gallery, setGallery] = useGymGallery();
  const [contactMessages, setContactMessages] = useGymContactMessages();
  const [shopCategories, setShopCategories] = useGymShopCategories();

  // Active form overlays
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [activeItem, setActiveItem] = useState<AdminItem | null>(null);

  const filterItems = useCallback(<T,>(items: T[]): T[] => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredClients = useMemo(() => filterItems(clients), [clients, filterItems]);
  const filteredTrainers = useMemo(() => filterItems(trainers), [trainers, filterItems]);
  const filteredBlogs = useMemo(() => filterItems(blogs), [blogs, filterItems]);
  const filteredPayments = useMemo(() => filterItems(payments), [payments, filterItems]);
  const filteredProducts = useMemo(() => filterItems(products), [products, filterItems]);
  const filteredBrands = useMemo(() => filterItems(brands), [brands, filterItems]);
  const filteredOffers = useMemo(() => filterItems(offers), [offers, filterItems]);
  const filteredOrders = useMemo(() => filterItems(orders), [orders, filterItems]);
  const filteredReviews = useMemo(() => filterItems(reviews), [reviews, filterItems]);
  const filteredAttendance = useMemo(() => filterItems(attendance), [attendance, filterItems]);
  const filteredClasses = useMemo(() => filterItems(classes), [classes, filterItems]);
  const filteredBookings = useMemo(() => filterItems(bookings), [bookings, filterItems]);
  const filteredGallery = useMemo(() => filterItems(gallery), [gallery, filterItems]);
  const filteredContactMessages = useMemo(() => filterItems(contactMessages), [contactMessages, filterItems]);
  const filteredShopCategories = useMemo(() => filterItems(shopCategories), [shopCategories, filterItems]);
  const unreadContactCount = contactMessages.filter((m) => m.status === "New").length;
  const filteredPlans = useMemo(
    () => ({
      ...settings,
      membershipPlans: filterItems(settings.membershipPlans),
    }),
    [settings, filterItems]
  );

  const setSection = (section: AdminSection) => {
    setActive(section);
    setSidebarOpen(false);
    setSearchQuery("");
    setModalType(null);
    setActiveItem(null);
  };

  const handleOpenAdd = () => {
    setModalType("add");
    setActiveItem(null);
  };

  const handleOpenEdit = (item: AdminItem) => {
    setModalType("edit");
    setActiveItem(item);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sec = searchParams.get("section") || searchParams.get("tab");
    if (sec) {
      setActive(sec as AdminSection);
      
      const action = searchParams.get("action");
      if (action === "add") {
        setTimeout(() => {
          handleOpenAdd();
        }, 100);
      }
    }
  }, []);

  return (
    <main className="adminShell">
      {/* Styles for CRUD Modal Form overlay */}
      <style jsx global>{`
        .adminModalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }
        .adminModal {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .adminModalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #27272a;
        }
        .adminModalHeader h2 {
          font-size: 1.25rem;
          color: #f4f4f5;
          margin: 0;
        }
        .adminModalClose {
          background: transparent;
          border: none;
          color: #a1a1aa;
          cursor: pointer;
          font-size: 1.25rem;
          padding: 4px;
          display: flex;
          align-items: center;
        }
        .adminModalClose:hover {
          color: #f4f4f5;
        }
        .adminModalBody {
          padding: 24px;
        }
        .adminFormGroup {
          margin-bottom: 16px;
        }
        .adminFormGroup.classFullScheduleEditor {
          margin-top: 10px;
          margin-bottom: 24px;
          padding: 16px;
          border: 1px solid rgba(251, 191, 36, 0.18);
          border-radius: 8px;
          background: rgba(251, 191, 36, 0.04);
        }
        .adminFormGroup label {
          display: block;
          font-size: 0.875rem;
          color: #a1a1aa;
          margin-bottom: 6px;
        }
        .adminFormGroup input,
        .adminFormGroup select,
        .adminFormGroup textarea {
          width: 100%;
          background: #09090b;
          border: 1px solid #27272a;
          color: #f4f4f5;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 0.95rem;
        }
        .adminFormGroup input:focus,
        .adminFormGroup select:focus,
        .adminFormGroup textarea:focus {
          border-color: #fcd34d;
          outline: none;
        }
        .adminFormActions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        .adminBtnCancel {
          background: #27272a;
          border: 1px solid #3f3f46;
          color: #e4e4e7;
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .adminBtnCancel:hover {
          background: #3f3f46;
        }
        .adminBtnSubmit {
          background: #fcd34d;
          color: #18181b;
          border: none;
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }
        .adminBtnSubmit:hover {
          background: #f59e0b;
        }
        .adminTableActionRow {
          display: flex;
          gap: 8px;
        }
        .adminActionBtn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          font-size: 1rem;
        }
        .adminActionBtn.edit {
          color: #38bdf8;
        }
        .adminActionBtn.edit:hover {
          background: rgba(56, 189, 248, 0.1);
        }
        .adminActionBtn.delete {
          color: #f87171;
        }
        .adminActionBtn.delete:hover {
          background: rgba(248, 113, 113, 0.1);
        }
      `}</style>

      <aside className={`adminSidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="adminBrand">
          <span className="adminBrandIcon">
            <FaDumbbell />
          </span>
          <div>
            <strong className="adminBrandText">FITNESS GYM</strong>
            <small className="adminBrandSubtext">ADMIN PANEL</small>
          </div>
        </div>

        <div className="adminNavContainer">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="adminNavSection">
              <span className="adminNavHeader">{group.title}</span>
              <nav className="adminNav" aria-label={`${group.title} navigation`}>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={active === item.id ? "active" : ""}
                    onClick={() => setSection(item.id as AdminSection)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="adminSidebarFooter">
          <Link href="/" className="adminViewWebLink">
            <FaSignOutAlt style={{ transform: "rotate(180deg)" }} />
            <span>View Website</span>
          </Link>
        </div>
      </aside>

      <section className="adminWorkspace">
        <header className="adminTopbar">
          <button
            className="adminMenuButton"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label="Toggle admin navigation"
          >
            <FaBars />
          </button>
          <label className="adminSearch">
            <FaSearch />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search members, orders, products..."
            />
          </label>

          <div className="adminTopbarRight">
            <button
              className="adminIconButton bell"
              aria-label="Contact Messages"
              onClick={() => setActive("contacts")}
              style={{ position: "relative" }}
            >
              <FaBell />
              {unreadContactCount > 0 && (
                <span className="adminNotificationBadge">{unreadContactCount}</span>
              )}
            </button>

            <div className="adminUserProfile">
              <div className="adminAvatarWrap">
                <Image
                  src="/images/fitness-logo.jpg"
                  alt="Admin Avatar"
                  width={36}
                  height={36}
                  className="adminAvatarImg"
                  unoptimized
                />
              </div>
              <div className="adminUserMeta">
                <span className="adminUserName">Admin</span>
                <span className="adminUserRole">Super Admin</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("admin_authenticated");
                  window.location.reload();
                }}
                className="adminLogoutBtn"
                title="Log Out"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Section */}
        {active === "dashboard" && (
          <Dashboard
            clients={clients}
            attendance={attendance}
            payments={payments}
            products={products}
            orders={orders}
            onOpenAddProduct={() => { setActive("shop"); handleOpenAdd(); }}
            onViewAllProducts={() => setActive("shop")}
            onViewAllOrders={() => setActive("orders")}
            onOpenAddMember={() => { setActive("clients"); handleOpenAdd(); }}
            onOpenAddMembership={() => { setActive("memberships"); handleOpenAdd(); }}
            onOpenAddAnnouncement={() => { setActive("blogs"); handleOpenAdd(); }}
          />
        )}

        {/* Clients Section */}
        {active === "clients" && (
          <Clients
            clients={filteredClients}
            setClients={setClients}
            settings={settings}
            trainers={trainers}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={(id) => setClients(clients.filter((c) => c.id !== id))}
          />
        )}

        {/* Trainers Section */}
        {active === "trainers" && (
          <Trainers
            trainers={filteredTrainers}
            setTrainers={setTrainers}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={(name) => setTrainers(trainers.filter((t) => t.name !== name))}
          />
        )}

        {/* Memberships Section */}
        {active === "memberships" && (
          <Memberships
            settings={filteredPlans}
            setSettings={setSettings}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={(key) =>
              setSettings({
                ...settings,
                membershipPlans: settings.membershipPlans.filter((p) => p.key !== key),
              })
            }
          />
        )}

        {/* Blogs Section */}
        {active === "blogs" && (
          <Blogs
            blogs={filteredBlogs}
            setBlogs={setBlogs}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={(slug) => setBlogs(blogs.filter((b) => b.slug !== slug))}
          />
        )}

        {/* Settings Section */}
        {active === "settings" && (
          <Settings settings={settings} setSettings={setSettings} />
        )}

        {/* Operational Sections */}
        {active === "payments" && (
          <OperationsTable
            title="Payments"
            headers={["Transaction ID", "Member", "Amount", "Method", "Status", "Date"]}
            rows={filteredPayments.map((p) => [p.txnId, p.member, formatCurrency(p.amount), p.method, p.status, p.date])}
            items={filteredPayments}
            actionLabel="Log Payment"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(p: PaymentLog) => setPayments(payments.filter((item) => item.txnId !== p.txnId))}
          />
        )}
        {active === "offers" && (
          <OperationsTable
            title="Offers / Coupons"
            headers={["Offer Name", "Type", "Discount", "Code", "Valid Till", "Status"]}
            rows={filteredOffers.map((o) => [o.name, o.type, o.discount, o.code, o.validTill, o.status])}
            items={filteredOffers}
            actionLabel="Add Offer"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(o: Offer) => setOffers(offers.filter((item) => item.code !== o.code))}
            onToggleStatus={(o: Offer) => setOffers(offers.map((item) => item.code === o.code ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item))}
          />
        )}
        {active === "brands" && (
          <OperationsTable
            title="Brands"
            headers={["Brand", "Key", "Description", "Status"]}
            rows={filteredBrands.map((b) => [b.name, b.key, b.description || "No description", b.status])}
            items={filteredBrands}
            actionLabel="Add Brand"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(b: Brand) => {
              setBrands(brands.filter((item) => item.key !== b.key));
              setProducts(products.map((product) =>
                product.brandKey === b.key
                  ? { ...product, brandKey: "", brandName: "" }
                  : product
              ));
            }}
            onToggleStatus={(b: Brand) => setBrands(brands.map((item) => item.key === b.key ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item))}
          />
        )}
        {active === "shop" && (
          <OperationsTable
            title="Shop Products"
            headers={["Product", "Brand", "Category", "Flavor", "Size", "Price", "Stock", "Status"]}
            rows={filteredProducts.map((p) => [
              p.name,
              p.brandName || brands.find((b) => b.key === p.brandKey)?.name || "Unassigned",
              p.category,
              p.flavor || "-",
              p.size || "-",
              formatCurrency(p.price),
              p.stock,
              p.status,
            ])}
            items={filteredProducts}
            actionLabel="Add Product"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(p: Product) => setProducts(products.filter((item) => item.id !== p.id))}
            onToggleStatus={(p: Product) => setProducts(products.map((item) => item.id === p.id ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item))}
          />
        )}
        {active === "shopCategories" && (
          <OperationsTable
            title="Shop Categories"
            headers={["Label", "Category", "Order"]}
            rows={filteredShopCategories.map((c) => [
              c.label,
              c.category,
              String(c.order ?? 0),
            ])}
            items={filteredShopCategories}
            actionLabel="Add Category"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(c: ShopCategory) => setShopCategories(shopCategories.filter((item) => item.label !== c.label))}
          />
        )}
        {active === "orders" && (
          <OperationsTable
            title="Orders"
            headers={["Order ID", "Customer", "Products", "Total", "Payment", "Status", "Date"]}
            rows={filteredOrders.map((o) => [o.orderId, o.customer, o.items || "Gym shop order", formatCurrency(o.total), o.payment, o.status, o.date])}
            items={filteredOrders}
            actionLabel="Log Order"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(o: OrderLog) => setOrders(orders.filter((item) => item.orderId !== o.orderId))}
          />
        )}
        {active === "reviews" && (
          <OperationsTable
            title="Reviews"
            headers={["Customer", "Product / Service", "Rating", "Review", "Date", "Status"]}
            rows={filteredReviews.map((r) => [r.customer, r.product, r.rating, r.reviewText, r.date, r.status])}
            items={filteredReviews}
            actionLabel="Add Review"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(r: Review) => setReviews(reviews.filter((item) => !(item.customer === r.customer && item.product === r.product && item.date === r.date)))}
            onApprove={(r: Review) => setReviews(reviews.map((item) => item.customer === r.customer && item.product === r.product && item.date === r.date ? { ...item, status: "Approved" } : item))}
            onToggleStatus={(r: Review) => setReviews(reviews.map((item) => item.customer === r.customer && item.product === r.product && item.date === r.date ? { ...item, status: item.status === "Approved" ? "Pending" : "Approved" } : item))}
          />
        )}
        {active === "attendance" && (
          <OperationsTable
            title="Attendance"
            headers={["Member", "Plan", "Status", "Time"]}
            rows={filteredAttendance.map((a) => [a.member, a.plan, a.status, a.time])}
            items={filteredAttendance}
            actionLabel="Log Check-in"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(a: AttendanceLog) =>
              setAttendance(attendance.filter((item) => !(item.member === a.member && item.plan === a.plan && item.time === a.time)))
            }
          />
        )}
        {active === "classes" && (
          <OperationsTable
            title="Programs"
            headers={["Program Name", "Tag", "Trainer", "Weekly Times", "Full Schedule", "Capacity"]}
            rows={filteredClasses.map((c) => [
              c.className,
              c.tag || "—",
              c.trainer,
              c.time,
              parseScheduleTable(c.schedule)
                .map((row) => `${row.day}: ${row.workout}`)
                .join(" | ") || "Not set",
              c.capacity,
            ])}
            items={filteredClasses}
            actionLabel="Add Program"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(c: ClassSchedule) =>
              setClasses(
                classes.filter(
                  (item) =>
                    !(
                      item.className === c.className &&
                      item.trainer === c.trainer &&
                      item.time === c.time
                    )
                )
              )
            }
          />
        )}
        {active === "bookings" && (
          <OperationsTable
            title="Bookings"
            headers={["Booking ID", "Client", "Trainer & Program", "Date"]}
            rows={filteredBookings.map((b) => [b.bookingId, b.member, b.service, b.date])}
            items={filteredBookings}
            actionLabel="Add Booking"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(b: Booking) =>
              setBookings(bookings.filter((item) => item.bookingId !== b.bookingId))
            }
          />
        )}
        {active === "gallery" && (
          <GalleryManager
            gallery={filteredGallery}
            onOpenAdd={handleOpenAdd}
            onDelete={(photo) => setGallery(gallery.filter((item) => item !== photo))}
          />
        )}

        {active === "contacts" && (
          <ContactMessages
            messages={filteredContactMessages}
            onDelete={async (msg: ContactMessage) => {
              // Optimistic local removal
              setContactMessages(contactMessages.filter((m) => m.id !== msg.id));
              // Hard-delete from Supabase
              try {
                await fetch(`/api/contact?id=${encodeURIComponent(msg.id)}`, {
                  method: "DELETE",
                });
              } catch {
                // Backend unreachable – local state still reflects deletion
              }
            }}
            onMarkRead={(msg: ContactMessage) => {
              setContactMessages(
                contactMessages.map((m) =>
                  m.id === msg.id ? { ...m, status: "Read" } : m
                )
              );
            }}
          />
        )}

        {active === "stock" && (
          <StockManagement
            products={filteredProducts}
            setProducts={setProducts}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
          />
        )}

        {active === "banners" && (
          <BannerManagement
            settings={settings}
            setSettings={setSettings}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
          />
        )}
        {modalType && (
          <ModalForm
            type={modalType}
            section={active}
            item={activeItem}
            settings={settings}
            trainers={trainers}
            clients={clients}
            brands={brands}
            shopCategories={shopCategories}
            onClose={() => setModalType(null)}
            onSubmit={(payload) => {
              const currentItem = (activeItem || {}) as FormFields;
              if (active === "memberships") {
                let updatedPlans = [];
                if (modalType === "edit") {
                  updatedPlans = settings.membershipPlans.map((p) =>
                    p.key === currentItem.key ? payload : p
                  );
                } else {
                  updatedPlans = [...settings.membershipPlans, payload];
                }
                setSettings({ ...settings, membershipPlans: updatedPlans });
              } else if (active === "clients") {
                const clientPayload = payload as unknown as DemoClient;
                if (modalType === "edit") {
                  setClients(clients.map((c) => (c.id === currentItem.id ? clientPayload : c)));
                } else {
                  setClients([...clients, clientPayload]);
                }
              } else if (active === "trainers") {
                const trainerPayload = payload as unknown as Trainer;
                if (modalType === "edit") {
                  setTrainers(trainers.map((t) => (t.name === currentItem.name ? trainerPayload : t)));
                } else {
                  setTrainers([...trainers, trainerPayload]);
                }
              } else if (active === "blogs") {
                const blogPayload = payload as unknown as BlogPost;
                if (modalType === "edit") {
                  setBlogs(blogs.map((b) => (b.slug === currentItem.slug ? blogPayload : b)));
                } else {
                  setBlogs([blogPayload, ...blogs]);
                }
              } else if (active === "payments") {
                const paymentPayload = payload as unknown as PaymentLog;
                if (modalType === "edit") {
                  setPayments(payments.map((p) => (p.txnId === currentItem.txnId ? paymentPayload : p)));
                } else {
                  setPayments([paymentPayload, ...payments]);
                }
              } else if (active === "offers") {
                const offerPayload = payload as unknown as Offer;
                if (modalType === "edit") {
                  setOffers(offers.map((o) => (o.code === currentItem.code ? offerPayload : o)));
                } else {
                  setOffers([offerPayload, ...offers]);
                }
              } else if (active === "brands") {
                const brandPayload = payload as unknown as Brand;
                if (modalType === "edit") {
                  setBrands(brands.map((b) => (b.key === currentItem.key ? brandPayload : b)));
                  setProducts(products.map((product) =>
                    product.brandKey === currentItem.key
                      ? { ...product, brandKey: String(payload.key || ""), brandName: String(payload.name || "") }
                      : product
                  ));
                } else {
                  setBrands([brandPayload, ...brands]);
                }
              } else if (active === "shop") {
                const productPayload = payload as unknown as Product;
                if (modalType === "edit") {
                  setProducts(products.map((p) => (p.id === currentItem.id ? { ...productPayload, id: currentItem.id } : p)));
                } else {
                  // Assign a temporary id so saveGymData uses update (not create) if it fires again
                  // before Supabase responds with the real UUID
                  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                  setProducts([{ ...productPayload, id: tempId }, ...products]);
                }
              } else if (active === "shopCategories") {
                const catPayload = payload as unknown as ShopCategory;
                if (modalType === "edit") {
                  setShopCategories(shopCategories.map((c) => (c.label === currentItem.label ? catPayload : c)));
                } else {
                  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                  setShopCategories([...shopCategories, { ...catPayload, id: tempId }]);
                }
              } else if (active === "orders") {
                const orderPayload = payload as unknown as OrderLog;
                if (modalType === "edit") {
                  setOrders(orders.map((o) => (o.orderId === currentItem.orderId ? orderPayload : o)));
                } else {
                  setOrders([orderPayload, ...orders]);
                }
              } else if (active === "reviews") {
                const reviewPayload = payload as unknown as Review;
                if (modalType === "edit") {
                  setReviews(reviews.map((r) => (r.customer === currentItem.customer && r.product === currentItem.product && r.date === currentItem.date ? reviewPayload : r)));
                } else {
                  setReviews([reviewPayload, ...reviews]);
                }
              } else if (active === "attendance") {
                const attendancePayload = payload as unknown as AttendanceLog;
                if (modalType === "edit") {
                  setAttendance(attendance.map((a) =>
                    a.member === currentItem.member && a.plan === currentItem.plan && a.time === currentItem.time ? attendancePayload : a
                  ));
                } else {
                  setAttendance([attendancePayload, ...attendance]);
                }
              } else if (active === "classes") {
                const classPayload = payload as unknown as ClassSchedule;
                if (modalType === "edit") {
                  setClasses(
                    classes.map((c) =>
                      c.className === currentItem.className &&
                      c.trainer === currentItem.trainer &&
                      c.time === currentItem.time
                        ? classPayload
                        : c
                    )
                  );
                } else {
                  setClasses([classPayload, ...classes]);
                }
              } else if (active === "bookings") {
                const bookingPayload = payload as unknown as Booking;
                if (modalType === "edit") {
                  setBookings(
                    bookings.map((b) =>
                      b.bookingId === currentItem.bookingId ? bookingPayload : b
                    )
                  );
                } else {
                  setBookings([bookingPayload, ...bookings]);
                }
              } else if (active === "gallery") {
                if (payload.image) {
                  setGallery([...gallery, payload.image]);
                }
              } else if (active === "banners") {
                const bannerPayload = { ...payload } as unknown as Banner;
                delete bannerPayload.index;
                let updatedBanners: Banner[] = [];
                if (modalType === "edit") {
                  const editIndex = (currentItem as Banner).index;
                  updatedBanners = (settings.banners || []).map((b, i) =>
                    i === editIndex ? bannerPayload : b
                  );
                } else {
                  updatedBanners = [...(settings.banners || []), bannerPayload];
                }
                setSettings({ ...settings, banners: updatedBanners });
              }
              setModalType(null);
            }}
          />
        )}
      </section>
    </main>
  );
}

// Subcomponents

function Dashboard({
  clients,
  attendance,
  payments,
  products = [],
  orders = [],
  onOpenAddProduct,
  onViewAllProducts,
  onViewAllOrders,
  onOpenAddMember,
  onOpenAddMembership,
  onOpenAddAnnouncement,
}: {
  clients: DemoClient[];
  attendance: AttendanceLog[];
  payments: PaymentLog[];
  products?: Product[];
  orders?: OrderLog[];
  onOpenAddProduct: () => void;
  onViewAllProducts: () => void;
  onViewAllOrders: () => void;
  onOpenAddMember: () => void;
  onOpenAddMembership: () => void;
  onOpenAddAnnouncement: () => void;
}) {
  const [shopFilter, setShopFilter] = useState<"all" | "low" | "featured" | "top">("all");
  const parseMoney = (value: string) => Number(value.replace(/[^\d.]/g, "")) || 0;
  const formatMetricNumber = (value: number) => value.toLocaleString("en-IN");
  const activeMembers = clients.filter((client) => client.package.status === "Active").length;
  const checkedInToday = attendance.filter((entry) => /checked|present/i.test(entry.status)).length;
  const totalRevenue = orders.reduce((total, order) => total + parseMoney(order.total), 0) || payments.reduce((total, payment) => total + parseMoney(payment.amount), 0);

  // Exact metrics from the screenshot
  const metrics = [
    {
      title: "Total Members",
      value: formatMetricNumber(clients.length),
      trend: "",
      sub: "Current total",
      icon: <FaUsers style={{ color: "#ef4444" }} />,
      iconBg: "#fee2e2",
    },
    {
      title: "Active Memberships",
      value: formatMetricNumber(activeMembers),
      trend: "",
      sub: "Currently active",
      icon: <FaDumbbell style={{ color: "#3b82f6" }} />,
      iconBg: "#dbeafe",
    },
    {
      title: "Today's Attendance",
      value: formatMetricNumber(checkedInToday),
      trend: "",
      sub: "Recorded attendance",
      icon: <FaCalendarCheck style={{ color: "#10b981" }} />,
      iconBg: "#d1fae5",
    },
    {
      title: "Shop Orders",
      value: formatMetricNumber(orders.length),
      trend: "",
      sub: "Recorded orders",
      icon: <FaShoppingCart style={{ color: "#f59e0b" }} />,
      iconBg: "#fef3c7",
    },
    {
      title: "Total Revenue",
      value: "₹2,45,680",
      trend: "",
      sub: "Recorded revenue",
      icon: <FaWallet style={{ color: "#8b5cf6" }} />,
      iconBg: "#ede9fe",
    },
  ];

  const totalRevenueMetric = metrics.find((metric) => metric.title === "Total Revenue");
  if (totalRevenueMetric) {
    totalRevenueMetric.value = formatCurrency(totalRevenue);
  }

  const dashboardProducts = products.map((product, index) => ({
    id: product.id || `${product.name}-${index}`,
    name: product.name,
    brand: product.brandName || "Unassigned",
    category: product.category,
    price: formatCurrency(product.price),
    stock: Number(product.stock) || 0,
    sold: 0,
    status: product.status,
    img: product.image || "/images/fitness-logo.jpg",
  }));

  const filteredProducts = dashboardProducts.filter((p) => {
    if (shopFilter === "low") return p.stock < 20;
    if (shopFilter === "featured") return false;
    if (shopFilter === "top") return false;
    return true;
  });
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="newDashboardContainer">
      <style jsx>{`
        .newDashboardContainer {
          display: flex;
          flex-direction: column;
          gap: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* Header Row */
        .dashHeaderRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .dashTitleCol h1 {
          font-size: 26px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
        }
        .dashTitleCol p {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0;
          font-weight: 500;
        }
        .dashDatePicker {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        /* Metrics Row */
        .dashMetricsRow {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        .metricCard {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .metricIconWrap {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .metricContent {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .metricContent label {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          white-space: nowrap;
        }
        .metricContent strong {
          font-size: 22px;
          font-weight: 900;
          color: #0f172a;
        }
        .metricTrend {
          font-size: 11px;
          font-weight: 700;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 2px;
          margin-top: 1px;
        }
        .metricTrend span {
          color: #64748b;
          font-weight: 500;
        }

        /* Charts Row */
        .dashChartsRow {
          display: grid;
          grid-template-columns: 29% 42% 29%;
          gap: 18px;
        }
        .chartWidget {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }
        .chartWidgetHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .chartWidgetHeader h2 {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .chartSelect {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 3px 6px;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          outline: none;
          background: #fff;
          cursor: pointer;
        }
        .chartBody {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-grow: 1;
          min-height: 156px;
        }
        .svgDonutWrap {
          position: relative;
          width: 140px;
          height: 140px;
          flex-shrink: 0;
        }
        .svgDonutText {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
        }
        .svgDonutText strong {
          font-size: 20px;
          font-weight: 900;
          color: #0f172a;
        }
        .svgDonutText span {
          font-size: 10px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          margin-top: 3px;
        }
        .chartLegend {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          color: #334155;
          flex-grow: 1;
        }
        .legendItem {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .legendLabel {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .legendColorDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .legendVal {
          color: #64748b;
          font-weight: 600;
        }

        /* Bottom Grid */
        .dashBottomGrid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 20px;
          align-items: start;
        }
        
        /* Shop Management Widget */
        .shopManageWidget {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .shopWidgetHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .shopWidgetHeader h2 {
          font-size: 16px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
        }
        .shopWidgetHeaderActions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btnRedAccent {
          background: #e53e3e;
          color: #ffffff;
          border: 0;
          border-radius: 6px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btnRedAccent:hover {
          background: #c53030;
        }
        .btnLightGray {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btnLightGray:hover {
          background: #e2e8f0;
        }
        
        /* Table tabs */
        .shopTabsList {
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: -4px;
        }
        .shopTabBtn {
          border: 0;
          background: transparent;
          padding: 0 0 10px;
          font-size: 12px;
          font-weight: 800;
          color: #64748b;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }
        .shopTabBtn:hover {
          color: #0f172a;
        }
        .shopTabBtn.active {
          color: #e53e3e;
        }
        .shopTabBtn.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #e53e3e;
        }

        /* Products Table */
        .dashProdTableWrap {
          overflow-x: auto;
        }
        .dashProdTable {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .dashProdTable th {
          padding: 10px 12px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid #f1f5f9;
        }
        .dashProdTable td {
          padding: 12px;
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        .tableProdCol {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tableProdImg {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          object-fit: cover;
          background: #f1f5f9;
          flex-shrink: 0;
        }
        .tableProdName {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
        }
        .badgeGreen {
          background: #d1fae5;
          color: #065f46;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .tableActionsCol {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tableActionBtn {
          background: transparent;
          border: 0;
          padding: 4px;
          font-size: 13px;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.15s;
        }
        .tableActionBtn:hover {
          color: #e53e3e;
        }
        .footerBtnWrap {
          display: flex;
          justify-content: center;
          margin-top: 4px;
        }

        /* Sidebar column widgets */
        .dashSidebarCol {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .sidebarWidget {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .sidebarWidget h2 {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .quickActionsList {
          display: grid;
          gap: 8px;
        }
        .quickActionRow {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          background: #ffffff;
          font-size: 12px;
          font-weight: 800;
          color: #334155;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .quickActionRow:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .quickActionIcon {
          color: #ef4444;
          font-size: 13px;
          display: flex;
          align-items: center;
        }
        .recentOrdersList {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .recentOrderRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          border: 1px solid #f8fafc;
          border-radius: 8px;
          background: #f8fafc;
        }
        .orderMeta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .orderNum {
          font-size: 11px;
          font-weight: 800;
          color: #0f172a;
        }
        .orderAmt {
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
        }
        .orderCust {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .custName {
          font-size: 11px;
          font-weight: 800;
          color: #334155;
        }
        .orderDate {
          font-size: 9px;
          color: #94a3b8;
          font-weight: 600;
        }
        .badgeStatus {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .badgeStatus.delivered {
          background: #d1fae5;
          color: #065f46;
        }
        .badgeStatus.shipped {
          background: #dbeafe;
          color: #1e40af;
        }
        .badgeStatus.pending {
          background: #fef3c7;
          color: #92400e;
        }
      `}</style>

      {/* Title & Date Range */}
      <div className="dashHeaderRow">
        <div className="dashTitleCol">
          <h1>Dashboard</h1>
          <p>Welcome back, Admin! 👋</p>
        </div>
        <button className="dashDatePicker" type="button">
          <FaCalendarAlt style={{ color: "#64748b" }} />
          <span>May 12 - Jun 12, 2025</span>
        </button>
      </div>

      {/* Metrics grid */}
      <section className="dashMetricsRow">
        {metrics.map((m, idx) => (
          <article className="metricCard" key={idx}>
            <div className="metricIconWrap" style={{ background: m.iconBg }}>
              {m.icon}
            </div>
            <div className="metricContent">
              <label>{m.title}</label>
              <strong>{m.value}</strong>
              <span className="metricTrend">
                ↑ {m.trend} <span>{m.sub}</span>
              </span>
            </div>
          </article>
        ))}
      </section>

      {/* Charts section */}
      {false && <section className="dashChartsRow">
        {/* Membership Overview Chart */}
        <article className="chartWidget">
          <div className="chartWidgetHeader">
            <h2>Membership Overview</h2>
            <select className="chartSelect" defaultValue="month">
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="chartBody">
            <div className="svgDonutWrap">
              <svg viewBox="0 0 160 160" width="100%" height="100%">
                {/* 
                  Radius = 50, Center = 80, 80
                  Circumference = 314.16
                  Basic: 37.4% -> 117.5 stroke-dasharray, offset = 0
                  Standard: 30.4% -> 95.5 stroke-dasharray, offset = -117.5
                  Premium: 22.9% -> 71.9 stroke-dasharray, offset = -213.0
                  Elite: 9.3% -> 29.2 stroke-dasharray, offset = -284.9
                */}
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeDasharray="117.5 314.16" strokeDashoffset="0" />
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="95.5 314.16" strokeDashoffset="-117.5" />
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#f97316" strokeWidth="16" strokeDasharray="71.9 314.16" strokeDashoffset="-213.0" />
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#a855f7" strokeWidth="16" strokeDasharray="29.2 314.16" strokeDashoffset="-284.9" />
              </svg>
              <div className="svgDonutText">
                <strong>856</strong>
                <span>Active</span>
              </div>
            </div>
            <div className="chartLegend">
              <div className="legendItem">
                <span className="legendLabel">
                  <span className="legendColorDot" style={{ background: "#3b82f6" }} /> Basic
                </span>
                <span className="legendVal">320 (37.4%)</span>
              </div>
              <div className="legendItem">
                <span className="legendLabel">
                  <span className="legendColorDot" style={{ background: "#10b981" }} /> Standard
                </span>
                <span className="legendVal">260 (30.4%)</span>
              </div>
              <div className="legendItem">
                <span className="legendLabel">
                  <span className="legendColorDot" style={{ background: "#f97316" }} /> Premium
                </span>
                <span className="legendVal">196 (22.9%)</span>
              </div>
              <div className="legendItem">
                <span className="legendLabel">
                  <span className="legendColorDot" style={{ background: "#a855f7" }} /> Elite
                </span>
                <span className="legendVal">80 (9.3%)</span>
              </div>
            </div>
          </div>
        </article>

        {/* Revenue Overview Chart */}
        <article className="chartWidget">
          <div className="chartWidgetHeader">
            <h2>Revenue Overview</h2>
            <select className="chartSelect" defaultValue="month">
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="chartBody" style={{ flexDirection: "column", padding: "10px 0" }}>
            <svg viewBox="0 0 420 140" width="100%" height="110">
              {/* Gradients */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="20" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="80" x2="400" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="20" y1="110" x2="400" y2="110" stroke="#f1f5f9" strokeWidth="1" />
              
              {/* Fill Area path */}
              <path d="M 20 110 C 60 90, 60 70, 100 70 C 140 70, 140 90, 180 90 C 220 90, 220 50, 260 50 C 300 50, 300 30, 340 30 L 340 110 L 20 110 Z" fill="url(#chartGradient)" />
              {/* Stroke line path */}
              <path d="M 20 110 C 60 90, 60 70, 100 70 C 140 70, 140 90, 180 90 C 220 90, 220 50, 260 50 C 300 50, 300 30, 340 30" fill="transparent" stroke="#ef4444" strokeWidth="3" />
              
              {/* Points */}
              <circle cx="20" cy="110" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="100" cy="70" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="180" cy="90" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="260" cy="50" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="340" cy="30" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              
              {/* Axis Labels */}
              <text x="20" y="130" fill="#94a3b8" fontSize="9" fontWeight="700" textAnchor="middle">May 12</text>
              <text x="100" y="130" fill="#94a3b8" fontSize="9" fontWeight="700" textAnchor="middle">May 19</text>
              <text x="180" y="130" fill="#94a3b8" fontSize="9" fontWeight="700" textAnchor="middle">May 26</text>
              <text x="260" y="130" fill="#94a3b8" fontSize="9" fontWeight="700" textAnchor="middle">Jun 02</text>
              <text x="340" y="130" fill="#94a3b8" fontSize="9" fontWeight="700" textAnchor="middle">Jun 09</text>
            </svg>
          </div>
        </article>

        {/* Top Selling Categories Chart */}
        <article className="chartWidget">
          <div className="chartWidgetHeader">
            <h2>Top Selling Categories</h2>
            <select className="chartSelect" defaultValue="month">
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="chartBody">
            <div className="svgDonutWrap">
              <svg viewBox="0 0 160 160" width="100%" height="100%">
                {/* 
                  Radius = 50, Center = 80, 80
                  Circumference = 314.16
                  Whey Protein: 28.8% -> 90.5 stroke-dasharray, offset = 0
                  Pre Workout: 20.5% -> 64.4 stroke-dasharray, offset = -90.5
                  Mass Gainers: 17.9% -> 56.2 stroke-dasharray, offset = -154.9
                  Vitamins: 14.1% -> 44.3 stroke-dasharray, offset = -211.1
                  Others: 18.6% -> 58.4 stroke-dasharray, offset = -255.4
                */}
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#ef4444" strokeWidth="16" strokeDasharray="90.5 314.16" strokeDashoffset="0" />
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#3b82f6" strokeWidth="16" strokeDasharray="64.4 314.16" strokeDashoffset="-90.5" />
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#10b981" strokeWidth="16" strokeDasharray="56.2 314.16" strokeDashoffset="-154.9" />
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#f59e0b" strokeWidth="16" strokeDasharray="44.3 314.16" strokeDashoffset="-211.1" />
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#a855f7" strokeWidth="16" strokeDasharray="58.4 314.16" strokeDashoffset="-255.4" />
              </svg>
              <div className="svgDonutText">
                <strong>156</strong>
                <span>Orders</span>
              </div>
            </div>
            <div className="chartLegend">
              <div className="legendItem">
                <span className="legendLabel">
                  <span className="legendColorDot" style={{ background: "#ef4444" }} /> Whey Protein
                </span>
                <span className="legendVal">45 (28.8%)</span>
              </div>
              <div className="legendItem">
                <span className="legendLabel">
                  <span className="legendColorDot" style={{ background: "#3b82f6" }} /> Pre Workout
                </span>
                <span className="legendVal">32 (20.5%)</span>
              </div>
              <div className="legendItem">
                <span className="legendLabel">
                  <span className="legendColorDot" style={{ background: "#10b981" }} /> Mass Gainers
                </span>
                <span className="legendVal">28 (17.9%)</span>
              </div>
              <div className="legendItem">
                <span className="legendLabel">
                  <span className="legendColorDot" style={{ background: "#f59e0b" }} /> Vitamins
                </span>
                <span className="legendVal">22 (14.1%)</span>
              </div>
              <div className="legendItem">
                <span className="legendLabel">
                  <span className="legendColorDot" style={{ background: "#a855f7" }} /> Others
                </span>
                <span className="legendVal">29 (18.6%)</span>
              </div>
            </div>
          </div>
        </article>
      </section>}

      {/* Grid container with Shop Management + Quick Actions */}
      <section className="dashBottomGrid">
        
        {/* Left Side: Shop Management */}
        <article className="shopManageWidget">
          <div className="shopWidgetHeader">
            <h2>Shop Management</h2>
            <div className="shopWidgetHeaderActions">
              <button className="btnRedAccent" type="button" onClick={onOpenAddProduct}>
                + Add Product
              </button>
              <button className="btnLightGray" type="button" onClick={onViewAllProducts}>
                View All Products
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="shopTabsList">
            <button className={`shopTabBtn${shopFilter === "all" ? " active" : ""}`} type="button" onClick={() => setShopFilter("all")}>All Products</button>
            <button className={`shopTabBtn${shopFilter === "low" ? " active" : ""}`} type="button" onClick={() => setShopFilter("low")}>Low Stock</button>
            <button className={`shopTabBtn${shopFilter === "featured" ? " active" : ""}`} type="button" onClick={() => setShopFilter("featured")}>Featured</button>
            <button className={`shopTabBtn${shopFilter === "top" ? " active" : ""}`} type="button" onClick={() => setShopFilter("top")}>Top Selling</button>
          </div>

          {/* Product table */}
          <div className="dashProdTableWrap">
            <table className="dashProdTable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Sold</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length ? filteredProducts.map((p) => (
                  <tr key={`${p.name}-${p.brand}`}>
                    <td>
                      <div className="tableProdCol">
                        <Image src={p.img} alt={p.name} width={32} height={32} className="tableProdImg" unoptimized />
                        <span className="tableProdName">{p.name}</span>
                      </div>
                    </td>
                    <td>{p.brand}</td>
                    <td>{p.category}</td>
                    <td>{p.price}</td>
                    <td style={{ color: p.stock < 20 ? "#f97316" : "#10b981", fontWeight: 800 }}>{p.stock}</td>
                    <td>{p.sold}</td>
                    <td>
                      <span className="badgeGreen">{p.status}</span>
                    </td>
                    <td>
                      <div className="tableActionsCol">
                        <button className="tableActionBtn" type="button" onClick={onViewAllProducts} title="View Details"><FaImages /></button>
                        <button className="tableActionBtn" type="button" onClick={onViewAllProducts} title="Edit"><FaEdit /></button>
                        <button className="tableActionBtn" type="button" onClick={onViewAllProducts} title="Delete"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="dashboardEmptyState">No products to display.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="footerBtnWrap">
            <button className="btnLightGray" type="button" onClick={onViewAllOrders} style={{ width: "100%", maxHeight: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              View All Shop Orders
            </button>
          </div>
        </article>

        {/* Right Side: Quick Actions & Recent Orders */}
        <div className="dashSidebarCol">
          
          {/* Quick Actions */}
          <article className="sidebarWidget">
            <h2>Quick Actions</h2>
            <div className="quickActionsList">
              <button className="quickActionRow" type="button" onClick={onOpenAddMember}>
                <span className="quickActionIcon"><FaUsers /></span>
                <span>Add New Member</span>
              </button>
              <button className="quickActionRow" type="button" onClick={onOpenAddProduct}>
                <span className="quickActionIcon"><FaShoppingCart /></span>
                <span>Add New Product</span>
              </button>
              <button className="quickActionRow" type="button" onClick={onOpenAddMembership}>
                <span className="quickActionIcon"><FaLayerGroup /></span>
                <span>Create New Membership</span>
              </button>
              <button className="quickActionRow" type="button" onClick={onOpenAddAnnouncement}>
                <span className="quickActionIcon"><FaEnvelope /></span>
                <span>Add Announcement</span>
              </button>
            </div>
          </article>

          {/* Recent Orders */}
          <article className="sidebarWidget">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2>Recent Orders</h2>
              <button type="button" onClick={onViewAllOrders} style={{ background: "transparent", border: 0, fontSize: "11px", fontWeight: "bold", color: "#e53e3e", cursor: "pointer" }}>View All</button>
            </div>
            <div className="recentOrdersList">
              {recentOrders.length ? recentOrders.map((order) => (
                <div className="recentOrderRow" key={order.orderId}>
                  <div className="orderMeta">
                    <span className="orderNum">{order.orderId}</span>
                    <span className="orderAmt">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="orderCust">
                    <span className="custName">{order.customer}</span>
                    <span className="orderDate">{order.date}</span>
                  </div>
                  <span className={`badgeStatus ${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
              )) : (
                <p className="dashboardEmptyState">No orders yet.</p>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function Clients({ clients, setClients, onOpenAdd, onOpenEdit, onDelete }: {
  clients: DemoClient[];
  setClients: (val: DemoClient[]) => void;
  settings: SharedGymContent;
  trainers: Trainer[];
  onOpenAdd: () => void;
  onOpenEdit: (item: DemoClient) => void;
  onDelete: (id: string) => void;
}) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const toggleStatus = (clientId: string) => {
    setClients(
      clients.map((c) => {
        if (c.id === clientId) {
          let nextStatus: "Active" | "Pending" | "Expired";
          if (c.package.status === "Active") {
            nextStatus = "Expired";
          } else if (c.package.status === "Expired") {
            nextStatus = "Pending";
          } else {
            nextStatus = "Active";
          }
          return {
            ...c,
            package: {
              ...c.package,
              status: nextStatus,
            },
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="adminPage">
      <PanelHeader title="Clients / Members" action="Add Member" onAction={onOpenAdd} />
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
              <th>Membership</th><th>Status</th><th>Joined On</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} style={pendingDeleteId === c.id ? { background: "rgba(248,113,113,0.06)" } : undefined}>
                <td>{c.id}</td>
                <td><strong>{c.name}</strong></td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.package.name} ({formatCurrency(c.package.price)})</td>
                <td>
                  <button
                    type="button"
                    onClick={() => toggleStatus(c.id)}
                    style={{ background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer" }}
                    title="Click to toggle status"
                  >
                    <Badge value={c.package.status} className="clickable" />
                  </button>
                </td>
                <td>{c.memberSince}</td>
                <td>
                  <div className="adminTableActionRow">
                    {pendingDeleteId === c.id ? (
                      <>
                        <span style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 700, whiteSpace: "nowrap" }}>Confirm?</span>
                        <button className="adminActionBtn delete" onClick={() => { onDelete(c.id); setPendingDeleteId(null); }} aria-label="Confirm Delete" style={{ background: "rgba(248,113,113,0.25)", border: "1px solid #f87171" }}>
                          <FaCheckCircle />
                        </button>
                        <button className="adminActionBtn edit" onClick={() => setPendingDeleteId(null)} aria-label="Cancel">
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="adminActionBtn edit" onClick={() => onOpenEdit(c)} aria-label="Edit Member"><FaEdit /></button>
                        <button className="adminActionBtn delete" onClick={() => setPendingDeleteId(c.id)} aria-label="Delete Member"><FaTrashAlt /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Trainers({ trainers, onOpenAdd, onOpenEdit, onDelete }: {
  trainers: Trainer[];
  setTrainers?: (val: Trainer[] | ((prev: Trainer[]) => Trainer[])) => void;
  onOpenAdd: () => void;
  onOpenEdit: (item: Trainer) => void;
  onDelete: (name: string) => void;
}) {
  const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);

  return (
    <div className="adminPage">
      <PanelHeader title="Our Team" action="Add Team" onAction={onOpenAdd} />
      <div className="adminTrainerGrid">
        {trainers.map((t) => (
          <article className="adminTrainerCard" key={t.name} style={{ position: "relative" }}>
            <Image src={t.image || "/images/fitness-logo.jpg"} alt={t.name} width={280} height={200} style={{ objectFit: "cover", width: "100%", height: "200px" }} unoptimized />
            <span className="adminOnlineDot" />
            <div>
              <h2>{t.name}</h2>
              {t.specialty && <p>{t.specialty}</p>}
              {t.certificate && <small>Certificate: {t.certificate}</small>}
              {t.experienceYears && <small>Experience: {t.experienceYears}</small>}
              {t.clients && <small>{t.clients}</small>}
              <span className="adminBadge info" style={{ display: "inline-block", marginTop: "6px" }}>{t.category}</span>
            </div>
            <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(24, 24, 27, 0.9)", borderRadius: "8px", display: "flex", gap: "4px", padding: "4px", alignItems: "center" }}>
              {pendingDeleteName === t.name ? (
                <>
                  <span style={{ fontSize: "0.7rem", color: "#f87171", fontWeight: 700, padding: "0 2px" }}>Delete?</span>
                  <button className="adminActionBtn delete" onClick={() => { onDelete(t.name); setPendingDeleteName(null); }} aria-label="Confirm Delete" style={{ background: "rgba(248,113,113,0.25)", border: "1px solid #f87171" }}>
                    <FaCheckCircle />
                  </button>
                  <button className="adminActionBtn edit" onClick={() => setPendingDeleteName(null)} aria-label="Cancel">
                    <FaTimes />
                  </button>
                </>
              ) : (
                <>
                  <button className="adminActionBtn edit" onClick={() => { setPendingDeleteName(null); onOpenEdit(t); }} aria-label="Edit Trainer"><FaEdit /></button>
                  <button className="adminActionBtn delete" onClick={() => setPendingDeleteName(t.name)} aria-label="Delete Trainer"><FaTrashAlt /></button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function GalleryManager({ gallery, onOpenAdd, onDelete }: {
  gallery: string[];
  onOpenAdd: () => void;
  onDelete: (photo: string) => void;
}) {
  const [pendingDeleteUrl, setPendingDeleteUrl] = useState<string | null>(null);

  return (
    <div className="adminPage">
      <PanelHeader title="Gallery Photos" action="Add Photo" onAction={onOpenAdd} />
      <div className="adminGalleryGrid">
        {gallery.map((photo, index) => (
          <article className="adminGalleryCard" key={`${index}-${photo.slice(-20)}`}>
            <Image src={photo || "/images/fitness-logo.jpg"} alt={`Gallery ${index + 1}`} width={320} height={200} style={{ objectFit: "cover", width: "100%", height: "200px" }} unoptimized />
            <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(24, 24, 27, 0.9)", borderRadius: "8px", display: "flex", gap: "4px", padding: "4px", alignItems: "center" }}>
              {pendingDeleteUrl === photo ? (
                <>
                  <span style={{ fontSize: "0.7rem", color: "#f87171", fontWeight: 700, padding: "0 2px" }}>Delete?</span>
                  <button className="adminActionBtn delete" onClick={() => { onDelete(photo); setPendingDeleteUrl(null); }} aria-label="Confirm Delete" style={{ background: "rgba(248,113,113,0.25)", border: "1px solid #f87171" }}>
                    <FaCheckCircle />
                  </button>
                  <button className="adminActionBtn edit" onClick={() => setPendingDeleteUrl(null)} aria-label="Cancel">
                    <FaTimes />
                  </button>
                </>
              ) : (
                <button className="adminActionBtn delete" onClick={() => setPendingDeleteUrl(photo)} aria-label="Delete Photo">
                  <FaTrashAlt />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Memberships({
  settings,
  onOpenAdd,
  onOpenEdit,
  onDelete,
}: {
  settings: SharedGymContent;
  setSettings: (val: SharedGymContent | ((prev: SharedGymContent) => SharedGymContent)) => void;
  onOpenAdd: () => void;
  onOpenEdit: (item: SharedMembershipPlan) => void;
  onDelete: (key: string) => void;
}) {
  return (
    <div className="adminPage">
      <PanelHeader title="Membership Plans" action="Add Plan" onAction={onOpenAdd} />
      <div className="adminPlanStack">
        {settings.membershipPlans.map((plan) => (
          <article className="adminPlanRow" key={plan.key}>
            <div>
              <h2>
                {plan.name} {plan.highlighted && <span style={{ color: "#fcd34d", fontSize: "0.8rem", marginLeft: "6px" }}>★ Popular</span>}
              </h2>
              <strong>
                {formatCurrency(plan.price)} <span>/ month</span>
              </strong>
              <div style={{ fontSize: "0.85rem", color: "#a1a1aa", marginTop: "4px" }}>
                Access: {plan.access} | Trainer: {plan.trainer}
              </div>
            </div>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <FaCheckCircle /> {feature}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="adminPrimaryButton" onClick={() => onOpenEdit(plan)}>Edit</button>
              <button
                className="adminIconButton"
                style={{ background: "rgba(248, 113, 113, 0.1)", color: "#f87171", border: "1px solid rgba(248, 113, 113, 0.2)" }}
                onClick={() => onDelete(plan.key)}
                aria-label="Delete Plan"
              >
                <FaTrashAlt />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Blogs({
  blogs,
  onOpenAdd,
  onOpenEdit,
  onDelete,
}: {
  blogs: BlogPost[];
  setBlogs: (val: BlogPost[] | ((prev: BlogPost[]) => BlogPost[])) => void;
  onOpenAdd: () => void;
  onOpenEdit: (item: BlogPost) => void;
  onDelete: (slug: string) => void;
}) {
  return (
    <div className="adminPage">
      <PanelHeader title="Blogs" action="Add Blog" onAction={onOpenAdd} />
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Published On</th>
              <th>Read Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((b) => (
              <tr key={b.slug}>
                <td><strong>{b.title}</strong></td>
                <td>{b.category}</td>
                <td>{b.author}</td>
                <td>{b.date}</td>
                <td>{b.readTime}</td>
                <td>
                  <div className="adminTableActionRow">
                    <button className="adminActionBtn edit" onClick={() => onOpenEdit(b)} aria-label="Edit Blog">
                      <FaEdit />
                    </button>
                    <button className="adminActionBtn delete" onClick={() => onDelete(b.slug)} aria-label="Delete Blog">
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Settings({
  settings,
  setSettings,
}: {
  settings: SharedGymContent;
  setSettings: (val: SharedGymContent) => void;
}) {
  const [gymName, setGymName] = useState(settings.gymName);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [phoneError, setPhoneError] = useState("");
  const [address, setAddress] = useState(settings.address);
  const [currency, setCurrency] = useState(settings.currency);
  const [logo, setLogo] = useState(settings.logo);
  const [message, setMessage] = useState("");

  const validatePhone = (value: string) => {
    // Nepal: 10 digits starting with 96–99, optional +977 or 977 prefix.
    const stripped = value.trim().replace(/^(\+977|977)/, "").replace(/\s/g, "");
    if (!stripped) return "Phone number is required.";
    if (!/^[9][6-9][0-9]{8}$/.test(stripped))
      return "Enter a valid 10-digit Nepali number (e.g. 9812345678 or +977 9812345678).";
    return "";
  };

  useEffect(() => {
    setGymName(settings.gymName);
    setEmail(settings.email);
    setPhone(settings.phone);
    setAddress(settings.address);
    setCurrency(settings.currency);
    setLogo(settings.logo);
  }, [settings]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }
    const nextSettings = {
      ...settings,
      gymName,
      email,
      phone,
      address,
      currency,
      logo,
    };
    setSettings(nextSettings);
    setMessage("Settings updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="adminPage">
      <PanelHeader title="General Settings" />
      <form className="adminSettingsForm" onSubmit={handleSave}>
        <label>
          <span>Gym Name</span>
          <input value={gymName} onChange={(e) => setGymName(e.target.value)} required />
        </label>
        <label>
          <span>Email Address</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          <span>Phone Number</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneError(validatePhone(e.target.value));
            }}
            placeholder="Phone No."
            required
            style={phoneError ? { borderColor: "#f87171" } : {}}
          />
          {phoneError && (
            <span style={{ fontSize: "0.78rem", color: "#f87171", marginTop: "4px", display: "block" }}>
              {phoneError}
            </span>
          )}
        </label>
        <label>
          <span>Address</span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} required />
        </label>
        <label>
          <span>Currency Format</span>
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} required />
        </label>
        <label className="adminLogoUpload">
          <span>
            <FaDumbbell />
            <strong>Logo</strong>
          </span>
          <input type="file" accept="image/*" onChange={handleLogoChange} />
        </label>
        {logo ? (
          <Image
            src={logo}
            alt="Logo preview"
            width={100}
            height={100}
            unoptimized
            style={{
              width: "100px",
              height: "100px",
              objectFit: "contain",
              borderRadius: "10px",
              border: "1px solid #27272a",
              marginTop: "12px",
            }}
          />
        ) : null}
        <button className="adminSaveButton" type="submit" disabled={!!phoneError} style={phoneError ? { opacity: 0.5, cursor: "not-allowed" } : {}}>Save Changes</button>
        {message && <div style={{ background: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.2)", color: "#34d399", padding: "12px", borderRadius: "6px", marginTop: "16px" }}>{message}</div>}
      </form>
    </div>
  );
}

function OperationsTable<T>({ title, headers, rows, items, actionLabel, onAdd, onEdit, onDelete, onApprove, onToggleStatus }: {
  title: string;
  headers: string[];
  rows: string[][];
  items?: T[];
  actionLabel?: string;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onApprove?: (item: T) => void;
  onToggleStatus?: (item: T) => void;
}) {
  const [pendingDeleteIdx, setPendingDeleteIdx] = useState<number | null>(null);
  const showActions = (onEdit || onDelete) && items && items.length > 0;
  const displayHeaders = showActions ? [...headers, "Actions"] : headers;

  const handleDeleteClick = (idx: number) => {
    if (pendingDeleteIdx === idx) {
      // Second click — confirmed
      const item = items![idx];
      onDelete!(item);
      setPendingDeleteIdx(null);
    } else {
      setPendingDeleteIdx(idx);
    }
  };

  return (
    <div className="adminPage">
      <PanelHeader title={title} action={actionLabel} onAction={onAdd} />
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              {displayHeaders.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const originalItem = items ? items[idx] : null;
              const stableKey = `${row[0] ?? ""}-${idx}`;
              const isPending = pendingDeleteIdx === idx;
              return (
                <tr key={stableKey} style={isPending ? { background: "rgba(248,113,113,0.06)" } : undefined}>
                  {row.map((cell, index) => (
                    <td key={`${stableKey}-${index}`}>
                      {["Active", "Inactive", "Paid", "Pending", "Delivered", "Processing", "Shipped", "Published", "Draft", "Approved", "Checked In", "Checked Out", "Late"].includes(cell) ? (
                        onToggleStatus && originalItem ? (
                          <button type="button" className="adminInlineStatusToggle" onClick={() => onToggleStatus(originalItem)} aria-label={`Change status from ${cell}`}>
                            <Badge value={cell} />
                          </button>
                        ) : <Badge value={cell} />
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                  {showActions && originalItem && (
                    <td>
                      <div className="adminTableActionRow">
                        {onApprove && !isPending && (originalItem as Record<string, unknown>).status === "Pending" && (
                          <button
                            className="adminActionBtn"
                            onClick={() => onApprove(originalItem)}
                            aria-label="Approve Review"
                            title="Approve Review"
                            style={{ color: "#34d399", marginRight: "4px" }}
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        {onEdit && !isPending && (
                          <button className="adminActionBtn edit" onClick={() => { setPendingDeleteIdx(null); onEdit(originalItem); }} aria-label="Edit Item">
                            <FaEdit />
                          </button>
                        )}
                        {onDelete && (
                          isPending ? (
                            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                              <span style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 700, whiteSpace: "nowrap" }}>Confirm?</span>
                              <button
                                className="adminActionBtn delete"
                                onClick={() => handleDeleteClick(idx)}
                                aria-label="Confirm Delete"
                                style={{ background: "rgba(248,113,113,0.25)", border: "1px solid #f87171" }}
                              >
                                <FaCheckCircle />
                              </button>
                              <button
                                className="adminActionBtn edit"
                                onClick={() => setPendingDeleteIdx(null)}
                                aria-label="Cancel Delete"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ) : (
                            <button className="adminActionBtn delete" onClick={() => handleDeleteClick(idx)} aria-label="Delete Item">
                              <FaTrashAlt />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Flexible typed interface for form fields across all admin sections
interface FormFields {
  [key: string]: unknown;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  weight?: string;
  height?: string;
  specialRequest?: string;
  packageKey?: string;
  status?: string;
  startedOn?: string;
  renewsOn?: string;
  paymentMethod?: string;
  sessionsUsed?: number;
  sessionsTotal?: number;
  trainer?: string;
  image?: string;
  memberSince?: string;
  subtitle?: string;
  link?: string;
  // Class / program fields
  className?: string;
  time?: string;
  capacity?: string;
  duration?: string;
  intensity?: string;
  targetAudience?: string;
  benefits?: string | string[];
  schedule?: string;
  description?: string;
  category?: string;
  // Blog fields
  title?: string;
  date?: string;
  author?: string;
  readTime?: string;
  summary?: string;
  content?: string | string[];
  slug?: string;
  // Membership plan fields
  key?: string;
  price?: number | string;
  access?: string;
  features?: string | string[];
  upcomingClasses?: string | string[];
  highlighted?: boolean;
  // Shop / offer fields
  brandKey?: string;
  brandName?: string;
  flavor?: string;
  size?: string;
  stock?: string;
  txnId?: string;
  member?: string;
  amount?: string;
  method?: string;
  orderId?: string;
  customer?: string;
  items?: string;
  total?: string;
  payment?: string;
  plan?: string;
  product?: string;
  reviewText?: string;
  bookingId?: string;
  service?: string;
  caption?: string;
  discount?: string;
  code?: string;
  type?: string;
  validTill?: string;
  logo?: string;
  banner?: string;
  // Misc
  specialty?: string;
  experienceYears?: string;
  clients?: string;
  certificate?: string;
  rating?: string;
  text?: string;
  photo?: string;
  url?: string;
  label?: string;
  order?: number;
}

// Modal Form overlay component

function ModalForm({
  type,
  section,
  item,
  settings,
  trainers,
  clients = [],
  brands = [],
  shopCategories = [],
  onClose,
  onSubmit,
}: {
  type: "add" | "edit";
  section: AdminSection;
  item: AdminItem | null;
  settings: SharedGymContent;
  trainers: Trainer[];
  clients?: DemoClient[];
  brands?: Brand[];
  shopCategories?: ShopCategory[];
  onClose: () => void;
  onSubmit: (payload: FormFields) => void;
}) {
  const [fields, setFields] = useState<FormFields>(() => {
    if (type === "edit" && item) {
      return { ...item };
    }
    // Return empty fields based on section
    if (section === "memberships") {
      return { key: "", name: "", price: 0, access: "", trainer: "Front Desk Support", sessionsTotal: 16, features: "", upcomingClasses: "", highlighted: false };
    }
    if (section === "clients") {
      return {
        id: getNextClientId(clients),
        name: "",
        email: "",
        phone: "",
        memberSince: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
        packageKey: "premium",
        status: "Active",
        startedOn: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
        renewsOn: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
        paymentMethod: "Card",
        sessionsUsed: 0,
        sessionsTotal: 24,
        trainer: "Mike Johnson",
        weight: "",
        height: "",
        specialRequest: "",
      };
    }
    if (section === "trainers") {
      return {
        name: "",
        specialty: "",
        certificate: "",
        experienceYears: "",
        clients: "0 clients",
        image: "/images/fitness-logo.jpg",
        category: "Trainers",
      };
    }
    if (section === "blogs") {
      return { title: "", category: "Fitness", author: "Admin", date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }), summary: "", content: "", image: "/images/pullup-training.jpg" };
    }
    if (section === "payments") {
      return { txnId: `TXN${Math.floor(1000 + Math.random() * 9000)}`, member: "", amount: "Rs 4,900", method: "Card", status: "Paid", date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) };
    }
    if (section === "offers") {
      return { name: "", type: "Percentage", discount: "15%", code: "", validTill: "", status: "Active" };
    }
    if (section === "brands") {
      return {
        key: "",
        name: "",
        logo: "/images/fitness-logo.jpg",
        banner: "/images/equipment-row.jpg",
        description: "",
        status: "Active",
      };
    }
    if (section === "shopCategories") {
      return {
        label: "",
        category: "Protein",
        image: "/images/kettlebell.jpg",
        order: shopCategories.length,
      };
    }
    if (section === "shop") {
      const defaultBrand = brands.find((brand) => brand.status === "Active") || brands[0];
      return {
        name: "",
        brandKey: defaultBrand?.key || "",
        brandName: defaultBrand?.name || "",
        category: "Protein",
        flavor: "Chocolate",
        size: "1 kg",
        price: "Rs 1,999",
        rating: "4.5",
        stock: "20",
        status: "Active",
        description: "",
        image: "/images/kettlebell.jpg",
      };
    }
    if (section === "orders") {
      return { orderId: `#${Math.floor(1000 + Math.random() * 9000)}`, customer: "", items: "", total: "Rs 1,999", payment: "Paid", status: "Processing", date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) };
    }
    if (section === "reviews") {
      return { customer: "", product: "", rating: "★★★★★", reviewText: "", date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }), status: "Approved" };
    }
    if (section === "attendance") {
      return { member: "", plan: "Premium", status: "Checked In", time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) };
    }
    if (section === "classes") {
      return { 
        className: "", 
        trainer: "", 
        time: "", 
        capacity: "20 members", 
        image: "",
        description: "",
        duration: "",
        intensity: "",
        targetAudience: "",
        benefits: "",
        schedule: ""
      };
    }
    if (section === "bookings") {
      return { bookingId: `BK-${Math.floor(1000 + Math.random() * 9000)}`, member: "", service: "", date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) };
    }
    if (section === "gallery") {
      return { image: "", caption: "" };
    }
    if (section === "banners") {
      return { title: "", subtitle: "", link: "", image: "" };
    }
    return {};
  });

  const [isCompressing, setIsCompressing] = useState(false);
  const clientItem = isDemoClientItem(item) ? item : null;
  const isWebsiteMemberClient =
    section === "clients" &&
    type === "edit" &&
    Boolean(clientItem?.username || clientItem?.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setFields((prev: FormFields) => ({ ...prev, [name]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
      return;
    }

    setFields((prev: FormFields) => {
      const next = { ...prev };
      next[name as keyof FormFields] = (isCheckbox ? checked : value) as never;
      if (name === "packageKey") {
        const activePlan = settings.membershipPlans.find((p) => p.key === value);
        if (activePlan) {
          next.trainer = activePlan.trainer;
          next.sessionsTotal = fixedMembershipSessions(activePlan.key, activePlan.name, activePlan.sessionsTotal || 24);
        }
      }
      if (name === "brandKey") {
        const activeBrand = brands.find((brand) => brand.key === value);
        next.brandName = activeBrand?.name || "";
      }
      return next;
    });
  };

  const renderStatusToggle = (name: string, value: string, options: string[]) => (
    <div className="adminStatusToggle" role="group" aria-label={`${name} status`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? "active" : ""}
          aria-pressed={value === option}
          onClick={() => setFields((previous: FormFields) => ({ ...previous, [name]: option }))}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const handleClassNameChange = (value: string) => {
    setFields((prev: FormFields) => {
      const next = { ...prev, className: value };
      const matchedProgram = programs.find((p: { title: string; schedule?: string }) => p.title === value);
      if (matchedProgram) {
        next.time = matchedProgram.schedule;
      }
      return next;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Require an image for new banners
    if (section === "banners" && type !== "edit" && !fields.image) {
      alert("Please upload a banner image before saving.");
      return;
    }

    const payload = { ...fields };

    if (section === "memberships") {
      payload.price = Number(payload.price);
      payload.sessionsTotal = fixedMembershipSessions(payload.key, payload.name, Number(payload.sessionsTotal));
      payload.features = typeof payload.features === "string"
        ? (payload.features as string).split(",").map((f: string) => f.trim()).filter(Boolean)
        : payload.features;
      payload.upcomingClasses = typeof payload.upcomingClasses === "string"
        ? (payload.upcomingClasses as string).split(",").map((c: string) => c.trim()).filter(Boolean)
        : payload.upcomingClasses;
      if (!payload.key) {
        payload.key = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }
      payload.sessionsTotal = fixedMembershipSessions(payload.key, payload.name, Number(payload.sessionsTotal));
    }

    if (section === "clients") {
      const existingPackage = clientItem?.package;
      const pKey = isWebsiteMemberClient ? existingPackage?.key || "premium" : payload.packageKey || existingPackage?.key || "premium";
      const activePlan = settings.membershipPlans.find((p) => p.key === pKey) || settings.membershipPlans[0];
      const planSessionsTotal = fixedMembershipSessions(activePlan.key, activePlan.name, activePlan.sessionsTotal || 24);
      payload.package = {
        key: pKey,
        name: activePlan.name,
        price: activePlan.price,
        access: activePlan.access,
        status: type === "edit" ? existingPackage?.status : payload.status,
        startedOn: isWebsiteMemberClient ? existingPackage?.startedOn : payload.startedOn || existingPackage?.startedOn,
        renewsOn: isWebsiteMemberClient ? existingPackage?.renewsOn : payload.renewsOn || existingPackage?.renewsOn,
        paymentMethod: isWebsiteMemberClient ? existingPackage?.paymentMethod : payload.paymentMethod || existingPackage?.paymentMethod,
        sessionsUsed: Number(payload.sessionsUsed),
        sessionsTotal: Number(payload.sessionsTotal || planSessionsTotal),
        features: activePlan.features,
        upcomingClasses: activePlan.upcomingClasses,
        trainer: payload.trainer,
      };
      delete payload.packageKey;
      delete payload.startedOn;
      delete payload.renewsOn;
      delete payload.paymentMethod;
      delete payload.sessionsUsed;
      delete payload.sessionsTotal;
      delete payload.trainer;
    }

    if (section === "blogs") {
      payload.content = typeof payload.content === "string"
        ? (payload.content as string).split("\n\n").map((p: string) => p.trim()).filter(Boolean)
        : payload.content;
      if (!payload.slug) {
        payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      payload.readTime = `${Math.max(1, Math.round((payload.content.join ? payload.content.join(" ").split(/\s+/).length : 200) / 200))} Min Read`;
    }

    if (section === "brands") {
      if (!payload.key && payload.name) {
        payload.key = String(payload.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      payload.status = payload.status || "Active";
    }

    if (section === "shop") {
      const activeBrand = brands.find((brand) => brand.key === payload.brandKey);
      payload.brandName = activeBrand?.name || String(payload.brandName || "");
      payload.category = payload.category || "Protein";
      payload.rating = String(payload.rating || "4.5");
      payload.status = payload.status || "Active";
    }

    if (section === "shopCategories") {
      payload.order = Number(payload.order ?? 0);
    }

    if ((section === "gallery" || section === "classes" || section === "shop" || section === "brands" || section === "shopCategories" || section === "banners") && (payload.image || payload.logo || payload.banner)) {
      setIsCompressing(true);
      try {
        for (const imageField of ["image", "logo", "banner"] as const) {
          const imageValue = payload[imageField];
          if (typeof imageValue !== "string" || !imageValue.startsWith("data:")) continue;

          const formData = new FormData();
          formData.append("file", imageValue);
          formData.append("bucket", "gym-images");

          const uploadResponse = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const { url } = await uploadResponse.json();
            payload[imageField] = url;
          } else if (section !== "gallery") {
            payload[imageField] = await compressImage(imageValue);
          }
        }
      } catch {
        console.error("Image upload failed, using compressed base64");
        for (const imageField of ["image", "logo", "banner"] as const) {
          const imageValue = payload[imageField];
          if (typeof imageValue === "string" && imageValue.startsWith("data:") && section !== "gallery") {
            payload[imageField] = await compressImage(imageValue);
          }
        }
      } finally {
        setIsCompressing(false);
      }
    }

    onSubmit(payload);
  };

  return (
    <div className="adminModalOverlay" onClick={onClose}>
      <div className="adminModal" onClick={(e) => e.stopPropagation()}>
        <div className="adminModalHeader">
          <h2>
            {type === "edit" ? "Edit" : "Add New"}{" "}
            {section === "classes" ? "Program" : (section === "bookings" ? "Booking" : (section === "gallery" ? "Photo" : (section === "trainers" ? "Team Member" : (section.charAt(0).toUpperCase() + section.slice(1)))))}
          </h2>
          <button className="adminModalClose" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleFormSubmit}>
          <div className="adminModalBody">
            {/* Memberships Form fields */}
            {section === "memberships" && (
              <>
                <div className="adminFormGroup">
                  <label>Plan Name</label>
                  <input name="name" value={fields.name || ""} onChange={handleChange} required placeholder="e.g. Premium Membership" />
                </div>
                <div className="adminFormGroup">
                  <label>Monthly Price (Rs)</label>
                  <input type="number" name="price" value={fields.price || 0} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Access Limit</label>
                  <input name="access" value={fields.access || ""} onChange={handleChange} required placeholder="e.g. 24/7 access" />
                </div>
                <div className="adminFormGroup">
                  <label>Assigned Default Trainer</label>
                  <select name="trainer" value={fields.trainer || "Front Desk Support"} onChange={handleChange}>
                    <option value="Front Desk Support">Front Desk Support</option>
                    {trainers.map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Total Sessions</label>
                  <input type="number" name="sessionsTotal" value={fields.sessionsTotal || 16} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Features (comma-separated)</label>
                  <textarea
                    name="features"
                    value={
                      Array.isArray(fields.features)
                        ? fields.features.join(", ")
                        : fields.features || ""
                    }
                    onChange={handleChange}
                    required
                    placeholder="Unlimited access, Lockers, Free Towel"
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Upcoming Classes (comma-separated)</label>
                  <textarea
                    name="upcomingClasses"
                    value={
                      Array.isArray(fields.upcomingClasses)
                        ? fields.upcomingClasses.join(", ")
                        : fields.upcomingClasses || ""
                    }
                    onChange={handleChange}
                    required
                    placeholder="HIIT Burn, Power Strength"
                  />
                </div>
                <div className="adminFormGroup" style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px" }}>
                  <input
                    type="checkbox"
                    name="highlighted"
                    id="highlighted"
                    checked={fields.highlighted || false}
                    onChange={handleChange}
                    style={{ width: "auto" }}
                  />
                  <label htmlFor="highlighted" style={{ margin: 0 }}>Highlight as Popular Plan</label>
                </div>
              </>
            )}

            {/* Clients / Members Form fields */}
            {section === "clients" && (
              <>
                <div className="adminFormGroup">
                  <label>Client ID</label>
                  <input name="id" value={fields.id || ""} onChange={handleChange} disabled required />
                </div>
                <div className="adminFormGroup">
                  <label>Full Name</label>
                  <input name="name" value={fields.name || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Email Address</label>
                  <input type="email" name="email" value={fields.email || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={fields.phone || ""}
                    onChange={handleChange}
                    required
                    placeholder="Phone No."
                    pattern="(\+977|977)?[9][6-9][0-9]{8}"
                    title="Enter a valid 10-digit Nepali number (e.g. 9812345678 or +977 9812345678)"
                    maxLength={14}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "4px", display: "block" }}>
                    10-digit Nepali mobile number (e.g. 98XXXXXXXX or +977 9812345678).
                  </span>
                </div>
                <div className="adminFormGroup">
                  <label>Select Membership Package</label>
                  <select
                    name="packageKey"
                    value={fields.packageKey || clientItem?.package.key || "premium"}
                    onChange={handleChange}
                    disabled={isWebsiteMemberClient}
                  >
                    {settings.membershipPlans.map((p) => (
                      <option key={p.key} value={p.key}>{p.name} ({formatCurrency(p.price)}/mo)</option>
                    ))}
                  </select>
                </div>
                {type !== "edit" && (
                  <div className="adminFormGroup">
                    <label>Account Status</label>
                    {renderStatusToggle("status", String(fields.status || clientItem?.package.status || "Active"), ["Active", "Pending", "Expired"])}
                  </div>
                )}
                <div className="adminFormGroup">
                  <label>Assigned Personal Trainer</label>
                  <select name="trainer" value={fields.trainer || clientItem?.package.trainer || "Mike Johnson"} onChange={handleChange}>
                    <option value="Front Desk Support">Front Desk Support</option>
                    {trainers.map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Sessions Used</label>
                  <input type="number" name="sessionsUsed" value={fields.sessionsUsed ?? clientItem?.package.sessionsUsed ?? 0} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Sessions Total</label>
                  <input type="number" name="sessionsTotal" value={fields.sessionsTotal ?? clientItem?.package.sessionsTotal ?? 24} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Payment Method</label>
                  <input name="paymentMethod" value={fields.paymentMethod || clientItem?.package.paymentMethod || "Card"} onChange={handleChange} disabled={isWebsiteMemberClient} required />
                </div>
                <div className="adminFormGroup">
                  <label>Started On</label>
                  <input name="startedOn" value={fields.startedOn || clientItem?.package.startedOn || ""} onChange={handleChange} disabled={isWebsiteMemberClient} required />
                </div>
                <div className="adminFormGroup">
                  <label>Renews On</label>
                  <input name="renewsOn" value={fields.renewsOn || clientItem?.package.renewsOn || ""} onChange={handleChange} disabled={isWebsiteMemberClient} required />
                </div>
                <div className="adminFormGroup">
                  <label>Weight (kg)</label>
                  <input name="weight" value={fields.weight || ""} onChange={handleChange} placeholder="e.g. 70" />
                </div>
                <div className="adminFormGroup">
                  <label>Height (ft)</label>
                  <input name="height" value={fields.height || ""} onChange={handleChange} placeholder="e.g. 5.9" />
                </div>
                <div className="adminFormGroup">
                  <label>Special Request</label>
                  <textarea name="specialRequest" value={fields.specialRequest || ""} onChange={handleChange} placeholder="Any requests..." style={{ minHeight: "80px" }} />
                </div>
              </>
            )}

            {/* Trainers Form fields */}
            {section === "trainers" && (() => {
              const isOptionalCategory = ["Front Desk", "Housekeeping", "Franchise Manager"].includes(fields.category || "Trainers");
              return (
                <>
                  <div className="adminFormGroup">
                    <label>Name</label>
                    <input name="name" value={fields.name || ""} onChange={handleChange} required />
                  </div>
                  <div className="adminFormGroup">
                    <label>Specialty / Role {!isOptionalCategory && " *"}</label>
                    <input name="specialty" value={fields.specialty || ""} onChange={handleChange} required={!isOptionalCategory} placeholder="e.g. Strength Coach" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Certificate</label>
                    <input name="certificate" value={fields.certificate || ""} onChange={handleChange} placeholder="e.g. ACE Certified Personal Trainer" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Experience Year</label>
                    <input name="experienceYears" value={fields.experienceYears || ""} onChange={handleChange} placeholder="e.g. 5 years" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Clients Metric {!isOptionalCategory && " *"}</label>
                    <input name="clients" value={fields.clients || ""} onChange={handleChange} required={!isOptionalCategory} placeholder="e.g. 15 clients or Staff" />
                  </div>
                  <div className="adminFormGroup">
                    <label>Photo</label>
                    {fields.image && (
                      <Image
                        src={fields.image as string}
                        alt="Trainer preview"
                        width={400}
                        height={180}
                        unoptimized
                        style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px", border: "1px solid #3f3f46" }}
                      />
                    )}
                    <label
                      htmlFor="trainerImageUpload"
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 14px", background: "rgba(251,191,36,0.08)",
                        border: "1px dashed rgba(251,191,36,0.4)", borderRadius: "8px",
                        cursor: "pointer", color: "#fbbf24", fontSize: "0.875rem", fontWeight: 600,
                      }}
                    >
                      <FaCamera /> {fields.image ? "Change Photo" : "Upload Photo from Device"}
                    </label>
                    <input
                      id="trainerImageUpload"
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      style={{ display: "none" }}
                    />
                  </div>
                  <div className="adminFormGroup">
                    <label>Category Group</label>
                    <select name="category" value={fields.category || "Trainers"} onChange={handleChange}>
                      <option value="Trainers">Trainers (Main list)</option>
                      <option value="Yoga Instructor">Yoga Instructor</option>
                      <option value="Front Desk">Front Desk</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Franchise Manager">Franchise Manager</option>
                    </select>
                  </div>
                </>
              );
            })()}

            {/* Blogs Form fields */}
            {section === "blogs" && (
              <>
                <div className="adminFormGroup">
                  <label>Blog Title</label>
                  <input name="title" value={fields.title || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Category</label>
                  <input name="category" value={fields.category || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Author</label>
                  <input name="author" value={fields.author || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Summary Description</label>
                  <textarea name="summary" value={fields.summary || ""} onChange={handleChange} required placeholder="Brief summary for list display" />
                </div>
                <div className="adminFormGroup">
                  <label>Article Content (separate paragraphs with 2 returns)</label>
                  <textarea
                    name="content"
                    value={
                      Array.isArray(fields.content)
                        ? fields.content.join("\n\n")
                        : fields.content || ""
                    }
                    onChange={handleChange}
                    required
                    style={{ height: "150px" }}
                    placeholder="First paragraph... \n\nSecond paragraph..."
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Featured Image</label>
                  {fields.image && (
                    <Image
                      src={fields.image as string}
                      alt="Blog preview"
                      width={600}
                      height={160}
                      unoptimized
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px", border: "1px solid #3f3f46" }}
                    />
                  )}
                  <label
                    htmlFor="blogImageUpload"
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 14px", background: "rgba(251,191,36,0.08)",
                      border: "1px dashed rgba(251,191,36,0.4)", borderRadius: "8px",
                      cursor: "pointer", color: "#fbbf24", fontSize: "0.875rem", fontWeight: 600,
                    }}
                  >
                    <FaCamera /> {fields.image ? "Change Image" : "Upload Image from Device"}
                  </label>
                  <input
                    id="blogImageUpload"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Publish Date</label>
                  <input name="date" value={fields.date || ""} onChange={handleChange} required />
                </div>
              </>
            )}

            {/* Operations Fallback forms (payments, offers, shop, orders, attendance, classes, bookings) */}
            {section === "payments" && (
              <>
                <div className="adminFormGroup">
                  <label>Transaction ID</label>
                  <input name="txnId" value={fields.txnId || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Member Name</label>
                  <input name="member" value={fields.member || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Amount Charged</label>
                  <input name="amount" value={fields.amount || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Payment Method</label>
                  <input name="method" value={fields.method || ""} onChange={handleChange} required />
                </div>
                  <div className="adminFormGroup">
                    <label>Payment Status</label>
                  {renderStatusToggle("status", String(fields.status || "Paid"), ["Paid", "Pending"])}
                </div>
              </>
            )}

            {section === "offers" && (
              <>
                <div className="adminFormGroup">
                  <label>Offer Name</label>
                  <input name="name" value={fields.name || ""} onChange={handleChange} required placeholder="e.g. Welcome Discount" />
                </div>
                <div className="adminFormGroup">
                  <label>Offer Type</label>
                  <select name="type" value={fields.type || "Percentage"} onChange={handleChange}>
                    <option value="Percentage">Percentage (e.g. 15%)</option>
                    <option value="Fixed">Fixed Amount (e.g. Rs 100)</option>
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>
                    Discount Value
                    <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "8px" }}>
                      {fields.type === "Fixed" ? "e.g. Rs 100" : "e.g. 15%"}
                    </span>
                  </label>
                  <input name="discount" value={fields.discount || ""} onChange={handleChange} required
                    placeholder={fields.type === "Fixed" ? "Rs 100" : "15%"} />
                </div>
                <div className="adminFormGroup">
                  <label>Promo Code <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>(auto-uppercased)</span></label>
                  <input
                    name="code"
                    value={(fields.code || "").toUpperCase()}
                    onChange={(e) => handleChange({ ...e, target: { ...e.target, name: "code", value: e.target.value.toUpperCase() } } as unknown as React.ChangeEvent<HTMLInputElement>)}
                    required
                    placeholder="e.g. GYM15OFF"
                    style={{ letterSpacing: "0.05em", fontFamily: "monospace" }}
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Valid Till Date <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>(e.g. 31 Dec 2027)</span></label>
                  <input name="validTill" value={fields.validTill || ""} onChange={handleChange} required placeholder="31 Dec 2027" />
                </div>
                <div className="adminFormGroup">
                  <label>Status</label>
                  {renderStatusToggle("status", String(fields.status || "Active"), ["Active", "Inactive"])}
                </div>
              </>
            )}

            {section === "brands" && (
              <>
                <div className="adminFormGroup">
                  <label>Brand Name</label>
                  <input name="name" value={fields.name || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Brand Key</label>
                  <input name="key" value={fields.key || ""} onChange={handleChange} placeholder="auto-generated from name" />
                </div>
                <div className="adminFormGroup">
                  <label>Description</label>
                  <textarea name="description" value={fields.description || ""} onChange={handleChange} style={{ minHeight: "90px" }} />
                </div>
                <div className="adminFormGroup">
                  <label>Brand Logo</label>
                  {fields.logo && (
                    <Image
                      src={fields.logo as string}
                      alt="Brand logo preview"
                      width={220}
                      height={120}
                      unoptimized
                      style={{ width: "160px", height: "100px", objectFit: "contain", borderRadius: "8px", marginBottom: "8px", border: "1px solid #3f3f46", background: "#09090b" }}
                    />
                  )}
                  <label htmlFor="brandLogoUpload" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "rgba(251,191,36,0.08)", border: "1px dashed rgba(251,191,36,0.4)", borderRadius: "8px", cursor: "pointer", color: "#fbbf24", fontSize: "0.875rem", fontWeight: 600 }}>
                    <FaCamera /> {fields.logo ? "Change Brand Logo" : "Upload Brand Logo"}
                  </label>
                  <input id="brandLogoUpload" type="file" name="logo" accept="image/*" onChange={handleChange} style={{ display: "none" }} />
                </div>
                <div className="adminFormGroup">
                  <label>Brand Banner</label>
                  {fields.banner && (
                    <Image
                      src={fields.banner as string}
                      alt="Brand banner preview"
                      width={600}
                      height={160}
                      unoptimized
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px", border: "1px solid #3f3f46" }}
                    />
                  )}
                  <label htmlFor="brandBannerUpload" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "rgba(251,191,36,0.08)", border: "1px dashed rgba(251,191,36,0.4)", borderRadius: "8px", cursor: "pointer", color: "#fbbf24", fontSize: "0.875rem", fontWeight: 600 }}>
                    <FaImages /> {fields.banner ? "Change Brand Banner" : "Upload Brand Banner"}
                  </label>
                  <input id="brandBannerUpload" type="file" name="banner" accept="image/*" onChange={handleChange} style={{ display: "none" }} />
                </div>
                <div className="adminFormGroup">
                  <label>Status</label>
                  {renderStatusToggle("status", String(fields.status || "Active"), ["Active", "Inactive"])}
                </div>
              </>
            )}

            {section === "shop" && (
              <>
                <div className="adminFormGroup">
                  <label>Product Name</label>
                  <input name="name" value={fields.name || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Brand</label>
                  <select name="brandKey" value={fields.brandKey || ""} onChange={handleChange} required>
                    <option value="">Select brand</option>
                    {brands.map((brand) => (
                      <option key={brand.key} value={brand.key}>
                        {brand.name} {brand.status === "Inactive" ? "(Disabled)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Category</label>
                  <select name="category" value={fields.category || "Protein"} onChange={handleChange} required>
                    {["Protein", "Pre-Workout", "Creatine", "Mass Gainer", "BCAA", "Vitamins", "Fish Oil", "Fat Burners", "Post-Workout", "Meal Replacements", "Energy Drinks", "Protein Bars", "Peanut Butter"].map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Flavor</label>
                  <select name="flavor" value={fields.flavor || ""} onChange={handleChange} required>
                    <option value="">Select Flavor</option>
                    <option value="Chocolate">Chocolate</option>
                    <option value="Vanilla">Vanilla</option>
                    <option value="Cookies & Cream">Cookies & Cream</option>
                    <option value="Strawberry">Strawberry</option>
                    <option value="Banana">Banana</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Salted Caramel">Salted Caramel</option>
                    <option value="Mango">Mango</option>
                    <option value="Unflavored">Unflavored</option>
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Weight / Size</label>
                  <input name="size" value={fields.size || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Price</label>
                  <input name="price" value={fields.price || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Rating</label>
                  <input name="rating" value={fields.rating || ""} onChange={handleChange} placeholder="4.8" required />
                </div>
                <div className="adminFormGroup">
                  <label>Stock Quantity</label>
                  <input name="stock" value={fields.stock || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Description</label>
                  <textarea name="description" value={fields.description || ""} onChange={handleChange} style={{ minHeight: "90px" }} />
                </div>
                <div className="adminFormGroup">
                  <label>Product Image</label>
                  {fields.image && (
                    <Image
                      src={fields.image as string}
                      alt="Product preview"
                      width={600}
                      height={160}
                      unoptimized
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px", border: "1px solid #3f3f46" }}
                    />
                  )}
                  <label
                    htmlFor="productImageUpload"
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 14px", background: "rgba(251,191,36,0.08)",
                      border: "1px dashed rgba(251,191,36,0.4)", borderRadius: "8px",
                      cursor: "pointer", color: "#fbbf24", fontSize: "0.875rem", fontWeight: 600,
                    }}
                  >
                    <FaCamera /> {fields.image ? "Change Product Image" : "Upload Product Image"}
                  </label>
                  <input
                    id="productImageUpload"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Status</label>
                  {renderStatusToggle("status", String(fields.status || "Active"), ["Active", "Inactive"])}
                </div>
              </>
            )}

            {section === "shopCategories" && (
              <>
                <div className="adminFormGroup">
                  <label>Category Label (displayed to customers)</label>
                  <input name="label" value={fields.label || ""} onChange={handleChange} placeholder="e.g. Plant Proteins" required />
                </div>
                <div className="adminFormGroup">
                  <label>Category (maps to product category)</label>
                  <select name="category" value={fields.category || "Protein"} onChange={handleChange} required>
                    {["Protein", "Pre-Workout", "Creatine", "Mass Gainer", "BCAA", "Vitamins", "Fish Oil", "Fat Burners", "Post-Workout", "Meal Replacements", "Energy Drinks", "Protein Bars", "Peanut Butter"].map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Display Order (lower = shown first)</label>
                  <input name="order" type="number" value={fields.order ?? 0} onChange={handleChange} min={0} />
                </div>
                <div className="adminFormGroup">
                  <label>Category Photo</label>
                  {fields.image && (
                    <Image
                      src={fields.image as string}
                      alt="Category preview"
                      width={600}
                      height={160}
                      unoptimized
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px", border: "1px solid #3f3f46" }}
                    />
                  )}
                  <label
                    htmlFor="shopCatImageUpload"
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 14px", background: "rgba(251,191,36,0.08)",
                      border: "1px dashed rgba(251,191,36,0.4)", borderRadius: "8px",
                      cursor: "pointer", color: "#fbbf24", fontSize: "0.875rem", fontWeight: 600,
                    }}
                  >
                    <FaCamera /> {fields.image ? "Change Category Photo" : "Upload Category Photo"}
                  </label>
                  <input
                    id="shopCatImageUpload"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                </div>
              </>
            )}

            {section === "orders" && (
              <>
                <div className="adminFormGroup">
                  <label>Order ID</label>
                  <input name="orderId" value={fields.orderId || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Customer Name</label>
                  <input name="customer" value={fields.customer || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Products Ordered</label>
                  <input name="items" value={fields.items || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Total Price</label>
                  <input name="total" value={fields.total || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Payment Status</label>
                  {renderStatusToggle("payment", String(fields.payment || "Paid"), ["Paid", "Pending"])}
                </div>
                <div className="adminFormGroup">
                  <label>Order Fulfillment Status</label>
                  {renderStatusToggle("status", String(fields.status || "Processing"), ["Processing", "Shipped", "Delivered"])}
                </div>
              </>
            )}

            {section === "attendance" && (
              <>
                <div className="adminFormGroup">
                  <label>Member Name</label>
                  <input name="member" value={fields.member || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Membership Tier</label>
                  <input name="plan" value={fields.plan || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Attendance Status</label>
                  {renderStatusToggle("status", String(fields.status || "Checked In"), ["Checked In", "Checked Out", "Late"])}
                </div>
              </>
            )}

            {section === "classes" && (
              <>
                <div className="adminFormGroup">
                  <label>Program Name</label>
                  <input
                    list="program-options"
                    name="className"
                    value={fields.className || ""}
                    onChange={(e) => handleClassNameChange(e.target.value)}
                    placeholder="Select or type program name..."
                    required
                  />
                  <datalist id="program-options">
                    {programs.map((p) => (
                      <option key={p.slug} value={p.title} />
                    ))}
                  </datalist>
                </div>
                <div className="adminFormGroup">
                  <label>Program Tag</label>
                  <select
                    name="tag"
                    value={(fields.tag as string) || ""}
                    onChange={handleChange}
                  >
                    <option value="">— No Tag —</option>
                    <option value="Popular">🔥 Popular</option>
                    <option value="New">✨ New</option>
                    <option value="Top Rated">⭐ Top Rated</option>
                    <option value="Fat Burn">💪 Fat Burn</option>
                    <option value="Strength">🏋️ Strength</option>
                    <option value="Cardio">🏃 Cardio</option>
                    <option value="Yoga">🧘 Yoga</option>
                    <option value="HIIT">⚡ HIIT</option>
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Trainer</label>
                  <select
                    name="trainer"
                    value={fields.trainer || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a Trainer</option>
                    {trainers.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Weekly Times</label>
                  <input
                    name="time"
                    value={fields.time || ""}
                    onChange={handleChange}
                    placeholder="e.g. Mon, Wed, Fri - 06:00 AM, 05:00 PM"
                    required
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Capacity</label>
                  <input name="capacity" value={fields.capacity || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Program Image</label>
                  {fields.image && (
                    <Image
                      src={fields.image as string}
                      alt="Program preview"
                      width={600}
                      height={160}
                      unoptimized
                      style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px", border: "1px solid #3f3f46" }}
                    />
                  )}
                  <label
                    htmlFor="programImageUpload"
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "10px 14px", background: "rgba(251,191,36,0.08)",
                      border: "1px dashed rgba(251,191,36,0.4)", borderRadius: "8px",
                      cursor: "pointer", color: "#fbbf24", fontSize: "0.875rem", fontWeight: 600,
                    }}
                  >
                    <FaCamera /> {fields.image ? "Change Image" : "Upload Program Image"}
                  </label>
                  <input
                    id="programImageUpload"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Short Description</label>
                  <textarea
                    name="description"
                    value={fields.description || ""}
                    onChange={handleChange}
                    placeholder="Brief summary for list view..."
                    rows={3}
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Duration</label>
                  <input
                    name="duration"
                    value={fields.duration || ""}
                    onChange={handleChange}
                    placeholder="e.g. 60 Mins"
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Intensity</label>
                  <select
                    name="intensity"
                    value={fields.intensity || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Intensity</option>
                    <option value="Low">Low</option>
                    <option value="Low to Medium">Low to Medium</option>
                    <option value="Medium">Medium</option>
                    <option value="Medium to High">Medium to High</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                    <option value="Customized">Customized</option>
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Target Audience</label>
                  <textarea
                    name="targetAudience"
                    value={fields.targetAudience || ""}
                    onChange={handleChange}
                    placeholder="Who is this program for?"
                    rows={2}
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Benefits (comma-separated)</label>
                  <textarea
                    name="benefits"
                    value={fields.benefits || ""}
                    onChange={handleChange}
                    placeholder="e.g. Build muscle, Improve strength, Boost metabolism"
                    rows={3}
                  />
                </div>
                <div className="adminFormGroup classFullScheduleEditor" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ fontWeight: "600" }}>Full Schedule (Table)</label>
                  
                  <div style={{ overflowX: "auto", background: "#18181b", borderRadius: "8px", border: "1px solid #27272a", padding: "10px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", color: "#f4f4f5" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #3f3f46" }}>
                          <th style={{ textAlign: "left", padding: "8px", fontSize: "0.85rem", color: "#a1a1aa" }}>Day(s)</th>
                          <th style={{ textAlign: "left", padding: "8px", fontSize: "0.85rem", color: "#a1a1aa" }}>Workout(s)</th>
                          <th style={{ textAlign: "center", padding: "8px", fontSize: "0.85rem", color: "#a1a1aa", width: "80px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const rows = parseScheduleTable(fields.schedule || "");
                          if (rows.length === 0) {
                            return (
                              <tr>
                                <td colSpan={3} style={{ textAlign: "center", padding: "12px", fontSize: "0.9rem", color: "#71717a", fontStyle: "italic" }}>
                                  No schedule rows added yet.
                                </td>
                              </tr>
                            );
                          }
                          return rows.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: idx < rows.length - 1 ? "1px solid #27272a" : "none" }}>
                              <td style={{ padding: "6px" }}>
                                <select
                                  value={row.day}
                                  style={{ width: "100%", background: "#09090b", border: "1px solid #27272a", borderRadius: "4px", padding: "6px 10px", color: "#fff", fontSize: "0.9rem" }}
                                  onChange={(e) => {
                                    const updated = [...rows];
                                    updated[idx].day = e.target.value;
                                    setFields((prev: FormFields) => ({ ...prev, schedule: serializeScheduleTable(updated) }));
                                  }}
                                >

                                  {CLASS_SCHEDULE_DAY_OPTIONS.map((day) => (
                                    <option key={day} value={day}>
                                      {day}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ padding: "6px" }}>
                                <input
                                  type="text"
                                  value={row.workout}
                                  placeholder="e.g. Upper Body Strength, HIIT Circuit, Yoga Flow"
                                  style={{ width: "100%", background: "#09090b", border: "1px solid #27272a", borderRadius: "4px", padding: "6px 10px", color: "#fff", fontSize: "0.9rem" }}
                                  onChange={(e) => {
                                    const updated = [...rows];
                                    updated[idx].workout = e.target.value;
                                    setFields((prev: FormFields) => ({ ...prev, schedule: serializeScheduleTable(updated) }));
                                  }}
                                />
                              </td>
                              <td style={{ padding: "6px", textAlign: "center" }}>
                                <button
                                  type="button"
                                  style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", padding: "6px 10px", cursor: "pointer", fontSize: "0.85rem" }}
                                  onClick={() => {
                                    const updated = rows.filter((_, i) => i !== idx);
                                    setFields((prev: FormFields) => ({ ...prev, schedule: serializeScheduleTable(updated) }));
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    style={{
                      alignSelf: "flex-start",
                      background: "rgba(251,191,36,0.1)",
                      color: "#fbbf24",
                      border: "1px solid rgba(251,191,36,0.4)",
                      borderRadius: "6px",
                      padding: "6px 14px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                    onClick={() => {
                      const rows = parseScheduleTable(fields.schedule || "");
                      const updated = [...rows, { day: "", workout: "" }];
                      setFields((prev: FormFields) => ({ ...prev, schedule: serializeScheduleTable(updated) }));
                    }}
                  >
                    + Add Day & Workout
                  </button>
                </div>
              </>
            )}

            {section === "bookings" && (
              <>
                <div className="adminFormGroup">
                  <label>Booking ID</label>
                  <input name="bookingId" value={fields.bookingId || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Client Name</label>
                  <input name="member" value={fields.member || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Trainer & Program</label>
                  <input
                    list="program-options"
                    name="service"
                    value={fields.service || ""}
                    onChange={handleChange}
                    placeholder="e.g. Mike Johnson - Strength Training"
                    required
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Booking Date</label>
                  <input name="date" value={fields.date || ""} onChange={handleChange} required />
                </div>
              </>
            )}

            {section === "reviews" && (
              <>
                <div className="adminFormGroup">
                  <label>Customer Name</label>
                  <input name="customer" value={fields.customer || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Product / Service</label>
                  <input name="product" value={fields.product || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Rating</label>
                  <select name="rating" value={fields.rating || "★★★★★"} onChange={handleChange}>
                    <option value="★☆☆☆☆">★☆☆☆☆ (1 Star)</option>
                    <option value="★★☆☆☆">★★☆☆☆ (2 Stars)</option>
                    <option value="★★★☆☆">★★★☆☆ (3 Stars)</option>
                    <option value="★★★★☆">★★★★☆ (4 Stars)</option>
                    <option value="★★★★★">★★★★★ (5 Stars)</option>
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Review Text</label>
                  <textarea name="reviewText" value={fields.reviewText || ""} onChange={handleChange} required style={{ minHeight: "100px" }} />
                </div>
                <div className="adminFormGroup">
                  <label>Review Date</label>
                  <input name="date" value={fields.date || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Status</label>
                  {renderStatusToggle("status", String(fields.status || "Approved"), ["Approved", "Pending"])}
                </div>
              </>
            )}
            {section === "gallery" && (
              <>
                <div className="adminFormGroup">
                  <label>Gallery Photo</label>
                  {fields.image && (
                    <Image
                      src={fields.image as string}
                      alt="Gallery preview"
                      width={600}
                      height={220}
                      unoptimized
                      style={{ width: "100%", height: "220px", objectFit: "contain", objectPosition: "center", borderRadius: "8px", marginBottom: "8px", border: "1px solid #3f3f46", background: "#09090b" }}
                    />
                  )}
                  <label
                    htmlFor="galleryImageUpload"
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "12px 16px", background: "rgba(251,191,36,0.08)",
                      border: "2px dashed rgba(251,191,36,0.4)", borderRadius: "10px",
                      cursor: "pointer", color: "#fbbf24", fontSize: "0.9rem", fontWeight: 700,
                      justifyContent: "center",
                    }}
                  >
                    <FaImages /> {fields.image ? "Change Photo" : "Click to Upload Photo from Device"}
                  </label>
                  <input
                    id="galleryImageUpload"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                </div>
                <div className="adminFormGroup">
                  <label>Caption (optional)</label>
                  <input name="caption" value={fields.caption || ""} onChange={handleChange} placeholder="e.g. Morning HIIT Session" />
                </div>
              </>
            )}

            {section === "banners" && (
              <>
                <div className="adminFormGroup">
                  <label>Banner Title</label>
                  <input name="title" value={fields.title || ""} onChange={handleChange} placeholder="e.g. Summer Sale - 50% Off" />
                </div>
                <div className="adminFormGroup">
                  <label>Subtitle (optional)</label>
                  <input name="subtitle" value={fields.subtitle || ""} onChange={handleChange} placeholder="e.g. Limited time offer on all memberships" />
                </div>
                <div className="adminFormGroup">
                  <label>Link URL (optional)</label>
                  <input name="link" value={fields.link || ""} onChange={handleChange} placeholder="e.g. /membership" />
                </div>
                <div className="adminFormGroup">
                  <label>
                    Banner Image
                    {type !== "edit" && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
                  </label>
                  {fields.image && (
                    <Image
                      src={fields.image as string}
                      alt="Banner preview"
                      width={600}
                      height={220}
                      unoptimized
                      style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px", border: "1px solid #3f3f46", background: "#09090b" }}
                    />
                  )}
                  <label
                    htmlFor="bannerImageUpload"
                    style={{
                      display: "flex", alignItems: "center",
                      padding: "16px", background: fields.image ? "rgba(251,191,36,0.08)" : "rgba(239,68,68,0.06)",
                      border: `2px dashed ${fields.image ? "rgba(251,191,36,0.5)" : "rgba(239,68,68,0.45)"}`,
                      borderRadius: "10px",
                      cursor: "pointer", color: fields.image ? "#fbbf24" : "#f87171",
                      fontSize: "0.9rem", fontWeight: 700,
                      justifyContent: "center", flexDirection: "column", gap: "6px",
                    }}
                  >
                    <FaImages style={{ fontSize: "1.5rem" }} />
                    <span>{fields.image ? "Change Banner Image" : "Click to Upload Banner Image"}</span>
                    {!fields.image && (
                      <span style={{ fontSize: "0.78rem", fontWeight: 400, opacity: 0.75 }}>
                        JPG, PNG, or WebP — recommended size 1200×400px
                      </span>
                    )}
                  </label>
                  <input
                    id="bannerImageUpload"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: "none" }}
                  />
                  {!fields.image && type !== "edit" && (
                    <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "#f87171" }}>
                      An image is required to save the banner.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="adminModalFooter" style={{ padding: "16px 24px", borderTop: "1px solid #27272a", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" className="adminBtnCancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="adminBtnSubmit" disabled={isCompressing || (section === "banners" && type !== "edit" && !fields.image)}>
              {isCompressing ? "Processing..." : (type === "edit" ? "Save Changes" : (section === "gallery" ? "Upload Photo" : section === "banners" ? "Save Banner" : "Create Item"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Contact Messages Panel ─────────────────────────────────────────────────
function ContactMessages({
  messages,
  onDelete,
  onMarkRead,
}: {
  messages: ContactMessage[];
  onDelete: (msg: ContactMessage) => void;
  onMarkRead: (msg: ContactMessage) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (msg: ContactMessage) => {
    if (confirmId === msg.id) {
      onDelete(msg);
      setConfirmId(null);
    } else {
      setConfirmId(msg.id);
    }
  };

  return (
    <div className="adminPage">
      <PanelHeader title="Contact Messages" />

      {messages.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
            gap: "16px",
            color: "#71717a",
          }}
        >
          <FaEnvelope style={{ fontSize: "2.5rem", opacity: 0.3 }} />
          <p style={{ margin: 0, fontSize: "1rem" }}>No contact messages yet.</p>
          <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
            Messages sent via the contact form will appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
            padding: "24px",
          }}
        >
          {messages.map((msg) => {
            const isPending = confirmId === msg.id;
            const isNew = msg.status === "New";
            return (
              <div
                key={msg.id}
                style={{
                  background: isNew
                    ? "rgba(240, 90, 40, 0.06)"
                    : "rgba(39, 39, 42, 0.6)",
                  border: isNew
                    ? "1px solid rgba(240, 90, 40, 0.25)"
                    : "1px solid rgba(63, 63, 70, 0.8)",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  display: "grid",
                  gap: "10px",
                  transition: "background 0.2s",
                  position: "relative",
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #f05a28, #fbbf24)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        color: "#fff",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#f4f4f5",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {msg.name}
                        {isNew && (
                          <span
                            style={{
                              fontSize: "10px",
                              background: "#f05a28",
                              color: "#fff",
                              padding: "2px 7px",
                              borderRadius: "999px",
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#a1a1aa",
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                          marginTop: "2px",
                        }}
                      >
                        <span>{msg.email}</span>
                        {msg.phone && <span>{msg.phone}</span>}
                        <span>
                          {new Date(msg.date).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                    {isNew && (
                      <button
                        onClick={() => onMarkRead(msg)}
                        title="Mark as Read"
                        style={{
                          background: "rgba(52, 211, 153, 0.12)",
                          border: "1px solid rgba(52, 211, 153, 0.35)",
                          color: "#34d399",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          transition: "background 0.2s",
                        }}
                      >
                        <FaCheckCircle style={{ fontSize: "0.85rem" }} /> Mark Read
                      </button>
                    )}
                    {isPending ? (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span
                          style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 700, whiteSpace: "nowrap" }}
                        >
                          Delete?
                        </span>
                        <button
                          onClick={() => handleDeleteClick(msg)}
                          title="Confirm Delete"
                          style={{
                            background: "rgba(248, 113, 113, 0.2)",
                            border: "1px solid #f87171",
                            color: "#f87171",
                            borderRadius: "8px",
                            padding: "6px 10px",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                          }}
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          title="Cancel"
                          style={{
                            background: "transparent",
                            border: "1px solid #52525b",
                            color: "#a1a1aa",
                            borderRadius: "8px",
                            padding: "6px 10px",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                          }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteClick(msg)}
                        title="Delete Message"
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(248, 113, 113, 0.25)",
                          color: "#f87171",
                          borderRadius: "8px",
                          padding: "6px 10px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subject */}
                {msg.subject && (
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#e4e4e7",
                      borderLeft: "3px solid #f05a28",
                      paddingLeft: "10px",
                    }}
                  >
                    {msg.subject}
                  </div>
                )}

                {/* Message body */}
                <div
                  style={{
                    fontSize: "0.88rem",
                    color: "#a1a1aa",
                    lineHeight: 1.65,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Stock Management Panel ─────────────────────────────────────────────────
function StockManagement({
  products,
  setProducts,
  onOpenAdd,
  onOpenEdit,
}: {
  products: Product[];
  setProducts: (val: Product[] | ((prev: Product[]) => Product[])) => void;
  onOpenAdd: () => void;
  onOpenEdit: (item: Product) => void;
}) {
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out" | "high">("all");
  const lowStockThreshold = 20;

  const filteredProducts = products.filter((p) => {
    const stockVal = Number(p.stock) || 0;
    if (stockFilter === "low") return stockVal > 0 && stockVal < lowStockThreshold;
    if (stockFilter === "out") return stockVal === 0;
    if (stockFilter === "high") return stockVal >= lowStockThreshold;
    return true;
  });

  const updateStock = (productId: string | undefined, newStock: number) => {
    setProducts(
      products.map((p) => (p.id === productId ? { ...p, stock: String(newStock) } : p))
    );
  };

  const toggleProductStatus = (productId: string | undefined) => {
    setProducts(
      products.map((p) => p.id === productId ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" } : p)
    );
  };

  return (
    <div className="adminPage">
      <PanelHeader title="Stock Management" action="Add Product" onAction={onOpenAdd} />

      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={stockFilter === "all" ? "adminPrimaryButton" : "adminBtnCancel"}
            onClick={() => setStockFilter("all")}
            style={{ padding: "8px 16px", fontSize: "0.85rem" }}
          >
            All Products
          </button>
          <button
            type="button"
            className={stockFilter === "low" ? "adminPrimaryButton" : "adminBtnCancel"}
            onClick={() => setStockFilter("low")}
            style={{ padding: "8px 16px", fontSize: "0.85rem" }}
          >
            Low Stock ({products.filter((p) => { const s = Number(p.stock) || 0; return s > 0 && s < lowStockThreshold; }).length})
          </button>
          <button
            type="button"
            className={stockFilter === "out" ? "adminPrimaryButton" : "adminBtnCancel"}
            onClick={() => setStockFilter("out")}
            style={{ padding: "8px 16px", fontSize: "0.85rem" }}
          >
            Out of Stock ({products.filter((p) => (Number(p.stock) || 0) === 0).length})
          </button>
          <button
            type="button"
            className={stockFilter === "high" ? "adminPrimaryButton" : "adminBtnCancel"}
            onClick={() => setStockFilter("high")}
            style={{ padding: "8px 16px", fontSize: "0.85rem" }}
          >
            Well Stocked ({products.filter((p) => (Number(p.stock) || 0) >= lowStockThreshold).length})
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 24px",
              gap: "16px",
              color: "#71717a",
            }}
          >
            <FaShoppingCart style={{ fontSize: "2.5rem", opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: "1rem" }}>No products found for this filter.</p>
          </div>
        ) : (
          <div className="adminTableWrap">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Current Stock</th>
                  <th>Stock Status</th>
                  <th>Product Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const stockVal = Number(p.stock) || 0;
                  const stockStatus =
                    stockVal === 0
                      ? "Out of Stock"
                      : stockVal < lowStockThreshold
                      ? "Low Stock"
                      : "In Stock";

                  return (
                    <tr key={p.id ? `${p.id}-${p.name}` : `${p.name}-${p.brandKey || ""}`}>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>{p.brandName || "-"}</td>
                      <td>{p.category}</td>
                      <td>{formatCurrency(p.price)}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="number"
                            value={p.stock}
                            onChange={(e) => updateStock(p.id, parseInt(e.target.value) || 0)}
                            min="0"
                            style={{
                              width: "70px",
                              padding: "6px 8px",
                              background: "#09090b",
                              border: "1px solid #27272a",
                              color: "#f4f4f5",
                              borderRadius: "4px",
                              fontSize: "0.9rem",
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <Badge value={stockStatus} />
                      </td>
                      <td>
                        <button type="button" className="adminInlineStatusToggle" onClick={() => toggleProductStatus(p.id)} aria-label={`Change ${p.name} status from ${p.status}`}>
                          <Badge value={p.status} />
                        </button>
                      </td>
                      <td>
                        <div className="adminTableActionRow">
                          <button
                            className="adminActionBtn edit"
                            onClick={() => onOpenEdit(p)}
                            aria-label="Edit Product"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Banner Management Panel ─────────────────────────────────────────────────
function BannerManagement({
  settings,
  setSettings,
  onOpenAdd,
  onOpenEdit,
}: {
  settings: SharedGymContent;
  setSettings: (val: SharedGymContent | ((prev: SharedGymContent) => SharedGymContent)) => void;
  onOpenAdd: () => void;
  onOpenEdit: (item: Banner) => void;
}) {
  const banners = settings.banners || [];

  const handleDeleteBanner = (index: number) => {
    setSettings({
      ...settings,
      banners: banners.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="adminPage">
      <PanelHeader title="Banner Management" action="Add Banner" onAction={onOpenAdd} />

      <div style={{ padding: "24px" }}>
        {banners.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 24px",
              gap: "16px",
              color: "#71717a",
            }}
          >
            <FaImages style={{ fontSize: "2.5rem", opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: "1rem" }}>No banners configured yet.</p>
            <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
              Add promotional banners to display on the website.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}>
            {banners.map((banner, index) => (
              <div
                key={index}
                style={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {banner.image && (
                  <div style={{ width: "100%", height: "180px", position: "relative" }}>
                    <Image
                      src={banner.image}
                      alt={banner.title || "Banner"}
                      fill
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  </div>
                )}
                <div style={{ padding: "16px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "1rem", fontWeight: 700, color: "#f4f4f5" }}>
                    {banner.title || "Untitled Banner"}
                  </h3>
                  {banner.subtitle && (
                    <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#a1a1aa" }}>
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.link && (
                    <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#3b82f6", wordBreak: "break-all" }}>
                      Link: {banner.link}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button
                      className="adminActionBtn edit"
                      onClick={() => onOpenEdit({ ...banner, index })}
                      aria-label="Edit Banner"
                      style={{ padding: "8px" }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="adminActionBtn delete"
                      onClick={() => handleDeleteBanner(index)}
                      aria-label="Delete Banner"
                      style={{ padding: "8px" }}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
