export type PlanType = "standard" | "pro" | "premium" | "enterprise";

export interface PlanLimits {
  tables: number | null; // null = unlimited
  chefs: number | null;
  managers: number | null;
  waiters: number | null;
  allowedRoles: string[];
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number | null; // null for enterprise (custom pricing)
  priceDisplay: string;
  features: string[];
  limits: PlanLimits;
  popular?: boolean;
}

export const PLANS: Record<PlanType, Plan> = {
  standard: {
    id: "standard",
    name: "Standard Plan",
    price: 250,
    priceDisplay: "₹250/month",
    features: ["Up to 5 tables", "1 chef", "3 waiters", "Billing route access", "Basic support"],
    limits: {
      tables: 5,
      chefs: 1,
      managers: 0,
      waiters: 3,
      allowedRoles: ["chef", "waiter", "tenant_admin"],
    },
  },
  pro: {
    id: "pro",
    name: "Pro Plan",
    price: 600,
    priceDisplay: "₹600/month",
    features: [
      "Up to 10 tables",
      "3 chefs",
      "1 manager",
      "5 waiters",
      "All features except universal admin",
      "Priority support",
    ],
    limits: {
      tables: 10,
      chefs: 3,
      managers: 1,
      waiters: 5,
      allowedRoles: ["chef", "waiter", "manager", "tenant_admin"],
    },
    popular: true,
  },
  premium: {
    id: "premium",
    name: "Premium Plan",
    price: 850,
    priceDisplay: "₹850/month",
    features: [
      "Up to 25 tables",
      "8 chefs",
      "3 managers",
      "9 waiters",
      "All features except universal admin",
      "Premium support",
      "Advanced analytics",
    ],
    limits: {
      tables: 25,
      chefs: 8,
      managers: 3,
      waiters: 9,
      allowedRoles: ["chef", "waiter", "manager", "tenant_admin"],
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Plan",
    price: null,
    priceDisplay: "Contact us",
    features: [
      "Unlimited tables",
      "Unlimited users",
      "All roles available",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    limits: {
      tables: null,
      chefs: null,
      managers: null,
      waiters: null,
      allowedRoles: ["chef", "waiter", "manager", "tenant_admin"],
    },
  },
};
