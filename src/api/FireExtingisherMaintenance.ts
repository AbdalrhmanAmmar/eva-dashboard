import api from "./api";

export const getFireExtinguisherMaintenance = async () => {
  try {
    const res = await api.get(`/fireExtinguisherMaintenance`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب بيانات صيانة طفايات الحرايق"
    );
  }
};

export const getFireExtinguisherMaintenanceById = async (id: string) => {
  try {
    const res = await api.get(`/fireExtinguisherMaintenance/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب تفاصيل طلب صيانة طفايات الحرايق"
    );
  }
};

export const updateFireExtinguisherMaintenanceStatus = async (
  id: string,
  status: "pending" | "completed"
) => {
  try {
    const res = await api.patch(`/fireExtinguisherMaintenance/${id}/status`, { status });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في تحديث حالة طلب صيانة طفايات الحرايق"
    );
  }
};