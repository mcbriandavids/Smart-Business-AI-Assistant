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
import { CustomersService } from "./customers.service";
import { SimpleCustomerData } from "./customer.entity";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto";

@ApiTags("Customers")
@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: "Get all customers" })
  @ApiResponse({ status: 200, description: "Returns all customers" })
  async getCustomers(): Promise<SimpleCustomerData[]> {
    return this.customersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get customer by ID" })
  @ApiResponse({ status: 200, description: "Returns customer by ID" })
  async getCustomer(
    @Param("id") id: string
  ): Promise<SimpleCustomerData | undefined> {
    return this.customersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new customer" })
  @ApiResponse({ status: 201, description: "Customer created successfully" })
  async createCustomer(
    @Body(ValidationPipe) createCustomerDto: CreateCustomerDto
  ): Promise<SimpleCustomerData> {
    return this.customersService.create(createCustomerDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update customer" })
  @ApiResponse({ status: 200, description: "Customer updated successfully" })
  async updateCustomer(
    @Param("id") id: string,
    @Body(ValidationPipe) updateCustomerDto: UpdateCustomerDto
  ): Promise<SimpleCustomerData | undefined> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete customer" })
  @ApiResponse({ status: 200, description: "Customer deleted successfully" })
  async deleteCustomer(@Param("id") id: string) {
    return this.customersService.delete(id);
  }
}
