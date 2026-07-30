"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "../../../components/Footer";
import {
  useGymProducts,
  useGymReviews,
  useGymClients,
  saveGymData,
  GYM_REVIEWS_KEY,
  GYM_PRODUCTS_KEY,
  GYM_DATA_CHANGED_EVENT,
  type Product,
  type Review,
} from "../../../data/gymData";
import { formatCurrency } from "../../../data/currency";
import { clientStorageKey } from "../../../data/clientPortal";
import {
  FaStar,
  FaChevronLeft,
  FaCartShopping,
  FaMinus,
  FaPlus,
  FaCheck,
  FaShieldHalved,
  FaTruckFast,
  FaRotateLeft,
  FaUser,
  FaMessage,
  FaBoxOpen,
} from "react-icons/fa6";

const SHOP_CART_STORAGE_KEY = "fitness-shop-cart";

function parseReviewRatingNumber(rating: string | number | undefined): number {
  if (typeof rating === "number") return Math.min(5, Math.max(1, rating));
  if (!rating) return 5;
  const str = String(rating).trim();
  if (str.includes("★")) return Math.min(5, Math.max(1, str.length));
  const num = parseFloat(str);
  return isNaN(num) ? 5 : Math.min(5, Math.max(1, num));
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useGymProducts();
  const [reviews, setReviews] = useGymReviews();
  const [clients] = useGymClients();

  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const decodedId = rawId ? decodeURIComponent(rawId) : "";

  // Find target product by id or name slug
  const product = useMemo(() => {
    if (!decodedId || !products || products.length === 0) return null;
    return (
      products.find(
        (p) =>
          p.id === decodedId ||
          p.name === decodedId ||
          p.name.toLowerCase() === decodedId.toLowerCase() ||
          p.name.toLowerCase().replace(/\s+/g, "-") === decodedId.toLowerCase()
      ) || null
    );
  }, [products, decodedId]);

  // Find reviews for this product
  const productReviews = useMemo(() => {
    if (!product || !reviews) return [];
    const pName = product.name.toLowerCase();
    const pId = product.id?.toLowerCase();
    return reviews.filter((r) => {
      if (!r.product) return false;
      const rProd = r.product.toLowerCase();
      return rProd === pName || (pId && rProd === pId);
    });
  }, [product, reviews]);

  // Calculate average rating
  const { averageRating, ratingCount, starCounts } = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!productReviews || productReviews.length === 0) {
      const fallback = parseFloat(product?.rating || "4.5") || 4.5;
      return { averageRating: fallback.toFixed(1), ratingCount: 0, starCounts: counts };
    }

    let sum = 0;
    productReviews.forEach((r) => {
      const score = Math.round(parseReviewRatingNumber(r.rating));
      sum += score;
      if (score >= 1 && score <= 5) {
        counts[score as keyof typeof counts] += 1;
      }
    });

    const avg = sum / productReviews.length;
    return {
      averageRating: avg.toFixed(1),
      ratingCount: productReviews.length,
      starCounts: counts,
    };
  }, [productReviews, product?.rating]);

  // Quantity stepper state
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Review Form state
  const [reviewStars, setReviewStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");

  // Prefill reviewer name if client logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmail = window.localStorage.getItem(clientStorageKey);
      if (loggedInEmail) {
        const found = clients.find((c) => c.email.toLowerCase() === loggedInEmail.toLowerCase());
        if (found && found.name) {
          setReviewerName(found.name);
        }
      }
    }
  }, [clients]);

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product) return;
    try {
      const stored = window.localStorage.getItem(SHOP_CART_STORAGE_KEY);
      const currentCart: { product: Product; quantity: number }[] = stored ? JSON.parse(stored) : [];
      const prodId = product.id || product.name;

      const existingIndex = currentCart.findIndex(
        (item) => (item.product.id || item.product.name) === prodId
      );

      if (existingIndex >= 0) {
        currentCart[existingIndex].quantity += quantity;
      } else {
        currentCart.push({ product, quantity });
      }

      window.localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(currentCart));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent(GYM_DATA_CHANGED_EVENT));

      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    } catch (err) {
      console.error("[ProductDetail] Error adding to cart:", err);
    }
  };

  // Submit review handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewComment.trim()) return;

    setSubmittingReview(true);
    setReviewSuccessMsg("");

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      customer: reviewerName.trim() || "Gym Member",
      product: product.name,
      rating: String(reviewStars),
      reviewText: reviewComment.trim(),
      date: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Approved",
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Save review to Supabase & localStorage
    await saveGymData(GYM_REVIEWS_KEY, updatedReviews);

    // Update product rating average in products array & save to database
    const newCount = productReviews.length + 1;
    const oldSum = productReviews.reduce((sum, r) => sum + parseReviewRatingNumber(r.rating), 0);
    const newAvg = ((oldSum + reviewStars) / newCount).toFixed(1);

    const updatedProducts = products.map((p) =>
      p.name === product.name || (product.id && p.id === product.id)
        ? { ...p, rating: newAvg }
        : p
    );
    setProducts(updatedProducts);
    await saveGymData(GYM_PRODUCTS_KEY, updatedProducts);

    setSubmittingReview(false);
    setReviewComment("");
    setReviewSuccessMsg("Thank you! Your review has been published and saved.");
    setTimeout(() => setReviewSuccessMsg(""), 4500);
  };

  if (!product) {
    return (
      <main className="productDetailLoadingPage">
        <div className="productDetailLoadingContainer">
          <p>Loading product details...</p>
          <button type="button" onClick={() => router.push("/shop")} className="backToShopBtn">
            <FaChevronLeft /> Back to Shop
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  const stock = Number(product.stock) || 0;
  const outOfStock = stock <= 0;

  return (
    <>
      <main className="productDetailPageMain">
        <div className="productDetailWrapper">
          {/* Breadcrumb Navigation */}
          <nav className="productBreadcrumb" aria-label="Breadcrumb">
            <Link href="/shop" className="breadcrumbBack">
              <FaChevronLeft /> Back to Shop
            </Link>
            <span className="breadcrumbSep">/</span>
            <span className="breadcrumbCat">{product.category}</span>
            <span className="breadcrumbSep">/</span>
            <span className="breadcrumbTitle">{product.name}</span>
          </nav>

          {/* Toast Notification */}
          {addedToast && (
            <div className="productAddedToast">
              <FaCheck /> {quantity} &times; &quot;{product.name}&quot; added to your cart!
            </div>
          )}

          {/* Top Showcase: Image + Info */}
          <div className="productShowcaseGrid">
            {/* Left: Product Image */}
            <div className="productImageCard">
              <div className="productImageBadgeRow">
                <span className="productCategoryBadge">{product.category}</span>
                {product.brandName && <span className="productBrandBadge">{product.brandName}</span>}
              </div>
              <div className="productImageFrame">
                <Image
                  src={product.image || "/images/kettlebell.jpg"}
                  alt={product.name}
                  width={500}
                  height={420}
                  unoptimized
                  style={{ objectFit: "contain", width: "100%", height: "100%", padding: "16px" }}
                />
              </div>
            </div>

            {/* Right: Product Details & Controls */}
            <div className="productInfoCard">
              <h1 className="productTitle">{product.name}</h1>

              {/* Star Rating Overview Header */}
              <div className="productRatingHeader">
                <div className="starsRow">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={star <= Math.round(parseFloat(averageRating)) ? "starFilled" : "starEmpty"}
                    />
                  ))}
                </div>
                <strong className="ratingScore">{averageRating}</strong>
                <span className="ratingCount">
                  ({ratingCount > 0 ? `${ratingCount} customer reviews` : "No reviews yet"})
                </span>
              </div>

              {/* Price & Stock */}
              <div className="productPriceStockRow">
                <div className="productPrice">{formatCurrency(product.price)}</div>
                <span className={outOfStock ? "stockStatus out" : "stockStatus in"}>
                  {outOfStock ? "Out of Stock" : `${stock} units in stock`}
                </span>
              </div>

              {/* Specs Box */}
              <dl className="productSpecsGrid">
                <div>
                  <dt>Flavor</dt>
                  <dd>{product.flavor || "Original"}</dd>
                </div>
                <div>
                  <dt>Weight / Size</dt>
                  <dd>{product.size || "Standard"}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{product.category}</dd>
                </div>
                <div>
                  <dt>Brand</dt>
                  <dd>{product.brandName || product.brandKey || "Fitness Bhaktapur"}</dd>
                </div>
              </dl>

              {/* Stepper & Add to Cart */}
              <div className="productActionsArea">
                <div className="quantityStepper">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || outOfStock}
                  >
                    <FaMinus />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock || outOfStock}
                  >
                    <FaPlus />
                  </button>
                </div>

                <button
                  type="button"
                  className="addToCartMainBtn"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                >
                  <FaCartShopping /> {outOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="productTrustBadges">
                <div>
                  <FaShieldHalved /> <span>100% Authentic Product</span>
                </div>
                <div>
                  <FaTruckFast /> <span>Fast Gym Pickup / Delivery</span>
                </div>
                <div>
                  <FaRotateLeft /> <span>Verified Quality Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Description Section */}
          <section className="productDescriptionSection">
            <h2 className="sectionHeaderTitle">
              <FaBoxOpen /> Product Description
            </h2>
            <div className="productDescriptionBox">
              <p>
                {product.description ||
                  `The ${product.name} is a premium fitness supplement engineered to support maximum performance, recovery, and overall wellness. Perfect for fitness enthusiasts, athletes, and gym members aiming to achieve optimal results.`}
              </p>
            </div>
          </section>

          {/* Reviews & Ratings Section */}
          <section className="productReviewsSection" id="customer-reviews">
            <h2 className="sectionHeaderTitle">
              <FaStar className="starHeaderIcon" /> Customer Reviews & Ratings
            </h2>

            <div className="reviewsGrid">
              {/* Left Column: Rating Summary */}
              <div className="ratingSummaryCard">
                <h3>Overall Rating</h3>
                <div className="bigScoreBox">
                  <div className="bigScoreNumber">{averageRating}</div>
                  <div className="bigScoreStars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={
                          star <= Math.round(parseFloat(averageRating)) ? "starFilled" : "starEmpty"
                        }
                      />
                    ))}
                  </div>
                  <p className="bigScoreMeta">Based on {ratingCount} verified reviews</p>
                </div>

                {/* Rating Distribution Progress Bars */}
                <div className="starDistribution">
                  {[5, 4, 3, 2, 1].map((s) => {
                    const count = starCounts[s as keyof typeof starCounts] || 0;
                    const percent = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
                    return (
                      <div key={s} className="starBarRow">
                        <span className="barStarLabel">{s} ★</span>
                        <div className="barTrack">
                          <div className="barFill" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="barCountLabel">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Write a Review Form */}
              <div className="writeReviewCard">
                <h3><FaMessage /> Write a Review</h3>
                {reviewSuccessMsg && (
                  <div className="reviewSuccessAlert">
                    <FaCheck /> {reviewSuccessMsg}
                  </div>
                )}
                <form onSubmit={handleReviewSubmit} className="reviewForm">
                  <div className="formGroup">
                    <label>Select Rating</label>
                    <div className="interactiveStarPicker">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={
                            star <= (hoverStars || reviewStars) ? "starBtn active" : "starBtn"
                          }
                          onClick={() => setReviewStars(star)}
                          onMouseEnter={() => setHoverStars(star)}
                          onMouseLeave={() => setHoverStars(0)}
                          aria-label={`Rate ${star} stars`}
                        >
                          <FaStar />
                        </button>
                      ))}
                      <span className="starRatingLabel">{hoverStars || reviewStars} out of 5 stars</span>
                    </div>
                  </div>

                  <div className="formGroup">
                    <label>Your Name</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>

                  <div className="formGroup">
                    <label>Your Review</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your honest thoughts about the taste, quality, and results..."
                      rows={4}
                      required
                    />
                  </div>

                  <button type="submit" className="submitReviewBtn" disabled={submittingReview}>
                    {submittingReview ? "Saving Review..." : "Submit Review"}
                  </button>
                </form>
              </div>
            </div>

            {/* List of Reviews */}
            <div className="reviewsListArea">
              <h3>Customer Feedback ({productReviews.length})</h3>
              {productReviews.length === 0 ? (
                <div className="emptyReviewsNotice">
                  <FaMessage />
                  <p>There are no reviews for this product yet.</p>
                  <span>Be the first gym member to leave a review above!</span>
                </div>
              ) : (
                <div className="reviewsListGrid">
                  {productReviews.map((rev) => {
                    const starsNum = parseReviewRatingNumber(rev.rating);
                    return (
                      <article key={rev.id || rev.customer + rev.date} className="reviewItemCard">
                        <div className="reviewItemHeader">
                          <div className="reviewerInfo">
                            <div className="reviewerAvatar">
                              <FaUser />
                            </div>
                            <div>
                              <strong className="reviewerName">{rev.customer}</strong>
                              <span className="reviewDate">{rev.date}</span>
                            </div>
                          </div>
                          <div className="reviewItemStars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={star <= starsNum ? "starFilled" : "starEmpty"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="reviewItemComment">{rev.reviewText}</p>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
