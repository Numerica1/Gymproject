"use client";

import { useEffect, useRef, useState } from "react";
import { defaultGymContent, type SharedGymContent, type SharedMembershipPlan } from "./sharedGymContent";
import { demoClients, type DemoClient } from "./clientPortal";
import { blogPosts, type BlogPost } from "./blogs";
export type { BlogPost };

// Import Supabase client for optional direct table operations
import {
  supabaseClients,
  supabaseTrainers,
  supabaseClasses,
  supabaseProducts,
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
export const GYM_OFFERS_KEY = "fitness-bhaktapur-offers-list";
export const GYM_ORDERS_KEY = "fitness-bhaktapur-orders-list";
export const GYM_REVIEWS_KEY = "fitness-bhaktapur-reviews-list";
export const GYM_ATTENDANCE_KEY = "fitness-bhaktapur-attendance-list";
export const GYM_CLASSES_KEY = "fitness-bhaktapur-classes-list";
export const GYM_BOOKINGS_KEY = "fitness-bhaktapur-bookings-list";
export const GYM_GALLERY_KEY = "fitness-bhaktapur-gallery-list";
export const GYM_CONTACT_MESSAGES_KEY = "fitness-bhaktapur-contact-messages";

// Change event name for local tab notifications
export const GYM_DATA_CHANGED_EVENT = "fitness-bhaktapur-data-changed";
const GYM_API_BASE_URL = process.env.NEXT_PUBLIC_GYM_API_URL || "";
const GYM_SYNC_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_GYM_SYNC_INTERVAL_MS || "0");

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
    membershipPlans: settings.membershipPlans?.map((plan) => ({
      ...plan,
      price: usedOldCurrency && plan.price > 0 && plan.price < 100 ? plan.price * 100 : plan.price,
    })),
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
  name: string;
  category: string;
  price: string;
  stock: string;
  status: string;
  image?: string;
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

// Default Seeds
const defaultTrainers: Trainer[] = [];

const defaultPayments: PaymentLog[] = [];

const defaultProducts: Product[] = [];

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
  // Try to save to Supabase tables for structured data
  try {
    if (key === GYM_CLIENTS_KEY && Array.isArray(value)) {
      // Sync clients to Supabase
      await Promise.all(
        value.map((client: any) => {
          if (client.id) {
            return supabaseClients.update(client.id, client).catch(() => supabaseClients.create(client));
          }
          return supabaseClients.create(client);
        })
      );
    } else if (key === GYM_TRAINERS_KEY && Array.isArray(value)) {
      // Sync trainers to Supabase
      await Promise.all(
        value.map((trainer: any) => {
          if (trainer.id) {
            return supabaseTrainers.update(trainer.id, trainer).catch(() => supabaseTrainers.create(trainer));
          }
          return supabaseTrainers.create(trainer);
        })
      );
    } else if (key === GYM_CLASSES_KEY && Array.isArray(value)) {
      // Sync classes to Supabase
      await Promise.all(
        value.map((cls: any) => {
          if (cls.id) {
            return supabaseClasses.update(cls.id, cls).catch(() => supabaseClasses.create(cls));
          }
          return supabaseClasses.create(cls);
        })
      );
    } else if (key === GYM_PRODUCTS_KEY && Array.isArray(value)) {
      // Sync products to Supabase
      await Promise.all(
        value.map((product: any) => {
          if (product.id) {
            return supabaseProducts.update(product.id, product).catch(() => supabaseProducts.create(product));
          }
          return supabaseProducts.create(product);
        })
      );
    } else if (key === GYM_OFFERS_KEY && Array.isArray(value)) {
      // Sync offers to Supabase
      await Promise.all(
        value.map((offer: any) => {
          if (offer.id) {
            return supabaseOffers.update(offer.id, offer).catch(() => supabaseOffers.create(offer));
          }
          return supabaseOffers.create(offer);
        })
      );
    } else if (key === GYM_ORDERS_KEY && Array.isArray(value)) {
      // Sync orders to Supabase
      await Promise.all(
        value.map((order: any) => {
          if (order.id) {
            return supabaseOrders.update(order.id, order).catch(() => supabaseOrders.create(order));
          }
          return supabaseOrders.create(order);
        })
      );
    } else if (key === GYM_REVIEWS_KEY && Array.isArray(value)) {
      // Sync reviews to Supabase
      await Promise.all(
        value.map((review: any) => {
          if (review.id) {
            return supabaseReviews.update(review.id, review).catch(() => supabaseReviews.create(review));
          }
          return supabaseReviews.create(review);
        })
      );
    } else if (key === GYM_PAYMENTS_KEY && Array.isArray(value)) {
      // Sync payments to Supabase
      await Promise.all(
        value.map((payment: any) => {
          if (payment.id) {
            return supabasePayments.update(payment.id, payment).catch(() => supabasePayments.create(payment));
          }
          return supabasePayments.create(payment);
        })
      );
    } else if (key === GYM_ATTENDANCE_KEY && Array.isArray(value)) {
      // Sync attendance to Supabase
      await Promise.all(
        value.map((attendance: any) => {
          if (attendance.id) {
            return supabaseAttendance.update(attendance.id, attendance).catch(() => supabaseAttendance.create(attendance));
          }
          return supabaseAttendance.create(attendance);
        })
      );
    } else if (key === GYM_BOOKINGS_KEY && Array.isArray(value)) {
      // Sync bookings to Supabase
      await Promise.all(
        value.map((booking: any) => {
          if (booking.id) {
            return supabaseBookings.update(booking.id, booking).catch(() => supabaseBookings.create(booking));
          }
          return supabaseBookings.create(booking);
        })
      );
    } else if (key === GYM_CONTACT_MESSAGES_KEY && Array.isArray(value)) {
      // Sync contact messages to Supabase
      await Promise.all(
        value.map((message: any) => {
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
const clientCache: Record<string, any> = {};
const pendingFetches: Record<string, Promise<any> | undefined> = {};

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
  const [state, setState] = useState<T>(() => {
    if (typeof window !== "undefined" && clientCache[key] !== undefined) {
      return clientCache[key] as T;
    }
    return seed;
  });
  // Track the last time we wrote locally so polling doesn't overwrite it
  const lastWriteRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;

    // Load from localStorage synchronously on mount to prevent delay/flicker
    const localVal = normalizeGymDataValue(key, getStorageItem(key, seed));
    setState(localVal);
    clientCache[key] = localVal;

    const refreshFromApi = async () => {
      // Suppress polling for 10 seconds after any local write
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
        return parsed.map((item: any) => ({
          day: String(item.day || item.days || "").trim(),
          workout: String(item.workout || item.workouts || "").trim()
        }));
      }
    } catch (e) {
      // fallback
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

