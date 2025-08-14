import api from "./api"; // هذا هو ملف axios الرئيسي

export interface Warehouse {
  _id?: string;
  name: string;
  order?: number;
  country: string;
  city: string;
  district: string;
  street: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// إضافة مخزن جديد
export const createWarehouse = async (data: Omit<Warehouse, "order" | "_id" | "createdAt" | "updatedAt">): Promise<{ success: boolean; message: string; warehouse: Warehouse }> => {
  try {
    const response = await api.post("/warehouses", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في إنشاء المخزن");
  }
};

// جلب جميع المخازن مرتبة
export const getAllWarehouses = async (): Promise<{ success: boolean; warehouses: Warehouse[] }> => {
  try {
    const response = await api.get("/warehouses");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في جلب بيانات المخازن");
  }
};

// تحديث مخزن
export const updateWarehouse = async (
  id: string,
  data: Partial<Omit<Warehouse, "_id" | "createdAt" | "updatedAt">>
): Promise<{ success: boolean; message: string; warehouse: Warehouse }> => {
  try {
    const response = await api.patch(`/warehouses/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في تحديث المخزن");
  }
};

// حذف مخزن
export const deleteWarehouse = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في حذف المخزن");
  }
};

export const getProductsByWarehouse = async (
  warehouseId: string
): Promise<{ success: boolean; products: Product[] }> => {
  try {
    const response = await api.get(`/warehouses/${warehouseId}/products`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في جلب المنتجات");
  }
};

export const getWarehouseById = async (id: string): Promise<{ success: boolean; warehouse: Warehouse }> => {
  try {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في جلب بيانات المخزن");
  }
};