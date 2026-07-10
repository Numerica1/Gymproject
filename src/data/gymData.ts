"use client";

import { useEffect, useRef, useState } from "react";
import { defaultGymContent, type SharedGymContent } from "./sharedGymContent";
import { demoClients, type DemoClient } from "./clientPortal";
import { blogPosts, type BlogPost } from "./blogs";
export type { BlogPost };

// Import Supabase client for optional direct table operations
import {
  supabaseClients,
  supabaseTrainers,
  supabaseClasses,
  supabaseProducts,
  supabaseBrands,
  supabaseOffers,
  supabaseOrders,
  supabaseReviews,
  supabasePayments,
  supabaseAttendance,
  supabaseBookings,
  supabaseContactMessages,
} from "./supabaseClient";

// Define storage keys
export const GYM_SETTINGS_KEY = "fitness-bhaktapur-shared-content";
export const GYM_CLIENTS_KEY = "fitness-bhaktapur-clients-list";
export const GYM_TRAINERS_KEY = "fitness-bhaktapur-trainers-list";
export const GYM_BLOGS_KEY = "fitness-bhaktapur-blogs-list";
export const GYM_PAYMENTS_KEY = "fitness-bhaktapur-payments-list";
export const GYM_PRODUCTS_KEY = "fitness-bhaktapur-products-list";
export const GYM_BRANDS_KEY = "fitness-bhaktapur-brands-list";
export const GYM_OFFERS_KEY = "fitness-bhaktapur-offers-list";
export const GYM_ORDERS_KEY = "fitness-bhaktapur-orders-list";
export const GYM_REVIEWS_KEY = "fitness-bhaktapur-reviews-list";
export const GYM_ATTENDANCE_KEY = "fitness-bhaktapur-attendance-list";
export const GYM_CLASSES_KEY = "fitness-bhaktapur-classes-list";
export const GYM_BOOKINGS_KEY = "fitness-bhaktapur-bookings-list";
export const GYM_GALLERY_KEY = "fitness-bhaktapur-gallery-list";
export const GYM_CONTACT_MESSAGES_KEY = "fitness-bhaktapur-contact-messages";
export const GYM_SHOP_CATEGORIES_KEY = "fitness-bhaktapur-shop-categories";

// Change event name for local tab notifications
export const GYM_DATA_CHANGED_EVENT = "fitness-bhaktapur-data-changed";
const GYM_API_BASE_URL = process.env.NEXT_PUBLIC_GYM_API_URL || "";
const GYM_SYNC_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_GYM_SYNC_INTERVAL_MS || "0");

function normalizeMembershipPlanSessions<T extends { key: string; name: string; sessionsTotal: number }>(plan: T): T {
  const normalized = `${plan.key} ${plan.name}`.toLowerCase();
  if (normalized.includes("basic")) return { ...plan, sessionsTotal: 15 };
  if (normalized.includes("standard")) return { ...plan, sessionsTotal: 20 };
  if (normalized.includes("premium")) return { ...plan, sessionsTotal: 30 };
  return plan;
}

function getGymDataUrl(key: string) {
  const encodedKey = encodeURIComponent(key);

  if (GYM_API_BASE_URL) {
    return `${GYM_API_BASE_URL}/api/gym-data/${encodedKey}`;
  }

  return `/api/gym-data?key=${encodedKey}`;
}

function normalizeGymDataValue<T>(key: string, value: T): T {
  if (key !== GYM_SETTINGS_KEY || !value || typeof value !== "object") {
    return value;
  }

  const settings = value as Partial<SharedGymContent>;
  const usedOldCurrency = !settings.currency || /usd|\$/i.test(settings.currency);

  return {
    ...settings,
    currency: "Rs",
    membershipPlans: settings.membershipPlans?.map((plan) =>
      normalizeMembershipPlanSessions({
        ...plan,
        price: usedOldCurrency && plan.price > 0 && plan.price < 100 ? plan.price * 100 : plan.price,
      })
    ),
  } as T;
}

// Types
export type Trainer = {
  name: string;
  specialty: string;
  clients: string;
  certificate?: string;
  experienceYears?: string;
  image: string;
  category: string; // "Trainers" | "Yoga Instructor" | "Front Desk" | "Housekeeping" | "Franchise Manager"
};

export type PaymentLog = {
  txnId: string;
  member: string;
  amount: string;
  method: string;
  status: string;
  date: string;
  email?: string;
  pickupPoint?: string;
  address?: string;
  paymentMethod?: string;
};

