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