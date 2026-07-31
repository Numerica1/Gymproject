"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaBagShopping,
  FaCartShopping,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaHeart,
  FaMagnifyingGlass,
  FaMinus,
  FaPlus,
  FaStar,
  FaUser,
  FaXmark,
  FaSpinner,
  FaArrowRightFromBracket,
  FaShieldHalved,
} from "react-icons/fa6";
import Image from "next/image";
import {
  useGymProducts,
  useGymBrands,
  useGymShopCategories,
  useGymSettings,
  useGymClients,
  useGymReviews,
  getNextClientId,
  type Product,
} from "../data/gymData";
import { formatCurrency } from "../data/currency";
import type { Banner } from "../data/sharedGymContent";
import { clientStorageKey, type DemoClient } from "../data/clientPortal";

type CartItem = {
  product: Product;
  quantity: number;
};

const productImages = [
  "/images/kettlebell.jpg",
  "/images/equipment-row.jpg",
  "/images/strength-training.jpg",
  "/images/crossfit-weights.jpg",
  "/images/fitness-logo.jpg",
];


function getProductImage(product: Product, index: number) {
  if (product.image) return product.image;
  const name = product.name.toLowerCase();
  if (name.includes("whey") || name.includes("protein")) return "/images/kettlebell.jpg";
  if (name.includes("gainer")) return "/images/strength-training.jpg";
  if (name.includes("creatine")) return "/images/crossfit-weights.jpg";
  return productImages[index % productImages.length];
}

function getProductId(product: Product) {
  return product.id || product.name;
}

const SHOP_CART_STORAGE_KEY = "fitness-shop-cart";
const SHOP_WISHLIST_STORAGE_KEY = "fitness-shop-wishlist";

