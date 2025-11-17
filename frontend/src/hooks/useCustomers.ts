import { useState, useCallback } from "react";
import { api } from "../api/client";

export interface Customer {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  notes?: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const custRes = await api.get("/api/customers");
      setCustomers(custRes.data?.data || []);
    } catch (err: any) {
      setCustomers([]);
    }
  }, []);

  const addCustomer = useCallback(async (customer: Omit<Customer, '_id'>) => {
    await api.post("/api/customers", customer);
    await fetchCustomers(); // Refetch to get updated list
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (id: string, customer: Omit<Customer, '_id'>) => {
    await api.put(`/api/customers/${id}`, customer);
    await fetchCustomers();
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (id: string) => {
    await api.delete(`/api/customers/${id}`);
    setCustomers(prev => prev.filter(c => c._id !== id));
  }, []);

  const sendMessage = useCallback(async (id: string, content: string) => {
    await api.post(`/api/customers/${id}/message`, {
      content,
      type: "general",
    });
  }, []);

  return {
    customers,
    loading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    sendMessage,
  };
}