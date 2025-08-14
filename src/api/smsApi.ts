import api from "./api";

export interface ISmsTemplateResponse {
  success: boolean;
  template: ISmsTemplate;
}

export interface ISmsTemplate {
  id?: string;
  otpMessage: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getSmsTemplate = async (): Promise<ISmsTemplateResponse> => {
  try {
    const response = await api.get("/sms-template");
    return response.data as ISmsTemplateResponse;
  } catch (error) {
    console.error("[SmsTemplate] خطأ في جلب القالب:", error);
    throw new Error("تعذر جلب قالب الرسائل النصية");
  }
};

export const updateSmsTemplate = async (data: ISmsTemplate): Promise<ISmsTemplateResponse> => {
  try {
    const response = await api.put("/sms-template", data);
    return response.data as ISmsTemplateResponse;
  } catch (error) {
    console.error("[SmsTemplate] خطأ في تحديث القالب:", error);
    throw new Error("تعذر تحديث قالب الرسائل النصية");
  }
};