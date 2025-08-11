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
    const response = await api.get("/FormService/all", {
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
