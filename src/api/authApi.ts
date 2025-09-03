import api from './api';


interface User {
  id: string;        // تغيير من _id إلى id
  name: string;
  phone: string;
  role: string;
  email?: string;    // إضافة كخيار لأنه موجود في authStore
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      phone: string;
      role: "user" | "admin" | "superadmin";
      isVerified: boolean;
    };
    token?: string;
  };
}

interface Ilogin{
  phone:string,
  password:string
}


export const login = async (data:Ilogin): Promise<AuthResponse> => {
    try {
      const response = await api.post("/user/login", data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "حدث خطأ في تسجيل الدخول"
      );
    }
  };

export const logoutAPI = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const verifyTokenAPI = async (token: string): Promise<boolean> => {
  try {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.success;
  } catch (error) {
    return false;
  }
};