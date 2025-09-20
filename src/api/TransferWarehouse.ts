import api from './api';

// Types for transfer operations
export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  priceBeforeDiscount: number;
  images?: string[];
  sku: string;
  warehouse: string;
}

export interface TransferItem {
  productId: string;
  quantity: number;
}

export interface TransferRequest {
  sourceWarehouseId: string;
  targetWarehouseId: string;
  transfers?: TransferItem[];
  productId?: string;
  quantity?: number;
}

export interface TransferResult {
  productName: string;
  transferredQuantity: number;
  remainingInSource: number;
  newQuantityInTarget: number;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  data?: {
    sourceWarehouse: {
      id: string;
      name: string;
    };
    targetWarehouse: {
      id: string;
      name: string;
    };
    transfers: TransferResult[];
  };
}

export interface WarehouseProductsResponse {
  success: boolean;
  message: string;
  warehouse?: {
    id: string;
    name: string;
    location: string;
  };
  products?: Product[];
}

export interface TransferredProduct {
  product: {
    _id: string;
    name: string;
    images: Array<{
      url: string;
      isMain: boolean;
      order: number;
      _id: string;
    }>;
    sku: string;
    id: string;
  };
  productName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  _id: string;
  id: string;
}

export interface Transaction {
  _id: string;
  sourceWarehouse: {
    _id: string;
    name: string;
    city: string;
    district: string;
  };
  targetWarehouse: {
    _id: string;
    name: string;
    city: string;
    district: string;
  };
  transferredProducts: TransferredProduct[];
  transactionType: string;
  status: string;
  notes: string;
  createdBy: any;
  totalItems: number;
  totalValue: number;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  transactionId: string;
  __v: number;
  transactionDuration: any;
  id: string;
}

export interface TransactionsResponse {
  success: boolean;
  message: string;
  data?: {
    transactions: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTransactions: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: string;
  warehouseId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * جلب جميع المخازن النشطة
 */
export const getAllActiveWarehouses = async (): Promise<{ success: boolean; message: string; data?: Warehouse[] }> => {
  try {
    const response = await api.get('/warehouse-transactions/warehouses');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ في جلب المخازن',
    };
  }
};

/**
 * جلب المنتجات الموجودة في مخزن معين
 */
export const getProductsByWarehouse = async (warehouseId: string): Promise<WarehouseProductsResponse> => {
  try {
    if (!warehouseId) {
      return {
        success: false,
        message: 'معرف المخزن مطلوب',
      };
    }

    const response = await api.get(`/warehouse-transactions/warehouses/${warehouseId}/products`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ في جلب منتجات المخزن',
    };
  }
};

/**
 * نقل كميات من منتجات بين المخازن
 */
export const transferProducts = async (transferData: TransferRequest): Promise<TransferResponse> => {
  try {
    // التحقق من البيانات المطلوبة على الواجهة الأمامية
    if (!transferData.sourceWarehouseId || !transferData.targetWarehouseId) {
      return {
        success: false,
        message: 'يرجى تعبئة جميع البيانات المطلوبة',
      };
    }

    // التحقق من وجود بيانات النقل (إما transfers أو productId + quantity)
    const hasTransfers = transferData.transfers && Array.isArray(transferData.transfers) && transferData.transfers.length > 0;
    const hasSingleProduct = transferData.productId && transferData.quantity && transferData.quantity > 0;
    
    if (!hasTransfers && !hasSingleProduct) {
      return {
        success: false,
        message: 'يجب تحديد منتج واحد على الأقل للنقل',
      };
    }

    if (transferData.sourceWarehouseId === transferData.targetWarehouseId) {
      return {
        success: false,
        message: 'لا يمكن النقل إلى نفس المخزن',
      };
    }

    // التحقق من صحة بيانات كل عملية نقل إذا كانت موجودة
    if (hasTransfers) {
      for (const transfer of transferData.transfers!) {
        if (!transfer.productId || !transfer.quantity || transfer.quantity <= 0) {
          return {
            success: false,
            message: 'يجب تحديد معرف المنتج والكمية بشكل صحيح',
          };
        }
      }
    }
    

    const response = await api.post('/warehouse-transactions/transfer', transferData);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ في عملية النقل',
    };
  }
};

/**
 * التحقق من توفر الكمية المطلوبة في المخزن المصدر
 */
export const validateTransferQuantities = async (
  sourceWarehouseId: string,
  transfers: TransferItem[]
): Promise<{ success: boolean; message: string; invalidItems?: string[] }> => {
  try {
    const productsResponse = await getProductsByWarehouse(sourceWarehouseId);
    
    if (!productsResponse.success || !productsResponse.products) {
      return {
        success: false,
        message: 'لا يمكن التحقق من منتجات المخزن المصدر',
      };
    }

    const invalidItems: string[] = [];
    const products = productsResponse.products;

    for (const transfer of transfers) {
      const product = products.find(p => p._id === transfer.productId);
      
      if (!product) {
        invalidItems.push(`المنتج غير موجود في المخزن المصدر`);
        continue;
      }

      if (product.quantity < transfer.quantity) {
        invalidItems.push(
          `الكمية المطلوبة (${transfer.quantity}) أكبر من المتوفر (${product.quantity}) للمنتج ${product.name}`
        );
      }
    }

    if (invalidItems.length > 0) {
      return {
        success: false,
        message: 'توجد مشاكل في الكميات المطلوبة',
        invalidItems,
      };
    }

    return {
      success: true,
      message: 'جميع الكميات متوفرة',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'حدث خطأ في التحقق من الكميات',
    };
  }
};

/**
 * حساب إجمالي قيمة المنتجات المراد نقلها
 */
export const calculateTransferValue = async (
  sourceWarehouseId: string,
  transfers: TransferItem[]
): Promise<{ success: boolean; totalValue?: number; message: string }> => {
  try {
    const productsResponse = await getProductsByWarehouse(sourceWarehouseId);
    
    if (!productsResponse.success || !productsResponse.products) {
      return {
        success: false,
        message: 'لا يمكن حساب قيمة المنتجات',
      };
    }

    let totalValue = 0;
    const products = productsResponse.products;

    for (const transfer of transfers) {
      const product = products.find(p => p._id === transfer.productId);
      
      if (product) {
        totalValue += product.priceBeforeDiscount * transfer.quantity;
      }
    }

    return {
      success: true,
      totalValue,
      message: 'تم حساب القيمة بنجاح',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'حدث خطأ في حساب القيمة',
    };
  }
};

/**
 * جلب جميع معاملات النقل مع إمكانية التصفية
 */
export const getAllTransactions = async (filters: TransactionFilters = {}): Promise<TransactionsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.warehouseId) params.append('warehouseId', filters.warehouseId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/warehouse-transactions/transactions?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'حدث خطأ في جلب المعاملات',
    };
  }
};

export default {
  getAllActiveWarehouses,
  getProductsByWarehouse,
  transferProducts,
  validateTransferQuantities,
  calculateTransferValue,
  getAllTransactions,
};