"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { defaultGymContent, type SharedGymContent, type SharedMembershipPlan } from "./sharedGymContent";
import { demoClients, type DemoClient } from "./clientPortal";
import { blogPosts, type BlogPost } from "./blogs";
export type { BlogPost };

// Import Supabase client for optional direct table operations
import {
  supabaseClients,
  supabaseTrainers,
  supabasePrograms,
  supabaseProducts,
  supabaseBrands,
  supabaseOffers,
  supabaseOrders,
  supabaseReviews,
  supabasePayments,
  supabaseAttendance,
  supabaseBookings,
  supabaseContactMessages,
  supabaseShopCategories,
  supabaseBlogs,
  supabaseMemberships,
  supabaseTrash,
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
export const GYM_PROGRAMS_KEY = "fitness-bhaktapur-programs-list";
export const GYM_CLASSES_KEY = "fitness-bhaktapur-classes-list";
export const GYM_BOOKINGS_KEY = "fitness-bhaktapur-bookings-list";
export const GYM_GALLERY_KEY = "fitness-bhaktapur-gallery-list";
export const GYM_CONTACT_MESSAGES_KEY = "fitness-bhaktapur-contact-messages";
export const GYM_SHOP_CATEGORIES_KEY = "fitness-bhaktapur-shop-categories";
export const GYM_HOME_PAGE_KEY = "fitness-bhaktapur-home-page";
export const GYM_ABOUT_PAGE_KEY = "fitness-bhaktapur-about-page";

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

function getShopCategoryIdentity(category: Partial<ShopCategory>) {
  return `${category.label || ""}::${category.category || ""}`.trim().toLowerCase();
}

function stableUuidFromString(value: string) {
  let hashA = 0x811c9dc5;
  let hashB = 0x45d9f3b;
  let hashC = 0x27d4eb2d;
  let hashD = 0x165667b1;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    hashA = Math.imul(hashA ^ code, 16777619);
    hashB = Math.imul(hashB ^ code, 1597334677);
    hashC = Math.imul(hashC ^ code, 2246822519);
    hashD = Math.imul(hashD ^ code, 3266489917);
  }

  const hex = [hashA, hashB, hashC, hashD]
    .map((part) => (part >>> 0).toString(16).padStart(8, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
}

function isPersistedId(id: string | undefined) {
  return !!id && !id.startsWith("temp-");
}

function isPersistedProductId(id: string | undefined) {
  return !!id && !/^(temp|legacy-product|default-product)-/.test(id);
}

function dedupeShopCategories(categories: ShopCategory[]) {
  const byIdentity = new Map<string, ShopCategory>();

  categories.forEach((category) => {
    const identity = getShopCategoryIdentity(category);
    if (!identity || identity === "::") return;

    const existing = byIdentity.get(identity);
    if (!existing) {
      byIdentity.set(identity, category);
      return;
    }

    byIdentity.set(identity, {
      ...existing,
      ...category,
      id: existing.id || category.id,
      order: typeof existing.order === "number" ? existing.order : category.order,
      image: existing.image || category.image,
    });
  });

  return Array.from(byIdentity.values());
}

function getGymDataUrl(key: string) {
  const encodedKey = encodeURIComponent(key);

  if (GYM_API_BASE_URL) {
    return `${GYM_API_BASE_URL}/api/gym-data/${encodedKey}`;
  }

  return `/api/gym-data?key=${encodedKey}`;
}

function normalizeGymDataValue<T>(key: string, value: T): T {
  if (!value) return value;

  if (key === GYM_SETTINGS_KEY && typeof value === "object") {
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

  if (key === GYM_HOME_PAGE_KEY && typeof value === "object" && !Array.isArray(value)) {
    const homePage = value as Partial<HomePageContent>;
    return {
      ...defaultHomePageContent,
      ...homePage,
      slides: Array.isArray(homePage.slides) && homePage.slides.length
        ? homePage.slides.filter((slide): slide is string => typeof slide === "string" && Boolean(slide))
        : defaultHomePageContent.slides,
    } as T;
  }

  if (key === GYM_ABOUT_PAGE_KEY && typeof value === "object" && !Array.isArray(value)) {
    return { ...defaultAboutPageContent, ...(value as Partial<AboutPageContent>) } as T;
  }

  if (key === GYM_PRODUCTS_KEY && Array.isArray(value)) {
    return value.map((p, index) => {
      if (p && typeof p === "object") {
        const prod = p as Partial<Product>;
        const legacyId = `legacy-product-${stableUuidFromString(`${prod.name || "product"}::${prod.brandKey || ""}::${prod.category || ""}::${prod.flavor || ""}::${prod.size || ""}::${index}`)}`;
        if (prod.category && /^proti?en$/i.test(prod.category)) {
          return { ...prod, id: prod.id || legacyId, category: "Protein" };
        }
        return { ...prod, id: prod.id || legacyId };
      }
      return p;
    }) as unknown as T;
  }

  if (key === GYM_SHOP_CATEGORIES_KEY && Array.isArray(value)) {
    const normalizedCategories = value.map((c) => {
      if (c && typeof c === "object") {
        const cat = c as Partial<ShopCategory>;
        let updated = false;
        const newCat = { ...cat };
        if (cat.category && /^proti?en$/i.test(cat.category)) {
          newCat.category = "Protein";
          updated = true;
        }
        if (cat.label && /^proti?en$/i.test(cat.label)) {
          newCat.label = "Protein";
          updated = true;
        }
        if (updated) return newCat;
      }
      return c;
    }) as ShopCategory[];

    return dedupeShopCategories(normalizedCategories) as unknown as T;
  }

  return value;
}

// Types
export type Trainer = {
  id?: string;
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
  id?: string;
  name: string;
  type: string;
  discount: string;
  code: string;
  validTill: string;
  status: string;
};

export type OrderItemDetail = {
  productName: string;
  brand?: string;
  quantity: number;
  price?: string;
  image?: string;
};

export type OrderLog = {
  id?: string;
  orderId: string;
  customer: string;
  items?: string;
  total: string;
  payment: string;
  status: string;
  date: string;
  email?: string;
  phone?: string;
  pickupPoint?: string;
  address?: string;
  paymentMethod?: string;
  cartItems?: OrderItemDetail[];
};

export type Review = {
  id?: string;
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
  id?: string;
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
  tag?: string; // badge tag e.g. "Popular", "New", "Top Rated", "Fat Burn"
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
    id: "default-product-gold-standard-whey",
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
    id: "default-product-micronized-creatine",
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
    id: "default-product-biozyme-whey",
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
    id: "default-product-mass-gainer-xxl",
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
    id: "default-product-iso100-hydrolyzed",
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
    id: "default-product-amino-pro-bcaa",
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

const defaultReviews: Review[] = [
  { id: "rev-1", customer: "Aarav Sharma", product: "Optimum Nutrition Gold Standard 100% Whey", rating: "5", reviewText: "Extremely good quality whey! Mixes super well with milk and water, no clumps at all.", date: "15 Jul 2026", status: "Approved" },
  { id: "rev-2", customer: "Sujata Thapa", product: "Optimum Nutrition Gold Standard 100% Whey", rating: "5", reviewText: "Tastes fantastic and helped tremendously with post-workout muscle recovery.", date: "18 Jul 2026", status: "Approved" },
  { id: "rev-3", customer: "Bikash Shrestha", product: "Muscletech Platinum 100% Creatine", rating: "5", reviewText: "Noticeable increase in bench and squat strength within 2 weeks of use. 10/10!", date: "10 Jul 2026", status: "Approved" },
  { id: "rev-4", customer: "Pooja Karki", product: "Cellucor C4 Original Pre-Workout", rating: "4", reviewText: "Great energy boost for early morning heavy gym sessions.", date: "12 Jul 2026", status: "Approved" },
  { id: "rev-5", customer: "Rohan Gurung", product: "Dymatize ISO 100 Whey Protein Hydrolyzate", rating: "5", reviewText: "Zero bloating, incredibly fast absorption, and tastes just like real chocolate fudge!", date: "20 Jul 2026", status: "Approved" },
];

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

// ─── Soft Delete Utilities ────────────────────────────────────────────────────

export type TrashItem = {
  id: string;
  name: string;
  module: string;
  tableName: string;
  deletedAt: string;
  deletedBy: string;
};

/**
 * Soft-delete an item in Supabase (sets is_deleted=true).
 * Falls back silently if the item has no Supabase ID.
 */
export async function softDeleteItem(tableName: string, id: string): Promise<void> {
  try {
    await supabaseTrash.softDelete(tableName, id);
  } catch (err) {
    console.warn(`[softDelete] Failed for ${tableName}/${id}:`, err);
  }
}

/**
 * Restore a soft-deleted item (sets is_deleted=false).
 */
export async function restoreItem(tableName: string, id: string): Promise<void> {
  try {
    await supabaseTrash.restore(tableName, id);
  } catch (err) {
    console.warn(`[restore] Failed for ${tableName}/${id}:`, err);
  }
}

/**
 * Permanently delete an item from the database.
 */
export async function permanentDeleteItem(tableName: string, id: string): Promise<void> {
  try {
    await supabaseTrash.permanentDelete(tableName, id);
  } catch (err) {
    console.warn(`[permanentDelete] Failed for ${tableName}/${id}:`, err);
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
    } else if (key === GYM_PROGRAMS_KEY || key === GYM_CLASSES_KEY) {
      const data = await supabasePrograms.get();
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
      const data = await supabaseOrders.get().catch(() => []);
      if (data && data.length > 0) {
        return data as T;
      }
      // fall through to gym_data backup
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
    } else if (key === GYM_SHOP_CATEGORIES_KEY) {
      const data = await supabaseShopCategories.get();
      return data as T;
    } else if (key === GYM_BLOGS_KEY) {
      const data = await supabaseBlogs.get();
      // Only use the dedicated table if it actually has records;
      // otherwise fall through to gym_data which has the persisted JSON
      if (data && data.length > 0) {
        return data as T;
      }
      // fall through to gym_data
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
  const normalized = normalizeGymDataValue(key, payload.value ?? seed);

  if (key === GYM_SETTINGS_KEY) {
    try {
      const membershipPlans = await supabaseMemberships.get();
      if (membershipPlans.length) {
        return { ...(normalized as SharedGymContent), membershipPlans } as T;
      }
      // Memberships table empty but gym_data has plans — seed dedicated table in background
      const gymDataPlans = (normalized as SharedGymContent).membershipPlans;
      if (Array.isArray(gymDataPlans) && gymDataPlans.length > 0) {
        saveGymData(key, normalized).catch(() => {});
      }
    } catch {
      // The generic settings record remains available while memberships migrate.
    }
  }

  if (key === GYM_BLOGS_KEY) {
    // Blogs dedicated table was empty — seed it in the background from gym_data values
    if (Array.isArray(normalized) && normalized.length > 0) {
      saveGymData(key, normalized).catch(() => {});
    }
  }

  if (key === GYM_ORDERS_KEY) {
    if (Array.isArray(normalized) && normalized.length > 0) {
      // Sync orders to dedicated table in background if needed
      saveGymData(key, normalized).catch(() => {});
      return normalized;
    }

    if (typeof window !== "undefined") {
      const localStr = window.localStorage.getItem(GYM_ORDERS_KEY);
      if (localStr) {
        try {
          const localOrders = JSON.parse(localStr) as OrderLog[];
          if (Array.isArray(localOrders) && localOrders.length > 0) {
            saveGymData(key, localOrders as unknown as T).catch(() => {});
            return localOrders as unknown as T;
          }
        } catch {
          // ignore
        }
      }
    }
  }

  return normalized;
}

export async function saveGymData<T>(key: string, value: T): Promise<T> {
  // Helper type: records fetched from Supabase may carry an extra `id` field
  type WithId<U> = U & { id?: string };

  // Try to save to Supabase tables for structured data
  try {
    if (key === GYM_CLIENTS_KEY && Array.isArray(value)) {
      // Sync clients to Supabase — update/create kept clients, soft-delete removed ones
      const newClients = value as WithId<DemoClient>[];
      const newIdSet = new Set(newClients.map((c) => c.id).filter(Boolean));

      // Fetch existing Supabase clients to detect deletions
      const existingClients = await supabaseClients.get().catch(() => []) as WithId<DemoClient>[];

      // Soft-delete clients that are no longer in the local list
      await Promise.all(
        existingClients
          .filter((existing) => existing.id && !newIdSet.has(existing.id))
          .map((removed) => supabaseClients.softDelete(removed.id!).catch(() => {}))
      );

      // Update/create the remaining clients
      await Promise.all(
        newClients.map((client) => {
          if (client.id) {
            return supabaseClients.update(client.id, client).catch(() => supabaseClients.create(client));
          }
          return supabaseClients.create(client);
        })
      );
    } else if (key === GYM_BLOGS_KEY && Array.isArray(value)) {
      const blogs = value as WithId<BlogPost>[];
      const existingBlogs = await supabaseBlogs.get().catch(() => []) as WithId<BlogPost>[];
      const existingBySlug = new Map(existingBlogs.map((blog) => [blog.slug, blog]));
      await Promise.all(blogs.map((blog) => {
        const existing = existingBySlug.get(blog.slug);
        return existing?.id
          ? supabaseBlogs.update(existing.id, blog as unknown as Record<string, unknown>)
          : supabaseBlogs.create(blog as unknown as Record<string, unknown>);
      }));
      await Promise.all(existingBlogs
        .filter((existing) => existing.id && !blogs.some((blog) => blog.slug === existing.slug))
        .map((existing) => supabaseBlogs.delete(existing.id!)));
    } else if (key === GYM_SETTINGS_KEY && value && typeof value === "object") {
      const settings = value as unknown as SharedGymContent;
      const plans = settings.membershipPlans as WithId<SharedMembershipPlan>[];
      const existingPlans = await supabaseMemberships.get().catch(() => []) as WithId<SharedMembershipPlan>[];
      const existingByKey = new Map(existingPlans.map((plan) => [plan.key, plan]));
      await Promise.all(plans.map((plan) => {
        const existing = existingByKey.get(plan.key);
        return existing?.id
          ? supabaseMemberships.update(existing.id, plan as Record<string, unknown>)
          : supabaseMemberships.create(plan as Record<string, unknown>);
      }));
      await Promise.all(existingPlans
        .filter((existing) => existing.id && !plans.some((plan) => plan.key === existing.key))
        .map((existing) => supabaseMemberships.delete(existing.id!)));
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
    } else if ((key === GYM_PROGRAMS_KEY || key === GYM_CLASSES_KEY) && Array.isArray(value)) {
      // Sync programs to Supabase and patch back returned ids for new programs
      const programsArr = value as WithId<ClassSchedule>[];
      const updatedPrograms = await Promise.all(
        programsArr.map(async (program, idx) => {
          try {
            const isNew = !program.id || program.id.startsWith("temp-");
            if (!isNew) {
              await supabasePrograms.update(program.id!, program as Record<string, unknown>).catch(() =>
                supabasePrograms.create(program as Record<string, unknown>)
              );
              return program;
            } else {
              // Strip temp id before sending to Supabase
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id: _tempId, ...programWithoutId } = program;
              // Create and capture the returned record to get the auto-assigned id
              const created = (await supabasePrograms.create(programWithoutId as Record<string, unknown>)) as unknown as WithId<ClassSchedule> | null;
              if (created?.id) {
                programsArr[idx] = { ...program, id: created.id };
                return programsArr[idx];
              }
              return program;
            }
          } catch (err) {
            console.error("[saveGymData] Error saving program to Supabase:", err);
            return program;
          }
        })
      );
      if (typeof window !== "undefined") {
        window.localStorage.setItem(GYM_PROGRAMS_KEY, JSON.stringify(updatedPrograms));
        window.localStorage.setItem(GYM_CLASSES_KEY, JSON.stringify(updatedPrograms));
      }
      return updatedPrograms as unknown as T;
    } else if (key === GYM_PRODUCTS_KEY && Array.isArray(value)) {
      // Sync products to Supabase and patch back returned ids for new products
      const productsArr = value as WithId<Product>[];
      const updatedProducts = await Promise.all(
        productsArr.map(async (product, idx) => {
          try {
            const isNew = !isPersistedProductId(product.id);
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
      value = updatedProducts as T;
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
      // Sync orders to Supabase, patching back DB-assigned ids for new orders
      const ordersArr = value as WithId<OrderLog>[];
      const updatedOrders = await Promise.all(
        ordersArr.map(async (order) => {
          try {
            if (order.id) {
              await supabaseOrders.update(order.id, order as Record<string, unknown>).catch(() =>
                supabaseOrders.create(order as Record<string, unknown>)
              );
              return order;
            } else {
              // New order — create and capture Supabase-assigned id
              const created = await supabaseOrders.create(order as Record<string, unknown>) as unknown as WithId<OrderLog> | null;
              if (created?.id) {
                return { ...order, id: created.id };
              }
              return order;
            }
          } catch {
            return order;
          }
        })
      );
      // Persist id-enriched array back to localStorage so future syncs use update
      if (typeof window !== "undefined") {
        window.localStorage.setItem(GYM_ORDERS_KEY, JSON.stringify(updatedOrders));
      }
      value = updatedOrders as T;
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
    } else if (key === GYM_SHOP_CATEGORIES_KEY && Array.isArray(value)) {
      // Sync shop categories to Supabase without creating duplicate rows for the same label/category.
      const categoriesArr = dedupeShopCategories(value as WithId<ShopCategory>[]);
      const existingCategories = await supabaseShopCategories.get().catch(() => []) as WithId<ShopCategory>[];
      const existingByIdentity = new Map<string, WithId<ShopCategory>>();
      const duplicateExistingIds: string[] = [];

      existingCategories.forEach((cat) => {
        const identity = getShopCategoryIdentity(cat);
        const existing = existingByIdentity.get(identity);

        if (existing?.id && cat.id) {
          duplicateExistingIds.push(cat.id);
          return;
        }

        existingByIdentity.set(identity, cat);
      });

      const updatedCategories = await Promise.all(
        categoriesArr.map(async (cat) => {
          const identity = getShopCategoryIdentity(cat);
          const existing = existingByIdentity.get(identity);
          const categoryId = isPersistedId(cat.id) ? cat.id : undefined;
          const persistedId = categoryId || existing?.id || stableUuidFromString(`shop-category::${identity}`);
          const categoryPayload = { ...cat, id: persistedId };

          try {
            const updated = await supabaseShopCategories.update(persistedId, categoryPayload as Record<string, unknown>) as unknown as WithId<ShopCategory> | null;
            if (updated?.id) {
              return { ...cat, id: updated.id || persistedId };
            }

            const created = await supabaseShopCategories.create(categoryPayload as Record<string, unknown>) as unknown as WithId<ShopCategory>;
            return { ...cat, id: created.id };
          } catch {
            if (existing?.id) {
              const updated = await supabaseShopCategories.update(existing.id, categoryPayload as Record<string, unknown>) as unknown as WithId<ShopCategory>;
              return { ...cat, id: updated.id || existing.id };
            }

            const created = await supabaseShopCategories.create(categoryPayload as Record<string, unknown>) as unknown as WithId<ShopCategory>;
            return { ...cat, id: created.id };
          }
        })
      );

      await Promise.all(duplicateExistingIds.map((id) => supabaseShopCategories.delete(id).catch(() => {})));

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(updatedCategories));
      }
      value = updatedCategories as T;
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
    saveGymData(key, normalizedValue)
      .then((savedValue) => {
        const resolvedValue = normalizeGymDataValue(key, savedValue);
        setState(resolvedValue);
        clientCache[key] = resolvedValue;
        setStorageItem(key, resolvedValue);
      })
      .catch(() => {
      // Backend not available — localStorage is the source of truth
    });
  };

  return [state, updateState];
}

// Domain specific hooks
export function useGymSettings() {
  return useGymState<SharedGymContent>(GYM_SETTINGS_KEY, defaultGymContent);
}

export type HomePageContent = {
  eyebrow: string;
  headingFirstLine: string;
  headingSecondLine: string;
  description: string;
  primaryButtonLabel: string;
  primaryButtonLink: string;
  secondaryButtonLabel: string;
  secondaryButtonLink: string;
  slides: string[];
};

export const defaultHomePageContent: HomePageContent = {
  eyebrow: "Fitness Bhaktapur",
  headingFirstLine: "Transform Your Body",
  headingSecondLine: "Transform Your Life",
  description: "Join our fitness community and achieve your goals with expert trainers, modern equipment, and programs built for real progress.",
  primaryButtonLabel: "View Programs",
  primaryButtonLink: "/services",
  secondaryButtonLabel: "Join Now",
  secondaryButtonLink: "/join",
  slides: ["/images/hero-gym.jpg", "/images/equipment-row.jpg", "/images/group-training.jpg"],
};

export function useHomePageContent() {
  return useGymState<HomePageContent>(GYM_HOME_PAGE_KEY, defaultHomePageContent);
}

export type AboutPageContent = {
  introEyebrow: string;
  introTitle: string;
  introBodyOne: string;
  introBodyTwo: string;
  introImage: string;
  missionHeading: string;
  missionBodyOne: string;
  missionBodyTwo: string;
  missionImageOne: string;
  missionImageTwo: string;
};

export const defaultAboutPageContent: AboutPageContent = {
  introEyebrow: "Welcome to Gym Fitness Bhaktapur",
  introTitle: "Transform Your Body,\nTransform Your Life",
  introBodyOne: "Fitness Bhaktapur stands as a premier fitness destination in Nepal, dedicated to providing a comprehensive health and wellness experience. Equipped with modern strength-training gear, advanced cardiovascular machinery, and specialized zones for functional fitness, CrossFit, and yoga, we cater to all fitness levels.",
  introBodyTwo: "Our facility offers flexible hours and supportive, structured programs tailored to your personal goals. Whether you are aiming to build strength, enhance endurance, find mental peace, or reset your mobility, we provide the perfect space and guidance to elevate your lifestyle.",
  introImage: "/images/gym-corner.jpg",
  missionHeading: "Our Mission",
  missionBodyOne: "At Fitness Bhaktapur, our mission is to empower individuals in our community to build lasting, healthy habits and achieve peak performance. We believe that true fitness goes beyond physical strength—it encompasses mental clarity, emotional balance, and a supportive network of like-minded people.",
  missionBodyTwo: "We strive to lower the barriers to high-quality health training by delivering professional coaching, safe and clean facilities, and educational resources. By fostering an inclusive environment, we encourage every member to push their limits and lead a more active, vibrant, and fulfilling life.",
  missionImageOne: "/images/calm-yoga.jpg",
  missionImageTwo: "/images/pullup-training.jpg",
};

export function useAboutPageContent() {
  return useGymState<AboutPageContent>(GYM_ABOUT_PAGE_KEY, defaultAboutPageContent);
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

export function useGymPrograms() {
  return useGymState<ClassSchedule[]>(GYM_PROGRAMS_KEY, defaultClasses);
}

export function useGymClasses() {
  return useGymPrograms();
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

export function useGymTrash() {
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/trash");
      if (res.ok) {
        const data = await res.json();
        setTrash(data);
      }
    } catch (err) {
      console.error("Failed to fetch trash:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  return { trash, loading, refresh: fetchTrash, setTrash };
}

