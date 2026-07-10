"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaBagShopping,
  FaCartShopping,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaEye,
  FaHeart,
  FaMagnifyingGlass,
  FaMinus,
  FaPlus,
  FaStar,
  FaUser,
  FaXmark,
} from "react-icons/fa6";
import Image from "next/image";
import {
  useGymProducts,
  useGymBrands,
  useGymShopCategories,
  type Product,
} from "../data/gymData";
import { formatCurrency } from "../data/currency";

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

const SHOP_CART_STORAGE_KEY = "fitness-shop-cart";

export default function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products] = useGymProducts();
  const [brands] = useGymBrands();
  const [shopCategories] = useGymShopCategories();
  const carouselRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(shopCategories[0]?.category || "Protein");
  const [priceFilter, setPriceFilter] = useState("all");
  const [flavorFilter, setFlavorFilter] = useState("all");
  const [stockFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
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
  const pageSize = 6;

  useEffect(() => {
    const storedCart = window.localStorage.getItem(SHOP_CART_STORAGE_KEY);
    if (!storedCart) return;

    try {
      setCart(JSON.parse(storedCart) as CartItem[]);
    } catch {
      setCart([]);
    }
  }, []);

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


  const getNumericPrice = (product: Product) =>
    Number(String(product.price).replace(/[^\d.]/g, "")) || 0;

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + getNumericPrice(item.product) * item.quantity,
    0
  );

  const updateQuantity = (product: Product, quantity: number) => {
    const maxStock = Number(product.stock) || 0;
    const nextQuantity = Math.max(0, Math.min(quantity, maxStock));

    setCart((current) => {
      const updatedCart = nextQuantity === 0
        ? current.filter((item) => item.product.name !== product.name)
        : current.some((item) => item.product.name === product.name)
        ? current.map((item) =>
            item.product.name === product.name
              ? { ...item, quantity: nextQuantity }
              : item
          )
        : [...current, { product, quantity: nextQuantity }];

      saveCartToStorage(updatedCart);
      return updatedCart;
    });
  };

  const getCartQuantity = (product: Product) =>
    cart.find((item) => item.product.name === product.name)?.quantity ?? 0;

  const getBrandName = (product: Product) =>
    product.brandName || activeBrands.find((brand) => brand.key === product.brandKey)?.name || "Unassigned Brand";

  const flavors = Array.from(new Set(activeProducts.map((product) => product.flavor).filter(Boolean)));

  const filteredProducts = activeProducts.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    const stock = Number(product.stock) || 0;
    const price = getNumericPrice(product);
    const searchable = [
      product.name,
      getBrandName(product),
      product.category,
      product.flavor,
      product.size,
    ].join(" ").toLowerCase();

    if (selectedBrand !== "all" && product.brandKey !== selectedBrand) return false;
    if (query && !searchable.includes(query)) return false;
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

  const handleCategoryClick = (category: string) => {
    setCategoryFilter(category);
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
          <a className="shopLogo" href="/shop" aria-label="FitnessHealth home">
            <span>FITNESS</span>
            <strong>Health</strong>
          </a>

          <label className="shopSearchBar">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search for products"
            />
            <button type="button" aria-label="Search products">
              <FaMagnifyingGlass />
            </button>
          </label>

          <div className="shopHeaderActions">
            <button type="button" aria-label="Account">
              <FaUser />
            </button>
            <button type="button" aria-label="Wishlist">
              <FaHeart />
              <span>0</span>
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

      <section className="shopPromoHero" aria-label="FitnessHealth deal">
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

            return (
              <article className="shopProductCard" key={`${product.name}-${index}`}>
                <div className="shopProductHoverActions">
                  <button
                    type="button"
                    onClick={() => setDetailProduct(product)}
                    aria-label={`View details for ${product.name}`}
                    title="View details"
                  >
                    <FaEye />
                  </button>
                  <button
                    type="button"
                    aria-label={`Add ${product.name} to wishlist`}
                    title="Wishlist"
                  >
                    <FaHeart />
                  </button>
                </div>
                <Image src={getProductImage(product, index)} alt={product.name} width={350} height={250} style={{ objectFit: "cover" }} unoptimized />
                <div className="shopProductBody">
                  <span>{product.category}</span>
                  <h2>{product.name}</h2>
                  <p>{product.description || "Ready for pickup at the gym reception desk."}</p>
                  <dl className="shopProductSpecs">
                    <div><dt>Flavor</dt><dd>{product.flavor || "Original"}</dd></div>
                    <div><dt>Size</dt><dd>{product.size || "Standard"}</dd></div>
                    <div><dt>Rating</dt><dd><FaStar /> {product.rating || "4.5"}</dd></div>
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
        <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>
          <FaChevronLeft /> Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>
          Next <FaChevronRight />
        </button>
      </div>

      {detailProduct && (
        <div className="shopDetailOverlay" role="dialog" aria-modal="true" aria-label={`${detailProduct.name} details`}>
          <article className="shopDetailModal">
            <button type="button" className="shopDetailClose" onClick={() => setDetailProduct(null)} aria-label="Close product details">
              <FaXmark />
            </button>
            <Image src={getProductImage(detailProduct, 0)} alt={detailProduct.name} width={420} height={280} unoptimized />
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
    </section>
  );
}
