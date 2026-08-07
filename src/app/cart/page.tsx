"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaArrowLeft,
  FaTrash,
  FaCartShopping,
  FaChevronRight,
  FaShieldHalved,
  FaLock,
  FaRotateLeft,
  FaHeart,
  FaMinus,
  FaPlus,
  FaCircleInfo,
  FaTicket,
  FaStore,
  FaCreditCard,
  FaMoneyBillWave,
  FaBuildingColumns,
  FaQrcode,
  FaMobileScreenButton,
  FaCircleCheck,
  FaWallet,
} from "react-icons/fa6";
import {
  type Product,
  useGymOffers,
  useGymOrders,
  useGymProducts,
  type Offer,
} from "../../data/gymData";
import { formatCurrency } from "../../data/currency";

const SHOP_CART_STORAGE_KEY = "fitness-shop-cart";

type CartItem = {
  product: Product;
  quantity: number;
};

function getProductId(product: Product) {
  return product.id || product.name;
}

const productImages = [
  "/images/kettlebell.jpg",
  "/images/equipment-row.jpg",
  "/images/strength-training.jpg",
  "/images/crossfit-weights.jpg",
  "/images/fitness-logo.jpg",
];

function getCartProductImage(product: Product, index: number) {
  if (product.image) return product.image;
  const name = product.name.toLowerCase();
  if (name.includes("whey") || name.includes("protein")) return "/images/kettlebell.jpg";
  if (name.includes("gainer")) return "/images/strength-training.jpg";
  if (name.includes("creatine")) return "/images/crossfit-weights.jpg";
  return productImages[index % productImages.length];
}

