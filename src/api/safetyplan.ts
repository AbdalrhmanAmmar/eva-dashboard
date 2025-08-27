import api from "./api";

export const getAllsafetyplans= async()=>{
  try {
    const res = await api.get(`/safteyPlan`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب الخطط الهندسية"
    );
  }
}

export const getAllSafetyPlanbyId = async (id: string) => {
  try {
    const res = await api.get(`/safteyPlan/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب تفاصيل طلب التأهيل"
    );
  }
};

export const updateStatusSafetyPlans = async (
  id: string,
  status: "pending" | "completed"
) => {
  try {
    const res = await api.patch(`/safteyPlan/${id}/status`, { status });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في تحديث حالة طلب التأهيل"
    );
  }
};