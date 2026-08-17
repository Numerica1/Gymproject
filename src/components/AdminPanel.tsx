"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
  FaBox,
  FaTruck,
  FaPhone,
  FaMapMarkerAlt,
  FaEye,
  FaChevronDown,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
} from "react-icons/fa";
import {
  useGymSettings,
  useGymClients,
  useGymTrainers,
  useGymBlogs,
  useGymBlogCategories,
  useGymPayments,
  useGymProducts,
  useGymBrands,
  useGymOffers,
  useGymOrders,
  useGymReviews,
  useGymAttendance,
  useGymPrograms,
  useGymBookings,
  useGymGallery,
  useGymContactMessages,
  useGymShopCategories,
  useGymShopBuyers,
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
  type ShopBuyer,
  parseScheduleTable,
  serializeScheduleTable,
  useHomePageContent,
  useAboutPageContent,
  useWhyChooseUsContent,
  useContactCtaContent,
  type HomePageContent,
  type AboutPageContent,
  type WhyChooseUsContent,
  type ContactCtaContent,
  useGymTrash,
  softDeleteItem,
  restoreItem,
  permanentDeleteItem,
  type TrashItem,
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
  | "programs"
  | "classes"
  | "payments"
  | "offers"
  | "brands"
  | "blogs"
  | "shop"
  | "shopCategories"
  | "buyers"
  | "orders"
  | "reviews"
  | "bookings"
  | "gallery"
  | "contacts"
  | "settings"
  | "reports"
  | "stock"
  | "banners"
  | "announcements"
  | "home"
  | "about"
  | "whyChooseUs"
  | "contactCta"
  | "trash";

// navGroups drives sidebar rendering; navItems kept for reference only

const navGroups = [
  {
    title: "MAIN",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <FaChartLine /> },
      { id: "clients", label: "Members", icon: <FaUsers /> },
      { id: "trainers", label: "Trainers", icon: <FaUserTie /> },
      { id: "attendance", label: "Attendance", icon: <FaCalendarCheck /> },
      { id: "programs", label: "Programs", icon: <FaDumbbell /> },
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
      { id: "buyers", label: "Buyers", icon: <FaUsers /> },
      { id: "banners", label: "Banners", icon: <FaImages /> },
      { id: "orders", label: "Orders", icon: <FaClipboardList /> },
      { id: "stock", label: "Stock Management", icon: <FaClipboardList /> },
    ]
  },
  {
    title: "CONTENT MANAGEMENT",
    items: [
      { id: "blogs", label: "Blog Posts", icon: <FaEdit /> },
      { id: "home", label: "Home Page", icon: <FaImages /> },
      { id: "about", label: "About Us", icon: <FaImages /> },
      { id: "whyChooseUs", label: "Why Choose Us", icon: <FaDumbbell /> },
      { id: "contactCta", label: "Contact Us", icon: <FaPhone /> },
      { id: "announcements", label: "Announcements", icon: <FaEnvelope /> },
      { id: "gallery", label: "Gallery", icon: <FaImages /> },
      { id: "trash", label: "Trash", icon: <FaTrash /> },
      { id: "settings", label: "Settings", icon: <FaCog /> },
    ]
  }
];

