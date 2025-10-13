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
    const response = await api.get(`/warehouses/products/${warehouseId}`);
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

// ============================
// جلب المنتجات مع فلاتر وترقيم
// ============================

// نماذج البيانات العائدة من نقطة النهاية (backend)
export interface WarehouseSummary {
  id: string;
  name: string;
  location: string; // مثال: "الرياض، العليا"
  totalProducts: number;
  products: Array<{
    _id: string;
    name: string;
    description?: string;
    quantity: number;
    priceBeforeDiscount: number;
    images?: any[];
    sku: string;
  }>;
}

export interface WarehouseProductsFilters {
  warehouseId?: string;
  term?: string;
  sku?: string;
  minQty?: number;
  maxQty?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean; // true لإظهار المتوفر فقط
  sort?: string; // الحقل المراد الترتيب به (افتراضي name)
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface WarehousesWithProductsResponse {
  success: boolean;
  message: string;
  filtersApplied: {
    warehouseId: string | null;
    term: string | null;
    sku: string | null;
    minQty: number | null;
    maxQty: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    inStock: boolean | null;
  };
  pagination: {
    page: number;
    limit: number;
    totalWarehouses: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  warehouses: WarehouseSummary[];
}

export interface SingleWarehouseProductsResponse {
  success: boolean;
  message: string;
  warehouse?: {
    _id: string;
    name: string;
    city: string;
    district: string;
  } | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  products: Array<{
    _id: string;
    name: string;
    description?: string;
    quantity: number;
    priceBeforeDiscount: number;
    images?: any[];
    sku: string;
    warehouse: {
      name: string;
      city: string;
      district: string;
    };
  }>;
}

// ملاحظة: الدالة التالية هي للواجهة الأمامية (Frontend)
// وتستدعي نقطة نهاية في الخادم (Backend) لتنفيذ المنطق المذكور في كودك
export const getAllProductInWarehouse = async (
  filters: WarehouseProductsFilters = {}
): Promise<WarehousesWithProductsResponse | SingleWarehouseProductsResponse> => {
  try {
    const params: Record<string, any> = {};

    if (filters.warehouseId) params.warehouseId = filters.warehouseId;
    if (filters.term) params.term = filters.term;
    if (filters.sku) params.sku = filters.sku;
    if (typeof filters.minQty === 'number') params.minQty = filters.minQty;
    if (typeof filters.maxQty === 'number') params.maxQty = filters.maxQty;
    if (typeof filters.minPrice === 'number') params.minPrice = filters.minPrice;
    if (typeof filters.maxPrice === 'number') params.maxPrice = filters.maxPrice;
    if (typeof filters.inStock === 'boolean') params.inStock = String(filters.inStock); // backend يتوقع 'true'/'false'
    if (filters.sort) params.sort = filters.sort;
    if (filters.order) params.order = filters.order;
    if (typeof filters.page === 'number') params.page = filters.page;
    if (typeof filters.limit === 'number') params.limit = filters.limit;

    // إذا كان لديك راوت في السيرفر كما في كودك يجب أن يكون:
    // GET /warehouses/products?{query}
    const response = await api.get('/warehouses/all-products', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل في جلب المنتجات وفق الفلاتر');
  }
};