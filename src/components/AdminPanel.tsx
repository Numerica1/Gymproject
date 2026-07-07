"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  FaBars,
  FaBell,
  FaBlog,
  FaCalendarAlt,
  FaCalendarCheck,
  FaChartLine,
  FaCheckCircle,
  FaClipboardList,
  FaCog,
  FaCreditCard,
  FaDumbbell,
  FaEllipsisV,
  FaGift,
  FaLayerGroup,
  FaPlus,
  FaSearch,
  FaShoppingCart,
  FaStar,
  FaTags,
  FaTimes,
  FaTimesCircle,
  FaTrashAlt,
  FaEdit,
  FaUserShield,
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
  useGymOffers,
  useGymOrders,
  useGymReviews,
  useGymAttendance,
  useGymClasses,
  useGymBookings,
  useGymGallery,
  useGymContactMessages,
  getNextClientId,
  type Trainer,
  type BlogPost,
  type PaymentLog,
  type Product,
  type Offer,
  type OrderLog,
  type Review,
  type AttendanceLog,
  type Booking,
  type ClassSchedule,
  type ContactMessage,
  parseScheduleTable,
  serializeScheduleTable,
  type ScheduleRow,
} from "../data/gymData";
import type { DemoClient } from "../data/clientPortal";
import type { SharedMembershipPlan, SharedGymContent } from "../data/sharedGymContent";
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
  | "blogs"
  | "shop"
  | "orders"
  | "reviews"
  | "bookings"
  | "gallery"
  | "contacts"
  | "settings";

