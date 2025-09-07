import api from "./api";

export interface IWorkItem {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOfferWork {
  workItem: IWorkItem | string;
  quantity: number;
  price: number;
  order?: number;
}

export interface IOffer {
  _id: string;
  offerName: string;
  to: string;
  project: string;
  subject: string;
  offerValidity?: string;
  paymentTerms?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  } | string;
  downloadsCount: number;
  order: number;
  works: IOfferWork[];
  createdAt?: string;
  updatedAt?: string;
}

export const createOffer = async (data: Partial<IOffer>): Promise<IOffer> => {
  const res = await api.post("/offers", data);
  
  // تأكد من الهيكل الذي يعيده الخادم
  if (res.data.success && res.data.data) {
    return res.data.data;
  } else {
    throw new Error(res.data.message || 'فشل في إنشاء العرض');
  }
};

// 📥 جلب كل العروض الخاصة بالمستخدم
export const getOffersByUser = async (): Promise<IOffer[]> => {
  const res = await api.get("/offers");
  return res.data.data;
};

// 📥 جلب عرض محدد بالـ ID
export const getOfferById = async (id: string): Promise<IOffer> => {
  const res = await api.get(`/offers/${id}`);
  return res.data.data;
};

// ===============================
// 🟢 WorkItem APIs
// ===============================

// ➕ إنشاء وصف عمل ثابت
export const createWorkItem = async (name: string): Promise<IWorkItem> => {
  const res = await api.post("/offers/workitem", { name });
  return res.data.data;
};

// 📥 جلب كل الأوصاف الثابتة
export const getWorkItems = async (): Promise<IWorkItem[]> => {
  const res = await api.get("offers/workitems");
  return res.data.data;
};
export const getAllOffers = async () => {
  const res = await api.get("/offers");
  return res.data
};

export const downloadOffer = async (id: string) => {
  try {
    const response = await api.get(`/offers/${id}/download`, {
      responseType: 'blob',
    });
    
    // إنشاء رابط للتحميل
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `offer-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading offer:', error);
    throw error;
  }
};

// 📝 تحديث عرض
export const updateOffer = async (id: string, data: Partial<IOffer>): Promise<IOffer> => {
  const res = await api.put(`/offers/${id}`, data);
  return res.data.data;
};

// 🗑️ حذف عرض
export const deleteOffer = async (id: string): Promise<void> => {
  await api.delete(`/offers/${id}`);
};
