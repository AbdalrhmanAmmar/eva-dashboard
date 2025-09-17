import { create } from 'zustand';
import { getAllUsers } from '../api/user';

interface Customer {
  id: string;
  name: string;
}

interface CustomersStore {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  clearCustomers: () => void;
}

export const useCustomersStore = create<CustomersStore>((set, get) => ({
  customers: [],
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    const { customers } = get();
    
    // إذا كانت البيانات موجودة بالفعل، لا نحتاج لجلبها مرة أخرى
    if (customers.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const response = await getAllUsers(1, 1000);
      const customerData = response.users.map((user: any) => ({
        id: user._id,
        name: user.fullName
      }));
      
      set({ customers: customerData, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'حدث خطأ في جلب بيانات العملاء',
        isLoading: false 
      });
    }
  },

  clearCustomers: () => {
    set({ customers: [], error: null });
  }
}));