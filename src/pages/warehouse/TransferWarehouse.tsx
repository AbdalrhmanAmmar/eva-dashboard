import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Package, ArrowRight, Eye, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getAllTransactions, 
  getAllActiveWarehouses, 
  Transaction, 
  TransactionFilters, 
  Warehouse 
} from '../../api/TransferWarehouse';
import { useNavigate } from 'react-router-dom';

const TransferWarehouse: React.FC = () => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
    status: '',
    warehouseId: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    hasNext: false,
    hasPrev: false
  });

  // جلب المخازن
  const loadWarehouses = async () => {
    const response = await getAllActiveWarehouses();
    if (response.success && response.data) {
      setWarehouses(response.data);
    }
  };

  // جلب المعاملات
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await getAllTransactions(filters);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب المعاملات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  // تصفية المعاملات حسب البحث
  const filteredTransactions = transactions.filter(transaction =>
    transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.sourceWarehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.targetWarehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تغيير الصفحة
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // تطبيق الفلاتر
  const applyFilters = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleNavigate=()=>{
    navigate("/create-transfer-warehouse")
  }

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // تنسيق المبلغ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  // تنسيق حالة المعاملة
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'مكتملة', class: 'bg-green-100 text-green-800' },
      pending: { label: 'قيد الانتظار', class: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'ملغية', class: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* العنوان الرئيسي */}
      <div className="mb-6 flex justify-between">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">عرض معاملات النقل</h1>
        <p className="text-gray-600">إدارة ومراقبة جميع عمليات نقل المنتجات بين المخازن</p>

        </div>
        <button onClick={handleNavigate} className='btn-gradient rounded-md'>اضافه عمليه نقل جديده</button>
      
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث برقم المعاملة أو اسم المخزن..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* فلتر الحالة */}
          <select
            value={filters.status}
            onChange={(e) => applyFilters({ status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">جميع الحالات</option>
            <option value="completed">مكتملة</option>
            <option value="pending">قيد الانتظار</option>
            <option value="cancelled">ملغية</option>
          </select>

          {/* فلتر المخزن */}
          <select
            value={filters.warehouseId}
            onChange={(e) => applyFilters({ warehouseId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">جميع المخازن</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>

          {/* فلتر التاريخ */}
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => applyFilters({ startDate: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => applyFilters({ endDate: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-3 text-gray-600">جاري التحميل...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد معاملات</h3>
            <p className="text-gray-500">لم يتم العثور على معاملات نقل تطابق معايير البحث</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم المعاملة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المخزن المصدر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المخزن الهدف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عدد المنتجات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      القيمة الإجمالية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ المعاملة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.transactionId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.sourceWarehouse.name}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.sourceWarehouse.city} - {transaction.sourceWarehouse.district}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.targetWarehouse.name}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.targetWarehouse.city} - {transaction.targetWarehouse.district}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.totalItems}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.transferredProducts.length} منتج
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.totalValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(transaction.transactionDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="تحميل التقرير"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* التنقل بين الصفحات */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      عرض{' '}
                      <span className="font-medium">
                        {(pagination.currentPage - 1) * (filters.limit || 10) + 1}
                      </span>{' '}
                      إلى{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * (filters.limit || 10), pagination.totalTransactions)}
                      </span>{' '}
                      من{' '}
                      <span className="font-medium">{pagination.totalTransactions}</span>{' '}
                      معاملة
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        السابق
                      </button>
                      
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        التالي
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransferWarehouse;