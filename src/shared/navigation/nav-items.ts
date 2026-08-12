import {
  LayoutDashboard as LayoutDashboardIcon,
  Truck as TruckIcon,
  Package as PackageIcon,
  Warehouse as WarehouseIcon,
  ShoppingCart as ShoppingCartIcon,
  Users as UsersIcon,
  Megaphone as MegaphoneIcon,
  FileBarChart2 as FileBarChart2Icon,
  Wrench as WrenchIcon,
  Plug as PlugIcon,
  Settings as SettingsIcon,
  ScrollText as ScrollTextIcon,
  Building2 as Building2Icon,
  UserCog as UserCogIcon,
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

// Shown while a single store is selected in the sidebar switcher — every
// item here operates on that one tenant's data.
export const STORE_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  {
    label: "Suppliers",
    href: "/suppliers",
    icon: TruckIcon,
    children: [
      { label: "All Suppliers", href: "/suppliers" },
      { label: "Connected Accounts", href: "/suppliers/connected-accounts" },
      { label: "Sync History", href: "/suppliers/sync-history" },
    ],
  },
  {
    label: "Products",
    href: "/products",
    icon: PackageIcon,
    children: [
      { label: "All Products", href: "/products" },
      { label: "Categories", href: "/products/categories" },
      { label: "Brands", href: "/products/brands" },
      { label: "Collections", href: "/products/collections" },
    ],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: WarehouseIcon,
    children: [
      { label: "Locations", href: "/inventory" },
      { label: "Stock Lookup", href: "/inventory/stock" },
      { label: "Transactions", href: "/inventory/transactions" },
    ],
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCartIcon,
    children: [
      { label: "All Orders", href: "/orders" },
      { label: "Processing", href: "/orders/processing" },
      { label: "Completed", href: "/orders/completed" },
      { label: "Returns", href: "/orders/returns" },
    ],
  },
  { label: "Customers", href: "/customers", icon: UsersIcon },
  {
    label: "Marketing",
    href: "/marketing",
    icon: MegaphoneIcon,
    children: [
      { label: "Campaigns", href: "/marketing" },
      { label: "Social Accounts", href: "/marketing/social-accounts" },
      { label: "AI Content", href: "/marketing/ai-content" },
    ],
  },
  { label: "Reports", href: "/reports", icon: FileBarChart2Icon },
  {
    label: "Tools",
    href: "/tools",
    icon: WrenchIcon,
    children: [
      { label: "Product Sync", href: "/tools" },
      { label: "Bulk Update", href: "/tools/bulk-update" },
      { label: "AI Generator", href: "/tools/ai-generator" },
    ],
  },
  { label: "Integrations", href: "/integrations", icon: PlugIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
  { label: "Activity Logs", href: "/activity-logs", icon: ScrollTextIcon },
];

// Shown while "Platform" is selected — super-admin-only, cross-tenant
// concerns. Store-scoped items (Products, Orders, Customers, ...) don't
// apply here since there's no single tenant to operate on: GET
// /api/v2/customers scopes its result to whichever tenant sends
// x-tenant-slug, and no tenant is selected at platform scope. Staff & Roles
// stays here because GET /api/v2/users (which it reads from) has no tenant
// field — that account list is genuinely platform-wide.
export const PLATFORM_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Tenants", href: "/tenants", icon: Building2Icon },
  { label: "Staff & Roles", href: "/staff", icon: UserCogIcon },
  { label: "Activity Logs", href: "/activity-logs", icon: ScrollTextIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

export function getNavItems(isPlatformScope: boolean): NavItem[] {
  return isPlatformScope ? PLATFORM_NAV_ITEMS : STORE_NAV_ITEMS;
}
