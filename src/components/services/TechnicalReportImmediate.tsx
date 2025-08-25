import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Search,
  MapPin,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Hash,
  AlertTriangle,
  CheckSquare // أيقونة جديدة للإكمال
} from 'lucide-react';
import { getPaginatedSafetyRequests, updateSafetyRequestStatus } from '../../api/ServiceForm'; // استيراد الدالة الجديدة
import { useNavigate } from 'react-router-dom';

interface ISafetyRequest {
  _id: string;
  nameService: string;
  interiorNumber: string;
  commercialRegisterNumber: string;
  activityCode: string;
  shopArea: number;
  region: string;
  city: string;
  neighborhood: string;
  street: string;
  signName: string;
  buildingArea: number;
  mobile: string;
  extinguishersCount: number;
  smokeDetectorsCount: number;
  emergencyLightsCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed'; // إضافة الحالة الجديدة
  createdAt: string;
  updatedAt: string;
}

const TechnicalReportImmediate: React.FC = () => {
  const [requests, setRequests] = useState<ISafetyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{key: keyof ISafetyRequest; direction: 'asc' | 'desc'} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null); // لتتبع العنصر الذي يتم تحديثه
  const itemsPerPage = 10;
  const navigate = useNavigate();


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await getPaginatedSafetyRequests();
        setRequests(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // دالة لتحديث حالة الطلب
  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    // السماح بالتحديث فقط إذا كانت الحالة الحالية هي "pending"
    if (currentStatus !== 'pending') {
      setError('يمكن تحديث الحالة فقط من "قيد الانتظار" إلى "مكتمل"');
      return;
    }

    setUpdatingId(id);
    try {
      const response = await updateSafetyRequestStatus(id, 'completed');
      
      if (response.success) {
        // تحديث الحالة في الواجهة
        setRequests(prevRequests => 
          prevRequests.map(request => 
            request._id === id 
              ? { ...request, status: 'completed' } 
              : request
          )
        );
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحديث الحالة. يرجى المحاولة لاحقًا.');
    } finally {
      setUpdatingId(null);
    }
  };

  // تصفية البيانات حسب حالة البحث والفلتر
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.nameService.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.mobile.includes(searchTerm) ||
      request.signName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.commercialRegisterNumber.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // فرز البيانات
  const sortedRequests = React.useMemo(() => {
    if (!sortConfig) return filteredRequests;

    return [...filteredRequests].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredRequests, sortConfig]);

  // ترقيم الصفحات
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const paginatedRequests = sortedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key: keyof ISafetyRequest) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      completed: 'مكتمل'
    };
    return statusMap[status] || 'غير محدد';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث باسم الخدمة أو الهاتف أو الاسم التجاري..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="approved">موافق عليه</option>
            <option value="rejected">مرفوض</option>
            <option value="completed">مكتمل</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('nameService')}
              >
                <div className="flex items-center justify-start gap-1">
                  اسم الخدمة
                  {sortConfig?.key === 'nameService' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('mobile')}
              >
                <div className="flex items-center justify-start gap-1">
                  رقم الهاتف
                  {sortConfig?.key === 'mobile' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('signName')}
              >
                <div className="flex items-center justify-start gap-1">
                  الاسم التجاري
                  {sortConfig?.key === 'signName' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('commercialRegisterNumber')}
              >
                <div className="flex items-center justify-start gap-1">
                  رقم السجل التجاري
                  {sortConfig?.key === 'commercialRegisterNumber' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العنوان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                أدوات السلامة
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center justify-start gap-1">
                  الحالة
                  {sortConfig?.key === 'status' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((request) => (
                <tr 
  key={request._id} 
  className="hover:bg-gray-50 cursor-pointer"
  onClick={() => navigate(`/safety-requests/${request._id}`)}
>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.nameService}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {request.mobile}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.signName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4 text-gray-400" />
                      {request.commercialRegisterNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {request.city} - {request.neighborhood}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>طفايات: {request.extinguishersCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>كاشفات دخان: {request.smokeDetectorsCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>إنارة طوارئ: {request.emergencyLightsCount}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(request._id, request.status)}
                        disabled={updatingId === request._id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50 flex items-center gap-1"
                      >
                        {updatingId === request._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                            جاري التحديث...
                          </>
                        ) : (
                          <>
                            <CheckSquare className="h-4 w-4" />
                            تم الإكمال
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  لا توجد بيانات متاحة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              التالي
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                عرض <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedRequests.length)}</span> من{' '}
                <span className="font-medium">{sortedRequests.length}</span> نتائج
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">الأولى</span>
                  <span>«</span>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">السابق</span>
                  <ChevronUp className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">التالي</span>
                  <ChevronDown className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">الأخيرة</span>
                  <span>»</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalReportImmediate;