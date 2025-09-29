import { Injectable } from "@nestjs/common";
import {
  Customer,
  CustomerStatus,
  PreferredContact,
  SimpleCustomerData,
} from "./customer.entity";

@Injectable()
export class CustomersService {
  private customers: SimpleCustomerData[] = [];
  private idCounter = 1;

  async findAll(): Promise<SimpleCustomerData[]> {
    return this.customers;
  }

  async findById(id: string): Promise<SimpleCustomerData | undefined> {
    return this.customers.find((customer) => customer.id === id);
  }

  async create(customerData: {
    name: string;
    email?: string;
    phone: string;
    preferences?: any;
  }): Promise<SimpleCustomerData> {
    const customer: SimpleCustomerData = {
      id: this.idCounter.toString(),
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone, // Frontend uses 'phone'
      phoneNumber: customerData.phone, // Entity uses 'phoneNumber'
      preferences: customerData.preferences || {},
      status: CustomerStatus.ACTIVE,
      preferredContact: PreferredContact.SMS,
      isActive: true,
      totalPurchases: 0,
      purchaseCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customers.push(customer);
    this.idCounter++;

    return customer;
  }

  async update(
    id: string,
    updateData: Partial<SimpleCustomerData>
  ): Promise<SimpleCustomerData | undefined> {
    const customerIndex = this.customers.findIndex(
      (customer) => customer.id === id
    );

    if (customerIndex === -1) {
      return undefined;
    }

    const updatedCustomer = {
      ...this.customers[customerIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    this.customers[customerIndex] = updatedCustomer;
    return updatedCustomer;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.customers.length;
    this.customers = this.customers.filter((customer) => customer.id !== id);
    return this.customers.length < initialLength;
  }
}
