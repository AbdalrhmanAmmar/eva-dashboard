import api from "./auth";

// نوع العنصر داخل الجرد (داخل InventoryCount)
export interface InventoryItem {
  _id?: string;
  product: string;
  countedQuantity: number;
  createdAt?: string;
}

// سكيمة الجرد
export interface InventoryCount {
  _id?: string;
  warehouse: string;
  name: string;
  type: "full" | "partial";
  notes?: string;
  createdBy?: string;
  status?: "draft" | "reviewed" | "completed";
  createdAt?: string;
  items?: InventoryItem[];
}

// 1. إنشاء جرد جديد
export const createInventoryCount = async (
  data: Omit<InventoryCount, "_id" | "createdAt" | "createdBy" | "status">
): Promise<{ success: boolean; message: string; data: InventoryCount }> => {
  try {
    const response = await api.post("/inventories", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في إنشاء الجرد");
  }
};


// 2. جلب كل الجردات الخاصة بالمستخدم الحالي
export const getMyInventoryCounts = async (): Promise<{
  success: boolean;
  count: number;
  data: InventoryCount[];
}> => {
  try {
    const response = await api.get("/inventories");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في جلب الجردات");
  }
};

export const getInventoryById = async (
  id: string
): Promise<{ success: boolean; data: InventoryCount }> => {
  try {
    const response = await api.get(`/inventories/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "فشل في جلب بيانات الجرد");
    }
    
    return response.data;
  } catch (error: any) {
    // تسجيل الخطأ للتصحيح
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      "فشل في جلب بيانات الجرد. يرجى التحقق من اتصال الشبكة والمحاولة مرة أخرى"
    );
  }
};