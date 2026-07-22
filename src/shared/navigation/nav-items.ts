import {
  LayoutDashboard,
  Truck,
  Package,
  ShoppingCart,
  Users,
  Megaphone,
  FileBarChart2,
  Wrench,
  Plug,
  Settings,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export type NavChildItem = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavChildItem[];
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: Truck,
    children: [
      { label: "All Suppliers", href: "/suppliers" },
      { label: "Connected Accounts", href: "/suppliers/connected-accounts" },
      { label: "Sync History", href: "/suppliers/sync-history" },
    ],
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
    children: [
      { label: "All Products", href: "/products" },
      { label: "Categories", href: "/products/categories" },
      { label: "Brands", href: "/products/brands" },
      { label: "Collections", href: "/products/collections" },
    ],
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    children: [
      { label: "All Orders", href: "/orders" },
      { label: "Processing", href: "/orders/processing" },
      { label: "Completed", href: "/orders/completed" },
      { label: "Returns", href: "/orders/returns" },
    ],
  },
  { label: "Customers", href: "/customers", icon: Users },
  {
    label: "Marketing",
    href: "/marketing",
    icon: Megaphone,
    children: [
      { label: "Campaigns", href: "/marketing" },
      { label: "Social Accounts", href: "/marketing/social-accounts" },
      { label: "AI Content", href: "/marketing/ai-content" },
    ],
  },
  { label: "Reports", href: "/reports", icon: FileBarChart2 },
  {
    label: "Tools",
    href: "/tools",
    icon: Wrench,
    children: [
      { label: "Product Sync", href: "/tools" },
      { label: "Bulk Update", href: "/tools/bulk-update" },
      { label: "AI Generator", href: "/tools/ai-generator" },
    ],
  },
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Activity Logs", href: "/activity-logs", icon: ScrollText },
];
