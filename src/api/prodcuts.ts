import api from "./api";

export const productAPI = {
  // جلب جميع المنتجات مع الفلترة والبحث
getAllProducts: async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  search?: string;
}): Promise<{ success: boolean; products: any[]; total: number }> => {
  try {
    const response = await api.get("/products", { params });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return { 
      success: false, 
      products: [], 
      total: 0,
      message: error.response?.data?.message || "حدث خطأ أثناء جلب المنتجات"
    };
  }
},

  // جلب منتج واحد عبر ID
getProductById: async (id: string): Promise<{ success: boolean; product: any | null }> => {
  try {
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId(id)) {
      return { success: false, product: null };
    }

    const response = await api.get(`/products/${id}`);

    if (!response.data?.success || !response.data?.product) {
      return { success: false, product: null };
    }

    const product = response.data.product;
    return {
      success: true,
      product: {
        ...product,
        id: product._id?.toString?.() ?? product.id,
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, product: null };
  }
},


  // جلب منتجات حسب التصنيف
  getProductsByCategory: async (category: string): Promise<{ success: boolean; products: any[] }> => {
    try {
      const response = await api.get(`/products/category/${category}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "حدث خطأ أثناء جلب منتجات التصنيف");
    }
  },

  // إنشاء منتج جديد (مع صور)
  createProduct: async (formData: FormData): Promise<{ success: boolean; product: any; message?: string }> => {
    try {
      const response = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error creating product:", error);
      return { 
        success: false, 
        product: null,
        message: error.response?.data?.message || "حدث خطأ أثناء إنشاء المنتج"
      };
    }
  },
  // تحديث منتج
  updateProduct: async (id: string, formData: FormData): Promise<{ success: boolean; product: any }> => {
    try {
      const response = await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "حدث خطأ أثناء تحديث المنتج");
    }
  },

  // حذف منتج
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "حدث خطأ أثناء حذف المنتج");
    }
  },
};