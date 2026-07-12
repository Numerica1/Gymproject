"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaArrowLeft, FaTrash, FaCartShopping } from "react-icons/fa6";
import { type Product, useGymOffers, useGymOrders, useGymProducts, type Offer } from "../../data/gymData";
import { formatCurrency } from "../../data/currency";

const SHOP_CART_STORAGE_KEY = "fitness-shop-cart";

type CartItem = {
  product: Product;
  quantity: number;
};

function getProductId(product: Product) {
  return product.id || product.name;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pickupAddress, setPickupAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [message, setMessage] = useState("");

  // Promo code / Offer states
  const [offers] = useGymOffers();
  const [orders, setOrders] = useGymOrders();
  const [products, setProducts] = useGymProducts();
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [showAvailableOffers, setShowAvailableOffers] = useState(false);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

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

  const saveCartToStorage = (nextCart: CartItem[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(nextCart));
  };

  const updateQuantity = (product: Product, quantity: number) => {
    const productId = getProductId(product);
    const nextCart = quantity <= 0
      ? cart.filter((item) => getProductId(item.product) !== productId)
      : cart.some((item) => getProductId(item.product) === productId)
      ? cart.map((item) =>
          getProductId(item.product) === productId ? { ...item, quantity } : item
        )
      : [...cart, { product, quantity }];

    setCart(nextCart);
    saveCartToStorage(nextCart);
  };

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + Number(item.product.price.replace(/[^0-9.]/g, "")) * item.quantity,
        0
      ),
    [cart]
  );

  const activeOffers = offers.filter((o) => o.status === "Active");

  const calculateDiscount = (price: number, offer: Offer) => {
    if (offer.type === "Percentage") {
      const pct = parseFloat(offer.discount.replace(/[^0-9.]/g, "")) || 0;
      return (price * pct) / 100;
    } else {
      const val = parseFloat(offer.discount.replace(/[^0-9.]/g, "")) || 0;
      return val;
    }
  };

  const discountAmount = appliedOffer ? calculateDiscount(cartTotal, appliedOffer) : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a promo code.");
      return;
    }

    const matchedOffer = activeOffers.find(
      (o) => o.code.toUpperCase() === code
    );

    if (!matchedOffer) {
      setPromoError("Invalid or expired promo code.");
      setPromoSuccess("");
      setAppliedOffer(null);
      return;
    }

    setAppliedOffer(matchedOffer);
    setPromoSuccess(`Promo code "${matchedOffer.code}" applied successfully!`);
    setPromoError("");
  };

  const handleRemovePromo = () => {
    setAppliedOffer(null);
    setPromoSuccess("");
    setPromoError("");
    setPromoCodeInput("");
  };

  const handlePlaceOrder = () => {
    if (!cart.length) {
      setMessage("Add at least one product to your cart.");
      return;
    }

    if (!customerName.trim()) {
      setMessage("Enter your name before placing the order.");
      return;
    }

    if (!customerEmail.trim()) {
      setMessage("Enter your email address before placing the order.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(customerEmail.trim())) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!pickupAddress.trim()) {
      setMessage("Enter pickup address.");
      return;
    }

    const orderDate = new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const orderId = `#${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      orderId,
      customer: customerName.trim(),
      items: cart
        .map((item) => `${item.product.name} x${item.quantity}`)
        .join(", "),
      total: formatCurrency(finalTotal),
      payment: "Pending",
      status: "Processing",
      date: orderDate,
      email: customerEmail.trim(),
      pickupPoint: pickupAddress.trim(),
      address: pickupAddress.trim(),
      paymentMethod: "Cash on Pickup",
    };

    // Deduct stock
    const nextProducts = products.map((product) => {
      const cartItem = cart.find((item) => getProductId(item.product) === getProductId(product));
      if (!cartItem) return product;

      const currentStock = Number(product.stock) || 0;
      return {
        ...product,
        stock: String(Math.max(0, currentStock - cartItem.quantity)),
      };
    });

    setOrders([newOrder, ...orders]);
    setProducts(nextProducts);

    setCart([]);
    saveCartToStorage([]);

    setPlacedOrderId(orderId);
    setOrderPlaced(true);
    setMessage("");
  };

  return (
    <section className="shopPage">
      <div className="shopHero">
        <div>
          <p className="eyebrow dark">Your Cart</p>
          <h1>Checkout Ready</h1>
          <p>Review your cart and complete your pickup order below.</p>
        </div>
        <Link href="/shop" className="shopHeroCart">
          <FaArrowLeft /> Back to Shop
        </Link>
      </div>

      <div className="shopLayout" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        {orderPlaced ? (
          <div className="successCard" style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            maxWidth: "550px",
            width: "100%",
            margin: "40px auto",
            color: "#111",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}>
            <div style={{ fontSize: "56px", color: "#22c55e", marginBottom: "16px" }}>✓</div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#000", marginBottom: "8px" }}>Order Placed Successfully!</h2>
            <p style={{ color: "#4b5563", lineHeight: 1.6, marginBottom: "24px", fontSize: "15px" }}>
              Thank you, <strong>{customerName}</strong>. Your order <strong>{placedOrderId}</strong> has been registered. You can pick it up at the gym reception desk.
            </p>
            <Link href="/shop" className="shopBuyButton" style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>
              Back to Shop
            </Link>
          </div>
        ) : (
          <aside className="shopCartPanel" aria-label="Shopping cart" style={{ width: "100%", maxWidth: "600px" }}>
            <div className="shopCartTitle">
              <FaCartShopping />
              <div>
                <h2>Your Cart</h2>
                <p>{cart.length} product{cart.length === 1 ? "" : "s"}</p>
              </div>
            </div>

            {cart.length ? (
              <div className="shopCartItems">
                {cart.map((item, index) => (
                  <div className="shopCartItem" key={getProductId(item.product)}>
                    <div>
                      <strong>{item.product.name}</strong>
                      <span>
                        {item.quantity} x {formatCurrency(item.product.price)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product, 0)}
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="shopEmptyCart">Your cart is empty.</p>
            )}

            {cart.length > 0 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                  <label className="shopCheckoutField">
                    <span>Name</span>
                    <input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Customer name"
                    />
                  </label>

                  <label className="shopCheckoutField">
                    <span>Email</span>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      placeholder="Email address"
                    />
                  </label>

                  <label className="shopCheckoutField">
                    <span>Pickup Address</span>
                    <input
                      value={pickupAddress}
                      onChange={(event) => setPickupAddress(event.target.value)}
                      placeholder="Enter pickup address"
                    />
                  </label>
                </div>

                {/* Promo Code Section */}
                <div className="promoSection" style={{ borderTop: "1px dashed #e5e7eb", padding: "16px 0", marginTop: "20px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "8px", color: "#374151" }}>
                    Promo / Offer Code
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      className="input"
                      style={{
                        textTransform: "uppercase",
                        padding: "10px 14px",
                        fontSize: "14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        background: "#fafafa",
                        width: "100%",
                      }}
                      value={promoCodeInput}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        setPromoError("");
                      }}
                      disabled={!!appliedOffer}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      style={{
                        background: !!appliedOffer ? "#e5e7eb" : "#ffe500",
                        color: !!appliedOffer ? "#9ca3af" : "#000",
                        fontWeight: "700",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: !!appliedOffer ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        transition: "background 0.2s"
                      }}
                      disabled={!!appliedOffer}
                    >
                      Apply
                    </button>
                  </div>

                  {promoError && <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px", fontWeight: "500" }}>{promoError}</p>}
                  {promoSuccess && <p style={{ color: "#22c55e", fontSize: "13px", marginTop: "6px", fontWeight: "500" }}>{promoSuccess}</p>}

                  {appliedOffer && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", background: "#f0fdf4", padding: "8px 12px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                      <span style={{ fontSize: "13px", color: "#166534", fontWeight: "600" }}>
                        Code Applied: {appliedOffer.code} ({appliedOffer.discount} Off)
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        style={{ background: "transparent", border: "none", color: "#ef4444", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Accordion for Available Offers */}
                  <div style={{ marginTop: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setShowAvailableOffers(!showAvailableOffers)}
                      style={{ background: "transparent", border: "none", color: "#2563eb", fontSize: "13px", cursor: "pointer", padding: "0", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      {showAvailableOffers ? "Hide Available Offers" : "View Available Offers"}
                    </button>
                    {showAvailableOffers && (
                      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "8px 12px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {activeOffers.length === 0 ? (
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>No active offers at the moment.</span>
                        ) : (
                          activeOffers.map((o) => (
                            <button
                              key={o.code}
                              type="button"
                              onClick={() => {
                                if (!appliedOffer) {
                                  setPromoCodeInput(o.code);
                                  // Auto-apply code
                                  const matchedOffer = activeOffers.find((x) => x.code === o.code);
                                  if (matchedOffer) {
                                    setAppliedOffer(matchedOffer);
                                    setPromoSuccess(`Promo code "${matchedOffer.code}" applied successfully!`);
                                    setPromoError("");
                                  }
                                }
                              }}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "12px",
                                background: hoveredCode === o.code ? "#e5e7eb" : "none",
                                border: "none",
                                padding: "6px 8px",
                                width: "100%",
                                cursor: !!appliedOffer ? "not-allowed" : "pointer",
                                textAlign: "left",
                                borderRadius: "4px",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={() => setHoveredCode(o.code)}
                              onMouseLeave={() => setHoveredCode(null)}
                              disabled={!!appliedOffer}
                            >
                              <div>
                                <span style={{ fontWeight: "700", color: "#2563eb", textDecoration: "underline" }}>{o.code}</span>
                                <span style={{ color: "#4b5563", marginLeft: "6px" }}>({o.name})</span>
                              </div>
                              <span style={{ color: "#166534", fontWeight: "700" }}>{o.discount} Off</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed #e5e7eb", marginTop: "20px", paddingTop: "10px" }}>
                  <div className="shopCartTotal" style={{ margin: "5px 0" }}>
                    <span style={{ color: "#4b5563" }}>Subtotal</span>
                    <strong>{formatCurrency(cartTotal, { decimals: 2 })}</strong>
                  </div>

                  {appliedOffer && (
                    <div className="shopCartTotal" style={{ margin: "5px 0", color: "#166534" }}>
                      <span>Discount ({appliedOffer.code})</span>
                      <strong>-{formatCurrency(discountAmount, { decimals: 2 })}</strong>
                    </div>
                  )}

                  <div className="shopCartTotal" style={{ borderTop: "1px solid #e5e7eb", marginTop: "10px", paddingTop: "10px" }}>
                    <span>Total</span>
                    <strong style={{ fontSize: "20px", color: "#000" }}>{formatCurrency(finalTotal, { decimals: 2 })}</strong>
                  </div>
                </div>

                {message && <p className="shopMessage" style={{ color: "#ef4444", fontSize: "13px", fontWeight: "500", marginTop: "10px" }}>{message}</p>}

                <button
                  type="button"
                  className="shopBuyButton"
                  onClick={handlePlaceOrder}
                  style={{ marginTop: "20px" }}
                >
                  Place Pickup Order
                </button>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}