function Badge({ value, className }: { value: string; className?: string }) {
  const tone = ["Active", "Paid", "Published", "Delivered", "Completed", "Approved", "Checked In"].includes(value)
    ? "good"
    : ["Inactive", "Draft", "Expired", "Cancelled", "Late"].includes(value)
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
  const [openNavGroups, setOpenNavGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((group) => [group.title, true]))
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Load dynamic data hooks
  const [settings, setSettings] = useGymSettings();
  const [clients, setClients] = useGymClients();
  const [trainers, setTrainers] = useGymTrainers();
  const [blogs, setBlogs] = useGymBlogs();
  const [blogCategories, setBlogCategories] = useGymBlogCategories();
  const [payments, setPayments] = useGymPayments();
  const [products, setProducts] = useGymProducts();
  const [brands, setBrands] = useGymBrands();
  const [offers, setOffers] = useGymOffers();
  const [orders, setOrders] = useGymOrders();
  const [reviews, setReviews] = useGymReviews();
  const [attendance, setAttendance] = useGymAttendance();
  const [programs, setPrograms] = useGymPrograms();
  const [bookings, setBookings] = useGymBookings();
  const [gallery, setGallery] = useGymGallery();
  const [contactMessages, setContactMessages] = useGymContactMessages();
  const [shopCategories, setShopCategories] = useGymShopCategories();
  const [shopBuyers] = useGymShopBuyers();
  const [homePage, setHomePage] = useHomePageContent();
  const [aboutPage, setAboutPage] = useAboutPageContent();
  const [whyChooseUs, setWhyChooseUs] = useWhyChooseUsContent();
  const [contactCta, setContactCta] = useContactCtaContent();
  const { trash, loading: trashLoading, refresh: refreshTrash, setTrash } = useGymTrash();

  // Toast System
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error"; undoAction?: () => void }[]>([]);
  const addToast = useCallback((message: string, type: "success" | "error" = "success", undoAction?: () => void) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type, undoAction }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const [softDeleteTarget, setSoftDeleteTarget] = useState<{
    id: string;
    name: string;
    tableName: string;
    moduleLabel: string;
    onConfirmed: () => void;
  } | null>(null);

  const handleSoftDelete = useCallback((
    item: unknown,
    tableName: string,
    moduleLabel: string,
    idField: string,
    displayField: string,
    onDeleteLocal: () => void
  ) => {
    // Some items might have direct id or idField
    const rec = item as Record<string, unknown>;
    const id = String(rec[idField] || rec.id || "");
    const displayName = String(rec[displayField] || rec.name || rec.title || rec.label || rec.className || rec.code || "Item");

    setSoftDeleteTarget({
      id: id || "",
      name: displayName,
      tableName,
      moduleLabel,
      onConfirmed: async () => {
        onDeleteLocal();
        addToast(`Moved ${moduleLabel} "${displayName}" to Trash.`, "success", async () => {
          if (id) {
            await restoreItem(tableName, id);
            refreshTrash();
            window.location.reload();
          }
        });
        if (id) {
          await softDeleteItem(tableName, id);
          refreshTrash();
        }
      }
    });
  }, [addToast, refreshTrash]);

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
  const filteredPrograms = useMemo(() => filterItems(programs), [programs, filterItems]);
  const filteredBookings = useMemo(() => filterItems(bookings), [bookings, filterItems]);
  const filteredGallery = useMemo(() => filterItems(gallery), [gallery, filterItems]);
  const filteredContactMessages = useMemo(() => filterItems(contactMessages), [contactMessages, filterItems]);
  const filteredShopCategories = useMemo(() => filterItems(shopCategories), [shopCategories, filterItems]);
  const filteredShopBuyers = useMemo(() => filterItems(shopBuyers), [shopBuyers, filterItems]);
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
          {navGroups.map((group, gIdx) => {
            const isCollapsible = group.title !== "MAIN";
            const isOpen = !isCollapsible || openNavGroups[group.title];

            return (
              <div key={gIdx} className="adminNavSection">
                {isCollapsible ? (
                  <button
                    type="button"
                    className="adminNavHeader"
                    aria-expanded={isOpen}
                    aria-controls={`admin-nav-group-${gIdx}`}
                    onClick={() => setOpenNavGroups((groups) => ({ ...groups, [group.title]: !groups[group.title] }))}
                  >
                    <span>{group.title}</span>
                    <FaChevronDown aria-hidden="true" />
                  </button>
                ) : (
                  <span className="adminNavHeader adminNavHeaderStatic">{group.title}</span>
                )}
              {isOpen && (
                <nav id={`admin-nav-group-${gIdx}`} className="adminNav" aria-label={`${group.title} navigation`}>
                  {group.items.map((item) => {
                    const isTrash = item.id === "trash";
                    const badgeCount = isTrash ? trash.length : 0;
                    return (
                      <button
                        key={item.id}
                        className={active === item.id ? "active" : ""}
                        onClick={() => setSection(item.id as AdminSection)}
                        style={{ position: "relative" }}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {isTrash && badgeCount > 0 && (
                          <span className="adminNotificationBadge" style={{ right: "12px", top: "50%", transform: "translateY(-50%)", background: "#fcd34d", color: "#18181b", fontWeight: "bold" }}>
                            {badgeCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              )}
              </div>
            );
          })}
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
            onDelete={(client) => handleSoftDelete(client, "clients", "Member", "id", "name", () => {
              setClients(clients.filter((c) => c.id !== client.id));
            })}
          />
        )}

        {/* Trainers Section */}
        {active === "trainers" && (
          <Trainers
            trainers={filteredTrainers}
            setTrainers={setTrainers}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={(t: Trainer) => handleSoftDelete(t, "trainers", "Trainer", "id", "name", () => {
              setTrainers(trainers.filter((item) => item.name !== t.name));
            })}
          />
        )}

        {/* Memberships Section */}
        {active === "memberships" && (
          <Memberships
            settings={filteredPlans}
            setSettings={setSettings}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={(plan: SharedMembershipPlan) => handleSoftDelete(plan, "memberships", "Membership Plan", "id", "name", () => {
              setSettings({
                ...settings,
                membershipPlans: settings.membershipPlans.filter((p) => p.key !== plan.key),
              });
            })}
          />
        )}

        {/* Blogs Section */}
        {active === "blogs" && (
          <Blogs
            blogs={filteredBlogs}
            categories={blogCategories}
            setCategories={setBlogCategories}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={(b: BlogPost) => handleSoftDelete(b, "blogs", "Blog Post", "id", "title", () => {
              setBlogs(blogs.filter((item) => item.slug !== b.slug));
            })}
          />
        )}

        {/* Settings Section */}
        {active === "settings" && (
          <Settings settings={settings} setSettings={setSettings} />
        )}

        {active === "reports" && (
          <Reports
            gymName={settings.gymName || "Fitness Gym"}
            payments={payments}
            orders={orders}
          />
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
            onDelete={(o: Offer) => handleSoftDelete(o, "offers", "Coupon Offer", "id", "name", () => {
              setOffers(offers.filter((item) => item.code !== o.code));
            })}
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
            onDelete={(b: Brand) => handleSoftDelete(b, "brands", "Brand", "id", "name", () => {
              setBrands(brands.filter((item) => item.key !== b.key));
              setProducts(products.map((product) =>
                product.brandKey === b.key
                  ? { ...product, brandKey: "", brandName: "" }
                  : product
              ));
            })}
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
            onDelete={(p: Product) => handleSoftDelete(p, "products", "Product", "id", "name", () => {
              setProducts(products.filter((item) => item.id !== p.id));
            })}
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
            onDelete={(c: ShopCategory) => handleSoftDelete(c, "shop_categories", "Category", "id", "label", () => {
              setShopCategories(shopCategories.filter((item) => item.label !== c.label));
            })}
          />
        )}
        {active === "buyers" && (
          <ShopBuyersManagement
            buyers={filteredShopBuyers}
            clients={clients}
          />
        )}
        {active === "orders" && (
          <OrdersManagementTable
            orders={filteredOrders}
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(o: OrderLog) => handleSoftDelete(o, "orders", "Order", "id", "orderId", () => {
              setOrders(orders.filter((item) => item.orderId !== o.orderId));
            })}
            onToggleStatus={(o: OrderLog) => {
              const statusOrder = ["Processing", "Shipped", "Delivered"];
              const currentIdx = statusOrder.indexOf(o.status);
              const nextStatus = currentIdx >= 0 ? statusOrder[(currentIdx + 1) % statusOrder.length] : "Processing";
              setOrders(orders.map((item) => (item.orderId === o.orderId ? { ...item, status: nextStatus } : item)));
            }}
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
            onDelete={(r: Review) => handleSoftDelete(r, "reviews", "Review", "id", "customer", () => {
              setReviews(reviews.filter((item) => !(item.customer === r.customer && item.product === r.product && item.date === r.date)));
            })}
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
        {(active === "programs" || active === "classes") && (
          <OperationsTable
            title="Programs"
            headers={["Program Name", "Tag", "Trainer", "Weekly Times", "Full Schedule", "Capacity"]}
            rows={filteredPrograms.map((c) => [
              c.className,
              c.tag || "—",
              c.trainer,
              c.time,
              parseScheduleTable(c.schedule)
                .map((row) => `${row.day}: ${row.workout}`)
                .join(" | ") || "Not set",
              c.capacity,
            ])}
            items={filteredPrograms}
            actionLabel="Add Program"
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={(c: ClassSchedule) => handleSoftDelete(c, "programs", "Program", "id", "className", () => {
              setPrograms(
                programs.filter(
                  (item) =>
                    !(
                      (item.id && c.id && item.id === c.id) ||
                      (item.className === c.className &&
                      item.trainer === c.trainer &&
                      item.time === c.time)
                    )
                )
              );
            })}
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

        {/* Home Page Manager */}
        {active === "home" && (
          <HomePageManager content={homePage} setContent={setHomePage} />
        )}

        {/* About Us Page Manager */}
        {active === "about" && (
          <AboutPageManager content={aboutPage} setContent={setAboutPage} />
        )}

        {active === "whyChooseUs" && (
          <WhyChooseUsManager content={whyChooseUs} setContent={setWhyChooseUs} />
        )}

        {active === "contactCta" && (
          <ContactCtaManager content={contactCta} setContent={setContactCta} settings={settings} setSettings={setSettings} />
        )}

        {active === "trash" && (
          <TrashSection
            trash={trash}
            loading={trashLoading}
            refresh={refreshTrash}
            setTrash={setTrash}
            addToast={addToast}
          />
        )}

        {softDeleteTarget && (
          <SoftDeleteModal
            target={softDeleteTarget}
            onClose={() => setSoftDeleteTarget(null)}
          />
        )}

        <ToastStack toasts={toasts} setToasts={setToasts} />

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
            blogCategories={blogCategories}
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
              } else if (active === "programs" || active === "classes") {
                const programPayload = payload as unknown as ClassSchedule;
                if (modalType === "edit") {
                  setPrograms(
                    programs.map((c) =>
                      (c.id && currentItem.id && c.id === currentItem.id) ||
                      (c.className === currentItem.className &&
                      c.trainer === currentItem.trainer &&
                      c.time === currentItem.time)
                        ? { ...programPayload, id: currentItem.id || c.id }
                        : c
                    )
                  );
                } else {
                  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                  setPrograms([{ ...programPayload, id: tempId }, ...programs]);
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

function Reports({ gymName, payments, orders }: {
  gymName: string;
  payments: PaymentLog[];
  orders: OrderLog[];
}) {
  const [filters, setFilters] = useState({ start: "2025-05-12", end: "2025-06-12", type: "All reports", status: "All statuses" });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [generatedAt, setGeneratedAt] = useState("");
  const dateLabel = (start: string, end: string) => {
    const format = (value: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
    return `${format(start)} - ${format(end)}`;
  };
  const resetFilters = () => {
    const today = new Date();
    const toDateInputValue = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const defaults = {
      start: `${today.getFullYear()}-01-01`,
      end: toDateInputValue(today),
      type: "All reports",
      status: "All statuses",
    };
    setFilters(defaults);
    setAppliedFilters(defaults);
  };
  const printReport = () => {
    setGeneratedAt(new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }));
    window.setTimeout(() => window.print(), 0);
  };

  const parseDate = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const inDateRange = (value: string) => {
    const date = parseDate(value);
    return !date || (date >= new Date(`${appliedFilters.start}T00:00:00`) && date <= new Date(`${appliedFilters.end}T23:59:59`));
  };
  const matchesStatus = (value?: string) => appliedFilters.status === "All statuses" || value?.toLowerCase() === appliedFilters.status.toLowerCase() || (appliedFilters.status === "Completed" && /paid|complete/i.test(value || ""));
  const parseAmount = (value: string) => Number(value.replace(/[^\d.]/g, "")) || 0;
  const filteredPayments = payments.filter((payment) => inDateRange(payment.date) && matchesStatus(payment.status));
  const filteredOrders = orders.filter((order) => inDateRange(order.date) && matchesStatus(order.status));
  const reportRevenue = filteredPayments.reduce((sum, payment) => sum + parseAmount(payment.amount), 0) + filteredOrders.reduce((sum, order) => sum + parseAmount(order.total), 0);
  const allTransactions = [
    ...filteredPayments.map((payment) => ({ date: payment.date, customer: payment.member, type: "Membership", amount: payment.amount, quantity: 1, method: payment.paymentMethod || payment.method || "—", status: /paid|complete/i.test(payment.status) ? "Completed" : payment.status })),
    ...filteredOrders.map((order) => ({ date: order.date, customer: order.customer, type: "Product Sale", amount: order.total, quantity: order.cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 1, method: order.paymentMethod || order.payment || "—", status: /paid|complete/i.test(order.status) ? "Completed" : order.status })),
  ].sort((first, second) => (parseDate(second.date)?.getTime() || 0) - (parseDate(first.date)?.getTime() || 0));
  const transactions = allTransactions.slice(0, 8);
  const metrics = [
    { label: "Total Sales", value: allTransactions.length.toLocaleString(), note: "Transactions in selected period", icon: <FaShoppingCart />, tone: "members" },
    { label: "Total Revenue", value: formatCurrency(reportRevenue), note: "Payments and shop orders", icon: <FaWallet />, tone: "revenue" },
    { label: "Total Orders", value: filteredOrders.length.toLocaleString(), note: "Shop orders in selected period", icon: <FaClipboardList />, tone: "bookings" },
  ];
  const monthKey = (value: string) => {
    const date = parseDate(value);
    return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : null;
  };
  const monthLabel = (key: string) => new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(`${key}-01T00:00:00`));
  const relevantDates = [...filteredPayments.map((payment) => payment.date), ...filteredOrders.map((order) => order.date)].map(monthKey).filter((key): key is string => Boolean(key));
  const trendMonths = [...new Set(relevantDates)].sort().slice(-6);
  const revenueTrend = trendMonths.map((month) => [month, filteredPayments.filter((payment) => monthKey(payment.date) === month).reduce((sum, payment) => sum + parseAmount(payment.amount), 0) + filteredOrders.filter((order) => monthKey(order.date) === month).reduce((sum, order) => sum + parseAmount(order.total), 0)] as const);
  const maxRevenue = Math.max(...revenueTrend.map(([, amount]) => amount), 1);

  return (
    <div className="adminPage reportsPage">
      <div className="reportsPrintMasthead">
        <strong>{gymName}</strong>
        <span>Gym Performance Report</span>
      </div>
      <div className="reportsHeader">
        <div>
          <h1>Reports</h1>
          <p>View your gym&apos;s sales and revenue overview</p>
        </div>
        <div className="reportsActions adminNoPrint">
          <button type="button" className="reportsSecondaryButton reportsExportButton" onClick={() => window.alert("PDF export can be connected here when a PDF service is available.")}><FaFilePdf /> Export PDF</button>
          <button type="button" className="reportsSecondaryButton reportsExportButton" onClick={() => window.alert("Excel export can be connected here when an export service is available.")}><FaFileExcel /> Export Excel</button>
        </div>
      </div>

      <section className="reportsFilters adminNoPrint" aria-label="Report filters">
        <div className="reportsDatePicker"><FaCalendarAlt /><input aria-label="Start date" type="date" value={filters.start} onChange={(event) => setFilters({ ...filters, start: event.target.value })} /><span>–</span><input aria-label="End date" type="date" value={filters.end} onChange={(event) => setFilters({ ...filters, end: event.target.value })} /></div>
        <div className="reportsFilterButtons"><button type="button" className="adminPrimaryButton" onClick={() => setAppliedFilters(filters)}>Filter</button><button type="button" className="reportsResetButton" onClick={resetFilters}>Reset</button></div>
      </section>

      <div className="reportsPrintDetails">
        <span><b>Date range:</b> {dateLabel(appliedFilters.start, appliedFilters.end)}</span>
        <span><b>Filters:</b> {appliedFilters.type} · {appliedFilters.status}</span>
        <span><b>Generated:</b> {generatedAt || "Ready to print"}</span>
      </div>

      <section className="reportsMetrics">
        {metrics.map((metric) => <article key={metric.label} className={`reportsMetric reportsMetric-${metric.tone}`}><span className="reportsMetricIcon">{metric.icon}</span><div><p>{metric.label}</p><strong>{metric.value}</strong><small>{metric.note}</small></div></article>)}
      </section>

      <section className="reportsCharts">
        <article className="adminWidget reportsChartCard reportsGrowthChart">
          <div className="adminWidgetTitle"><div><h2>Revenue Overview</h2><span>NPR</span></div></div>
          {revenueTrend.length ? <div className="reportsLineChart" aria-label="Revenue overview chart"><svg viewBox="0 0 600 220" role="img"><path d="M20 180 H580 M20 125 H580 M20 70 H580 M20 15 H580" className="reportsGridLine" /><polyline points={revenueTrend.map(([, amount], index) => `${30 + (trendMonths.length > 1 ? (540 * index) / (trendMonths.length - 1) : 270)},${180 - (amount / maxRevenue) * 140}`).join(" ")} className="reportsLine" />{revenueTrend.map(([, amount], index) => <circle key={trendMonths[index]} cx={30 + (trendMonths.length > 1 ? (540 * index) / (trendMonths.length - 1) : 270)} cy={180 - (amount / maxRevenue) * 140} r="5" />)}</svg><div className="reportsChartLabels">{revenueTrend.map(([month]) => <span key={month}>{monthLabel(month)}</span>)}</div></div> : <p className="reportsEmpty">No revenue data for the selected period.</p>}
        </article>
        <article className="adminWidget reportsChartCard">
          <div className="adminWidgetTitle"><div><h2>Sales Overview</h2><span>Transactions by month</span></div></div>
          {revenueTrend.length ? <div className="reportsBarChart" aria-label="Sales overview bar chart">{trendMonths.map((month) => { const sales = transactions.filter((transaction) => monthKey(transaction.date) === month).length; const maxSales = Math.max(...trendMonths.map((currentMonth) => transactions.filter((transaction) => monthKey(transaction.date) === currentMonth).length), 1); return <div key={month}><i style={{ height: `${Math.max((sales / maxSales) * 100, 2)}%` }} /><span>{monthLabel(month)}</span></div>; })}</div> : <p className="reportsEmpty">No sales data for the selected period.</p>}
        </article>
      </section>

      <section className="reportsLowerGrid">
        <article className="adminWidget reportsTransactions"><div className="adminWidgetTitle"><div><h2>Sales Summary</h2></div><button type="button" className="adminPrimaryButton reportsPrintButton adminNoPrint" onClick={printReport}><FaPrint /> Print Report</button></div><div className="adminTableWrap"><table className="adminTable"><thead><tr>{["Date", "Description", "Type", "Sales (Qty)", "Revenue (NPR)", "Payment Method", "Status"].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{transactions.length ? <>{transactions.map((row) => <tr key={row.date + row.customer + row.type}><td>{row.date}</td><td>{row.customer}</td><td>{row.type}</td><td>{row.quantity}</td><td>{row.amount}</td><td>{row.method}</td><td><span className={`adminBadge ${/complete|paid/i.test(row.status) ? "good" : /pending/i.test(row.status) ? "warn" : "bad"}`}>{row.status}</span></td></tr>)}<tr className="reportsTotalRow"><td colSpan={3}>Total</td><td>{transactions.reduce((sum, row) => sum + row.quantity, 0)}</td><td>{formatCurrency(reportRevenue)}</td><td colSpan={2} /></tr></> : <tr><td colSpan={7} className="reportsTableEmpty">No transactions match the selected filters.</td></tr>}</tbody></table></div></article>
      </section>
    </div>
  );
}

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
  onDelete: (client: DemoClient) => void;
}) {
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
              <tr key={c.id}>
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
                    <button className="adminActionBtn edit" onClick={() => onOpenEdit(c)} aria-label="Edit Member"><FaEdit /></button>
                    <button className="adminActionBtn delete" onClick={() => onDelete(c)} aria-label="Delete Member"><FaTrashAlt /></button>
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
  onDelete: (trainer: Trainer) => void;
}) {
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
              <button className="adminActionBtn edit" onClick={() => onOpenEdit(t)} aria-label="Edit Trainer"><FaEdit /></button>
              <button className="adminActionBtn delete" onClick={() => onDelete(t)} aria-label="Delete Trainer"><FaTrashAlt /></button>
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
  onDelete: (plan: SharedMembershipPlan) => void;
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
                onClick={() => onDelete(plan)}
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
  categories,
  setCategories,
  onOpenAdd,
  onOpenEdit,
  onDelete,
}: {
  blogs: BlogPost[];
  categories: string[];
  setCategories: (val: string[]) => void;
  onOpenAdd: () => void;
  onOpenEdit: (item: BlogPost) => void;
  onDelete: (blog: BlogPost) => void;
}) {
  const [newCategory, setNewCategory] = useState("");
  const addCategory = () => {
    const category = newCategory.trim();
    if (!category || categories.some((item) => item.toLowerCase() === category.toLowerCase())) return;
    setCategories([...categories, category]);
    setNewCategory("");
  };

  return (
    <div className="adminPage">
      <PanelHeader title="Blog Posts" action="Write New Post" onAction={onOpenAdd} />

      {/* Stats bar */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { label: "Total Posts", value: blogs.length },
          { label: "Categories", value: new Set(blogs.map(b => b.category)).size },
          { label: "Authors", value: new Set(blogs.map(b => b.author)).size },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)",
            borderRadius: "10px", padding: "14px 22px", minWidth: "130px",
          }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fbbf24" }}>{stat.value}</div>
            <div style={{ fontSize: "0.78rem", color: "#a1a1aa", marginTop: "2px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "24px", padding: "18px", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "10px", background: "rgba(251,191,36,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "12px" }}>
          <div><h3 style={{ margin: "0 0 4px", color: "#f4f4f5", fontSize: "0.95rem", textTransform: "none" }}>Client blog categories</h3><p style={{ margin: 0, color: "#a1a1aa", fontSize: "0.78rem" }}>These categories appear as filters on the client blog and are available when creating a post.</p></div>
          <div style={{ display: "flex", gap: "8px" }}><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCategory(); } }} placeholder="Add category" style={{ width: "150px", padding: "8px 10px", border: "1px solid #3f3f46", borderRadius: "6px", color: "#f4f4f5", background: "#09090b" }} /><button type="button" className="adminPrimaryButton" onClick={addCategory} style={{ padding: "8px 12px" }}><FaPlus /> Add</button></div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{categories.map((category) => <span key={category} style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "6px 9px", borderRadius: "999px", color: "#fcd34d", background: "rgba(251,191,36,0.1)", fontSize: "0.78rem" }}>{category}<button type="button" onClick={() => setCategories(categories.filter((item) => item !== category))} aria-label={`Remove ${category} category`} title="Remove category" style={{ border: 0, padding: 0, color: "#fcd34d", background: "transparent", cursor: "pointer", lineHeight: 1 }}><FaTimes /></button></span>)}</div>
      </div>

      {blogs.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "64px 24px",
          background: "rgba(255,255,255,0.02)", borderRadius: "16px",
          border: "1px dashed rgba(251,191,36,0.25)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📝</div>
          <h3 style={{ color: "#fbbf24", marginBottom: "8px" }}>No Blog Posts Yet</h3>
          <p style={{ color: "#71717a", marginBottom: "20px" }}>Write your first post to engage your gym community.</p>
          <button className="adminPrimaryButton" onClick={onOpenAdd}>
            <FaEdit /> Write New Post
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "20px",
        }}>
          {blogs.map((b) => (
            <div key={b.slug} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px", overflow: "hidden",
              transition: "border-color 0.2s, transform 0.2s",
              cursor: "default",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(251,191,36,0.4)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
            >
              {/* Thumbnail */}
              <div style={{ position: "relative", height: "160px", overflow: "hidden", background: "#18181b" }}>
                <Image
                  src={b.image || "/images/pullup-training.jpg"}
                  alt={b.title}
                  fill
                  unoptimized
                  style={{ objectFit: "cover", opacity: 0.85 }}
                />
                <div style={{
                  position: "absolute", top: "10px", left: "10px",
                  background: "rgba(251,191,36,0.9)", color: "#000",
                  fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px",
                  borderRadius: "20px", letterSpacing: "0.05em", textTransform: "uppercase",
                }}>
                  {b.category || "Fitness"}
                </div>
                <div style={{
                  position: "absolute", top: "10px", right: "10px",
                  background: "rgba(0,0,0,0.65)", color: "#a1a1aa",
                  fontSize: "0.7rem", padding: "3px 10px", borderRadius: "20px",
                }}>
                  {b.readTime || "5 min read"}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "16px" }}>
                <h3 style={{
                  color: "#f4f4f5", fontSize: "0.95rem", fontWeight: 700,
                  marginBottom: "6px", lineHeight: 1.4,
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {b.title}
                </h3>
                <p style={{
                  color: "#71717a", fontSize: "0.8rem", marginBottom: "12px",
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {b.summary || (Array.isArray(b.content) ? b.content[0] : b.content)}
                </p>

                {/* Meta */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 700, color: "#000",
                    }}>
                      {(b.author || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: "#d4d4d8", fontSize: "0.75rem", fontWeight: 600 }}>{b.author || "Admin"}</div>
                      <div style={{ color: "#52525b", fontSize: "0.7rem" }}>{b.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="adminActionBtn edit"
                      onClick={() => onOpenEdit(b)}
                      aria-label="Edit Blog"
                      title="Edit Post"
                      style={{ padding: "6px 10px" }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="adminActionBtn delete"
                      onClick={() => onDelete(b)}
                      aria-label="Delete Blog"
                      title="Delete Post"
                      style={{ padding: "6px 10px" }}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Soft Delete System components

function SoftDeleteModal({
  target,
  onClose,
}: {
  target: {
    id: string;
    name: string;
    tableName: string;
    moduleLabel: string;
    onConfirmed: () => void;
  };
  onClose: () => void;
}) {
  return (
    <div className="adminModalOverlay" style={{ zIndex: 1100 }}>
      <div className="adminModal" style={{ maxWidth: "450px" }}>
        <div className="adminModalHeader">
          <h2>Move to Trash</h2>
          <button className="adminModalClose" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        <div className="adminModalBody" style={{ textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: "3rem", color: "#fbbf24", marginBottom: "16px", display: "flex", justifyContent: "center" }}>
            <FaTrash />
          </div>
          <h3 style={{ color: "#f4f4f5", fontSize: "1.1rem", marginBottom: "8px", fontWeight: "600" }}>
            Move this item to Trash?
          </h3>
          <p style={{ color: "#a1a1aa", fontSize: "0.88rem", marginBottom: "24px", lineHeight: "1.4" }}>
            Are you sure you want to move <strong>{target.name}</strong> to Trash? You can restore it later.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="adminBtnCancel" onClick={onClose}>
              Cancel
            </button>
            <button
              className="adminBtnSubmit"
              style={{ background: "#ef4444", color: "#fff" }}
              onClick={() => {
                target.onConfirmed();
                onClose();
              }}
            >
              Move to Trash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToastStack({
  toasts,
  setToasts,
}: {
  toasts: { id: string; message: string; type: "success" | "error"; undoAction?: () => void }[];
  setToasts: React.Dispatch<React.SetStateAction<{ id: string; message: string; type: "success" | "error"; undoAction?: () => void }[]>>;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "350px",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "#f4f4f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
            animation: "toastSlideUp 0.3s ease-out forwards",
          }}
        >
          <style>{`
            @keyframes toastSlideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: t.type === "success" ? "#10b981" : "#ef4444" }}>
              <FaCheckCircle />
            </span>
            <span style={{ fontSize: "0.88rem" }}>{t.message}</span>
          </div>
          {t.undoAction && (
            <button
              onClick={() => {
                t.undoAction!();
                setToasts((prev) => prev.filter((item) => item.id !== t.id));
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#fcd34d",
                fontWeight: "600",
                fontSize: "0.8rem",
                cursor: "pointer",
                padding: "2px 6px",
                textDecoration: "underline",
              }}
            >
              Undo
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const TRASH_TABS = [
  { key: "all", label: "All Items" },
  { key: "Products", label: "Products" },
  { key: "Categories", label: "Categories" },
  { key: "Brands", label: "Brands" },
  { key: "Programs", label: "Programs" },
  { key: "Trainers", label: "Trainers" },
  { key: "Memberships", label: "Memberships" },
  { key: "Reviews", label: "Reviews" },
  { key: "Offers", label: "Offers" },
  { key: "Blog Posts", label: "Blog Posts" },
];

function TrashSection({
  trash,
  loading,
  refresh,
  setTrash,
  addToast,
}: {
  trash: TrashItem[];
  loading: boolean;
  refresh: () => void;
  setTrash: React.Dispatch<React.SetStateAction<TrashItem[]>>;
  addToast: (message: string, type?: "success" | "error", undo?: () => void) => void;
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [permanentConfirmId, setPermanentConfirmId] = useState<string | null>(null);

  const handleRestore = async (item: TrashItem) => {
    try {
      setRestoringId(item.id);
      await restoreItem(item.tableName, item.id);
      setTrash((prev) => prev.filter((t) => t.id !== item.id));
      addToast(`Restored "${item.name}" successfully!`, "success");
      // Trigger a refresh to update active view
      setTimeout(() => {
        refresh();
      }, 500);
    } catch {
      addToast("Failed to restore item.", "error");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    try {
      await permanentDeleteItem(item.tableName, item.id);
      setTrash((prev) => prev.filter((t) => t.id !== item.id));
      addToast(`Permanently deleted "${item.name}".`, "success");
      setPermanentConfirmId(null);
    } catch {
      addToast("Failed to permanently delete item.", "error");
    }
  };

  const filteredTrash = activeTab === "all" ? trash : trash.filter((t) => t.module === activeTab);

  return (
    <div className="adminPage">
      <PanelHeader title="Trash Bin" />

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "20px", borderBottom: "1px solid #27272a" }}>
        {TRASH_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === "all" ? trash.length : trash.filter((t) => t.module === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: isActive ? "#fbbf24" : "#18181b",
                color: isActive ? "#18181b" : "#a1a1aa",
                border: "1px solid #27272a",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: isActive ? "rgba(0,0,0,0.15)" : "#27272a",
                color: isActive ? "#000" : "#a1a1aa",
                padding: "2px 6px",
                borderRadius: "10px",
                fontSize: "0.75rem",
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#a1a1aa" }}>Loading Trash...</div>
      ) : filteredTrash.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "64px 24px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "16px",
          border: "1px dashed #27272a",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🗑️</div>
          <h3 style={{ color: "#fbbf24", marginBottom: "8px" }}>Trash Bin Empty</h3>
          <p style={{ color: "#71717a" }}>No deleted items found in this section.</p>
        </div>
      ) : (
        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Module</th>
                <th>Deleted On</th>
                <th>Deleted By</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrash.map((item) => {
                const isConfirming = permanentConfirmId === item.id;
                const formattedDate = item.deletedAt ? new Date(item.deletedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) : "—";
                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <Badge value={item.module} className="info" />
                    </td>
                    <td>{formattedDate}</td>
                    <td>{item.deletedBy || "System Admin"}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        {isConfirming ? (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: "bold" }}>Irreversible! Confirm?</span>
                            <button
                              onClick={() => handlePermanentDelete(item)}
                              style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setPermanentConfirmId(null)}
                              style={{ background: "#27272a", color: "#e4e4e7", border: "1px solid #3f3f46", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              disabled={restoringId === item.id}
                              onClick={() => handleRestore(item)}
                              style={{
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                              }}
                            >
                              {restoringId === item.id ? "Restoring..." : "Restore"}
                            </button>
                            <button
                              onClick={() => setPermanentConfirmId(item.id)}
                              style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                              }}
                            >
                              Delete Permanently
                            </button>
                          </>
                        )}
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
  );
}


function HomePageManager({
  content,
  setContent,
}: {
  content: HomePageContent;
  setContent: (value: HomePageContent) => void;
}) {
  const [draft, setDraft] = useState<HomePageContent>(content);
  const [message, setMessage] = useState("");
  const [slideStatus, setSlideStatus] = useState<Record<number, string>>({});
  const draftRef = useRef<HomePageContent>(content);

  useEffect(() => {
    draftRef.current = content;
    setDraft(content);
  }, [content]);

  const updateField = (field: keyof HomePageContent, value: string | string[]) => {
    const next = { ...draftRef.current, [field]: value } as HomePageContent;
    draftRef.current = next;
    setDraft(next);
    return next;
  };

  const handleSlideImageChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSlideStatus((s) => ({ ...s, [index]: "Uploading…" }));
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;
      let imageUrl = await compressImage(reader.result, 1400);
      try {
        const formData = new FormData();
        formData.append("file", imageUrl);
        formData.append("bucket", "gym-images");
        const res = await fetch("/api/upload-image", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json() as { url?: string };
          if (data.url) imageUrl = data.url;
        }
      } catch { /* fallback to compressed */ }
      const newSlides = [...draftRef.current.slides];
      newSlides[index] = imageUrl;
      updateField("slides", newSlides);
      setContent({ ...draftRef.current, slides: newSlides });
      setSlideStatus((s) => ({ ...s, [index]: "Slide image saved!" }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setContent(draftRef.current);
    setMessage("Home page updated successfully.");
    window.setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="adminPage">
      <PanelHeader title="Home Page Content" />
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "860px" }}>

        {/* Hero Text Section */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ color: "#fbbf24", fontSize: "0.9rem", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🏠 Hero Section Text
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="adminFormGroup" style={{ gridColumn: "1 / -1" }}>
              <label>Eyebrow / Tag Line</label>
              <input
                value={draft.eyebrow}
                onChange={(e) => updateField("eyebrow", e.target.value)}
                placeholder="e.g. Fitness Bhaktapur"
              />
            </div>
            <div className="adminFormGroup">
              <label>Heading — First Line</label>
              <input
                value={draft.headingFirstLine}
                onChange={(e) => updateField("headingFirstLine", e.target.value)}
                placeholder="e.g. Transform Your Body"
              />
            </div>
            <div className="adminFormGroup">
              <label>Heading — Second Line</label>
              <input
                value={draft.headingSecondLine}
                onChange={(e) => updateField("headingSecondLine", e.target.value)}
                placeholder="e.g. Transform Your Life"
              />
            </div>
            <div className="adminFormGroup" style={{ gridColumn: "1 / -1" }}>
              <label>Description / Subtitle</label>
              <textarea
                value={draft.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                placeholder="Short tagline shown below the heading…"
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ color: "#fbbf24", fontSize: "0.9rem", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🔗 Call-to-Action Buttons
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="adminFormGroup">
              <label>Primary Button Label</label>
              <input
                value={draft.primaryButtonLabel}
                onChange={(e) => updateField("primaryButtonLabel", e.target.value)}
                placeholder="e.g. View Programs"
              />
            </div>
            <div className="adminFormGroup">
              <label>Primary Button Link</label>
              <input
                value={draft.primaryButtonLink}
                onChange={(e) => updateField("primaryButtonLink", e.target.value)}
                placeholder="e.g. /services"
              />
            </div>
            <div className="adminFormGroup">
              <label>Secondary Button Label</label>
              <input
                value={draft.secondaryButtonLabel}
                onChange={(e) => updateField("secondaryButtonLabel", e.target.value)}
                placeholder="e.g. Join Now"
              />
            </div>
            <div className="adminFormGroup">
              <label>Secondary Button Link</label>
              <input
                value={draft.secondaryButtonLink}
                onChange={(e) => updateField("secondaryButtonLink", e.target.value)}
                placeholder="e.g. /join"
              />
            </div>
          </div>
        </div>

        {/* Hero Slides — fixed 3 slots */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ color: "#fbbf24", fontSize: "0.9rem", fontWeight: 700, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🖼️ Hero Background Photos
          </h3>
          <p style={{ color: "#71717a", fontSize: "0.8rem", marginBottom: "20px" }}>
            Exactly 3 photos rotate as the hero background with a smooth crossfade. Each should be a wide landscape image (min 1400×800px recommended).
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {Array.from({ length: 3 }).map((_, idx) => {
              const slide = draft.slides[idx] ?? "";
              return (
                <div key={idx} style={{ background: "rgba(255,255,255,0.02)", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ position: "relative", height: "150px", background: "#18181b" }}>
                    {slide ? (
                      <Image src={slide} alt={`Slide ${idx + 1}`} fill unoptimized style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#52525b", gap: "6px" }}>
                        <FaCamera style={{ fontSize: "1.4rem" }} />
                        <span style={{ fontSize: "0.75rem" }}>No photo yet</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", top: "8px", left: "8px", background: slide ? "rgba(251,191,36,0.9)" : "rgba(0,0,0,0.55)", borderRadius: "20px", padding: "2px 10px", fontSize: "0.7rem", color: slide ? "#000" : "#a1a1aa", fontWeight: 700 }}>
                      Photo {idx + 1}
                    </div>
                  </div>
                  <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input
                      value={slide}
                      onChange={(e) => {
                        const newSlides = [...draftRef.current.slides];
                        while (newSlides.length < 3) newSlides.push("");
                        newSlides[idx] = e.target.value;
                        updateField("slides", newSlides);
                      }}
                      placeholder="Paste image URL…"
                      style={{ width: "100%", fontSize: "0.78rem" }}
                    />
                    <label style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      padding: "8px 10px", background: "rgba(251,191,36,0.08)",
                      border: "1px dashed rgba(251,191,36,0.4)", borderRadius: "6px",
                      cursor: "pointer", color: "#fbbf24", fontSize: "0.78rem", fontWeight: 600,
                    }}>
                      <FaCamera /> {slide ? "Replace Photo" : "Upload Photo"}
                      <input type="file" accept="image/*" onChange={(e) => handleSlideImageChange(idx, e)} style={{ display: "none" }} />
                    </label>
                    {slideStatus[idx] && (
                      <small style={{ color: "#4ade80", fontSize: "0.72rem" }}>{slideStatus[idx]}</small>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {message && (
          <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "10px", padding: "12px 18px", color: "#4ade80", fontSize: "0.875rem", fontWeight: 600 }}>
            ✓ {message}
          </div>
        )}
        <div>
          <button className="adminPrimaryButton" type="submit" style={{ padding: "12px 32px", fontSize: "0.95rem" }}>
            Save & Publish Home Page
          </button>
        </div>
      </form>
    </div>
  );
}

function WhyChooseUsManager({ content, setContent }: { content: WhyChooseUsContent; setContent: (value: WhyChooseUsContent) => void }) {
  const [draft, setDraft] = useState(content);
  const [message, setMessage] = useState("");
  useEffect(() => setDraft(content), [content]);
  const updateReason = (index: number, field: "title" | "text", value: string) => setDraft((current) => ({ ...current, reasons: current.reasons.map((reason, itemIndex) => itemIndex === index ? { ...reason, [field]: value } : reason) }));
  const loadImage = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file?.type.startsWith("image/")) return; setMessage("Uploading image…"); try { const image = await uploadContentImage(file); setDraft((current) => ({ ...current, image })); setMessage("Image uploaded. Click Save & Publish to make it live."); } catch (error) { setMessage(error instanceof Error ? error.message : "Image upload failed."); } };
  return <div className="adminPage"><PanelHeader title="Why Choose Us" /><form onSubmit={(event) => { event.preventDefault(); setContent(draft); setMessage("Why Choose Us section published successfully."); }} style={{ maxWidth: "860px" }}>
    <div style={{ padding: "24px", border: "1px solid rgba(255,255,255,.08)", borderRadius: "14px", background: "rgba(255,255,255,.03)" }}><div className="adminFormGroup"><label>Background Image URL</label><input value={draft.image || ""} onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="https://..." /><label style={{ display: "inline-block", marginTop: "10px", color: "#fbbf24", cursor: "pointer" }}><FaCamera /> Upload Background Image<input type="file" accept="image/*" onChange={loadImage} style={{ display: "none" }} /></label></div><div className="adminFormGroup"><label>Section Label</label><input value={draft.eyebrow} onChange={(event) => setDraft({ ...draft, eyebrow: event.target.value })} /></div><div className="adminFormGroup"><label>Heading</label><input value={draft.heading} onChange={(event) => setDraft({ ...draft, heading: event.target.value })} /></div><h3 style={{ color: "#fbbf24", fontSize: "0.9rem", textTransform: "uppercase", margin: "24px 0 14px" }}>Benefit Cards</h3>{draft.reasons.map((reason, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginBottom: "12px" }}><div className="adminFormGroup"><label>Title {index + 1}</label><input value={reason.title} onChange={(event) => updateReason(index, "title", event.target.value)} /></div><div className="adminFormGroup"><label>Description</label><input value={reason.text} onChange={(event) => updateReason(index, "text", event.target.value)} /></div></div>)}</div>{message && <p style={{ color: "#4ade80" }}>✓ {message}</p>}<button className="adminPrimaryButton" type="submit">Save & Publish Why Choose Us</button></form></div>;
}

async function uploadContentImage(file: File) {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read image."));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
  const compressed = await compressImage(base64, 1400);
  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("bucket", "gym-images");
  try {
    const response = await fetch("/api/upload-image", { method: "POST", body: formData });
    if (response.ok) {
      const data = await response.json() as { url?: string };
      if (data.url) return data.url;
    }
  } catch {
    // The compressed data URL remains a working fallback when Storage is unavailable.
  }
  return compressed;
}

function ContactCtaManager({ content, setContent, settings, setSettings }: { content: ContactCtaContent; setContent: (value: ContactCtaContent) => void; settings: SharedGymContent; setSettings: (value: SharedGymContent) => void }) {
  const [draft, setDraft] = useState(content);
  const [contact, setContact] = useState({ phone: settings.phone, email: settings.email, address: settings.address });
  const [message, setMessage] = useState("");
  useEffect(() => { setDraft(content); setContact({ phone: settings.phone, email: settings.email, address: settings.address }); }, [content, settings]);
  const field = (label: string, key: keyof ContactCtaContent) => <div className="adminFormGroup"><label>{label}</label><input value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /></div>;
  const loadImage = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file?.type.startsWith("image/")) return; setMessage("Uploading image…"); try { const image = await uploadContentImage(file); setDraft((current) => ({ ...current, image })); setMessage("Image uploaded. Click Save & Publish to make it live."); } catch (error) { setMessage(error instanceof Error ? error.message : "Image upload failed."); } };
  return <div className="adminPage"><PanelHeader title="Contact Us Section" /><form onSubmit={(event) => { event.preventDefault(); setContent(draft); setSettings({ ...settings, ...contact }); setMessage("Contact Us section published successfully."); }} style={{ maxWidth: "760px" }}><div style={{ padding: "24px", border: "1px solid rgba(255,255,255,.08)", borderRadius: "14px", background: "rgba(255,255,255,.03)" }}><h3 style={{ color: "#fbbf24", fontSize: "0.9rem", textTransform: "uppercase", marginBottom: "16px" }}>Call to Action</h3><div className="adminFormGroup"><label>Background Image URL</label><input value={draft.image || ""} onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="https://..." /><label style={{ display: "inline-block", marginTop: "10px", color: "#fbbf24", cursor: "pointer" }}><FaCamera /> Upload Background Image<input type="file" accept="image/*" onChange={loadImage} style={{ display: "none" }} /></label></div>{field("Label", "eyebrow")}{field("Heading", "heading")}<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>{field("Join Button", "joinLabel")}{field("Contact Button", "contactLabel")}{field("Call Button", "callLabel")}</div><h3 style={{ color: "#fbbf24", fontSize: "0.9rem", textTransform: "uppercase", margin: "24px 0 16px" }}>Contact Details</h3>{(["phone", "email", "address"] as const).map((key) => <div className="adminFormGroup" key={key}><label>{key.charAt(0).toUpperCase() + key.slice(1)}</label><input value={contact[key]} onChange={(event) => setContact({ ...contact, [key]: event.target.value })} /></div>)}</div>{message && <p style={{ color: "#4ade80" }}>✓ {message}</p>}<button className="adminPrimaryButton" type="submit">Save & Publish Contact Us</button></form></div>;
}

function AboutPageManager({
  content,
  setContent,
}: {
  content: AboutPageContent;
  setContent: (value: AboutPageContent) => void;
}) {
  const [draft, setDraft] = useState<AboutPageContent>(content);
  const [message, setMessage] = useState("");
  const [imageStatus, setImageStatus] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const draftRef = useRef<AboutPageContent>(content);

  useEffect(() => {
    if (isDirty) return;
    draftRef.current = content;
    setDraft(content);
  }, [content, isDirty]);

  const updateField = (field: keyof AboutPageContent, value: string) => {
    const next = { ...draftRef.current, [field]: value };
    draftRef.current = next;
    setDraft(next);
    setIsDirty(true);
    return next;
  };

  const handleImageChange = (field: "introImage" | "missionImageOne" | "missionImageTwo", event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageStatus((cur) => ({ ...cur, [field]: "Uploading image…" }));
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;
      let imageUrl = await compressImage(reader.result, 1200);
      try {
        const formData = new FormData();
        formData.append("file", imageUrl);
        formData.append("bucket", "gym-images");
        const response = await fetch("/api/upload-image", { method: "POST", body: formData });
        if (response.ok) {
          const data = await response.json() as { url?: string };
          if (data.url) imageUrl = data.url;
        }
      } catch { /* fallback to compressed */ }
      const next = updateField(field, imageUrl);
      setContent(next);
      setIsDirty(false);
      setImageStatus((cur) => ({ ...cur, [field]: "Photo saved. Live on the About Us page." }));
    };
    reader.readAsDataURL(file);
  };

  const publishAboutPage = () => {
    setContent(draftRef.current);
    setIsDirty(false);
    setMessage("About Us page published successfully.");
    window.setTimeout(() => setMessage(""), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    publishAboutPage();
  };

  const imageEditor = (field: "introImage" | "missionImageOne" | "missionImageTwo", label: string) => (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", overflow: "hidden" }}>
      <div style={{ position: "relative", height: "160px", background: "#18181b" }}>
        {draft[field] ? (
          <Image src={draft[field]} alt={`${label} preview`} fill unoptimized style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#52525b", fontSize: "0.8rem" }}>No photo</div>
        )}
        <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.7)", borderRadius: "20px", padding: "2px 10px", fontSize: "0.7rem", color: "#fbbf24", fontWeight: 700 }}>
          {label}
        </div>
      </div>
      <div style={{ padding: "12px" }}>
        <input
          value={draft[field]}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder="Image URL"
          style={{ width: "100%", marginBottom: "8px", fontSize: "0.78rem" }}
        />
        <label style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "7px 10px", background: "rgba(251,191,36,0.08)",
          border: "1px dashed rgba(251,191,36,0.4)", borderRadius: "6px",
          cursor: "pointer", color: "#fbbf24", fontSize: "0.78rem", fontWeight: 600,
        }}>
          <FaCamera /> {draft[field] ? "Change Image" : "Upload Image"}
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(field, e)} style={{ display: "none" }} />
        </label>
        {imageStatus[field] && (
          <small style={{ color: "#4ade80", fontSize: "0.72rem", marginTop: "4px", display: "block" }}>{imageStatus[field]}</small>
        )}
      </div>
    </div>
  );

  return (
    <div className="adminPage">
      <PanelHeader
        title={`About Us Page Content${isDirty ? " • Unsaved changes" : ""}`}
        action="Save & Publish"
        onAction={publishAboutPage}
      />
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "860px" }}>

        {/* Hero Section */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ color: "#fbbf24", fontSize: "0.9rem", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            📖 Hero Section
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            <div className="adminFormGroup">
              <label>Hero Title</label>
              <input value={draft.heroTitle} onChange={(e) => updateField("heroTitle", e.target.value)} placeholder="e.g. ABOUT US" />
            </div>
            <div className="adminFormGroup">
              <label>Hero Description</label>
              <textarea value={draft.heroBody} onChange={(e) => updateField("heroBody", e.target.value)} rows={3} style={{ resize: "vertical" }} />
            </div>
            <div>
              <div style={{ color: "#a1a1aa", fontSize: "0.82rem", fontWeight: 600, marginBottom: "10px" }}>Intro Image</div>
              {imageEditor("introImage", "Intro Photo")}
            </div>
          </div>
        </div>

        {/* Mission and Vision */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ color: "#fbbf24", fontSize: "0.9rem", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🎯 Mission, Vision & Motto
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            <div className="adminFormGroup">
              <label>Mission Title</label>
              <input value={draft.missionTitle} onChange={(e) => updateField("missionTitle", e.target.value)} placeholder="e.g. OUR MISSION" />
            </div>
            <div className="adminFormGroup">
              <label>Mission Description</label>
              <textarea value={draft.missionBody} onChange={(e) => updateField("missionBody", e.target.value)} rows={3} style={{ resize: "vertical" }} />
            </div>
            <div className="adminFormGroup">
              <label>Vision Title</label>
              <input value={draft.visionTitle} onChange={(e) => updateField("visionTitle", e.target.value)} placeholder="e.g. OUR VISION" />
            </div>
            <div className="adminFormGroup">
              <label>Vision Description</label>
              <textarea value={draft.visionBody} onChange={(e) => updateField("visionBody", e.target.value)} rows={3} style={{ resize: "vertical" }} />
            </div>
            <div className="adminFormGroup">
              <label>Motto (use Enter for line breaks)</label>
              <textarea value={draft.mottoText} onChange={(e) => updateField("mottoText", e.target.value)} rows={3} style={{ resize: "vertical" }} />
            </div>
            <div>
              <div style={{ color: "#a1a1aa", fontSize: "0.82rem", fontWeight: 600, marginBottom: "10px" }}>Motto Image</div>
              {imageEditor("missionImageTwo", "Motto Photo")}
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ color: "#fbbf24", fontSize: "0.9rem", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>⭐ Values</h3>
          <div className="adminFormGroup"><label>Values Title</label><input value={draft.valuesTitle} onChange={(e) => updateField("valuesTitle", e.target.value)} /></div>
          {([ ["qualityTitle", "qualityBody", "Quality"], ["commitmentTitle", "commitmentBody", "Commitment"], ["communityTitle", "communityBody", "Community"], ["integrityTitle", "integrityBody", "Integrity"] ] as const).map(([titleKey, bodyKey, label]) => (
            <div key={titleKey} style={{ paddingTop: "16px", marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="adminFormGroup"><label>{label} Title</label><input value={draft[titleKey]} onChange={(e) => updateField(titleKey, e.target.value)} /></div>
              <div className="adminFormGroup"><label>{label} Description</label><textarea value={draft[bodyKey]} onChange={(e) => updateField(bodyKey, e.target.value)} rows={2} style={{ resize: "vertical" }} /></div>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ color: "#fbbf24", fontSize: "0.9rem", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>📊 Statistics</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
            {([ ["membersStat", "membersLabel", "Happy Members"], ["trainersStat", "trainersLabel", "Expert Trainers"], ["classesStat", "classesLabel", "Weekly Classes"], ["yearsStat", "yearsLabel", "Years of Excellence"] ] as const).map(([numberKey, labelKey, label]) => (
              <div key={numberKey} style={{ padding: "14px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}>
                <div className="adminFormGroup"><label>{label} Number</label><input value={draft[numberKey]} onChange={(e) => updateField(numberKey, e.target.value)} /></div>
                <div className="adminFormGroup"><label>{label} Label</label><input value={draft[labelKey]} onChange={(e) => updateField(labelKey, e.target.value)} /></div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "24px" }}>
          <h3 style={{ color: "#fbbf24", fontSize: "0.9rem", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.08em" }}>✓ Join Call to Action</h3>
          <div className="adminFormGroup"><label>Heading</label><input value={draft.ctaHeading} onChange={(e) => updateField("ctaHeading", e.target.value)} /></div>
          <div className="adminFormGroup"><label>Description</label><textarea value={draft.ctaBody} onChange={(e) => updateField("ctaBody", e.target.value)} rows={2} style={{ resize: "vertical" }} /></div>
          <div className="adminFormGroup"><label>Button Label</label><input value={draft.ctaButtonLabel} onChange={(e) => updateField("ctaButtonLabel", e.target.value)} /></div>
          <div className="adminFormGroup"><label>Button Link</label><input value={draft.ctaButtonLink} onChange={(e) => updateField("ctaButtonLink", e.target.value)} placeholder="/join" /></div>
        </div>

        {message && (
          <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "10px", padding: "12px 18px", color: "#4ade80", fontSize: "0.875rem", fontWeight: 600 }}>
            ✓ {message}
          </div>
        )}
      </form>
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

type ParsedOrderItem = {
  name: string;
  quantity: number;
  price?: string;
  brand?: string;
  image?: string;
};

function parseOrderItems(order: OrderLog): ParsedOrderItem[] {
  if (order.cartItems && Array.isArray(order.cartItems) && order.cartItems.length > 0) {
    return order.cartItems.map((item) => ({
      name: item.productName || "Product",
      quantity: item.quantity || 1,
      price: item.price,
      brand: item.brand,
      image: item.image,
    }));
  }

  if (!order.items) {
    return [{ name: "Gym Shop Order", quantity: 1 }];
  }

  const rawParts = order.items.split(/,\s*/);
  return rawParts.map((part) => {
    const qtyMatch = part.match(/\s*(?:x|X|\*|\()?\s*(\d+)\s*\)?$/);
    if (qtyMatch) {
      const qty = parseInt(qtyMatch[1], 10);
      const name = part.replace(/\s*(?:x|X|\*|\()?\s*\d+\s*\)?$/, "").trim();
      return { name: name || part.trim(), quantity: isNaN(qty) ? 1 : qty };
    }
    return { name: part.trim(), quantity: 1 };
  });
}

function DeliverySlipModal({
  order,
  onClose,
  onToggleStatus,
}: {
  order: OrderLog;
  onClose: () => void;
  onToggleStatus: (order: OrderLog) => void;
}) {
  const parsedItems = parseOrderItems(order);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="adminModalOverlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="adminModal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "680px", width: "94%" }}
      >
        <div className="adminModalHeader">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaTruck style={{ color: "#ffe500", fontSize: "1.4rem" }} />
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>Order Delivery & Packing Slip</h2>
              <span style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>
                Order {order.orderId} • Date: {order.date}
              </span>
            </div>
          </div>
          <button className="adminModalClose" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>

        <div className="adminModalBody" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Customer Info Card */}
          <div style={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "10px", padding: "16px" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "#ffe500", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
              Customer Contact & Destination
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Customer Name</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{order.customer}</div>
              </div>
              {order.phone && (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Contact Phone</div>
                  <a href={`tel:${order.phone}`} style={{ fontSize: "0.92rem", fontWeight: 700, color: "#34d399", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <FaPhone style={{ fontSize: "0.75rem" }} /> {order.phone}
                  </a>
                </div>
              )}
              {order.email && (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Email</div>
                  <div style={{ fontSize: "0.85rem", color: "#d4d4d8" }}>{order.email}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Payment & Total</div>
                <div style={{ fontSize: "0.88rem", color: "#fbbf24", fontWeight: 700 }}>
                  {order.paymentMethod || order.payment} • {formatCurrency(order.total)}
                </div>
              </div>
            </div>

            {(order.address || order.pickupPoint) && (
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #27272a" }}>
                <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Delivery / Pickup Location</div>
                <div style={{ fontSize: "0.9rem", color: "#fff", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <FaMapMarkerAlt style={{ color: "#ef4444" }} />
                  {order.address || order.pickupPoint}
                </div>
              </div>
            )}
          </div>

          {/* Ordered Products Packing List */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "0.85rem", color: "#ffe500", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                Products to Pack ({parsedItems.length} item{parsedItems.length !== 1 ? "s" : ""})
              </h3>
              <span style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>
                Check off items as you pack for delivery
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {parsedItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: checkedItems[idx] ? "rgba(52, 211, 153, 0.08)" : "#18181b",
                    border: checkedItems[idx] ? "1px solid #34d399" : "1px solid #3f3f46",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(checkedItems[idx])}
                      onChange={() => {}}
                      style={{ width: "18px", height: "18px", accentColor: "#34d399", cursor: "pointer" }}
                    />
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={42}
                        height={42}
                        unoptimized
                        style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px", background: "#27272a" }}
                      />
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "42px", height: "42px", borderRadius: "6px", background: "#27272a", color: "#ffe500", fontSize: "18px" }}>
                        <FaBox />
                      </span>
                    )}
                    <div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: checkedItems[idx] ? "#34d399" : "#ffffff", textDecoration: checkedItems[idx] ? "line-through" : "none" }}>
                        {item.name}
                      </div>
                      {item.brand && (
                        <div style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>Brand: {item.brand}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "inline-block", padding: "4px 12px", background: "#ffe500", color: "#111", borderRadius: "14px", fontSize: "0.85rem", fontWeight: 800 }}>
                      QTY: {item.quantity}
                    </span>
                    {item.price && (
                      <div style={{ fontSize: "0.78rem", color: "#a1a1aa", marginTop: "2px" }}>
                        Unit Price: {item.price}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Status & Control */}
          <div style={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "10px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Fulfillment Status</div>
              <div style={{ marginTop: "4px" }}>
                <Badge value={order.status} />
              </div>
            </div>
            <button
              type="button"
              className="adminPrimaryButton"
              onClick={() => onToggleStatus(order)}
              style={{ fontSize: "0.85rem", padding: "8px 16px" }}
            >
              Cycle Status ({order.status === "Processing" ? "Move to Shipped" : order.status === "Shipped" ? "Move to Delivered" : "Move to Processing"})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersManagementTable({
  orders,
  onAdd,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  orders: OrderLog[];
  onAdd: () => void;
  onEdit: (order: OrderLog) => void;
  onDelete: (order: OrderLog) => void;
  onToggleStatus: (order: OrderLog) => void;
}) {
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderLog | null>(null);

  return (
    <div className="adminPage">
      <PanelHeader title="Orders Management" action="Log Order" onAction={onAdd} />
      
      <div className="adminTableWrap" style={{ overflowX: "auto" }}>
        <table className="adminTable">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer & Contact</th>
              <th>Ordered Products (Details for Delivery)</th>
              <th>Total & Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const parsedItems = parseOrderItems(o);
              const totalItemsCount = parsedItems.reduce((acc, item) => acc + item.quantity, 0);

              return (
                <tr key={o.orderId || o.id}>
                  {/* Order ID */}
                  <td style={{ verticalAlign: "top" }}>
                    <span style={{ fontWeight: 800, color: "#ffe500", fontSize: "0.95rem" }}>{o.orderId}</span>
                  </td>

                  {/* Customer & Contact */}
                  <td style={{ verticalAlign: "top", minWidth: "180px" }}>
                    <strong style={{ color: "#fff", display: "block", fontSize: "0.95rem" }}>{o.customer}</strong>
                    {o.phone && (
                      <a href={`tel:${o.phone}`} style={{ fontSize: "0.82rem", color: "#34d399", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "2px", textDecoration: "none", fontWeight: 600 }}>
                        <FaPhone style={{ fontSize: "0.75rem" }} /> {o.phone}
                      </a>
                    )}
                    {o.email && (
                      <div style={{ fontSize: "0.8rem", color: "#a1a1aa", marginTop: "2px" }}>
                        {o.email}
                      </div>
                    )}
                    {(o.address || o.pickupPoint) && (
                      <div style={{ fontSize: "0.78rem", color: "#d4d4d8", marginTop: "4px", background: "#27272a", padding: "4px 8px", borderRadius: "4px", display: "flex", alignItems: "flex-start", gap: "4px" }}>
                        <FaMapMarkerAlt style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                        <span>{o.address || o.pickupPoint}</span>
                      </div>
                    )}
                  </td>

                  {/* Detailed Ordered Products List */}
                  <td style={{ verticalAlign: "top", minWidth: "280px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#a1a1aa", fontWeight: 700 }}>
                        {totalItemsCount} item{totalItemsCount !== 1 ? "s" : ""} to pack:
                      </div>
                      {parsedItems.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#18181b",
                            border: "1px solid #3f3f46",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            gap: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={32}
                                height={32}
                                unoptimized
                                style={{ width: "32px", height: "32px", objectFit: "cover", borderRadius: "4px", background: "#27272a" }}
                              />
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "4px", background: "#27272a", color: "#ffe500", fontSize: "14px" }}>
                                <FaBox />
                              </span>
                            )}
                            <div>
                              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                                {item.name}
                              </div>
                              {item.brand && (
                                <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>
                                  {item.brand}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ padding: "2px 8px", background: "#ffe500", color: "#111", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 800 }}>
                              x{item.quantity}
                            </span>
                            {item.price && (
                              <span style={{ fontSize: "0.78rem", color: "#34d399", fontWeight: 600 }}>
                                {item.price}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Total & Payment */}
                  <td style={{ verticalAlign: "top" }}>
                    <strong style={{ fontSize: "0.95rem", color: "#ffe500", display: "block" }}>
                      {formatCurrency(o.total)}
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "#a1a1aa", display: "block", marginTop: "2px" }}>
                      {o.paymentMethod || o.payment}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td style={{ verticalAlign: "top" }}>
                    <button
                      type="button"
                      className="adminInlineStatusToggle"
                      onClick={() => onToggleStatus(o)}
                      title="Click to cycle status"
                    >
                      <Badge value={o.status} />
                    </button>
                  </td>

                  {/* Date */}
                  <td style={{ verticalAlign: "top", fontSize: "0.85rem", color: "#a1a1aa" }}>
                    {o.date}
                  </td>

                  {/* Actions */}
                  <td style={{ verticalAlign: "top" }}>
                    <div className="adminTableActionRow">
                      <button
                        className="adminActionBtn"
                        onClick={() => setSelectedOrderDetails(o)}
                        title="View Delivery Slip & Products Breakdown"
                        style={{ color: "#38bdf8" }}
                      >
                        <FaEye />
                      </button>
                      <button className="adminActionBtn edit" onClick={() => onEdit(o)} title="Edit Order">
                        <FaEdit />
                      </button>
                      <button className="adminActionBtn delete" onClick={() => onDelete(o)} title="Delete Order">
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delivery Slip & Packing Modal */}
      {selectedOrderDetails && (
        <DeliverySlipModal
          order={selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          onToggleStatus={onToggleStatus}
        />
      )}
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
  const showActions = (onEdit || onDelete) && items && items.length > 0;
  const displayHeaders = showActions ? [...headers, "Actions"] : headers;

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
              return (
                <tr key={stableKey}>
                  {row.map((cell, index) => (
                    <td key={`${stableKey}-${index}`}>
                      {["Active", "Inactive", "Paid", "Pending", "Processing", "Shipped", "Delivered", "Completed", "Cancelled", "Published", "Draft", "Approved", "Checked In", "Checked Out", "Late"].includes(cell) ? (
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
                        {onApprove && (originalItem as Record<string, unknown>).status === "Pending" && (
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
                        {onEdit && (
                          <button className="adminActionBtn edit" onClick={() => { onEdit(originalItem); }} aria-label="Edit Item">
                            <FaEdit />
                          </button>
                        )}
                        {onDelete && (
                          <button className="adminActionBtn delete" onClick={() => onDelete(originalItem)} aria-label="Delete Item">
                            <FaTrashAlt />
                          </button>
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
  popular?: boolean;
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
  blogCategories = [],
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
  blogCategories?: string[];
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
      return { title: "", category: blogCategories[0] || "Fitness", author: "Admin", date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }), summary: "", content: "", image: "/images/pullup-training.jpg", popular: false };
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
    if (section === "programs" || section === "classes") {
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

    if ((section === "gallery" || section === "programs" || section === "classes" || section === "shop" || section === "brands" || section === "shopCategories" || section === "banners") && (payload.image || payload.logo || payload.banner)) {
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
            {section === "programs" || section === "classes" ? "Program" : (section === "bookings" ? "Booking" : (section === "gallery" ? "Photo" : (section === "trainers" ? "Team Member" : (section.charAt(0).toUpperCase() + section.slice(1)))))}
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
                  <select name="category" value={fields.category || ""} onChange={handleChange} required>
                    {!blogCategories.includes(String(fields.category || "")) && fields.category && <option value={String(fields.category)}>{String(fields.category)}</option>}
                    {blogCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
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
                <label style={{ display: "flex", alignItems: "center", gap: "9px", marginTop: "4px", color: "#f4f4f5", cursor: "pointer", fontSize: "0.9rem" }}>
                  <input type="checkbox" name="popular" checked={Boolean(fields.popular)} onChange={handleChange} style={{ width: "16px", height: "16px", accentColor: "#fbbf24" }} />
                  Show this post in Popular Posts on the client blog
                </label>
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

            {(section === "programs" || section === "classes") && (
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

function ShopBuyersManagement({
  buyers,
  clients,
}: {
  buyers: ShopBuyer[];
  clients: DemoClient[];
}) {
  const shopOnlyClients = clients.filter(
    (c) => c.package?.key === "none" || c.package?.name === "No Active Plan"
  );

  const allBuyersMap = new Map<
    string,
    { id?: string; name: string; email: string; phone?: string; address?: string; memberSince?: string }
  >();

  shopOnlyClients.forEach((c) => {
    if (c.email) {
      allBuyersMap.set(c.email.toLowerCase(), {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        memberSince: c.memberSince,
      });
    }
  });

  buyers.forEach((b) => {
    if (b.email) {
      const existing = allBuyersMap.get(b.email.toLowerCase());
      allBuyersMap.set(b.email.toLowerCase(), {
        ...existing,
        id: b.id || existing?.id,
        name: b.name || existing?.name || "Buyer",
        email: b.email,
        phone: b.phone || existing?.phone,
        address: b.address || existing?.address,
        memberSince: b.memberSince || existing?.memberSince,
      });
    }
  });

  const combinedBuyers = Array.from(allBuyersMap.values());

  return (
    <div className="adminPage">
      <PanelHeader title="Shop Buyers" />

      <div className="adminTableCard">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Buyer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Registered Date</th>
              <th>Account Type</th>
            </tr>
          </thead>
          <tbody>
            {combinedBuyers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#a1a1aa", padding: "32px" }}>
                  No shop buyers recorded yet. Shop buyers appear here when users register or sign in through the shop.
                </td>
              </tr>
            ) : (
              combinedBuyers.map((b, idx) => (
                <tr key={b.id || b.email || idx}>
                  <td>
                    <strong>{b.name}</strong>
                  </td>
                  <td>{b.email}</td>
                  <td>{b.phone || "—"}</td>
                  <td>{b.address || "—"}</td>
                  <td>{b.memberSince || "Recent"}</td>
                  <td>
                    <Badge value="Active" className="good" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
