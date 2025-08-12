import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Plus, MapPin, Phone, Building, Shield, AlertTriangle } from 'lucide-react';
import { getPaginatedSafetyRequests, ISafetyRequest, RequestStatus } from '../api/ServiceForm';

const ServicesForms: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [data, setData] = useState<{
    success: boolean;
    results: number;
    total: number;
    page: number;
    pages: number;
    data: ISafetyRequest[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب البيانات من API
const fetchSafetyRequests = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await getPaginatedSafetyRequests(page, limit, {
      status: statusFilter !== 'all' ? statusFilter as RequestStatus : undefined,
      search: searchTerm || undefined
    });

    console.log(response.data);
    
    if (!response.success) {
      throw new Error(response.message || 'فشل جلب البيانات من الخادم');
    }

    setData(response);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    console.error('Fetch error:', err);
  } finally {
    setIsLoading(false);
  }
};

  // جلب البيانات عند التحميل أو تغيير الفلاتر
  useEffect(() => {
    fetchSafetyRequests();
  }, [page, limit, statusFilter, searchTerm]);

  // إحصائيات الطلبات
  const stats = {
    total: data?.total || 0,
    approved: data?.data?.filter(r => r.status === 'approved').length || 0,
    pending: data?.data?.filter(r => r.status === 'pending').length || 0,
    paid: data?.data?.filter(r => r.status === 'paid').length || 0,
    rejected: data?.data?.filter(r => r.status === 'rejected').length || 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'paid':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getStatusText = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      paid: 'مدفوع',
      approved: 'موافق عليه',
      rejected: 'مرفوض'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Shield className="w-4 h-4" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4" />;
      case 'paid':
        return <Building className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center py-12 text-red-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">حدث خطأ في جلب البيانات</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchSafetyRequests}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium">لا توجد بيانات متاحة</h3>
          <button
            onClick={fetchSafetyRequests}
            className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
          >
            تحميل البيانات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">طلبات شهادات السلامة</h1>
          <p className="text-muted-foreground mt-2">إدارة ومتابعة جميع طلبات شهادات السلامة</p>
        </div>
        <button className="btn-gradient flex items-center gap-2 px-6 py-3">
          <Plus className="w-5 h-5" />
          طلب جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي الطلبات</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Building className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">موافق عليها</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
            <Shield className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">قيد الانتظار</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Eye className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">مدفوعة</p>
              <p className="text-2xl font-bold">{stats.paid}</p>
            </div>
            <Building className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث في الطلبات (اسم المحل، الرقم الداخلي، المنطقة...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 text-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 min-w-[180px]"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="paid">مدفوع</option>
            <option value="approved">موافق عليه</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-secondary/50 to-secondary/30">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الرقم الداخلي</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">اسم المحل</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الموقع</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">رقم الهاتف</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">معدات السلامة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((request, index) => (
                    <tr 
                      key={request._id} 
                      className={`border-b border-border hover:bg-secondary/30 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/10'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                          {request.interiorstring}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">السجل التجاري: {request.commercialRegisterstring}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{request.signName}</div>
                        <div className="text-xs text-muted-foreground">كود النشاط: {request.activityCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{request.region}, {request.city}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{request.neighborhood} - {request.street}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono">{request.mobile}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>طفايات: {request.extinguishersCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>كواشف دخان: {request.smokeDetectorsCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>إضاءة طوارئ: {request.emergencyLightsCount}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {getStatusText(request.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="عرض التفاصيل">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="تعديل">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.data.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">لا توجد نتائج</h3>
                <p className="text-muted-foreground">لم يتم العثور على طلبات تطابق معايير البحث</p>
              </div>
            )}

            {/* Pagination */}
            {data && data.total > 0 && (
              <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  عرض {data.data.length} من إجمالي {data.total} طلب
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-border bg-card disabled:opacity-50"
                  >
                    السابق
                  </button>
                  <span className="px-4 py-2 rounded-lg bg-primary text-white">
                    {page}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!data || page * limit >= data.total}
                    className="px-4 py-2 rounded-lg border border-border bg-card disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ServicesForms;