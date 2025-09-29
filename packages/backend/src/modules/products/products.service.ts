import { Injectable } from "@nestjs/common";

export interface SimpleProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProductsService {
  private products: SimpleProduct[] = [];
  private idCounter = 1;

  async findAll(): Promise<SimpleProduct[]> {
    return this.products;
  }

  async findById(id: string): Promise<SimpleProduct | undefined> {
    return this.products.find((product) => product.id === id);
  }

  async create(productData: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category?: string;
  }): Promise<SimpleProduct> {
    const product: SimpleProduct = {
      id: this.idCounter.toString(),
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category: productData.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products.push(product);
    this.idCounter++;

    return product;
  }

  async update(
    id: string,
    updateData: Partial<SimpleProduct>
  ): Promise<SimpleProduct | undefined> {
    const productIndex = this.products.findIndex(
      (product) => product.id === id
    );

    if (productIndex === -1) {
      return undefined;
    }

    const updatedProduct = {
      ...this.products[productIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    this.products[productIndex] = updatedProduct;
    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.products.length;
    this.products = this.products.filter((product) => product.id !== id);
    return this.products.length < initialLength;
  }
}
