import api from "./api";

export const adminAPI = {
  // جلب جميع المستخدمين (يتطلب صلاحيات الأدمن)
  getAllUsers: async (): Promise<{ success: boolean; users: any[] }> => {
    try {
      const response = await api.get("/admin/users");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "حدث خطأ أثناء جلب المستخدمين");
    }
  },
  getUserDetails: async (id: string): Promise<{ success: boolean; user: any; products: any[]; reviews: any[] }> => {
  try {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء جلب تفاصيل المستخدم");
  }
  
},
updateUser: async (
    id: string,
    data: Partial<{ name: string; role: string; phone: string; email: string }>
  ): Promise<{ success: boolean; message: string; user: any }> => {
    try {
      const response = await api.patch(`/admin/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "حدث خطأ أثناء تحديث المستخدم");
    }
  },
  verifyEntity: async (
  id: string,
  action: "approve" | "reject"
): Promise<{ success: boolean; message: string; user: any }> => {
  try {
    const response = await api.patch(`/admin/users/${id}/verify`, { action });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "حدث خطأ أثناء تحديث حالة التحقق");
  }
},

};