export type Product = {
  id?: string;
  name: string;
  brandKey?: string;
  brandName?: string;
  category: string;
  flavor?: string;
  size?: string;
  price: string;
  rating?: string;
  stock: string;
  status: string;
  image?: string;
  description?: string;
};

export type Brand = {
  id?: string;
  key: string;
  name: string;
  logo?: string;
  banner?: string;
  description?: string;
  status: "Active" | "Inactive";
};

export type Offer = {
  name: string;
  type: string;
  discount: string;
  code: string;
  validTill: string;
  status: string;
};

export type OrderLog = {
  orderId: string;
  customer: string;
  items?: string;
  total: string;
  payment: string;
  status: string;
  date: string;
  email?: string;
  pickupPoint?: string;
  address?: string;
};

export type Review = {
  customer: string;
  product: string;
  rating: string;
  reviewText: string;
  date: string;
  status: string;
};

export type AttendanceLog = {
  member: string;
  plan: string;
  status: string;
  time: string;
};

export type ClassSchedule = {
  className: string;
  trainer: string;
  time: string;
  capacity: string;
  image?: string;
  // Extended fields for program detail pages
  description?: string;
  duration?: string;
  intensity?: string;
  targetAudience?: string;
  benefits?: string; // comma-separated string
  schedule?: string;
};

export type Booking = {
  bookingId: string;
  member: string;
  service: string;
  date: string;
  trainer?: string;
  program?: string;
  email?: string;
  phone?: string;
  notes?: string;
  status?: string;
};

export type ContactMessage = {
  id: string;          // client-generated uuid so we can target Supabase row for deletion
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;        // ISO date string
  status: "New" | "Read";
};

export type ShopCategory = {
  id?: string;
  label: string;
  category: string; // matches product.category
  image: string;
  order?: number;
};

// Default Seeds
const defaultTrainers: Trainer[] = [];

const defaultPayments: PaymentLog[] = [];

const defaultBrands: Brand[] = [
  {
    key: "optimum-nutrition",
    name: "Optimum Nutrition",
    logo: "/images/fitness-logo.jpg",
    banner: "/images/equipment-row.jpg",
    description: "Performance proteins, creatine, and everyday supplement essentials.",
    status: "Active",
  },
  {
    key: "muscleblaze",
    name: "MuscleBlaze",
    logo: "/images/fitness-logo.jpg",
    banner: "/images/strength-training.jpg",
    description: "High-value gainers and workout supplements for strength goals.",
    status: "Active",
  },
  {
    key: "dymatize",
    name: "Dymatize",
    logo: "/images/fitness-logo.jpg",
    banner: "/images/crossfit-weights.jpg",
    description: "Premium protein and amino formulas for serious training.",
    status: "Active",
  },
];

const defaultProducts: Product[] = [
  {
    name: "Gold Standard Whey Protein",
    brandKey: "optimum-nutrition",
    brandName: "Optimum Nutrition",
    category: "Protein",
    flavor: "Double Rich Chocolate",
    size: "2 lb",
    price: "Rs 6,499",
    rating: "4.8",
    stock: "18",
    status: "Active",
    image: "/images/kettlebell.jpg",
    description: "Fast-mixing whey protein for daily recovery and lean muscle support.",
  },
  {
    name: "Micronized Creatine Powder",
    brandKey: "optimum-nutrition",
    brandName: "Optimum Nutrition",
    category: "Creatine",
    flavor: "Unflavored",
    size: "300 g",
    price: "Rs 3,299",
    rating: "4.7",
    stock: "24",
    status: "Active",
    image: "/images/crossfit-weights.jpg",
    description: "Pure creatine monohydrate for strength, power, and training output.",
  },
  {
    name: "Biozyme Performance Whey",
    brandKey: "muscleblaze",
    brandName: "MuscleBlaze",
    category: "Protein",
    flavor: "Rich Milk Chocolate",
    size: "1 kg",
    price: "Rs 4,999",
    rating: "4.6",
    stock: "12",
    status: "Active",
    image: "/images/strength-training.jpg",
    description: "Digestive enzyme enhanced protein for post-workout recovery.",
  },
  {
    name: "Mass Gainer XXL",
    brandKey: "muscleblaze",
    brandName: "MuscleBlaze",
    category: "Mass Gainer",
    flavor: "Chocolate",
    size: "3 kg",
    price: "Rs 5,799",
    rating: "4.5",
    stock: "7",
    status: "Active",
    image: "/images/equipment-row.jpg",
    description: "High-calorie mass gainer for bulking phases and hard gainers.",
  },
  {
    name: "ISO100 Hydrolyzed Protein",
    brandKey: "dymatize",
    brandName: "Dymatize",
    category: "Protein",
    flavor: "Gourmet Vanilla",
    size: "1.6 lb",
    price: "Rs 7,999",
    rating: "4.9",
    stock: "9",
    status: "Active",
    image: "/images/gym-corner.jpg",
    description: "Hydrolyzed isolate protein with a lean, fast-digesting formula.",
  },
  {
    name: "Amino Pro BCAA",
    brandKey: "dymatize",
    brandName: "Dymatize",
    category: "BCAA",
    flavor: "Fruit Punch",
    size: "270 g",
    price: "Rs 3,899",
    rating: "4.4",
    stock: "0",
    status: "Active",
    image: "/images/cardio-training.jpg",
    description: "Amino support for intra-workout hydration and recovery.",
  },
];

