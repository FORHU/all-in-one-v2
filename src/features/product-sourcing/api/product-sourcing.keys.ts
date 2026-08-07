export const productSourcingKeys = {
  all: ["product-sourcing"] as const,
  searches: () => [...productSourcingKeys.all, "search"] as const,
  search: (supplierId: string, query: string) =>
    [...productSourcingKeys.searches(), supplierId, query] as const,
  details: () => [...productSourcingKeys.all, "detail"] as const,
  detail: (supplierId: string, externalId: string) =>
    [...productSourcingKeys.details(), supplierId, externalId] as const,
} as const;
