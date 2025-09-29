import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ProductsService, SimpleProduct } from "./products.service";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({ status: 200, description: "Returns all products" })
  async getProducts(): Promise<SimpleProduct[]> {
    return this.productsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product by ID" })
  @ApiResponse({ status: 200, description: "Returns product by ID" })
  async getProduct(
    @Param("id") id: string
  ): Promise<SimpleProduct | undefined> {
    return this.productsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new product" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  async createProduct(
    @Body(ValidationPipe) createProductDto: any
  ): Promise<SimpleProduct> {
    return this.productsService.create(createProductDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update product" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  async updateProduct(
    @Param("id") id: string,
    @Body(ValidationPipe) updateProductDto: any
  ): Promise<SimpleProduct | undefined> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete product" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  async deleteProduct(@Param("id") id: string) {
    return this.productsService.delete(id);
  }
}
