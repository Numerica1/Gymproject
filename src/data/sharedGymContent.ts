"use client";

import { useEffect, useState } from "react";

export type SharedMembershipPlan = {
  key: string;
  name: string;
  price: number;
  access: string;
  trainer: string;
  sessionsTotal: number;
  features: string[];
  upcomingClasses: string[];
  highlighted?: boolean;
};

export type SharedGymContent = {
  gymName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  logo: string;
  membershipPlans: SharedMembershipPlan[];
};

export const sharedGymContentKey = "fitness-bhaktapur-shared-content";
export const sharedGymContentChangedEvent = "fitness-bhaktapur-content-changed";

export const defaultGymContent: SharedGymContent = {
  gymName: "",
  email: "",
  phone: "",
  address: "",
  currency: "Rs",
  logo: "/images/fitness-logo.jpg",
  membershipPlans: [],
};

function mergeMembershipPlans(defaultPlans: SharedMembershipPlan[], storedPlans?: SharedMembershipPlan[]) {
  if (!storedPlans || !storedPlans.length) return defaultPlans;

  const merged = new Map<string, SharedMembershipPlan>(
    defaultPlans.map((plan) => [plan.key, plan])
  );

  storedPlans.forEach((plan) => {
    const existing = merged.get(plan.key);
    merged.set(plan.key, {
      ...existing,
      ...plan,
    });
  });

  return Array.from(merged.values());
}

export function readSharedGymContent() {
  if (typeof window === "undefined") {
    return defaultGymContent;
  }

  const storedContent = window.localStorage.getItem(sharedGymContentKey);
  if (!storedContent) {
    return defaultGymContent;
  }

  try {
    const stored = JSON.parse(storedContent) as Partial<SharedGymContent>;
    return {
      ...defaultGymContent,
      ...stored,
      membershipPlans: mergeMembershipPlans(defaultGymContent.membershipPlans, stored.membershipPlans),
    } as SharedGymContent;
  } catch {
    return defaultGymContent;
  }
}

export function saveSharedGymContent(content: SharedGymContent) {
  window.localStorage.setItem(sharedGymContentKey, JSON.stringify(content));
  window.dispatchEvent(new Event(sharedGymContentChangedEvent));
}

export function useSharedGymContent() {
  const [content, setContent] = useState(defaultGymContent);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const refreshContent = () => setContent(readSharedGymContent());

    refreshContent();
    window.addEventListener("storage", refreshContent);
    window.addEventListener(sharedGymContentChangedEvent, refreshContent);

    return () => {
      window.removeEventListener("storage", refreshContent);
      window.removeEventListener(sharedGymContentChangedEvent, refreshContent);
    };
  }, []);

  const saveContent = (nextContent: SharedGymContent) => {
    if (!hasMounted) return;
    saveSharedGymContent(nextContent);
    setContent(nextContent);
  };

  return { content, saveContent };
}
