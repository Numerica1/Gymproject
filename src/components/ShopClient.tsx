"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCartShopping,
  FaMinus,
  FaPlus,
} from "react-icons/fa6";
import Image from "next/image";
import {
  useGymProducts,
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
  const [products] = useGymProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const activeProducts = products.filter((product) => product.status === "Active");

  useEffect(() => {
    const storedCart = window.localStorage.getItem(SHOP_CART_STORAGE_KEY);
    if (!storedCart) return;

    try {
      setCart(JSON.parse(storedCart) as CartItem[]);
    } catch {
      setCart([]);
    }
  }, []);

  const saveCartToStorage = (nextCart: CartItem[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(nextCart));
  };


  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

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

  const handleBuyNow = (product: Product) => {
    updateQuantity(product, getCartQuantity(product) + 1);
    router.push("/cart");
  };



  return (
    <section className="shopPage">
      <div className="shopHero">
        <div>
          <p className="eyebrow dark">Gym Shop</p>
          <h1>Proteins & Supplements</h1>
          <p>
            Pick up gym-ready protein, gainers, creatine, and daily essentials.
          </p>
        </div>
        <div
          className="shopHeroCart"
          role="button"
          tabIndex={0}
          onClick={() => router.push("/cart")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/cart");
            }
          }}
          style={{ cursor: "pointer" }}
          aria-label={`View cart, ${cartCount} items`}
        >
          <FaCartShopping />
          <strong>{cartCount}</strong>
          <span>items in cart</span>
        </div>
      </div>

      <div className="shopLayout">
        <div className="shopGrid" aria-label="Shop products">
          {activeProducts.map((product, index) => {
            const quantity = getCartQuantity(product);
            const stock = Number(product.stock) || 0;
            const outOfStock = stock <= 0;

            return (
              <article className="shopProductCard" key={`${product.name}-${index}`}>
                 <Image src={getProductImage(product, index)} alt={product.name} width={350} height={250} style={{ objectFit: "cover" }} unoptimized />
                <div>
                  <span>{product.category}</span>
                  <h2>{product.name}</h2>
                  <p>Ready for pickup at the gym reception desk.</p>
                  <div className="shopProductMeta">
                    <strong>{formatCurrency(product.price)}</strong>
                    <small>{stock} in stock</small>
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
                      <button
                        type="button"
                        className="shopBuyButton"
                        onClick={() => handleBuyNow(product)}
                        disabled={outOfStock}
                      >
                        Buy Now
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
