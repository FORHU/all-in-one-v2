// No staff/roles endpoint exists yet — this feature is UI-only until a
// backend is wired up. Nothing here reads or writes real data.
export type StaffRole = "Super Admin" | "Admin" | "Developer";
export type StaffStatus = "Active" | "Invited";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  lastActive: string;
  isYou?: boolean;
};

export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: "1",
    name: "Global Super Admin",
    email: "superadmin@marketplace.com",
    role: "Super Admin",
    status: "Active",
    lastActive: "Just now",
    isYou: true,
  },
  {
    id: "2",
    name: "Wren Ashby",
    email: "wren.ashby@marketplace.com",
    role: "Super Admin",
    status: "Active",
    lastActive: "6 hours ago",
  },
  {
    id: "3",
    name: "Marcus Webb",
    email: "marcus.webb@marketplace.com",
    role: "Admin",
    status: "Active",
    lastActive: "3 hours ago",
  },
  {
    id: "4",
    name: "Priya Shah",
    email: "priya.shah@marketplace.com",
    role: "Admin",
    status: "Active",
    lastActive: "1 day ago",
  },
  {
    id: "5",
    name: "Elena Torres",
    email: "elena.torres@marketplace.com",
    role: "Admin",
    status: "Invited",
    lastActive: "—",
  },
  {
    id: "6",
    name: "Jonah Kim",
    email: "jonah.kim@marketplace.com",
    role: "Developer",
    status: "Active",
    lastActive: "5 hours ago",
  },
  {
    id: "7",
    name: "Sara Lindqvist",
    email: "sara.lindqvist@marketplace.com",
    role: "Developer",
    status: "Active",
    lastActive: "2 days ago",
  },
  {
    id: "8",
    name: "Theo Farrow",
    email: "theo.farrow@marketplace.com",
    role: "Developer",
    status: "Active",
    lastActive: "4 days ago",
  },
  {
    id: "9",
    name: "Nadia Osei",
    email: "nadia.osei@marketplace.com",
    role: "Developer",
    status: "Active",
    lastActive: "12 hours ago",
  },
];
