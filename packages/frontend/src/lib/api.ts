// API client for Smart Business AI Agent
const API_BASE_URL = "http://localhost:3001";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Customers API
  async getCustomers() {
    return this.request("/customers");
  }

  async createCustomer(customer: {
    name: string;
    email: string;
    phone: string;
    preferences?: any;
  }) {
    return this.request("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id: string, updates: any) {
    return this.request(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, {
      method: "DELETE",
    });
  }

  // Products API
  async getProducts() {
    return this.request("/products");
  }

  async createProduct(product: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category?: string;
  }) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, updates: any) {
    return this.request(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Notifications API
  async sendNotification(notification: {
    customerId: string;
    type: "sms" | "whatsapp" | "email";
    message: string;
    subject?: string;
  }) {
    return this.request("/notifications/send", {
      method: "POST",
      body: JSON.stringify(notification),
    });
  }

  async getNotificationHistory() {
    return this.request("/notifications/history");
  }

  // AI API
  async chatWithAI(message: string) {
    return this.request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  // Analytics API
  async getDashboardStats() {
    return this.request("/analytics/dashboard");
  }

  async getSalesAnalytics() {
    return this.request("/analytics/sales");
  }

  async getCustomerAnalytics() {
    return this.request("/analytics/customers");
  }

  // Delivery API
  async getDeliveries() {
    return this.request("/delivery");
  }

  async createDelivery(delivery: {
    customerId: string;
    productIds: string[];
    address: string;
    scheduledDate: string;
  }) {
    return this.request("/delivery", {
      method: "POST",
      body: JSON.stringify(delivery),
    });
  }

  async updateDeliveryStatus(id: string, status: string) {
    return this.request(`/delivery/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Inventory API
  async getInventoryAlerts() {
    return this.request("/inventory/alerts");
  }

  async updateStock(productId: string, quantity: number) {
    return this.request(`/inventory/update-stock`, {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
