import api from './api';

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  gender?: 'male' | 'female';
  entityType?: 'individual' | 'company' | 'organization';
  entityName?: string;
  accountRole?: 'owner' | 'employee';
  jobTitle?: string;
  addresses?: Address[];
  commercialRecordNumber?: string;
  taxNumber?: string;
  nationalAddressNumber?: string;
  vatRegistrationStatus?: 'not_registered' | 'registered';
  vatRegistrationNumber?: string;
  commercialRecordFile?: File;
  taxFile?: File;
  nationalAddressFile?: File;
}

export interface Address {
  country: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  unitNumber?: string;
  apartmentNumber?: string;
  postalCode: string;
  addressDetails?: string;
  isDefault: boolean;
}

export interface UserResponse {
  success: boolean;
  message: string;
  user: {
    _id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    gender: string;
    entityType: string;
    entityName?: string;
    accountRole?: string;
    jobTitle?: string;
    addresses?: Address[];
    commercialRecordNumber?: string;
    taxNumber?: string;
    nationalAddressNumber?: string;
    vatRegistrationStatus?: string;
    vatRegistrationNumber?: string;
    verificationStatus: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  verificationStatus: string;
}

export const addUser = async (userData: CreateUserData): Promise<UserResponse> => {
  try {
    const formData = new FormData();
    
    // إضافة البيانات الأساسية
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('fullName', userData.fullName);
    formData.append('phoneNumber', userData.phoneNumber);
    
    if (userData.gender) formData.append('gender', userData.gender);
    if (userData.entityType) formData.append('entityType', userData.entityType);
    if (userData.entityName) formData.append('entityName', userData.entityName);
    if (userData.accountRole) formData.append('accountRole', userData.accountRole);
    if (userData.jobTitle) formData.append('jobTitle', userData.jobTitle);
    if (userData.commercialRecordNumber) formData.append('commercialRecordNumber', userData.commercialRecordNumber);
    if (userData.taxNumber) formData.append('taxNumber', userData.taxNumber);
    if (userData.nationalAddressNumber) formData.append('nationalAddressNumber', userData.nationalAddressNumber);
    if (userData.vatRegistrationStatus) formData.append('vatRegistrationStatus', userData.vatRegistrationStatus);
    if (userData.vatRegistrationNumber) formData.append('vatRegistrationNumber', userData.vatRegistrationNumber);
    
    // إضافة العناوين
    if (userData.addresses && userData.addresses.length > 0) {
      formData.append('addresses', JSON.stringify(userData.addresses));
    }
    
    // إضافة الملفات
    if (userData.commercialRecordFile) {
      formData.append('commercialRecordFile', userData.commercialRecordFile);
    }
    if (userData.taxFile) {
      formData.append('taxFile', userData.taxFile);
    }
    if (userData.nationalAddressFile) {
      formData.append('nationalAddressFile', userData.nationalAddressFile);
    }
    
    const response = await api.post('/Add-user', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء المستخدم');
  }
};

export const getUserById = async (userId: string) => {
  try {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب بيانات المستخدم');
  }
};

export const updateUser = async (userId: string, userData: Partial<CreateUserData>) => {
  try {
    const formData = new FormData();
    
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'addresses') {
          formData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    const response = await api.put(`/user/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تحديث بيانات المستخدم');
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء حذف المستخدم');
  }
};

export const getAllUsers = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await api.get('/users', {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'حدث خطأ أثناء جلب قائمة المستخدمين');
  }
};