export default function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products] = useGymProducts();
  const [reviews] = useGymReviews();
  const [brands] = useGymBrands();
  const [shopCategories] = useGymShopCategories();
  const carouselRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [flavorFilter, setFlavorFilter] = useState("all");
  const [stockFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [settings] = useGymSettings();
  const [clients, setClients] = useGymClients();
  const [loggedInClient, setLoggedInClient] = useState<DemoClient | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFirstName, setAuthFirstName] = useState("");
  const [authLastName, setAuthLastName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(clientStorageKey);
    if (stored) {
      try {
        setLoggedInClient(JSON.parse(stored));
      } catch {
        setLoggedInClient(null);
      }
    }
  }, []);

  // Close dropdown on click outside
  const closeDropdown = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
  }, []);
  useEffect(() => {
    if (dropdownOpen) document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, [dropdownOpen, closeDropdown]);

  const handleLogout = () => {
    window.localStorage.removeItem(clientStorageKey);
    window.localStorage.removeItem("staySignedIn");
    setLoggedInClient(null);
    setDropdownOpen(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const client = clients.find(
      (c) =>
        c.email.toLowerCase() === authEmail.trim().toLowerCase() ||
        (c.username && c.username.toLowerCase() === authEmail.trim().toLowerCase())
    );

    if (!client) {
      setAuthError("Account not found. Please check your email.");
      return;
    }

    if (!client.password) {
      setAuthError("Your password is not set yet. Please check your email or contact support.");
      return;
    }

    if (client.password !== authPassword) {
      setAuthError("Incorrect password.");
      return;
    }

    window.localStorage.setItem(clientStorageKey, JSON.stringify(client));
    setLoggedInClient(client);
    setAuthModalOpen(false);
    setAuthEmail("");
    setAuthPassword("");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authFirstName.trim() || !authLastName.trim()) {
      setAuthError("First and last names are required.");
      return;
    }

    if (!authEmail.trim()) {
      setAuthError("Email is required.");
      return;
    }

    if (!authPhone.trim()) {
      setAuthError("Phone number is required.");
      return;
    }

    if (!/^[0-9]{10}$/.test(authPhone.trim())) {
      setAuthError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    const emailExists = clients.some(
      (c) => c.email.toLowerCase() === authEmail.trim().toLowerCase()
    );

    if (emailExists) {
      setAuthError("An account with this email already exists.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const fullName = `${authFirstName.trim()} ${authLastName.trim()}`;
      const nextId = getNextClientId(clients);

      const newClient: DemoClient = {
        id: nextId,
        name: fullName,
        email: authEmail.trim(),
        phone: authPhone.trim(),
        password: authPassword,
        memberSince: new Date().toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        package: {
          key: "none",
          name: "No Active Plan",
          price: 0,
          access: "None",
          status: "Pending",
          startedOn: "",
          renewsOn: "",
          paymentMethod: "",
          sessionsUsed: 0,
          sessionsTotal: 0,
          features: [],
          upcomingClasses: [],
          trainer: "",
        },
      };

      const updatedClients = [newClient, ...clients];
      setClients(updatedClients);

      window.localStorage.setItem(clientStorageKey, JSON.stringify(newClient));
      setLoggedInClient(newClient);
      setAuthSuccess("Account created successfully!");
      setIsSubmitting(false);

      setTimeout(() => {
        setAuthSuccess("");
        setAuthModalOpen(false);
        setAuthFirstName("");
        setAuthLastName("");
        setAuthEmail("");
        setAuthPhone("");
        setAuthPassword("");
        setAuthConfirmPassword("");
      }, 1500);
    }, 1000);
  };

  const adminBanners = (settings.banners || []).filter((banner): banner is Banner & { image: string } => Boolean(banner.image));
  // Infinite-loop banner carousel state.
  // Internal index offset by 1 because the track starts with a clone of the last slide.
  // Real slides occupy positions [1 … N], clones at [0] and [N+1].
  const [bannerIndex, setBannerIndex] = useState(1);
  const [bannerTransition, setBannerTransition] = useState(true);
  const bannerTrackRef = useRef<HTMLDivElement>(null);
  const bannerPausedRef = useRef(false);
  const activeBrands = brands.filter((brand) => brand.status === "Active");
  const activeProducts = products.filter((product) => {
    if (product.status !== "Active") return false;
    // If no brandKey is set, always show the product
    if (!product.brandKey) return true;
    // If a brandKey is set, the brand must exist (active or otherwise) to validate it
    const brandExists = brands.some((b) => b.key === product.brandKey);
    // If brand doesn't exist at all, still show the product (brand may not be loaded yet)
    return !brandExists || activeBrands.some((b) => b.key === product.brandKey);
  });
  const pageSize = 16;

  useEffect(() => {
    const storedCart = window.localStorage.getItem(SHOP_CART_STORAGE_KEY);
    if (!storedCart) return;

    try {
      const savedCart = JSON.parse(storedCart) as CartItem[];
      const normalizedCart = savedCart.map((item) => {
        const matchingProduct = products.find((product) =>
          getProductId(product) === getProductId(item.product) || product.name === item.product.name
        );
        return matchingProduct ? { ...item, product: matchingProduct } : item;
      });
      setCart(normalizedCart);
      window.localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(normalizedCart));
    } catch {
      setCart([]);
    }
  }, [products]);

  useEffect(() => {
    const storedWishlist = window.localStorage.getItem(SHOP_WISHLIST_STORAGE_KEY);
    if (!storedWishlist) return;

    try {
      const savedWishlist = JSON.parse(storedWishlist);
      if (Array.isArray(savedWishlist) && savedWishlist.every((item) => typeof item === "string")) {
        // Wishlist entries saved before product IDs were introduced used names.
        const normalizedWishlist = Array.from(new Set(savedWishlist.map((item) => {
          const matchingProduct = products.find((product) => getProductId(product) === item || product.name === item);
          return matchingProduct ? getProductId(matchingProduct) : item;
        })));
        setWishlist(normalizedWishlist);
        window.localStorage.setItem(SHOP_WISHLIST_STORAGE_KEY, JSON.stringify(normalizedWishlist));
      }
    } catch {
      setWishlist([]);
    }
  }, [products]);

  useEffect(() => {
    const brand = searchParams.get("brand");
    if (brand) {
      setSelectedBrand(brand);
    }
  }, [searchParams]);

  const saveCartToStorage = (nextCart: CartItem[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(nextCart));
  };

  const toggleWishlist = (product: Product) => {
    const productId = getProductId(product);
    const nextWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    window.localStorage.setItem(SHOP_WISHLIST_STORAGE_KEY, JSON.stringify(nextWishlist));
    setWishlist(nextWishlist);
  };


  const getNumericPrice = (product: Product) =>
    Number(String(product.price).replace(/[^\d.]/g, "")) || 0;

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + getNumericPrice(item.product) * item.quantity,
    0
  );
  const wishlistProducts = wishlist
    .map((id) => products.find((product) => getProductId(product) === id))
    .filter((product): product is Product => Boolean(product));

  const updateQuantity = (product: Product, quantity: number) => {
    const maxStock = Number(product.stock) || 0;
    const nextQuantity = Math.max(0, Math.min(quantity, maxStock));

    const productId = getProductId(product);
    const updatedCart = nextQuantity === 0
        ? cart.filter((item) => getProductId(item.product) !== productId)
        : cart.some((item) => getProductId(item.product) === productId)
        ? cart.map((item) =>
            getProductId(item.product) === productId
              ? { ...item, quantity: nextQuantity }
              : item
          )
        : [...cart, { product, quantity: nextQuantity }];

    saveCartToStorage(updatedCart);
    setCart(updatedCart);
  };

  const getCartQuantity = (product: Product) =>
    cart.find((item) => getProductId(item.product) === getProductId(product))?.quantity ?? 0;

  const getBrandName = (product: Product) =>
    product.brandName || activeBrands.find((brand) => brand.key === product.brandKey)?.name || "Unassigned Brand";

  const flavors = Array.from(new Set(activeProducts.map((product) => product.flavor).filter(Boolean)));

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim() && productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filteredProducts = activeProducts.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    const stock = Number(product.stock) || 0;
    const price = getNumericPrice(product);

    if (query) {
      const terms = query.split(/\s+/).filter(Boolean);
      const brandName = getBrandName(product).toLowerCase();
      const productName = (product.name || "").toLowerCase();
      const category = (product.category || "").toLowerCase();
      const flavor = (product.flavor || "").toLowerCase();
      const size = (product.size || "").toLowerCase();
      const description = (product.description || "").toLowerCase();
      const searchable = `${productName} ${brandName} ${product.brandKey || ""} ${category} ${flavor} ${size} ${description}`;

      const matchesSearch = terms.every((term) => searchable.includes(term));
      if (!matchesSearch) return false;
    }

    if (selectedBrand !== "all" && product.brandKey !== selectedBrand) return false;
    if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
    if (flavorFilter !== "all" && product.flavor !== flavorFilter) return false;
    if (stockFilter === "in-stock" && stock <= 0) return false;
    if (stockFilter === "out-of-stock" && stock > 0) return false;
    if (priceFilter === "under-3000" && price >= 3000) return false;
    if (priceFilter === "3000-6000" && (price < 3000 || price > 6000)) return false;
    if (priceFilter === "over-6000" && price <= 6000) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [selectedBrand, searchQuery, categoryFilter, priceFilter, flavorFilter, stockFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };
  // Sort categories by order field
  const sortedCategories = [...shopCategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Auto-scroll the category carousel with infinite rotation
  useEffect(() => {
    const rail = carouselRef.current;
    if (!rail || sortedCategories.length < 5) return;
    let paused = false;
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    rail.addEventListener("mouseenter", onEnter);
    rail.addEventListener("mouseleave", onLeave);
    const id = setInterval(() => {
      if (paused || !rail) return;
      
      const N = sortedCategories.length;
      if (rail.children.length < 3 * N) return;
      
      const firstChild = rail.children[0] as HTMLElement;
      const duplicateFirstChild = rail.children[N] as HTMLElement;
      if (!firstChild || !duplicateFirstChild) return;
      
      const setWidth = duplicateFirstChild.offsetLeft - firstChild.offsetLeft;
      if (setWidth <= 0) return;
      
      // Smooth continuous scrolling
      rail.scrollLeft += 0.8;
      
      // Seamless infinite scroll - reset by subtracting setWidth when reaching the second set
      if (rail.scrollLeft >= setWidth) {
        rail.scrollLeft -= setWidth;
      }
    }, 16);
    return () => {
      clearInterval(id);
      rail.removeEventListener("mouseenter", onEnter);
      rail.removeEventListener("mouseleave", onLeave);
    };
  }, [sortedCategories.length]);

  // After a CSS transition lands on a clone, silently jump to the real slide.
  const handleBannerTransitionEnd = () => {
    const n = adminBanners.length;
    if (n < 2) return;
    if (bannerIndex === 0) {
      // Landed on clone-of-last → jump to real last slide (no animation)
      setBannerTransition(false);
      setBannerIndex(n);
    } else if (bannerIndex === n + 1) {
      // Landed on clone-of-first → jump to real first slide (no animation)
      setBannerTransition(false);
      setBannerIndex(1);
    }
  };

  // Re-enable transition on the next frame after a silent jump.
  useEffect(() => {
    if (!bannerTransition) {
      const id = requestAnimationFrame(() => setBannerTransition(true));
      return () => cancelAnimationFrame(id);
    }
  }, [bannerTransition]);

  // Auto-advance every 4 s, respects hover-pause.
  useEffect(() => {
    if (adminBanners.length < 2) return;
    const id = setInterval(() => {
      if (!bannerPausedRef.current) {
        setBannerTransition(true);
        setBannerIndex((prev) => prev + 1);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [adminBanners.length]);

  // Real slide index (0-based) for dot highlighting.
  const realBannerIndex = adminBanners.length
    ? ((bannerIndex - 1 + adminBanners.length) % adminBanners.length)
    : 0;

  const goToSlide = (index: number) => {
    setBannerTransition(true);
    setBannerIndex(index + 1);
  };

  const goToPrevious = () => {
    setBannerTransition(true);
    setBannerIndex((prev) => prev - 1);
  };

  const goToNext = () => {
    setBannerTransition(true);
    setBannerIndex((prev) => prev + 1);
  };

  const handleCategoryClick = (category: string) => {
    setCategoryFilter((prev) => (prev === category ? "all" : category));
    // Scroll to products grid
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };


  return (
    <section className="shopPage">
      <header className="shopStorefrontHeader">
        <div className="shopDeliveryStrip">
          <span>Fast, Reliable, and Affordable Delivery Across Nepal</span>
          
        </div>

        <div className="shopMainHeader">
          <button
            type="button"
            className="shopBackButton"
            onClick={() => router.push("/")}
            aria-label="Back to gym website"
          >
            <FaChevronLeft />
          </button>
          <Link className="shopLogo" href="/shop" aria-label="FitnessHealth home">
            <span>FITNESS</span>
            <strong>Health</strong>
          </Link>

          <form className="shopSearchBar" onSubmit={handleSearchSubmit} role="search">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products, brands..."
              aria-label="Search products and brands"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#a1a1aa",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 6px",
                  fontSize: "14px",
                }}
              >
                <FaXmark />
              </button>
            )}
            <button type="submit" aria-label="Search products">
              <FaMagnifyingGlass />
            </button>
          </form>

          <div className="shopHeaderActions">
            {loggedInClient ? (
              <div className="shopUserDropdownContainer" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={`shopUserBtn${dropdownOpen ? " active" : ""}`}
                  aria-label="Account menu"
                  title={loggedInClient.name}
                >
                  <span className="shopUserAvatar">
                    {loggedInClient.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="shopUserNavName">{loggedInClient.name.split(" ")[0]}</span>
                </button>
                {dropdownOpen && (
                  <div className="shopUserDropdownMenu">
                    {/* User info header */}
                    <div className="shopDropdownUserHeader">
                      <span className="shopDropdownAvatar">
                        {loggedInClient.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="shopDropdownUserInfo">
                        <strong>{loggedInClient.name}</strong>
                        <span>{loggedInClient.email}</span>
                        <span className="shopDropdownBadge">{loggedInClient.package?.name || "No Active Plan"}</span>
                      </div>
                    </div>
                    <hr className="shopDropdownDivider" />
                    <Link href="/shop-portal" className="shopDropdownLink" onClick={() => setDropdownOpen(false)}>
                      <FaShieldHalved /> My Portal
                    </Link>
                    <Link href="/cart" className="shopDropdownLink" onClick={() => setDropdownOpen(false)}>
                      <FaBagShopping /> My Cart
                    </Link>
                    <hr className="shopDropdownDivider" />
                    <button type="button" className="shopDropdownLogout" onClick={handleLogout}>
                      <FaArrowRightFromBracket /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="shopSignInBtn"
                onClick={() => { setAuthMode("login"); setAuthError(""); setAuthModalOpen(true); }}
                aria-label="Sign in to your account"
                title="Sign In / Register"
              >
                <FaUser />
              </button>
            )}
            <button
              type="button"
              onClick={() => setWishlistOpen(true)}
              aria-label={`View wishlist, ${wishlist.length} items`}
              title="View wishlist"
            >
              <FaHeart />
              <span>{wishlist.length}</span>
            </button>
            <button type="button" onClick={() => router.push("/cart")} aria-label={`View cart, ${cartCount} items`}>
              <FaBagShopping />
              <span>{cartCount}</span>
            </button>
            <strong>{formatCurrency(cartTotal)}</strong>
          </div>
        </div>

        <nav className="shopNavBar" aria-label="Shop navigation">
          <a href="#shop-categories">Shop By Category</a>
          <Link href="/shop/brands">Brands</Link>
          <Link href="/blog">Blogs</Link>
          <Link href="/contact">Customer Support</Link>
        </nav>
      </header>

      <div
        className="shopCategoryRail"
        id="shop-categories"
        aria-label="Shop by category"
        ref={carouselRef}
        style={{
          justifyContent: sortedCategories.length < 5 ? "center" : "start"
        }}
      >
        {sortedCategories.map((cat) => (
          <button
            type="button"
            key={`${cat.label}-${cat.category}`}
            className={categoryFilter === cat.category ? "shopCategoryCard active" : "shopCategoryCard"}
            onClick={() => handleCategoryClick(cat.category)}
            aria-label={`Filter by ${cat.label}`}
          >
            <span>
              <Image src={cat.image} alt={cat.label} width={130} height={110} unoptimized />
            </span>
            <strong>{cat.label}</strong>
          </button>
        ))}
        {/* Duplicate categories for seamless infinite loop */}
        {sortedCategories.length >= 5 && sortedCategories.map((cat) => (
          <button
            type="button"
            key={`${cat.label}-${cat.category}-duplicate`}
            className={categoryFilter === cat.category ? "shopCategoryCard active" : "shopCategoryCard"}
            onClick={() => handleCategoryClick(cat.category)}
            aria-label={`Filter by ${cat.label}`}
          >
            <span>
              <Image src={cat.image} alt={cat.label} width={130} height={110} unoptimized />
            </span>
            <strong>{cat.label}</strong>
          </button>
        ))}
        {/* Triplicate categories for seamless infinite loop on wide screens */}
        {sortedCategories.length >= 5 && sortedCategories.map((cat) => (
          <button
            type="button"
            key={`${cat.label}-${cat.category}-triplicate`}
            className={categoryFilter === cat.category ? "shopCategoryCard active" : "shopCategoryCard"}
            onClick={() => handleCategoryClick(cat.category)}
            aria-label={`Filter by ${cat.label}`}
          >
            <span>
              <Image src={cat.image} alt={cat.label} width={130} height={110} unoptimized />
            </span>
            <strong>{cat.label}</strong>
          </button>
        ))}
      </div>

      <section className={adminBanners.length > 0 ? "shopPromoHero shopBannerCarousel" : "shopPromoHero"} aria-label={adminBanners.length > 0 ? "Shop promotions" : "FitnessHealth deal"}>
        {adminBanners.length > 0 ? (
          <div
            className="shopBannerViewport"
            onMouseEnter={() => { bannerPausedRef.current = true; }}
            onMouseLeave={() => { bannerPausedRef.current = false; }}
          >
            {/* Track: [clone-last] [slide-0] … [slide-N-1] [clone-first] */}
            <div
              ref={bannerTrackRef}
              className="shopBannerTrack"
              style={{
                transform: `translateX(-${bannerIndex * 100}%)`,
                transition: bannerTransition ? "transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
              }}
              onTransitionEnd={handleBannerTransitionEnd}
            >
              {/* Clone of last slide */}
              {adminBanners.length > 0 && (() => {
                const banner = adminBanners[adminBanners.length - 1];
                return (
                  <div
                    key="clone-last"
                    className="shopBannerSlide"
                    style={{ backgroundImage: `url(${banner.image})` }}
                    aria-hidden="true"
                  >
                    <div className="shopBannerOverlay">
                      <div className="shopBannerCopy">
                        {banner.title && <span>{banner.title}</span>}
                        {banner.subtitle && <h1>{banner.subtitle}</h1>}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Real slides */}
              {adminBanners.map((banner, index) => (
                <div
                  key={index}
                  className="shopBannerSlide"
                  style={{ backgroundImage: `url(${banner.image})` }}
                  role={banner.link ? "link" : undefined}
                  tabIndex={banner.link ? 0 : undefined}
                  onClick={() => { if (banner.link) router.push(banner.link); }}
                  onKeyDown={(e) => {
                    if (banner.link && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      router.push(banner.link);
                    }
                  }}
                >
                  <div className="shopBannerOverlay">
                    <div className="shopBannerCopy">
                      {banner.title && <span>{banner.title}</span>}
                      {banner.subtitle && <h1>{banner.subtitle}</h1>}
                    </div>
                  </div>
                </div>
              ))}

              {/* Clone of first slide */}
              {adminBanners.length > 0 && (() => {
                const banner = adminBanners[0];
                return (
                  <div
                    key="clone-first"
                    className="shopBannerSlide"
                    style={{ backgroundImage: `url(${banner.image})` }}
                    aria-hidden="true"
                  >
                    <div className="shopBannerOverlay">
                      <div className="shopBannerCopy">
                        {banner.title && <span>{banner.title}</span>}
                        {banner.subtitle && <h1>{banner.subtitle}</h1>}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <button type="button" className="shopBannerNav shopBannerPrev" aria-label="Previous banner" onClick={goToPrevious}>
              <FaChevronLeft />
            </button>
            <button type="button" className="shopBannerNav shopBannerNext" aria-label="Next banner" onClick={goToNext}>
              <FaChevronRight />
            </button>
            <div className="shopBannerDots" aria-hidden="true">
              {adminBanners.map((_, index) => (
                <span
                  key={index}
                  className={index === realBannerIndex ? "active" : ""}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <button type="button" aria-label="Previous promotion">
              <FaChevronLeft />
            </button>
            <div className="shopPromoCopy">
              <span>FitnessHealth Foods</span>
              <h1>Nepali Superfoods Redesign</h1>
              <p>Where nature meets nutrition</p>
            </div>
            <div className="shopPromoProducts">
              <Image src="/images/kettlebell.jpg" alt="FitnessHealth protein jar" width={210} height={260} unoptimized />
              <Image src="/images/strength-training.jpg" alt="FitnessHealth supplement bottle" width={210} height={260} unoptimized />
              <Image src="/images/crossfit-weights.jpg" alt="FitnessHealth recovery blend" width={210} height={260} unoptimized />
            </div>
            <div className="shopPromoDeal">
              <span>Up To</span>
              <strong>10%<br />Off</strong>
              <small>FitnessHealth Deal</small>
            </div>
            <button type="button" aria-label="Next promotion">
              <FaChevronRight />
            </button>
            <div className="shopPromoDots" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, index) => (
                <span key={index} className={index === 6 ? "active" : ""} />
              ))}
            </div>
          </>
        )}
      </section>

      <div className="shopLayout">
        <div className="shopGridWrapper" ref={productsRef}>
          <div className="shopGridToolbar">
            <span className="shopGridCount">{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}</span>
            <div className="shopFilterTriggerWrap">
              <button
                type="button"
                className={`shopFilterTrigger${filterOpen ? " active" : ""}${(selectedBrand !== "all" || priceFilter !== "all" || flavorFilter !== "all") ? " hasActive" : ""}`}
                onClick={() => setFilterOpen((v) => !v)}
                aria-label="Toggle filters"
                aria-expanded={filterOpen}
              >
                <FaFilter />
                {(selectedBrand !== "all" || priceFilter !== "all" || flavorFilter !== "all") && (
                  <span className="shopFilterBadge" />
                )}
              </button>
              {filterOpen && (
                <div className="shopFilterDropdown" role="dialog" aria-label="Product filters">
                  <div className="shopFilterDropdownHeader">
                    <span>Filters</span>
                    <button type="button" onClick={() => { setSelectedBrand("all"); setPriceFilter("all"); setFlavorFilter("all"); }} className="shopFilterClear">Clear all</button>
                  </div>
                  <label className="shopFilterLabel">
                    <span>Brand</span>
                    <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                      <option value="all">All brands ({activeProducts.length})</option>
                      {activeBrands.map((brand) => {
                        const count = activeProducts.filter((product) => product.brandKey === brand.key).length;
                        return (
                          <option key={brand.key} value={brand.key}>
                            {brand.name} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="shopFilterLabel">
                    <span>Price Range</span>
                    <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                      <option value="all">All prices</option>
                      <option value="under-3000">Under Rs 3,000</option>
                      <option value="3000-6000">Rs 3,000 – Rs 6,000</option>
                      <option value="over-6000">Over Rs 6,000</option>
                    </select>
                  </label>
                  <label className="shopFilterLabel">
                    <span>Flavor</span>
                    <select value={flavorFilter} onChange={(e) => setFlavorFilter(e.target.value)}>
                      <option value="all">All flavors</option>
                      {flavors.map((flavor) => (
                        <option key={flavor} value={flavor}>{flavor}</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="shopFilterApply" onClick={() => setFilterOpen(false)}>Apply</button>
                </div>
              )}
            </div>
          </div>

        <div className="shopGrid" aria-label="Shop products">
          {visibleProducts.map((product, index) => {
            const quantity = getCartQuantity(product);
            const stock = Number(product.stock) || 0;
            const outOfStock = stock <= 0;
            const isWishlisted = wishlist.includes(getProductId(product));

            // Calculate product average rating from reviews
            const prodReviews = reviews.filter((r) => {
              if (!r.product) return false;
              const pName = product.name.toLowerCase();
              const rName = r.product.toLowerCase();
              return rName === pName || (product.id && rName === product.id.toLowerCase());
            });

            let avgRatingNum = parseFloat(product.rating || "4.5") || 4.5;
            if (prodReviews.length > 0) {
              const sum = prodReviews.reduce((acc, r) => {
                let num = 5;
                if (r.rating) {
                  if (r.rating.includes("★")) num = r.rating.length;
                  else {
                    const p = parseFloat(r.rating);
                    if (!isNaN(p)) num = p;
                  }
                }
                return acc + num;
              }, 0);
              avgRatingNum = sum / prodReviews.length;
            }
            const formattedRating = avgRatingNum.toFixed(1);
            const productDetailUrl = `/shop/${encodeURIComponent(getProductId(product))}`;

            return (
              <article className="shopProductCard" key={getProductId(product)}>
                <div className="shopProductHoverActions">
                  <button
                    type="button"
                    onClick={() => router.push(productDetailUrl)}
                    aria-label={`View details for ${product.name}`}
                    title="View details"
                  >
                    <FaEye />
                  </button>
                  <button
                    type="button"
                    className={isWishlisted ? "active" : ""}
                    onClick={() => toggleWishlist(product)}
                    aria-label={`${isWishlisted ? "Remove" : "Add"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist`}
                    aria-pressed={isWishlisted}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <FaHeart />
                  </button>
                </div>

                <Link href={productDetailUrl} className="shopProductImageLink">
                  <Image
                    src={getProductImage(product, index)}
                    alt={product.name}
                    width={350}
                    height={200}
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    unoptimized
                  />
                </Link>

                <div className="shopProductBody">
                  <div className="shopProductHeaderRow">
                    <span className="shopProductCategory">{product.category}</span>
                    <div className="shopProductStarBadge" title={`${formattedRating} rating (${prodReviews.length} reviews)`}>
                      <FaStar className="starIcon" />
                      <strong>{formattedRating}</strong>
                      {prodReviews.length > 0 && <small>({prodReviews.length})</small>}
                    </div>
                  </div>

                  <h2 className="shopProductTitle">
                    <Link href={productDetailUrl}>{product.name}</Link>
                  </h2>

                  <dl className="shopProductSpecs">
                    <div><dt>Flavor</dt><dd>{product.flavor || "Original"}</dd></div>
                    <div><dt>Size</dt><dd>{product.size || "Standard"}</dd></div>
                  </dl>

                  <div className="shopProductMeta">
                    <strong>{formatCurrency(product.price)}</strong>
                    <small className={outOfStock ? "out" : "in"}>{outOfStock ? "Out of stock" : `${stock} in stock`}</small>
                  </div>

                  {quantity > 0 ? (
                    <div className="shopStepper" aria-label={`${product.name} quantity`}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product, quantity - 1)}
                        aria-label={`Remove one ${product.name}`}
                      >
                        <FaMinus />
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product, quantity + 1)}
                        disabled={quantity >= stock}
                        aria-label={`Add one ${product.name}`}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  ) : (
                    <div className="shopProductActions">
                      <button
                        type="button"
                        className="shopAddButton"
                        onClick={() => updateQuantity(product, 1)}
                        disabled={outOfStock}
                      >
                        <FaCartShopping /> {outOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          {visibleProducts.length === 0 && (
            <div className="shopEmptyState">
              <strong>No products found</strong>
              <span>Try changing the selected brand, search, or filters.</span>
            </div>
          )}
        </div>
        </div>
      </div>

      <div className="shopPagination" aria-label="Product pagination">
        <button type="button" onClick={() => handlePageChange(Math.max(1, page - 1))} disabled={page === 1}>
          <FaChevronLeft /> Prev
        </button>
        <div className="shopPageNumbers">
          {(() => {
            const pages: (number | "…")[] = [];
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              if (page > 3) pages.push("…");
              const start = Math.max(2, page - 1);
              const end = Math.min(totalPages - 1, page + 1);
              for (let i = start; i <= end; i++) pages.push(i);
              if (page < totalPages - 2) pages.push("…");
              pages.push(totalPages);
            }
            return pages.map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="shopPageEllipsis">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={p === page ? "shopPageBtn active" : "shopPageBtn"}
                  onClick={() => handlePageChange(p as number)}
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`Page ${p}`}
                >
                  {p}
                </button>
              )
            );
          })()}
        </div>
        <button type="button" onClick={() => handlePageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
          Next <FaChevronRight />
        </button>
      </div>

      {detailProduct && (
        <div className="shopDetailOverlay" role="dialog" aria-modal="true" aria-label={`${detailProduct.name} details`}>
          <article className="shopDetailModal">
            <button type="button" className="shopDetailClose" onClick={() => setDetailProduct(null)} aria-label="Close product details">
              <FaXmark />
            </button>
            <Image
              src={getProductImage(detailProduct, 0)}
              alt={detailProduct.name}
              width={420}
              height={280}
              style={{ objectFit: "contain", width: "100%", height: "100%", maxHeight: "320px", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}
              unoptimized
            />
            <div>
              <span>{detailProduct.category}</span>
              <h2>{detailProduct.name}</h2>
              <p>{detailProduct.description || "Available for pickup at Fitness Bhaktapur."}</p>
              <dl className="shopProductSpecs">
                <div><dt>Brand</dt><dd>{getBrandName(detailProduct)}</dd></div>
                <div><dt>Flavor</dt><dd>{detailProduct.flavor || "Original"}</dd></div>
                <div><dt>Size</dt><dd>{detailProduct.size || "Standard"}</dd></div>
                <div><dt>Rating</dt><dd><FaStar /> {detailProduct.rating || "4.5"}</dd></div>
              </dl>
              <div className="shopProductMeta">
                <strong>{formatCurrency(detailProduct.price)}</strong>
                <small>{Number(detailProduct.stock) > 0 ? `${detailProduct.stock} in stock` : "Out of stock"}</small>
              </div>
              <button
                type="button"
                className="shopAddButton"
                onClick={() => updateQuantity(detailProduct, getCartQuantity(detailProduct) + 1)}
                disabled={(Number(detailProduct.stock) || 0) <= 0}
              >
                <FaCartShopping /> Add to Cart
              </button>
            </div>
          </article>
        </div>
      )}

      {wishlistOpen && (
        <div className="shopDetailOverlay" role="dialog" aria-modal="true" aria-label="Wishlist">
          <article className="shopWishlistModal">
            <button type="button" className="shopDetailClose" onClick={() => setWishlistOpen(false)} aria-label="Close wishlist">
              <FaXmark />
            </button>
            <h2>My Wishlist</h2>
            {wishlistProducts.length > 0 ? (
              <div className="shopWishlistItems">
                {wishlistProducts.map((product, index) => (
                  <article className="shopWishlistItem" key={getProductId(product)}>
                    <Image src={getProductImage(product, index)} alt={product.name} width={84} height={70} style={{ objectFit: "contain", background: "#f8fafc", padding: "4px", borderRadius: "6px" }} unoptimized />
                    <div>
                      <strong>{product.name}</strong>
                      <span>{formatCurrency(product.price)}</span>
                    </div>
                    <button type="button" onClick={() => toggleWishlist(product)} aria-label={`Remove ${product.name} from wishlist`}>
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <p className="shopWishlistEmpty">Your wishlist is empty. Use the heart on a product to save it here.</p>
            )}
          </article>
        </div>
      )}
      {authModalOpen && (
        <div className="shopDetailOverlay" role="dialog" aria-modal="true" aria-label="Authentication" onClick={(e) => { if (e.target === e.currentTarget) setAuthModalOpen(false); }}>
          <article className="shopAuthModal">
            <button
              type="button"
              className="shopDetailClose"
              onClick={() => setAuthModalOpen(false)}
              aria-label="Close modal"
            >
              <FaXmark />
            </button>

            <div className="shopAuthModalHeader">
              <span className="shopAuthModalIcon"><FaUser /></span>
              <h2>{authMode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p>{authMode === "login" ? "Sign in to access your membership & cart." : "Join Fitness Bhaktapur today."}</p>
            </div>

            {authSuccess ? (
              <div className="shopAuthSuccess">
                <p className="shopAuthSuccessTitle">{authSuccess}</p>
                <p className="shopAuthSuccessSub">Logging you in…</p>
              </div>
            ) : (
              <form onSubmit={authMode === "login" ? handleLoginSubmit : handleRegisterSubmit} autoComplete="on" className="shopAuthForm">
                {authMode === "register" && (
                  <div className="shopAuthFieldRow">
                    <div className="shopAuthField">
                      <label htmlFor="authFirstName">First Name *</label>
                      <input
                        id="authFirstName"
                        type="text"
                        value={authFirstName}
                        onChange={(e) => setAuthFirstName(e.target.value)}
                        required
                        autoComplete="given-name"
                        placeholder="First name"
                      />
                    </div>
                    <div className="shopAuthField">
                      <label htmlFor="authLastName">Last Name *</label>
                      <input
                        id="authLastName"
                        type="text"
                        value={authLastName}
                        onChange={(e) => setAuthLastName(e.target.value)}
                        required
                        autoComplete="family-name"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                )}

                <div className="shopAuthField">
                  <label htmlFor="authEmail">Email Address *</label>
                  <input
                    id="authEmail"
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                  />
                </div>

                {authMode === "register" && (
                  <div className="shopAuthField">
                    <label htmlFor="authPhone">Phone Number *</label>
                    <input
                      id="authPhone"
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      required
                      maxLength={10}
                      autoComplete="tel"
                      placeholder="10-digit phone number"
                    />
                  </div>
                )}

                <div className="shopAuthField">
                  <label htmlFor="authPassword">Password *</label>
                  <div className="shopAuthPasswordWrap">
                    <input
                      id="authPassword"
                      type={showPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      autoComplete={authMode === "login" ? "current-password" : "new-password"}
                      placeholder={authMode === "login" ? "Your password" : "Min. 6 characters"}
                    />
                    <button type="button" className="shopAuthEyeBtn" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {authMode === "register" && (
                  <div className="shopAuthField">
                    <label htmlFor="authConfirmPassword">Confirm Password *</label>
                    <div className="shopAuthPasswordWrap">
                      <input
                        id="authConfirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        placeholder="Repeat password"
                      />
                      <button type="button" className="shopAuthEyeBtn" onClick={() => setShowConfirmPassword((v) => !v)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                )}

                {authError && (
                  <p className="shopAuthError">{authError}</p>
                )}

                <button type="submit" disabled={isSubmitting} className="shopAuthSubmitBtn">
                  {isSubmitting ? (
                    <><FaSpinner className="shopAuthSpinner" /> Processing…</>
                  ) : authMode === "login" ? (
                    <><FaUser /> Sign In</>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="shopAuthSwitch">
                  {authMode === "login" ? (
                    <p>Don&apos;t have an account?{" "}
                      <button type="button" onClick={() => { setAuthMode("register"); setAuthError(""); setShowPassword(false); }}>
                        Sign Up
                      </button>
                    </p>
                  ) : (
                    <p>Already have an account?{" "}
                      <button type="button" onClick={() => { setAuthMode("login"); setAuthError(""); setShowPassword(false); setShowConfirmPassword(false); }}>
                        Sign In
                      </button>
                    </p>
                  )}
                </div>
              </form>
            )}
          </article>
        </div>
      )}
    </section>
  );
}

