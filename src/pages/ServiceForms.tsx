import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Plus, MapPin, Phone, FileText, CheckCircle, XCircle } from 'lucide-react';
import { getAllEngineeringPlans } from '../api/ServiceForm';


// أنواع الخدمات مع دوال الجلب الخاصة بكل منها
const serviceTypes = [
  { 
    id: 'technical_report_immediate', 
    name: 'تقرير فني فوري',
    fetchFunction: getAllTechnicalReportsImmediate 
  },
  { 
    id: 'technical_report_delayed', 
    name: 'تقرير فني غير فوري',
    fetchFunction: getAllTechnicalReportsDelayed 
  },
  { 
    id: 'safety_certificate', 
    name: 'شهادة تركيب أدوات السلامة',
    fetchFunction: getAllSafetyCertificates 
  },
  { 
    id: 'maintenance_contract', 
    name: 'عقد الصيانة',
    fetchFunction: getAllMaintenanceContracts 
  },
  { 
    id: 'engineering_plan', 
    name: 'مخطط هندسي',
    fetchFunction: getAllEngineeringPlans 
  },
  { 
    id: 'safety_plan', 
    name: 'مخطط سلامة',
    fetchFunction: getAllSafetyPlans 
  },
  { 
    id: 'safety_systems', 
    name: 'توريد وتركيب أنظمة السلامة',
    fetchFunction: getAllSafetySystems 
  },
  { 
    id: 'system_rehabilitation', 
    name: 'إعادة تأهيل الأنظمة',
    fetchFunction: getAllSystemRehabilitations 
  }
];

interface IServiceItem {
  _id: string;
  name: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  [key: string]: any; // سماح بخواص إضافية حسب كل خدمة
}

const ServicesForms: React.FC = () => {
  const [activeTab, setActiveTab] = useState(serviceTypes[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [data, setData] = useState<IServiceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب البيانات من API حسب الخدمة المحددة
  const fetchServiceData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const activeService = serviceTypes.find(s => s.id === activeTab);
      if (!activeService) return;

      const response = await activeService.fetchFunction({
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });

      setData(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [page, limit, statusFilter, searchTerm, activeTab]);

  // إحصائيات الطلبات
  const stats = {
    total: total || 0,
    approved: data?.filter(r => r.status === 'approved').length || 0,
    pending: data?.filter(r => r.status === 'pending').length || 0,
    rejected: data?.filter(r => r.status === 'rejected').length || 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getStatusText = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // عرض الحقول الخاصة بكل خدمة
  const renderServiceSpecificFields = (item: IServiceItem) => {
    switch (activeTab) {
      case 'engineering_plan':
        return (
          <>
            <div className="text-sm">{item.activity}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <a href={item.ownerId} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                بطاقة الهوية
              </a>
            </div>
            <div className="text-xs text-muted-foreground">
              <a href={item.ownershipDoc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                مستند الملكية
              </a>
            </div>
          </>
        );
      case 'safety_certificate':
        return (
          <>
            <div className="text-sm">عدد الطفايات: {item.extinguishersCount}</div>
            <div className="text-xs text-muted-foreground">كواشف دخان: {item.smokeDetectorsCount}</div>
          </>
        );
      // يمكن إضافة حالات أخرى للخدمات الأخرى
      default:
        return <div className="text-sm">{item.activity || 'لا توجد معلومات إضافية'}</div>;
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
          <XCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">حدث خطأ في جلب البيانات</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchServiceData}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
          >
            إعادة المحاولة
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
          <h1 className="text-3xl font-bold text-gradient">إدارة طلبات الخدمات</h1>
          <p className="text-muted-foreground mt-2">إدارة ومتابعة جميع طلبات الخدمات المختلفة</p>
        </div>
        <button className="btn-gradient flex items-center gap-2 px-6 py-3">
          <Plus className="w-5 h-5" />
          طلب جديد
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl p-1 shadow-soft">
        <div className="flex overflow-x-auto">
          {serviceTypes.map((service) => (
            <button
              key={service.id}
              onClick={() => {
                setActiveTab(service.id);
                setPage(1); // إعادة تعيين الصفحة عند تغيير التبويب
              }}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === service.id
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-secondary/50'
              }`}
            >
              {service.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي الطلبات</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">موافق عليها</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">قيد الانتظار</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <FileText className="w-8 h-8 text-orange-200" />
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
              placeholder={`البحث في طلبات ${serviceTypes.find(s => s.id === activeTab)?.name}...`}
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
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الاسم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الهاتف</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">العنوان</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">معلومات إضافية</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr 
                      key={item._id} 
                      className={`border-b border-border hover:bg-secondary/30 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/10'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">{item.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono">{item.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{item.address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderServiceSpecificFields(item)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {getStatusText(item.status)}
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

            {data.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">لا توجد نتائج</h3>
                <p className="text-muted-foreground">لم يتم العثور على طلبات تطابق معايير البحث</p>
              </div>
            )}

            {/* Pagination */}
            {total > 0 && (
              <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  عرض {data.length} من إجمالي {total} طلب
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
                    disabled={page * limit >= total}
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