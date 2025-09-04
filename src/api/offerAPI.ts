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
  return res.data.data;
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