const defaultOffers: Offer[] = [];

const defaultOrders: OrderLog[] = [];

const defaultReviews: Review[] = [];

const defaultAttendance: AttendanceLog[] = [];

const defaultClasses: ClassSchedule[] = [];

const defaultBookings: Booking[] = [];

// Helper functions for reading and writing with local storage
export function getStorageItem<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  const item = window.localStorage.getItem(key);
  if (!item) {
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return normalizeGymDataValue(key, JSON.parse(item) as T);
  } catch {
    return seed;
  }
}

export function setStorageItem<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(GYM_DATA_CHANGED_EVENT, { detail: { key } }));
  // dispatch storage event manually for the same window to trigger refresh in same tab
  window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(value) }));
}

function cacheStorageItem<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

async function fetchGymData<T>(key: string, seed: T): Promise<T> {
  // Try to load from Supabase tables first for structured data
  try {
    if (key === GYM_CLIENTS_KEY) {
      const data = await supabaseClients.get();
      return data as T;
    } else if (key === GYM_TRAINERS_KEY) {
      const data = await supabaseTrainers.get();
      return data as T;
    } else if (key === GYM_CLASSES_KEY) {
      const data = await supabaseClasses.get();
      return data as T;
    } else if (key === GYM_PRODUCTS_KEY) {
      const data = await supabaseProducts.get();
      return data as T;
    } else if (key === GYM_BRANDS_KEY) {
      const data = await supabaseBrands.get();
      return data as T;
    } else if (key === GYM_OFFERS_KEY) {
      const data = await supabaseOffers.get();
      return data as T;
    } else if (key === GYM_ORDERS_KEY) {
      const data = await supabaseOrders.get();
      return data as T;
    } else if (key === GYM_REVIEWS_KEY) {
      const data = await supabaseReviews.get();
      return data as T;
    } else if (key === GYM_PAYMENTS_KEY) {
      const data = await supabasePayments.get();
      return data as T;
    } else if (key === GYM_ATTENDANCE_KEY) {
      const data = await supabaseAttendance.get();
      return data as T;
    } else if (key === GYM_BOOKINGS_KEY) {
      const data = await supabaseBookings.get();
      return data as T;
    } else if (key === GYM_CONTACT_MESSAGES_KEY) {
      const data = await supabaseContactMessages.get();
      return data as T;
    }
  } catch (error) {
    console.warn("Supabase load failed, falling back to gym_data:", error);
  }

  // Fallback to gym_data table
  const response = await fetch(getGymDataUrl(key), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Could not load ${key}`);
  }

  const payload = (await response.json()) as { value: T | null };
  return normalizeGymDataValue(key, payload.value ?? seed);
}

export async function saveGymData<T>(key: string, value: T): Promise<T> {
  // Helper type: records fetched from Supabase may carry an extra `id` field
  type WithId<U> = U & { id?: string };

  // Try to save to Supabase tables for structured data
  try {
    if (key === GYM_CLIENTS_KEY && Array.isArray(value)) {
      // Sync clients to Supabase
      await Promise.all(
        (value as WithId<DemoClient>[]).map((client) => {
          if (client.id) {
            return supabaseClients.update(client.id, client).catch(() => supabaseClients.create(client));
          }
          return supabaseClients.create(client);
        })
      );
    } else if (key === GYM_TRAINERS_KEY && Array.isArray(value)) {
      // Sync trainers to Supabase
      await Promise.all(
        (value as WithId<Trainer>[]).map((trainer) => {
          if (trainer.id) {
            return supabaseTrainers.update(trainer.id, trainer).catch(() => supabaseTrainers.create(trainer));
          }
          return supabaseTrainers.create(trainer);
        })
      );
    } else if (key === GYM_CLASSES_KEY && Array.isArray(value)) {
      // Sync classes to Supabase
      await Promise.all(
        (value as WithId<ClassSchedule>[]).map((cls) => {
          if (cls.id) {
            return supabaseClasses.update(cls.id, cls).catch(() => supabaseClasses.create(cls));
          }
          return supabaseClasses.create(cls);
        })
      );
    } else if (key === GYM_PRODUCTS_KEY && Array.isArray(value)) {
      // Sync products to Supabase and patch back returned ids for new products
      const productsArr = value as WithId<Product>[];
      const updatedProducts = await Promise.all(
        productsArr.map(async (product, idx) => {
          try {
            const isNew = !product.id || String(product.id).startsWith("temp-");
            if (!isNew) {
              await supabaseProducts.update(product.id!, product as Record<string, unknown>).catch(() =>
                supabaseProducts.create(product as Record<string, unknown>)
              );
              return product;
            } else {
              // Strip temp id before sending to Supabase
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id: _tempId, ...productWithoutId } = product;
              // Create and capture the returned record to get the auto-assigned id
              const created = await supabaseProducts.create(productWithoutId as Record<string, unknown>) as unknown as WithId<Product> | null;
              if (created?.id) {
                productsArr[idx] = { ...product, id: created.id };
                return productsArr[idx];
              }
              return product;
            }
          } catch {
            return product;
          }
        })
      );
      // Write the id-enriched array back to localStorage so future saves use update, not create
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(updatedProducts));
      }
    } else if (key === GYM_BRANDS_KEY && Array.isArray(value)) {
      // Sync brands to Supabase
      await Promise.all(
        (value as WithId<Brand>[]).map((brand) => {
          if (brand.id) {
            return supabaseBrands.update(brand.id, brand).catch(() => supabaseBrands.create(brand));
          }
          return supabaseBrands.create(brand);
        })
      );
    } else if (key === GYM_OFFERS_KEY && Array.isArray(value)) {
      // Sync offers to Supabase
      await Promise.all(
        (value as WithId<Offer>[]).map((offer) => {
          if (offer.id) {
            return supabaseOffers.update(offer.id, offer).catch(() => supabaseOffers.create(offer));
          }
          return supabaseOffers.create(offer);
        })
      );
    } else if (key === GYM_ORDERS_KEY && Array.isArray(value)) {
      // Sync orders to Supabase
      await Promise.all(
        (value as WithId<OrderLog>[]).map((order) => {
          if (order.id) {
            return supabaseOrders.update(order.id, order).catch(() => supabaseOrders.create(order));
          }
          return supabaseOrders.create(order);
        })
      );
    } else if (key === GYM_REVIEWS_KEY && Array.isArray(value)) {
      // Sync reviews to Supabase
      await Promise.all(
        (value as WithId<Review>[]).map((review) => {
          if (review.id) {
            return supabaseReviews.update(review.id, review).catch(() => supabaseReviews.create(review));
          }
          return supabaseReviews.create(review);
        })
      );
    } else if (key === GYM_PAYMENTS_KEY && Array.isArray(value)) {
      // Sync payments to Supabase
      await Promise.all(
        (value as WithId<PaymentLog>[]).map((payment) => {
          if (payment.id) {
            return supabasePayments.update(payment.id, payment).catch(() => supabasePayments.create(payment));
          }
          return supabasePayments.create(payment);
        })
      );
    } else if (key === GYM_ATTENDANCE_KEY && Array.isArray(value)) {
      // Sync attendance to Supabase
      await Promise.all(
        (value as WithId<AttendanceLog>[]).map((attendance) => {
          if (attendance.id) {
            return supabaseAttendance.update(attendance.id, attendance).catch(() => supabaseAttendance.create(attendance));
          }
          return supabaseAttendance.create(attendance);
        })
      );
    } else if (key === GYM_BOOKINGS_KEY && Array.isArray(value)) {
      // Sync bookings to Supabase
      await Promise.all(
        (value as WithId<Booking>[]).map((booking) => {
          if (booking.id) {
            return supabaseBookings.update(booking.id, booking).catch(() => supabaseBookings.create(booking));
          }
          return supabaseBookings.create(booking);
        })
      );
    } else if (key === GYM_CONTACT_MESSAGES_KEY && Array.isArray(value)) {
      // Sync contact messages to Supabase
      await Promise.all(
        (value as ContactMessage[]).map((message) => {
          if (message.id) {
            return supabaseContactMessages.create(message).catch(() => {});
          }
          return supabaseContactMessages.create(message);
        })
      );
    }
  } catch (error) {
    console.warn("Supabase sync failed, falling back to gym_data:", error);
  }

  // Always save to gym_data table as backup
  const response = await fetch(getGymDataUrl(key), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    throw new Error(`Could not save ${key}`);
  }

  const payload = (await response.json()) as { value: T };
  return normalizeGymDataValue(key, payload.value);
}

// Client-side cache to persist state across component remounts during client-side navigation
const clientCache: Record<string, unknown> = {};
const pendingFetches: Record<string, Promise<unknown> | undefined> = {};

function fetchGymDataOnce<T>(key: string, seed: T): Promise<T> {
  if (!pendingFetches[key]) {
    pendingFetches[key] = fetchGymData(key, seed).finally(() => {
      pendingFetches[key] = undefined;
    });
  }

  return pendingFetches[key] as Promise<T>;
}

// Custom hook generator for reactive gym state
export function useGymState<T>(key: string, seed: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(seed);
  // Track the last time we wrote locally so polling doesn't overwrite it
  const lastWriteRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;

    // Load from localStorage synchronously on mount to prevent delay/flicker
    const localVal = normalizeGymDataValue(key, getStorageItem(key, seed));
    setState(localVal);
    clientCache[key] = localVal;

    const refreshFromApi = async () => {
      // Suppress polling for 10 seconds after a local write
      if (Date.now() - lastWriteRef.current < 10000) return;

      try {
        const value = normalizeGymDataValue(key, await fetchGymDataOnce(key, seed));
        if (cancelled) return;
        cacheStorageItem(key, value);
        setState(value);
        clientCache[key] = value;
      } catch {
        // Backend not available — localStorage already loaded
      }
    };

    const handleStorageEvent = (e: StorageEvent | Event) => {
      // Ignore storage events triggered by our own writes
      if (Date.now() - lastWriteRef.current < 500) return;
      if (e instanceof StorageEvent) {
        if (e.key && e.key !== key) return;
        const localValue = normalizeGymDataValue(key, getStorageItem(key, seed));
        setState(localValue);
        clientCache[key] = localValue;
      }
      if (e instanceof CustomEvent && e.detail?.key && e.detail.key !== key) return;
      refreshFromApi();
    };

    // Initial load
    refreshFromApi();
    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener(GYM_DATA_CHANGED_EVENT, handleStorageEvent);
    window.addEventListener("focus", refreshFromApi);
    const interval =
      Number.isFinite(GYM_SYNC_INTERVAL_MS) && GYM_SYNC_INTERVAL_MS > 0
        ? window.setInterval(refreshFromApi, Math.max(GYM_SYNC_INTERVAL_MS, 30000))
        : undefined;

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener(GYM_DATA_CHANGED_EVENT, handleStorageEvent);
      window.removeEventListener("focus", refreshFromApi);
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateState = (newValue: T) => {
    const normalizedValue = normalizeGymDataValue(key, newValue);
    // Record write timestamp BEFORE anything else
    lastWriteRef.current = Date.now();
    // Optimistic local update — immediate, no waiting
    setState(normalizedValue);
    clientCache[key] = normalizedValue;
    setStorageItem(key, normalizedValue);
    // Fire API save silently in the background
    saveGymData(key, normalizedValue).catch(() => {
      // Backend not available — localStorage is the source of truth
    });
  };

  return [state, updateState];
}

// Domain specific hooks
export function useGymSettings() {
  return useGymState<SharedGymContent>(GYM_SETTINGS_KEY, defaultGymContent);
}

export function useGymClients() {
  return useGymState<DemoClient[]>(GYM_CLIENTS_KEY, demoClients);
}

export function useGymTrainers() {
  return useGymState<Trainer[]>(GYM_TRAINERS_KEY, defaultTrainers);
}

export function useGymBlogs() {
  return useGymState<BlogPost[]>(GYM_BLOGS_KEY, blogPosts);
}

export function useGymPayments() {
  return useGymState<PaymentLog[]>(GYM_PAYMENTS_KEY, defaultPayments);
}

export function useGymProducts() {
  return useGymState<Product[]>(GYM_PRODUCTS_KEY, defaultProducts);
}

export function useGymBrands() {
  return useGymState<Brand[]>(GYM_BRANDS_KEY, defaultBrands);
}

export function useGymOffers() {
  return useGymState<Offer[]>(GYM_OFFERS_KEY, defaultOffers);
}

export function useGymOrders() {
  return useGymState<OrderLog[]>(GYM_ORDERS_KEY, defaultOrders);
}

export function useGymReviews() {
  return useGymState<Review[]>(GYM_REVIEWS_KEY, defaultReviews);
}

export function useGymAttendance() {
  return useGymState<AttendanceLog[]>(GYM_ATTENDANCE_KEY, defaultAttendance);
}

export function useGymClasses() {
  return useGymState<ClassSchedule[]>(GYM_CLASSES_KEY, defaultClasses);
}

export function useGymBookings() {
  return useGymState<Booking[]>(GYM_BOOKINGS_KEY, defaultBookings);
}

export function getNextClientId(clients: { id: string }[]): string {
  let maxNum = 0;
  if (clients && Array.isArray(clients)) {
    for (const client of clients) {
      if (client && client.id) {
        const match = client.id.match(/^FB-?(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
  }
  return `FB${maxNum + 1}`;
}

export const defaultGallery: string[] = [];

export function useGymGallery() {
  return useGymState<string[]>(GYM_GALLERY_KEY, defaultGallery);
}

const defaultContactMessages: ContactMessage[] = [];

export function useGymContactMessages() {
  return useGymState<ContactMessage[]>(GYM_CONTACT_MESSAGES_KEY, defaultContactMessages);
}

const defaultShopCategories: ShopCategory[] = [
  { label: "Plant Proteins", category: "Protein", image: "/images/kettlebell.jpg", order: 0 },
  { label: "Creatine", category: "Creatine", image: "/images/crossfit-weights.jpg", order: 1 },
  { label: "Gainers", category: "Mass Gainer", image: "/images/strength-training.jpg", order: 2 },
  { label: "Pre Workout", category: "Pre-Workout", image: "/images/equipment-row.jpg", order: 3 },
  { label: "Vitals", category: "Vitamins", image: "/images/fitness-logo.jpg", order: 4 },
  { label: "Health Foods", category: "Protein", image: "/images/calm-yoga.jpg", order: 5 },
  { label: "Meal Shake", category: "Protein", image: "/images/yoga-wellness.jpg", order: 6 },
  { label: "Nut Butter", category: "Vitamins", image: "/images/cardio-training.jpg", order: 7 },
  { label: "BCAA", category: "BCAA", image: "/images/sunset-yoga.jpg", order: 8 },
];

export function useGymShopCategories() {
  return useGymState<ShopCategory[]>(GYM_SHOP_CATEGORIES_KEY, defaultShopCategories);
}

export interface ScheduleRow {
  day: string;
  workout: string;
}

export function parseScheduleTable(scheduleStr: string | undefined): ScheduleRow[] {
  if (!scheduleStr) return [];
  const trimmed = scheduleStr.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item: Record<string, unknown>) => ({
          day: String(item.day || item.days || "").trim(),
          workout: String(item.workout || item.workouts || "").trim()
        }));
      }
    } catch {
      // fallback to pipe/dash format parsing below
    }
  }

  // Parse pipe/dash format
  return trimmed
    .split("|")
    .map((part) => {
      const pTrim = part.trim();
      if (!pTrim) return null;
      const dashIdx = pTrim.indexOf(" - ");
      if (dashIdx !== -1) {
        return {
          day: pTrim.substring(0, dashIdx).trim(),
          workout: pTrim.substring(dashIdx + 3).trim(),
        };
      }
      const hyphenIdx = pTrim.indexOf("-");
      if (hyphenIdx !== -1) {
        return {
          day: pTrim.substring(0, hyphenIdx).trim(),
          workout: pTrim.substring(hyphenIdx + 1).trim(),
        };
      }
      return {
        day: pTrim,
        workout: "",
      };
    })
    .filter((item): item is ScheduleRow => item !== null);
}

export function serializeScheduleTable(rows: ScheduleRow[]): string {
  return JSON.stringify(rows);
}
