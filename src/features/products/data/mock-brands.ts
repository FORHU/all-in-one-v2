// The admin Products endpoint (GET /api/v2/products/admin) has no brands
// listing of its own — brands only exist as a `brand: string | null` field
// on each product. Until a dedicated brands endpoint exists, this stays mock.
export const BRANDS = [
  {
    name: "Northfield Textiles",
    initials: "NT",
    count: 24,
    status: "Active",
    tileColor: "#a8845a",
  },
  {
    name: "Solstice Athletics",
    initials: "SA",
    count: 31,
    status: "Active",
    tileColor: "#2b2f3d",
  },
  {
    name: "Havelock Goods",
    initials: "HG",
    count: 18,
    status: "Active",
    tileColor: "#84a6ac",
  },
  {
    name: "Bureau Studio",
    initials: "BS",
    count: 9,
    status: "Active",
    tileColor: "#7c8f82",
  },
  {
    name: "Kindred Devices",
    initials: "KD",
    count: 14,
    status: "Active",
    tileColor: "#1b1730",
  },
  {
    name: "Wayside Cosmetics",
    initials: "WC",
    count: 22,
    status: "Paused",
    tileColor: "#c97b86",
  },
];
