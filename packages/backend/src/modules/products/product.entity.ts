// Product entity
export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  OUT_OF_STOCK = "out_of_stock",
  DISCONTINUED = "discontinued",
}

export class Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  minStockLevel: number;
  status: ProductStatus;
  images?: string[];
  tags?: string[];
  supplier?: string;
  sku?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
