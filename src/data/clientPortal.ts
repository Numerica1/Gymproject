export type ClientPackage = {
  key: string;
  name: string;
  price: number;
  access: string;
  status: "Active" | "Pending" | "Expired";
  startedOn: string;
  renewsOn: string;
  paymentMethod: string;
  sessionsUsed: number;
  sessionsTotal: number;
  features: string[];
  upcomingClasses: string[];
  trainer: string;
};

export type DemoClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  package: ClientPackage;
  address?: string;
  weight?: string;
  height?: string;
  specialRequest?: string;
  username?: string;
  password?: string;
};

export const clientPackages: Record<string, Omit<ClientPackage, "startedOn" | "renewsOn" | "paymentMethod">> = {
  basic: {
    key: "basic",
    name: "Basic Membership",
    price: 2900,
    access: "Standard gym access and fitness classes",
    status: "Active",
    sessionsUsed: 8,
    sessionsTotal: 16,
    trainer: "Front Desk Support",
    features: [
      "Access to gym floor",
      "Standard fitness classes",
      "Basic fitness assessment",
      "Locker room access",
    ],
    upcomingClasses: ["Strength Basics", "Cardio Starter", "Mobility Reset"],
  },
  premium: {
    key: "premium",
    name: "Premium Membership",
    price: 4900,
    access: "All features with priority class booking",
    status: "Active",
    sessionsUsed: 14,
    sessionsTotal: 24,
    trainer: "Mike Johnson",
    features: [
      "Unlimited gym access",
      "Premium fitness classes",
      "Personalized training plan",
      "Priority class booking",
    ],
    upcomingClasses: ["HIIT Burn", "Power Strength", "Morning Yoga"],
  },
  elite: {
    key: "elite",
    name: "Elite Membership",
    price: 7900,
    access: "24/7 access and weekly personal training",
    status: "Active",
    sessionsUsed: 19,
    sessionsTotal: 32,
    trainer: "Sarah Williams",
    features: [
      "24/7 gym access",
      "Unlimited classes",
      "Weekly personal training",
      "Nutrition coaching review",
    ],
    upcomingClasses: ["Elite Conditioning", "Personal Training", "Recovery Yoga"],
  },
};

export const demoClients: DemoClient[] = [];

export const clientStorageKey = "fitness-bhaktapur-client";
