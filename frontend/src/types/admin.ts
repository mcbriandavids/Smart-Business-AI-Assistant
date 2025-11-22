export interface AdminStats {
  users: number;
  vendors: number;
  businesses: number;
  orders: number;
}

export interface Pagination {
  page: number;
  limit: number;
  pages: number;
  total: number;
}

export interface Vendor {
  _id?: string;
  id?: string;
  vendorId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
  role?: string;
  businesses?: number;
  companyName?: string;
}

export interface NormalizedVendor extends Vendor {
  vendorId: string;
}

export function resolveVendorId(vendor: Vendor): string {
  return vendor.vendorId ?? vendor._id ?? vendor.id ?? "";
}

export function normalizeVendor(vendor: Vendor): NormalizedVendor {
  const resolvedId = resolveVendorId(vendor);
  return { ...vendor, vendorId: resolvedId };
}

export interface VendorListResponse {
  success?: boolean;
  data?: {
    vendors?: Vendor[];
    pagination?: Pagination;
  };
  message?: string;
}

export interface AdminStatsResponse {
  success?: boolean;
  data?: AdminStats;
  message?: string;
}

export interface CustomerContact {
  id: string;
  contact: {
    name: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
    };
  };
  tags?: string[];
  lifecycleStage?: string;
  preferredChannel?: string;
  consentToContact?: boolean;
  lastInteractionAt?: string;
  metrics?: {
    totalOrders?: number;
    totalRevenue?: number;
    responsesReceived?: number;
    messagesSent?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VendorCustomerResponse {
  success?: boolean;
  data?: {
    items?: CustomerContact[];
    pagination?: Pagination;
  };
  message?: string;
}
