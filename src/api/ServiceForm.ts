import { IEngineeringPlan } from "../components/services/EngineeringPlan";
import api from "./api";

export type RequestStatus = 'pending' | 'paid' | 'approved' | 'rejected';

export interface ISafetyRequest {
  _id?: string;
  userId: string; // Reference to user who created the request
  interiorstring: string;
  commercialRegisterstring: string;
  activityCode: string;
  shopArea: string;
  region: string;
  city: string;
  neighborhood: string;
  street: string;
  signName: string;
  buildingArea: string;
  mobile: string;
  extinguishersCount: string;
  smokeDetectorsCount: string;
  emergencyLightsCount: string;
  status: RequestStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// DTO for creating requests
export interface CreateSafetyRequestDto {
  interiorstring: string;
  commercialRegisterstring: string;
  activityCode: string;
  shopArea: string;
  region: string;
  city: string;
  neighborhood: string;
  street: string;
  signName: string;
  buildingArea: string;
  mobile: string;
  extinguishersCount: string;
  smokeDetectorsCount: string;
  emergencyLightsCount: string;
}


export const createSafetyRequest = async (data: any) => {
  try {
    const response = await api.post("/FormService", data);
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 
      "فشل إرسال الطلب. يرجى المحاولة لاحقًا."
    );
  }
};


export const getPaginatedSafetyRequests = async (
  page = 1,
  limit = 10,
  filters = {}
): Promise<{
  success: boolean;
  results: number;
  total: number;
  page: number;
  pages: number;
  data: ISafetyRequest[];
}> => {
  try {
    const response = await api.get("/FormService", {
      params: {
        page,
        limit,
        ...filters
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 
      "فشل جلب البيانات. يرجى المحاولة لاحقًا."
    );
  }
};

export const updateSafetyRequestStatus = async (
  id: string,
  status: "pending" | "completed"
): Promise<{
  success: boolean;
  message: string;
  data: ISafetyRequest;
}> => {
  try {
    const response = await api.patch(`/FormService/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      "فشل تحديث الحالة. يرجى المحاولة لاحقًا."
    );
  }
};
export const getSafetyRequestById = async (
  id: string
): Promise<{
  success: boolean;
  data: ISafetyRequest;
}> => {
  try {
    const response = await api.get(`/FormService/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      "فشل جلب بيانات الطلب. يرجى المحاولة لاحقًا."
    );
  }
};


export const getAllEngineeringPlans = async () => {
  try {
    const res = await api.get(`/engineeringPlanForm`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب الخطط الهندسية"
    );
  }
};

export const getEngineeringPlanById = async (id: string): Promise<{
  success: boolean;
  data:IEngineeringPlan;
}> => {
  try {
    const res = await api.get(`/engineeringPlanForm/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب تفاصيل الخطة الهندسية"
    );
  }
};
export const updateEngineeringPlanStatus = async (
  id: string,
  status: "pending" | "completed"
): Promise<{
  success: boolean;
  message: string;
  data: IEngineeringPlan;
}> => {
  try {
    const res = await api.patch(`/engineeringPlanForm/${id}/status`, { status });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في تحديث حالة الخطة الهندسية"
    );
  }
};
export const getrehabilitation = async () => {
  try {
    const res = await api.get(`/rehabilitationRoutes`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب الخطط الهندسية"
    );
  }
};

export const getRehabilitationById = async (id: string) => {
  try {
    const res = await api.get(`/rehabilitationRoutes/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب تفاصيل طلب التأهيل"
    );
  }
};

export const updateRehabilitationStatus = async (
  id: string,
  status: "pending" | "completed"
) => {
  try {
    const res = await api.patch(`/rehabilitationRoutes/${id}/status`, { status });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في تحديث حالة طلب التأهيل"
    );
  }
};



export const getAllsafetyplans= async()=>{
  try {
    const res = await api.get(`/rehabilitationRoutes`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب الخطط الهندسية"
    );
  }
}
export const getMaintenanceContracts= async()=>{
  try {
    const res = await api.get(`/MaintenanceContract`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب الخطط الهندسية"
    );
  }
}
export const getAllSafetySystemsInstallation= async()=>{
  try {
    const res = await api.get(`/SafetySystemsInstallation`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "فشل في جلب الخطط الهندسية"
    );
  }
}