const navItems: { id: AdminSection; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <FaChartLine /> },
  { id: "clients", label: "Clients / Members", icon: <FaUsers /> },
  { id: "trainers", label: "Our Team", icon: <FaUserTie /> },
  { id: "memberships", label: "Memberships", icon: <FaLayerGroup /> },
  { id: "attendance", label: "Attendance", icon: <FaCalendarCheck /> },
  { id: "classes", label: "Programs", icon: <FaDumbbell /> },
  { id: "bookings", label: "Bookings", icon: <FaCalendarAlt /> },
  { id: "payments", label: "Payments", icon: <FaCreditCard /> },
  { id: "offers", label: "Offers / Coupons", icon: <FaGift /> },
  { id: "blogs", label: "Blogs", icon: <FaBlog /> },
  { id: "shop", label: "Shop", icon: <FaShoppingCart /> },
  { id: "orders", label: "Orders", icon: <FaClipboardList /> },
  { id: "reviews", label: "Reviews", icon: <FaStar /> },
  { id: "gallery", label: "Gallery", icon: <FaImages /> },
  { id: "contacts", label: "Contact Messages", icon: <FaEnvelope /> },
  { id: "settings", label: "Settings", icon: <FaCog /> },
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
  const router = useRouter();

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
  const [offers, setOffers] = useGymOffers();
  const [orders, setOrders] = useGymOrders();
  const [reviews, setReviews] = useGymReviews();
  const [attendance, setAttendance] = useGymAttendance();
  const [classes, setClasses] = useGymClasses();
  const [bookings, setBookings] = useGymBookings();
  const [gallery, setGallery] = useGymGallery();
  const [contactMessages, setContactMessages] = useGymContactMessages();

  // Active form overlays
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [activeItem, setActiveItem] = useState<any>(null);

  const activeItemLabel = useMemo(
    () => navItems.find((item) => item.id === active) ?? navItems[0],
    [active]
  );

  const filterItems = <T,>(items: T[]) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(query)
    );
  };

  const filteredClients = useMemo(() => filterItems(clients), [clients, searchQuery]);
  const filteredTrainers = useMemo(() => filterItems(trainers), [trainers, searchQuery]);
  const filteredBlogs = useMemo(() => filterItems(blogs), [blogs, searchQuery]);
  const filteredPayments = useMemo(() => filterItems(payments), [payments, searchQuery]);
  const filteredProducts = useMemo(() => filterItems(products), [products, searchQuery]);
  const filteredOffers = useMemo(() => filterItems(offers), [offers, searchQuery]);
  const filteredOrders = useMemo(() => filterItems(orders), [orders, searchQuery]);
  const filteredReviews = useMemo(() => filterItems(reviews), [reviews, searchQuery]);
  const filteredAttendance = useMemo(() => filterItems(attendance), [attendance, searchQuery]);
  const filteredClasses = useMemo(() => filterItems(classes), [classes, searchQuery]);
  const filteredBookings = useMemo(() => filterItems(bookings), [bookings, searchQuery]);
  const filteredGallery = useMemo(() => filterItems(gallery), [gallery, searchQuery]);
  const filteredContactMessages = useMemo(() => filterItems(contactMessages), [contactMessages, searchQuery]);
  const unreadContactCount = contactMessages.filter((m) => m.status === "New").length;
  const filteredPlans = useMemo(
    () => ({
      ...settings,
      membershipPlans: filterItems(settings.membershipPlans),
    }),
    [settings, searchQuery]
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

  const handleOpenEdit = (item: any) => {
    setModalType("edit");
    setActiveItem(item);
  };

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
          <span>
            <FaDumbbell />
          </span>
          <div>
            <strong>Gym Admin</strong>
            <small>Management System</small>
          </div>
        </div>
        <nav className="adminNav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={active === item.id ? "active" : ""}
              onClick={() => setSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="adminSidebarPromo">
          <img src="/images/strength-training.jpg" alt="Trainer ready for workout" />
          <strong>All-in-one solution</strong>
          <span>Manage members, sales, classes, and reports.</span>
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
              placeholder={`Search ${activeItemLabel.label.toLowerCase()}...`}
            />
          </label>
          <button
            className="adminIconButton"
            aria-label="Contact Messages"
            onClick={() => setActive("contacts")}
            style={{ position: "relative" }}
          >
            <FaBell />
            {unreadContactCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#f05a28",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: "10px",
                  fontWeight: 700,
                  minWidth: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  lineHeight: 1,
                  pointerEvents: "none",
                }}
              >
                {unreadContactCount > 99 ? "99+" : unreadContactCount}
              </span>
            )}
          </button>
          <div className="adminUser">
            <FaUserShield />
            <span>Admin</span>
            <button
              onClick={() => {
                localStorage.removeItem("admin_authenticated");
                window.location.reload();
              }}
              style={{
                background: "transparent",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
                cursor: "pointer",
                marginLeft: "8px",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: "bold",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Log Out"
            >
              <FaSignOutAlt />
              <span style={{ textTransform: "uppercase" }}>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Section */}
        {active === "dashboard" && (
          <Dashboard
            clients={clients}
            attendance={attendance}
            payments={payments}
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
          />
        )}
        {active === "shop" && (
          <OperationsTable
            title="Shop Products"
            headers={["Product", "Category", "Price", "Stock", "Status"]}
            rows={filteredProducts.map((p) => [p.name, p.category, formatCurrency(p.price), p.stock, p.status])}
            items={filteredProducts}
            actionLabel="Add Product"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(p: Product) => setProducts(products.filter((item) => item.name !== p.name))}
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
            headers={["Program Name", "Trainer", "Weekly Times", "Full Schedule", "Capacity"]}
            rows={filteredClasses.map((c) => [
              c.className,
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
        {modalType && (
          <ModalForm
            type={modalType}
            section={active}
            item={activeItem}
            settings={settings}
            trainers={trainers}
            clients={clients}
            onClose={() => setModalType(null)}
            onSubmit={(payload) => {
              if (active === "memberships") {
                let updatedPlans = [];
                if (modalType === "edit") {
                  updatedPlans = settings.membershipPlans.map((p) =>
                    p.key === activeItem.key ? payload : p
                  );
                } else {
                  updatedPlans = [...settings.membershipPlans, payload];
                }
                setSettings({ ...settings, membershipPlans: updatedPlans });
              } else if (active === "clients") {
                if (modalType === "edit") {
                  setClients(clients.map((c) => (c.id === activeItem.id ? payload : c)));
                } else {
                  setClients([...clients, payload]);
                }
              } else if (active === "trainers") {
                if (modalType === "edit") {
                  setTrainers(trainers.map((t) => (t.name === activeItem.name ? payload : t)));
                } else {
                  setTrainers([...trainers, payload]);
                }
              } else if (active === "blogs") {
                if (modalType === "edit") {
                  setBlogs(blogs.map((b) => (b.slug === activeItem.slug ? payload : b)));
                } else {
                  setBlogs([payload, ...blogs]);
                }
              } else if (active === "payments") {
                if (modalType === "edit") {
                  setPayments(payments.map((p) => (p.txnId === activeItem.txnId ? payload : p)));
                } else {
                  setPayments([payload, ...payments]);
                }
              } else if (active === "offers") {
                if (modalType === "edit") {
                  setOffers(offers.map((o) => (o.code === activeItem.code ? payload : o)));
                } else {
                  setOffers([payload, ...offers]);
                }
              } else if (active === "shop") {
                if (modalType === "edit") {
                  setProducts(products.map((p) => (p.name === activeItem.name ? payload : p)));
                } else {
                  setProducts([payload, ...products]);
                }
              } else if (active === "orders") {
                if (modalType === "edit") {
                  setOrders(orders.map((o) => (o.orderId === activeItem.orderId ? payload : o)));
                } else {
                  setOrders([payload, ...orders]);
                }
              } else if (active === "reviews") {
                if (modalType === "edit") {
                  setReviews(reviews.map((r) => (r.customer === activeItem.customer && r.product === activeItem.product && r.date === activeItem.date ? payload : r)));
                } else {
                  setReviews([payload, ...reviews]);
                }
              } else if (active === "attendance") {
                if (modalType === "edit") {
                  setAttendance(attendance.map((a) =>
                    a.member === activeItem.member && a.plan === activeItem.plan && a.time === activeItem.time ? payload : a
                  ));
                } else {
                  setAttendance([payload, ...attendance]);
                }
              } else if (active === "classes") {
                if (modalType === "edit") {
                  setClasses(
                    classes.map((c) =>
                      c.className === activeItem.className &&
                      c.trainer === activeItem.trainer &&
                      c.time === activeItem.time
                        ? payload
                        : c
                    )
                  );
                } else {
                  setClasses([payload, ...classes]);
                }
              } else if (active === "bookings") {
                if (modalType === "edit") {
                  setBookings(
                    bookings.map((b) =>
                      b.bookingId === activeItem.bookingId ? payload : b
                    )
                  );
                } else {
                  setBookings([payload, ...bookings]);
                }
              } else if (active === "gallery") {
                if (payload.image) {
                  setGallery([...gallery, payload.image]);
                }
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
}: {
  clients: DemoClient[];
  attendance: AttendanceLog[];
  payments: PaymentLog[];
}) {
  const router = useRouter();
  const [openStat, setOpenStat] = useState<string | null>(null);
  const totalMembers = clients.length;
  const activeMembers = clients.filter((c) => c.package.status === "Active").length;

  const monthlyRevenue = clients.reduce((acc, c) => {
    if (c.package.status === "Active") {
      return acc + (c.package.price || 0);
    }
    return acc;
  }, 0);

  const todayCheckins = attendance.filter((a) => a.status === "Checked In" || a.status === "Late").length;

  const stats = [
    {
      id: "total-members",
      label: "Total Members",
      value: totalMembers,
      trend: "+12.5%",
      icon: <FaUsers key="icon1" />,
      desc: "Total registered members in the system. Click for a quick breakdown of active vs inactive memberships.",
    },
    {
      id: "active-members",
      label: "Active Members",
      value: activeMembers,
      trend: "+8.2%",
      icon: <FaCheckCircle key="icon2" />,
      desc: "Members with an active membership plan. Use the Members section to view details and contact information.",
    },
    {
      id: "monthly-revenue",
      label: "Monthly Revenue",
      value: `Rs ${monthlyRevenue.toLocaleString()}`,
      trend: "+15.6%",
      icon: <FaWallet key="icon3" />,
      desc: "Total revenue collected from active memberships this month. Amount shown in Rupees.",
    },
    {
      id: "today-checkins",
      label: "Today's Check-ins",
      value: todayCheckins,
      trend: "-4.3%",
      icon: <FaCalendarCheck key="icon4" />,
      desc: "Number of members who have checked in today. Check the Attendance section for timestamps.",
    },
  ];

  return (
    <div className="adminPage">
      <PanelHeader title="Dashboard" />
      <section className="adminStatsGrid">
        {stats.map((s) => (
          <article
            key={s.id}
            className={`adminStatCard ${openStat === s.id ? "open" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => setOpenStat(openStat === s.id ? null : s.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setOpenStat(openStat === s.id ? null : s.id);
              }
            }}
            aria-pressed={openStat === s.id}
          >
            <span>{s.icon}</span>
            <div>
              <p>{s.label}</p>
              <strong>{String(s.value)}</strong>
              <small className={String(s.trend).startsWith("-") ? "down" : ""}>{String(s.trend)} vs last month</small>
            </div>
          </article>
        ))}
      </section>

      <section className="adminDashboardGrid">
        <article className="adminWidget wide">
          <div className="adminWidgetTitle">
            <h2>Member Growth</h2>
            <span>2024</span>
          </div>
          <div className="adminLineChart">
            {[26, 38, 56, 66, 48, 52, 61, 44, 59, 53, 64, 78].map((point, index) => (
              <i key={index} style={{ height: `${point}%` }} />
            ))}
          </div>
        </article>
        <article className="adminWidget">
          <div className="adminWidgetTitle">
            <h2>Membership Expiring Soon</h2>
            <span>4 due</span>
          </div>
          <div className="adminList">
            {clients.slice(0, 4).map((client, index) => (
              <div key={client.id}>
                <span className="adminAvatar">{client.name.charAt(0)}</span>
                <strong>{client.name}</strong>
                <em>{3 + index} days left</em>
              </div>
            ))}
          </div>
        </article>
        <article className="adminWidget">
          <div className="adminWidgetTitle">
            <h2>Recent Payments</h2>
            <span>Live</span>
          </div>
          <div className="adminTableWrap">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 4).map((p) => (
                  <tr key={p.txnId}>
                    <td>{p.member}</td>
                    <td>{p.amount}</td>
                    <td><Badge value={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="adminWidget">
          <div className="adminWidgetTitle">
            <h2>Recent Check-ins</h2>
            <span>Today</span>
          </div>
          <div className="adminTableWrap">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.slice(0, 4).map((a, index) => (
                  <tr key={`${a.member}-${index}`}>
                    <td>{a.member}</td>
                    <td>{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}

function Clients({ clients, setClients, onOpenAdd, onOpenEdit, onDelete }: {
  clients: DemoClient[];
  setClients: any;
  settings: SharedGymContent;
  trainers: Trainer[];
  onOpenAdd: () => void;
  onOpenEdit: (item: DemoClient) => void;
  onDelete: (id: string) => void;
}) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const toggleStatus = (clientId: string) => {
    setClients((prevClients: DemoClient[]) =>
      prevClients.map((c) => {
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
  setTrainers: any;
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
            <img src={t.image || "/images/fitness-logo.jpg"} alt={t.name} />
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
            <img src={photo || "/images/fitness-logo.jpg"} alt={`Gallery ${index + 1}`} />
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
  setSettings: any;
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
  setBlogs: any;
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
          <img
            src={logo}
            alt="Logo preview"
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

function OperationsTable<T>({ title, headers, rows, items, actionLabel, onAdd, onEdit, onDelete, onApprove }: {
  title: string;
  headers: string[];
  rows: string[][];
  items?: T[];
  actionLabel?: string;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onApprove?: (item: T) => void;
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
                        <Badge value={cell} />
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                  {showActions && originalItem && (
                    <td>
                      <div className="adminTableActionRow">
                        {onApprove && !isPending && (originalItem as any).status === "Pending" && (
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

// Modal Form overlay component

function ModalForm({
  type,
  section,
  item,
  settings,
  trainers,
  clients = [],
  onClose,
  onSubmit,
}: {
  type: "add" | "edit";
  section: AdminSection;
  item: any;
  settings: SharedGymContent;
  trainers: Trainer[];
  clients?: any[];
  onClose: () => void;
  onSubmit: (payload: any) => void;
}) {
  const [fields, setFields] = useState<any>(() => {
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
    if (section === "shop") {
      return { name: "", category: "Supplements", price: "Rs 1,999", stock: "20", status: "Active" };
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
    return {};
  });

  const [isCompressing, setIsCompressing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setFields((prev: any) => ({ ...prev, [name]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
      return;
    }

    setFields((prev: any) => {
      const next = { ...prev, [name]: isCheckbox ? checked : value };
      if (name === "className" && type === "text" && value) {
        const matchedProgram = programs.find((p: any) => p.title === value);
        if (matchedProgram) {
          next.time = matchedProgram.schedule;
        }
      }
      return next;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let payload = { ...fields };

    if (section === "memberships") {
      payload.price = Number(payload.price);
      payload.sessionsTotal = Number(payload.sessionsTotal);
      payload.features = typeof payload.features === "string"
        ? payload.features.split(",").map((f: any) => f.trim()).filter(Boolean)
        : payload.features;
      payload.upcomingClasses = typeof payload.upcomingClasses === "string"
        ? payload.upcomingClasses.split(",").map((c: any) => c.trim()).filter(Boolean)
        : payload.upcomingClasses;
      if (!payload.key) {
        payload.key = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }
    }

    if (section === "clients") {
      const pKey = payload.packageKey || (item && item.package.key) || "premium";
      const activePlan = settings.membershipPlans.find((p) => p.key === pKey) || settings.membershipPlans[0];
      payload.package = {
        key: pKey,
        name: activePlan.name,
        price: activePlan.price,
        access: activePlan.access,
        status: payload.status,
        startedOn: payload.startedOn,
        renewsOn: payload.renewsOn,
        paymentMethod: payload.paymentMethod,
        sessionsUsed: Number(payload.sessionsUsed),
        sessionsTotal: Number(payload.sessionsTotal),
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
        ? payload.content.split("\n\n").map((p: any) => p.trim()).filter(Boolean)
        : payload.content;
      if (!payload.slug) {
        payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      payload.readTime = `${Math.max(1, Math.round((payload.content.join ? payload.content.join(" ").split(/\s+/).length : 200) / 200))} Min Read`;
    }

    if ((section === "gallery" || section === "classes") && payload.image) {
      setIsCompressing(true);
      try {
        // Upload to Supabase Storage instead of storing base64
        const formData = new FormData();
        formData.append("file", payload.image);
        formData.append("bucket", "gym-images");
        
        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          payload.image = url;
        } else if (section !== "gallery") {
          // Fallback to compression if upload fails
          payload.image = await compressImage(payload.image);
        }
      } catch {
        console.error("Image upload failed, using compressed base64");
        if (section !== "gallery") {
          payload.image = await compressImage(payload.image);
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
                    value={fields.packageKey || (item && item.package.key) || "premium"}
                    onChange={handleChange}
                  >
                    {settings.membershipPlans.map((p) => (
                      <option key={p.key} value={p.key}>{p.name} ({formatCurrency(p.price)}/mo)</option>
                    ))}
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Account Status</label>
                  <select name="status" value={fields.status || (item && item.package.status) || "Active"} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Assigned Personal Trainer</label>
                  <select name="trainer" value={fields.trainer || (item && item.package.trainer) || "Mike Johnson"} onChange={handleChange}>
                    <option value="Front Desk Support">Front Desk Support</option>
                    {trainers.map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Sessions Used</label>
                  <input type="number" name="sessionsUsed" value={fields.sessionsUsed !== undefined ? fields.sessionsUsed : (item ? item.package.sessionsUsed : 0)} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Sessions Total</label>
                  <input type="number" name="sessionsTotal" value={fields.sessionsTotal !== undefined ? fields.sessionsTotal : (item ? item.package.sessionsTotal : 24)} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Payment Method</label>
                  <input name="paymentMethod" value={fields.paymentMethod || (item && item.package.paymentMethod) || "Card"} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Started On</label>
                  <input name="startedOn" value={fields.startedOn || (item && item.package.startedOn) || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Renews On</label>
                  <input name="renewsOn" value={fields.renewsOn || (item && item.package.renewsOn) || ""} onChange={handleChange} required />
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
                      <img
                        src={fields.image}
                        alt="Trainer preview"
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
                    <img
                      src={fields.image}
                      alt="Blog preview"
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
                  <select name="status" value={fields.status || "Paid"} onChange={handleChange}>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
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
                    onChange={(e) => handleChange({ ...e, target: { ...e.target, name: "code", value: e.target.value.toUpperCase() } } as any)}
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
                  <select name="status" value={fields.status || "Active"} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                  <label>Category</label>
                  <input name="category" value={fields.category || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Price</label>
                  <input name="price" value={fields.price || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Stock Quantity</label>
                  <input name="stock" value={fields.stock || ""} onChange={handleChange} required />
                </div>
                <div className="adminFormGroup">
                  <label>Product Image</label>
                  {fields.image && (
                    <img
                      src={fields.image}
                      alt="Product preview"
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
                  <select name="status" value={fields.status || "Active"} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                  <select name="payment" value={fields.payment || "Paid"} onChange={handleChange}>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="adminFormGroup">
                  <label>Order Fulfillment Status</label>
                  <select name="status" value={fields.status || "Processing"} onChange={handleChange}>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
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
                  <select name="status" value={fields.status || "Checked In"} onChange={handleChange}>
                    <option value="Checked In">Checked In</option>
                    <option value="Checked Out">Checked Out</option>
                    <option value="Late">Late</option>
                  </select>
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
                    onChange={handleChange}
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
                    <img
                      src={fields.image}
                      alt="Program preview"
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
                                    setFields((prev: any) => ({ ...prev, schedule: serializeScheduleTable(updated) }));
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
                                    setFields((prev: any) => ({ ...prev, schedule: serializeScheduleTable(updated) }));
                                  }}
                                />
                              </td>
                              <td style={{ padding: "6px", textAlign: "center" }}>
                                <button
                                  type="button"
                                  style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", padding: "6px 10px", cursor: "pointer", fontSize: "0.85rem" }}
                                  onClick={() => {
                                    const updated = rows.filter((_, i) => i !== idx);
                                    setFields((prev: any) => ({ ...prev, schedule: serializeScheduleTable(updated) }));
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
                      setFields((prev: any) => ({ ...prev, schedule: serializeScheduleTable(updated) }));
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
                  <select name="status" value={fields.status || "Approved"} onChange={handleChange}>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </>
            )}
            {section === "gallery" && (
              <>
                <div className="adminFormGroup">
                  <label>Gallery Photo</label>
                  {fields.image && (
                    <img
                      src={fields.image}
                      alt="Gallery preview"
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
          </div>
          <div className="adminModalFooter" style={{ padding: "16px 24px", borderTop: "1px solid #27272a", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" className="adminBtnCancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="adminBtnSubmit" disabled={isCompressing}>
              {isCompressing ? "Processing..." : (type === "edit" ? "Save Changes" : (section === "gallery" ? "Upload Photo" : "Create Item"))}
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
