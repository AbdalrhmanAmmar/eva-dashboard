// DetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin,
  Phone,
  Hash,
  AlertTriangle,
  Building,
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  CheckSquare,
  Users
} from 'lucide-react';
import { getSafetyRequestById } from '../api/ServiceForm';

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
  clientName: string;
  mobile: string;
  extinguishersCount: number;
  smokeDetectorsCount: number;
  emergencyLightsCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = React.useState<ISafetyRequest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRequestDetail = async () => {
      try {
        setLoading(true);
        const response = await getSafetyRequestById(id);
        setRequest(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequestDetail();
    }
  }, [id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'completed':
        return <CheckSquare className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
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

  // دالة لتحويل التاريخ إلى صيغة ميلادية مع الوقت
const formatArabicDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'gregory' // التأكد من استخدام التقويم الميلادي
  };
  return date.toLocaleDateString('ar-EG', options);
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

  if (!request) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>لم يتم العثور على البيانات المطلوبة</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5" />
          العودة
        </button>
        <h2 className="text-xl font-bold text-gray-800">تفاصيل طلب الخدمة</h2>
        <span className={`px-3 py-1 inline-flex items-center gap-1 text-sm leading-5 font-semibold rounded-full border ${getStatusColor(request.status)}`}>
          {getStatusIcon(request.status)}
          {getStatusText(request.status)}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* المعلومات الأساسية */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              المعلومات الأساسية
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">اسم الخدمة</label>
                <p className="mt-1 text-sm text-gray-900">{request.nameService}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">الرقم الوطني الموحد</label>
                <p className="mt-1 text-sm text-gray-900">{request.interiorNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">رقم السجل التجاري</label>
                  <p className="mt-1 text-sm text-gray-900">{request.commercialRegisterNumber}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">رمز النشاط</label>
                <p className="mt-1 text-sm text-gray-900">{request.activityCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">الاسم التجاري</label>
                <p className="mt-1 text-sm text-gray-900">{request.signName}</p>
              </div>
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              معلومات الاتصال
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">اسم العميل</label>
                  <p className="mt-1 text-sm text-gray-900">{request.clientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">رقم الجوال</label>
                  <p className="mt-1 text-sm text-gray-900">{request.mobile}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">العنوان</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {request.region} - {request.city} - {request.neighborhood}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">{request.street}</p>
                </div>
              </div>
            </div>
          </div>

          {/* المعلومات الهندسية */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              المعلومات الهندسية
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">مساحة المحل (م²)</label>
                <p className="mt-1 text-sm text-gray-900">{request.shopArea}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">مساحة المبنى (م²)</label>
                <p className="mt-1 text-sm text-gray-900">{request.buildingArea}</p>
              </div>
            </div>
          </div>

          {/* أدوات السلامة */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              أدوات السلامة
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">عدد طفايات الحريق</label>
                  <p className="mt-1 text-sm text-gray-900">{request.extinguishersCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">عدد كاشفات الدخان</label>
                  <p className="mt-1 text-sm text-gray-900">{request.smokeDetectorsCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">عدد إنارات الطوارئ</label>
                  <p className="mt-1 text-sm text-gray-900">{request.emergencyLightsCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* التواريخ */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">التواريخ</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">تم الإنشاء في</label>
              <p className="mt-1 text-sm text-gray-900">
                {formatArabicDate(request.createdAt)}
              </p>
            </div>
            <div>
              
              {request.status === 'completed' && (
                <p className="mt-1 text-sm text-blue-600">
                  تم التعديل إلى حالة مكتمل في {formatArabicDate(request.updatedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;