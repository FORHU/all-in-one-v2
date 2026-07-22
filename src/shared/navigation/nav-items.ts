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

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Suppliers", href: "/suppliers", icon: Truck },
  { label: "Products", href: "/products", icon: Package },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
  { label: "Reports", href: "/reports", icon: FileBarChart2 },
  { label: "Tools", href: "/tools", icon: Wrench },
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Activity Logs", href: "/activity-logs", icon: ScrollText },
];
