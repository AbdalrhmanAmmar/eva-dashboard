import api from "./api";

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
export interface InventoryItem {
  product: {
    _id: string;
    name: string;
    quantity: number;
    reservedQuantity: number;
    costPrice: number;
    sku:string
    price: number;
    images: string[];
  };
  countedQuantity: number;
  reservedQuantity: number;
}

export interface Inventory {
  _id: string;
  name: string;
  type: string;
  notes:string
  status: string;
  warehouse?: {
    _id: string;
    name: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  items: InventoryItem[];
  order: number;
  globalOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export const getAllInventories = async (
  page = 1,
  limit = 10,
  search = "",
  warehouse?: string,
  status?: string,
  sort = "-createdAt",
  token?: string
): Promise<{ data: Inventory[]; meta: Meta }> => {
  const params: Record<string, any> = { page, limit, search, sort };
  if (warehouse) params.warehouse = warehouse;
  if (status) params.status = status;

  const res = await api.get("/inventories", {
    params,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res.data;
};

export const getInventoryById = async (
  id: string,
): Promise<Inventory> => {
  const res = await api.get(`/inventories/${id}`, {

  });

  return res.data.data;
};