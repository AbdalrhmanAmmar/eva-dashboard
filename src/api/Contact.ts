import api from "./api";

export interface Address {
  city?: string;
  streetNumber?: string;
  buildingNumber?: string;
  area?: string;
  fullAddress?: string;
}

export interface ContactPayload {
  name: string;
  country: string;
  tax: boolean;
  address?: Address;
}

export interface Contact {
  _id: string;
  name: string;
  country: string;
  tax: boolean;
  address?: {
    city: string;
    streetNumber: string;
    buildingNumber: string;
    area: string;
    fullAddress: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ContactResponse extends ContactPayload {
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}



export interface ContactsQueryParams {
  page?: number;
  limit?: number;
  country?: string;
  city?: string;
  tax?: boolean;
  q?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  fields?: string;
}

export interface ContactsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ContactsResponse {
  success: boolean;
  data: ContactResponse[];
  pagination: ContactsPagination;
  applied: {
    country: string | null;
    city: string | null;
    tax: boolean | null;
    q: string | null;
    startDate: string | null;
    endDate: string | null;
    sort: Record<string, number>;
    fields: string[] | null;
  };
}

export const createContact = async (data: ContactPayload): Promise<ContactResponse> => {
  try {
    const response = await api.post<ContactResponse>("/contacts", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في إنشاء الكونتاكت");
  }
};

export const getContacts = async (params?: ContactsQueryParams): Promise<ContactsResponse> => {
  try {
    const response = await api.get<ContactsResponse>("/contacts", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في جلب جهات الاتصال");
  }
};

export const getContactById = async (id: string): Promise<ContactResponse> => {
  try {
    const response = await api.get<{success: boolean, data: ContactResponse}>(`/contacts/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في جلب الكونتاكت");
  }
};

export const updateContact = async (id: string, data: Partial<ContactPayload>): Promise<ContactResponse> => {
  try {
    const response = await api.put<ContactResponse>(`/contacts/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في تحديث الكونتاكت");
  }
};

export const deleteContact = async (id: string): Promise<void> => {
  try {
    await api.delete(`/contacts/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "فشل في حذف الكونتاكت");
  }
};