function getProductSpecPills(product: Product) {
  const pills: string[] = [];
  const name = (product.name || "").toLowerCase();

  if (name.includes("whey") || name.includes("protein")) {
    pills.push("24g Protein", "5.5g BCAA", "Low Sugar");
  } else if (name.includes("creatine")) {
    pills.push("Strength", "Performance", "Recovery");
  } else if (name.includes("bcaa") || name.includes("amino")) {
    pills.push("7g BCAA", "Electrolytes", "Zero Sugar");
  } else if (name.includes("gainer") || name.includes("mass")) {
    pills.push("High Calorie", "50g Protein", "Complex Carbs");
  } else {
    if (product.flavor) pills.push(product.flavor);
    if (product.size) pills.push(product.size);
    if (product.category) pills.push(product.category);
  }

  return pills.slice(0, 3);
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pickupAddress, setPickupAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [message, setMessage] = useState("");

  // Promo code / Offer states
  const [offers] = useGymOffers();
  const [orders, setOrders] = useGymOrders();
  const [products, setProducts] = useGymProducts();
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [showVouchersModal, setShowVouchersModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "esewa" | "khalti" | "mobile_banking" | "card">("cod");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [placedPaymentMethod, setPlacedPaymentMethod] = useState("");
  const [placedPaymentStatus, setPlacedPaymentStatus] = useState("");
  const [placedTotal, setPlacedTotal] = useState("");
  const [walletPhone, setWalletPhone] = useState("");
  const [cardInfo, setCardInfo] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const storedCart = window.localStorage.getItem(SHOP_CART_STORAGE_KEY);
    if (!storedCart) return;

    try {
      const savedCart = JSON.parse(storedCart) as CartItem[];
      const normalizedCart = savedCart.map((item) => {
        const matchingProduct = products.find(
          (product) =>
            getProductId(product) === getProductId(item.product) ||
            product.name === item.product.name
        );
        return matchingProduct ? { ...item, product: matchingProduct } : item;
      });
      setCart(normalizedCart);
      setSelectedIds(normalizedCart.map((item) => getProductId(item.product)));
      window.localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(normalizedCart));
    } catch {
      setCart([]);
      setSelectedIds([]);
    }
  }, [products]);

  const saveCartToStorage = (nextCart: CartItem[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(nextCart));
  };

  const updateQuantity = (product: Product, quantity: number) => {
    const productId = getProductId(product);
    const nextCart =
      quantity <= 0
        ? cart.filter((item) => getProductId(item.product) !== productId)
        : cart.some((item) => getProductId(item.product) === productId)
        ? cart.map((item) =>
            getProductId(item.product) === productId ? { ...item, quantity } : item
          )
        : [...cart, { product, quantity }];

    if (quantity <= 0) {
      setSelectedIds((prev) => prev.filter((id) => id !== productId));
    }
    setCart(nextCart);
    saveCartToStorage(nextCart);
  };

  const toggleSelect = (productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cart.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map((item) => getProductId(item.product)));
    }
  };

  const selectedCartItems = useMemo(
    () => cart.filter((item) => selectedIds.includes(getProductId(item.product))),
    [cart, selectedIds]
  );

  const groupedCartItems = useMemo(() => {
    const groups: { brandName: string; items: CartItem[] }[] = [];
    cart.forEach((item) => {
      const brand = item.product.brandName?.trim() || "FitnessHealth Store";
      const existing = groups.find((g) => g.brandName.toLowerCase() === brand.toLowerCase());
      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ brandName: brand, items: [item] });
      }
    });
    return groups;
  }, [cart]);

  const toggleSelectBrandGroup = (brandItems: CartItem[]) => {
    const brandItemIds = brandItems.map((item) => getProductId(item.product));
    const allSelected = brandItemIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !brandItemIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...brandItemIds])));
    }
  };

  const cartTotal = useMemo(
    () =>
      selectedCartItems.reduce(
        (total, item) => total + Number(item.product.price.replace(/[^0-9.]/g, "")) * item.quantity,
        0
      ),
    [selectedCartItems]
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
  const shippingFee = selectedCartItems.length > 0 ? 120 : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee);

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoCodeInput).trim().toUpperCase();
    if (!code) {
      setPromoError("Please enter a promo code.");
      return;
    }

    const matchedOffer = activeOffers.find((o) => o.code.toUpperCase() === code);

    if (!matchedOffer) {
      setPromoError("Invalid or expired promo code.");
      setPromoSuccess("");
      setAppliedOffer(null);
      return;
    }

    setAppliedOffer(matchedOffer);
    setPromoCodeInput(matchedOffer.code);
    setPromoSuccess(`Promo code "${matchedOffer.code}" applied successfully!`);
    setPromoError("");
    setShowVouchersModal(false);
  };

  const handleRemovePromo = () => {
    setAppliedOffer(null);
    setPromoSuccess("");
    setPromoError("");
    setPromoCodeInput("");
  };

  const handleClearSelected = () => {
    const remaining = cart.filter((item) => !selectedIds.includes(getProductId(item.product)));
    setCart(remaining);
    setSelectedIds([]);
    saveCartToStorage(remaining);
  };

  const handlePlaceOrder = () => {
    if (!selectedCartItems.length) {
      setMessage("Select at least one product in your cart to checkout.");
      return;
    }

    if (!customerName.trim()) {
      setMessage("Enter your full name before placing the order.");
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

    if (!customerPhone.trim()) {
      setMessage("Enter your phone number before placing the order.");
      return;
    }

    if (!/^[+]?[0-9\s\-().]{7,15}$/.test(customerPhone.trim())) {
      setMessage("Please enter a valid phone number (7–15 digits).");
      return;
    }

    if (!pickupAddress.trim()) {
      setMessage("Enter delivery / pickup address.");
      return;
    }

    setMessage("");
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    setPaymentError("");

    let paymentMethodLabel = "Cash on Delivery / Pickup";
    let paymentStatusLabel = "Pending (COD)";

    if (paymentMethod === "esewa") {
      paymentMethodLabel = "eSewa Mobile Wallet";
      paymentStatusLabel = "Paid via eSewa";
    } else if (paymentMethod === "khalti") {
      paymentMethodLabel = "Khalti Digital Wallet";
      paymentStatusLabel = "Paid via Khalti";
    } else if (paymentMethod === "mobile_banking") {
      paymentMethodLabel = "Mobile Banking (Fonepay QR)";
      paymentStatusLabel = "Paid via Fonepay";
    } else if (paymentMethod === "card") {
      if (cardInfo.number.replace(/\s/g, "").length < 13) {
        setPaymentError("Please enter a valid card number.");
        return;
      }
      if (!cardInfo.expiry.trim() || !cardInfo.cvv.trim()) {
        setPaymentError("Please fill out card expiry date and CVV.");
        return;
      }
      paymentMethodLabel = "Visa / Mastercard Card";
      paymentStatusLabel = "Paid via Credit/Debit Card";
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      const orderDate = new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const orderId = `#${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = {
        orderId,
        customer: customerName.trim(),
        items: selectedCartItems
          .map((item) => `${item.product.name} x${item.quantity}`)
          .join(", "),
        total: formatCurrency(finalTotal),
        payment: paymentStatusLabel,
        status: "Processing",
        date: orderDate,
        email: customerEmail.trim(),
        phone: customerPhone.trim(),
        pickupPoint: pickupAddress.trim(),
        address: pickupAddress.trim(),
        paymentMethod: paymentMethodLabel,
        cartItems: selectedCartItems.map((item) => ({
          productName: item.product.name,
          brand: item.product.brandName || "FitnessHealth",
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image || "",
        })),
      };

      // Deduct stock
      const nextProducts = products.map((product) => {
        const cartItem = selectedCartItems.find(
          (item) => getProductId(item.product) === getProductId(product)
        );
        if (!cartItem) return product;

        const currentStock = Number(product.stock) || 0;
        return {
          ...product,
          stock: String(Math.max(0, currentStock - cartItem.quantity)),
        };
      });

      const remainingCart = cart.filter(
        (item) => !selectedIds.includes(getProductId(item.product))
      );

      setOrders([newOrder, ...orders]);
      setProducts(nextProducts);

      setCart(remainingCart);
      setSelectedIds([]);
      saveCartToStorage(remainingCart);

      setPlacedOrderId(orderId);
      setPlacedPaymentMethod(paymentMethodLabel);
      setPlacedPaymentStatus(paymentStatusLabel);
      setPlacedTotal(formatCurrency(finalTotal));
      setOrderPlaced(true);
      setShowPaymentModal(false);
      setIsProcessingPayment(false);
      setMessage("");
    }, 600);
  };

  const isAllSelected = cart.length > 0 && selectedIds.length === cart.length;

  return (
    <main className="clientCartPageContainer">
      {/* Top Navigation */}
      <header className="clientCartHeader">
        {showOrderSummary ? (
          <button
            type="button"
            className="clientCartBackLink"
            onClick={() => { setShowOrderSummary(false); setMessage(""); }}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "inherit", fontSize: "inherit", fontFamily: "inherit" }}
          >
            <FaArrowLeft /> Back to Cart
          </button>
        ) : (
          <Link href="/shop" className="clientCartBackLink">
            <FaArrowLeft /> Back to Shop
          </Link>
        )}
        <h1 className="clientCartTitle">
          {showOrderSummary ? "Checkout" : "My Cart"}
        </h1>
        <div className="clientCartHeaderRight">
          {!showOrderSummary && (
            <>
              <button
                type="button"
                className="clientCartVoucherBtn"
                onClick={() => setShowVouchersModal(true)}
              >
                <FaTicket /> View my vouchers
              </button>
              <button
                type="button"
                className="clientCartTrashBtn"
                onClick={handleClearSelected}
                disabled={selectedIds.length === 0}
                title="Delete selected items"
                aria-label="Delete selected items"
              >
                <FaTrash />
                {selectedIds.length > 0 && <span className="trashBadge">{selectedIds.length}</span>}
              </button>
            </>
          )}
        </div>
      </header>

      {orderPlaced ? (
        /* ── SUCCESS VIEW ── */
        <div className="cartSuccessCard">
          <div className="cartSuccessIcon">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>
            Thank you, <strong>{customerName}</strong>. Your order <strong>{placedOrderId}</strong> has
            been registered and confirmed.
          </p>

          <div className="placedOrderDetailsBox">
            <div className="orderDetailRow">
              <span>Order Number</span>
              <strong>{placedOrderId}</strong>
            </div>
            <div className="orderDetailRow">
              <span>Customer</span>
              <strong>{customerName} ({customerPhone})</strong>
            </div>
            <div className="orderDetailRow">
              <span>Delivery / Pickup Address</span>
              <strong>{pickupAddress}</strong>
            </div>
            <div className="orderDetailRow">
              <span>Payment Method</span>
              <strong>{placedPaymentMethod}</strong>
            </div>
            <div className="orderDetailRow">
              <span>Payment Status</span>
              <strong className="statusBadge">{placedPaymentStatus}</strong>
            </div>
            <div className="orderDetailRow totalRow">
              <span>Total Amount</span>
              <strong className="totalPrice">{placedTotal}</strong>
            </div>
          </div>

          <Link href="/shop" className="cartPrimaryBtn" style={{ display: "inline-block", textAlign: "center", textDecoration: "none", marginTop: "16px" }}>
            Back to Shop
          </Link>
        </div>

      ) : showOrderSummary ? (
        /* ── CHECKOUT VIEW ── */
        <div className="checkoutPageLayout">
          {/* Left â€” Delivery Details + Promo */}
          <div className="checkoutPageLeft">
            {/* Order items mini-recap */}
            <div className="checkoutItemsRecap">
              <h3 className="checkoutSectionTitle">Your Items ({selectedCartItems.length})</h3>
              <div className="checkoutRecapList">
                {selectedCartItems.map((item, idx) => {
                  const numPrice = Number(item.product.price.replace(/[^0-9.]/g, "")) || 0;
                  return (
                    <div className="checkoutRecapItem" key={getProductId(item.product)}>
                      <div className="checkoutRecapImg">
                        <Image
                          src={getCartProductImage(item.product, idx)}
                          alt={item.product.name}
                          width={60}
                          height={60}
                          unoptimized
                        />
                      </div>
                      <div className="checkoutRecapInfo">
                        <span className="checkoutRecapName">
                          {item.product.name}
                          {item.product.flavor ? `, ${item.product.flavor}` : ""}
                          {item.product.size ? `, ${item.product.size}` : ""}
                        </span>
                        <span className="checkoutRecapMeta">
                          Qty: {item.quantity} Â· {formatCurrency(numPrice * item.quantity, { decimals: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery / Pickup Details */}
            <div className="checkoutDetailsCard">
              <h3 className="checkoutSectionTitle">Delivery / Pickup Details</h3>
              <div className="checkoutInputsGrid">
                <label className="cartInputLabel">
                  <span>Full Name *</span>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </label>
                <label className="cartInputLabel">
                  <span>Email Address *</span>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </label>
                <label className="cartInputLabel">
                  <span>Phone Number *</span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +977 98XXXXXXXX"
                    required
                  />
                </label>
                <label className="cartInputLabel fullWidth">
                  <span>Delivery / Pickup Address *</span>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Enter gym branch or delivery street address"
                    required
                  />
                </label>
              </div>

              {/* Promo Code */}
              <div className="cartPromoSection">
                <div className="promoInputRow">
                  <input
                    type="text"
                    placeholder="ENTER PROMO CODE"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value.toUpperCase());
                      setPromoError("");
                    }}
                    disabled={!!appliedOffer}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    disabled={!!appliedOffer}
                    className="applyPromoBtn"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="promoErrorMsg">{promoError}</p>}
                {promoSuccess && <p className="promoSuccessMsg">{promoSuccess}</p>}

                {appliedOffer && (
                  <div className="appliedOfferTag">
                    <span>Code <strong>{appliedOffer.code}</strong> Applied ({appliedOffer.discount} Off)</span>
                    <button type="button" onClick={handleRemovePromo}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right â€” Order Summary */}
          <aside className="checkoutPageRight">
            <div className="orderSummaryCard">
              <h3>Order Summary</h3>

              <div className="summaryRow">
                <span>Subtotal ({selectedCartItems.length} items)</span>
                <strong>{formatCurrency(cartTotal, { decimals: 2 })}</strong>
              </div>

              {appliedOffer && (
                <div className="summaryRow discountRow">
                  <span>Discount ({appliedOffer.code})</span>
                  <strong>-{formatCurrency(discountAmount, { decimals: 2 })}</strong>
                </div>
              )}

              <div className="summaryRow">
                <span>Estimated Shipping</span>
                <strong>{shippingFee > 0 ? formatCurrency(shippingFee) : "Free"}</strong>
              </div>

              <div className="summaryDivider" />

              <div className="summaryTotalRow">
                <span>Total</span>
                <strong>{formatCurrency(finalTotal, { decimals: 2 })}</strong>
              </div>

              {/* Trust badges */}
              <div className="summaryTrustRow">
                <span><FaShieldHalved /> Secure Payment</span>
                <span><FaLock /> Original Products</span>
                <span><FaRotateLeft /> Easy Returns</span>
              </div>

              {message && <p className="cartErrorMsg">{message}</p>}

              <button
                type="button"
                className="cartPrimaryBtn checkoutSubmitBtn"
                onClick={handlePlaceOrder}
                disabled={selectedCartItems.length === 0}
              >
                Place Order ({selectedCartItems.length})
              </button>
            </div>
          </aside>
        </div>

      ) : (
        /* â”€â”€ CART VIEW â”€â”€ */
        <div className="clientCartLayout">
          <div className="clientCartMainContent">

            {/* Cart Product Items grouped by Brand Heading */}
            {cart.length > 0 ? (
              <div className="clientCartItemsList">
                {groupedCartItems.map((group) => {
                  const groupItemIds = group.items.map((item) => getProductId(item.product));
                  const isGroupAllSelected =
                    groupItemIds.length > 0 && groupItemIds.every((id) => selectedIds.includes(id));

                  return (
                    <div className="clientCartBrandCard" key={group.brandName}>
                      {/* Brand Heading Strip */}
                      <div className="deliveryStripHeader">
                        <label className="customCheckboxLabel">
                          <input
                            type="checkbox"
                            checked={isGroupAllSelected}
                            onChange={() => toggleSelectBrandGroup(group.items)}
                          />
                          <span className="checkboxMark" />
                        </label>
                        <div className="fastDeliveryTag">
                          <span>{group.brandName.endsWith("Store") ? group.brandName : `${group.brandName} Store`}</span>{" "}
                          <FaChevronRight className="arrowIcon" />
                        </div>
                      </div>

                      {/* Related Products under this Brand */}
                      <div className="brandGroupItems">
                        {group.items.map((item, index) => {
                          const productId = getProductId(item.product);
                          const isSelected = selectedIds.includes(productId);
                          const numPrice = Number(item.product.price.replace(/[^0-9.]/g, "")) || 0;
                          const originalPrice = Math.round(numPrice * 1.2);
                          const stockNum = Number(item.product.stock) || 0;
                          const pills = getProductSpecPills(item.product);

                          return (
                            <article className="cartProductCard" key={productId}>
                              {/* Checkbox */}
                              <label className="customCheckboxLabel cartItemCheckbox">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelect(productId)}
                                />
                                <span className="checkboxMark" />
                              </label>

                              {/* Product Image Frame */}
                              <div className="cartProductImgFrame">
                                <Image
                                  src={getCartProductImage(item.product, index)}
                                  alt={item.product.name}
                                  width={140}
                                  height={140}
                                  unoptimized
                                />
                              </div>

                              {/* Product Info Body */}
                              <div className="cartProductBody">
                                <h2 className="cartProductTitle">
                                  <Link href={`/shop/${encodeURIComponent(productId)}`}>
                                    {item.product.name}
                                    {item.product.flavor ? `, ${item.product.flavor}` : ""}
                                    {item.product.size ? `, ${item.product.size}` : ""}
                                  </Link>
                                </h2>

                                {/* Specs Badges */}
                                <div className="cartProductPills">
                                  {pills.map((pill, i) => (
                                    <span key={i} className="specPill">
                                      {pill}
                                    </span>
                                  ))}
                                </div>

                                {/* Offer / Stock alert */}
                                <div className="cartProductStatusNote">
                                  {stockNum > 0 && stockNum <= 10 ? (
                                    <span className="stockLowText">{stockNum} item(s) left</span>
                                  ) : (
                                    <span className="limitedOfferText">Limited Time Offer</span>
                                  )}
                                </div>

                                {/* Price & Stepper Row */}
                                <div className="cartProductPriceRow">
                                  <div className="priceGroup">
                                    <strong className="currentPrice">{formatCurrency(numPrice)}</strong>
                                    <span className="originalPrice">{formatCurrency(originalPrice)}</span>
                                  </div>

                                  <div className="cartQuantityStepper">
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.product, item.quantity - 1)}
                                      aria-label="Decrease quantity"
                                    >
                                      <FaMinus />
                                    </button>
                                    <span className="quantityValue">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                      aria-label="Increase quantity"
                                    >
                                      <FaPlus />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="cartEmptyState">
                <FaCartShopping className="emptyCartIcon" />
                <h3>Your Cart is Empty</h3>
                <p>Explore our supplements, workout equipment, and gear in the shop.</p>
                <Link href="/shop" className="cartPrimaryBtn">
                  Browse Products
                </Link>
              </div>
            )}

            {/* Store Header & Guarantee Trust Strip */}
            <div className="gymStoreTrustCard">
              <div className="gymStoreHeader">
                <strong><FaStore /> Gym Store <FaChevronRight className="arrowIcon" /></strong>
              </div>

              <div className="trustIconsGrid">
                <div className="trustItem">
                  <FaShieldHalved />
                  <span>100% Original Products</span>
                </div>
                <div className="trustItem">
                  <FaLock />
                  <span>Secure Payment</span>
                </div>
                <div className="trustItem">
                  <FaRotateLeft />
                  <span>Easy Returns</span>
                </div>
                <div className="trustItem">
                  <FaHeart />
                  <span>Trusted by Fitness Lovers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Checkout Footer â€” only on cart view */}
      {!orderPlaced && !showOrderSummary && cart.length > 0 && (
        <div className="clientCartStickyFooter">
          <div className="stickyFooterInner">
            <label className="customCheckboxLabel allCheckbox">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
              />
              <span className="checkboxMark" />
              <strong>All</strong>
            </label>

            <div className="stickySubtotalGroup">
              <div className="subtotalText">
                Subtotal: <strong className="subtotalPrice">{formatCurrency(finalTotal, { decimals: 2 })}</strong>
              </div>
              <div className="shippingFeeNote">
                Shipping Fee: {shippingFee > 0 ? formatCurrency(shippingFee) : "Free"}{" "}
                <FaCircleInfo className="infoIcon" />
              </div>
            </div>

            <button
              type="button"
              className="stickyCheckoutBtn"
              onClick={() => {
                if (selectedCartItems.length === 0) return;
                setShowOrderSummary(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={selectedCartItems.length === 0}
            >
              Check Out ({selectedCartItems.length})
            </button>
          </div>
        </div>
      )}

      {/* Vouchers Modal */}
      {showVouchersModal && (
        <div className="cartModalOverlay" role="dialog" aria-modal="true" aria-label="Available Vouchers">
          <div className="cartVouchersModal">
            <div className="modalHeader">
              <h3>Available Vouchers & Offers</h3>
              <button type="button" onClick={() => setShowVouchersModal(false)} className="closeModalBtn">
                âœ•
              </button>
            </div>
            <div className="vouchersList">
              {activeOffers.length === 0 ? (
                <p className="noVouchersText">No active vouchers available right now.</p>
              ) : (
                activeOffers.map((offer) => (
                  <div className="voucherCard" key={offer.code}>
                    <div>
                      <strong className="voucherCode">{offer.code}</strong>
                      <p className="voucherName">{offer.name}</p>
                    </div>
                    <button
                      type="button"
                      className="useVoucherBtn"
                      onClick={() => handleApplyPromo(offer.code)}
                      disabled={!!appliedOffer && appliedOffer.code === offer.code}
                    >
                      {appliedOffer && appliedOffer.code === offer.code ? "Applied" : "Apply"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Payment Selection Modal */}
      {showPaymentModal && (
        <div className="cartModalOverlay" role="dialog" aria-modal="true" aria-label="Select Payment Method">
          <div className="cartPaymentModal">
            <div className="modalHeader">
              <div>
                <h3 style={{ margin: 0 }}>Choose Payment Method</h3>
                <p className="paymentAmountNote" style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Total to Pay: <strong style={{ color: "#ea580c" }}>{formatCurrency(finalTotal, { decimals: 2 })}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="closeModalBtn"
                disabled={isProcessingPayment}
              >
                ✕
              </button>
            </div>

            <div className="paymentOptionsList">
              {/* Option 1: Cash on Delivery / Pickup */}
              <label className={`paymentOptionCard ${paymentMethod === "cod" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <div className="paymentOptionIcon cod">
                  <FaMoneyBillWave />
                </div>
                <div className="paymentOptionContent">
                  <div className="paymentOptionTitleRow">
                    <strong>Cash on Delivery / Pickup</strong>
                    <span className="paymentTag recommended">Recommended</span>
                  </div>
                  <p>Pay cash when receiving order or picking up at gym</p>
                </div>
              </label>

              {/* Option 2: eSewa */}
              <label className={`paymentOptionCard ${paymentMethod === "esewa" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="esewa"
                  checked={paymentMethod === "esewa"}
                  onChange={() => setPaymentMethod("esewa")}
                />
                <div className="paymentOptionIcon esewa">
                  <FaWallet />
                </div>
                <div className="paymentOptionContent">
                  <div className="paymentOptionTitleRow">
                    <strong>eSewa Mobile Wallet</strong>
                    <span className="paymentTag esewa">Instant</span>
                  </div>
                  <p>Pay via eSewa account balance or QR scan</p>
                </div>
              </label>

              {/* Option 3: Khalti */}
              <label className={`paymentOptionCard ${paymentMethod === "khalti" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="khalti"
                  checked={paymentMethod === "khalti"}
                  onChange={() => setPaymentMethod("khalti")}
                />
                <div className="paymentOptionIcon khalti">
                  <FaMobileScreenButton />
                </div>
                <div className="paymentOptionContent">
                  <div className="paymentOptionTitleRow">
                    <strong>Khalti Digital Wallet</strong>
                  </div>
                  <p>Pay using Khalti wallet balance or eBanking</p>
                </div>
              </label>

              {/* Option 4: Mobile Banking / Fonepay */}
              <label className={`paymentOptionCard ${paymentMethod === "mobile_banking" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mobile_banking"
                  checked={paymentMethod === "mobile_banking"}
                  onChange={() => setPaymentMethod("mobile_banking")}
                />
                <div className="paymentOptionIcon bank">
                  <FaBuildingColumns />
                </div>
                <div className="paymentOptionContent">
                  <div className="paymentOptionTitleRow">
                    <strong>Mobile Banking (Fonepay QR)</strong>
                  </div>
                  <p>Scan QR code with any Nepalese mobile banking app</p>
                </div>
              </label>

              {/* Option 5: Credit / Debit Card */}
              <label className={`paymentOptionCard ${paymentMethod === "card" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <div className="paymentOptionIcon card">
                  <FaCreditCard />
                </div>
                <div className="paymentOptionContent">
                  <div className="paymentOptionTitleRow">
                    <strong>Credit / Debit Card</strong>
                  </div>
                  <p>Pay securely with Visa, Mastercard, or SCT Card</p>
                </div>
              </label>
            </div>

            {/* Sub-details box for chosen payment option */}
            <div className="paymentSubDetailsBox">
              {paymentMethod === "cod" && (
                <div className="paymentNoteBanner">
                  <FaCircleCheck className="noteIcon" />
                  <div>
                    <strong>Cash Payment Selected</strong>
                    <p>Pay <strong>{formatCurrency(finalTotal)}</strong> in cash upon delivery or branch pickup.</p>
                  </div>
                </div>
              )}

              {(paymentMethod === "esewa" || paymentMethod === "khalti") && (
                <div className="paymentWalletForm">
                  <label className="cartInputLabel">
                    <span>{paymentMethod === "esewa" ? "eSewa" : "Khalti"} Registered Mobile Number</span>
                    <input
                      type="tel"
                      value={walletPhone || customerPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                    />
                  </label>
                </div>
              )}

              {paymentMethod === "mobile_banking" && (
                <div className="paymentQrBox">
                  <div className="qrIconWrapper">
                    <FaQrcode />
                  </div>
                  <div className="qrTextInfo">
                    <strong>Scan to Pay {formatCurrency(finalTotal)}</strong>
                    <p>Open any mobile banking app & scan Fonepay QR code at pickup/delivery.</p>
                  </div>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="paymentCardForm">
                  <label className="cartInputLabel">
                    <span>Card Number</span>
                    <input
                      type="text"
                      value={cardInfo.number}
                      onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                    />
                  </label>
                  <div className="cardInlineInputs">
                    <label className="cartInputLabel">
                      <span>Expiry Date</span>
                      <input
                        type="text"
                        value={cardInfo.expiry}
                        onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                        placeholder="MM / YY"
                        maxLength={5}
                      />
                    </label>
                    <label className="cartInputLabel">
                      <span>CVV / CVC</span>
                      <input
                        type="password"
                        value={cardInfo.cvv}
                        onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                        placeholder="123"
                        maxLength={4}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {paymentError && <p className="paymentErrorMsg">{paymentError}</p>}

            {/* Modal Actions */}
            <div className="paymentModalFooter">
              <button
                type="button"
                className="cancelPaymentBtn"
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessingPayment}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirmPaymentBtn"
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Processing..." : `Pay & Confirm Order (${formatCurrency(finalTotal)})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
