import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download
} from 'lucide-react';
import { getEngineeringPlanById } from '../api/ServiceForm';
import { getFileUrl } from '../utils/fileUrl';

const EngineeringPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getEngineeringPlanById(id);
        setPlan(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [id]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

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

  const getStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض'
    };
    return status ? statusMap[status] || status : 'غير محدد';
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

  if (!plan) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          <span>الخطة غير موجودة</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">تفاصيل الخطة الهندسية</h1>
        <button
          onClick={() => navigate('/services-form')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          العودة إلى القائمة
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">المعلومات الأساسية</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">الاسم</label>
              <p className="mt-1 text-sm text-gray-900">{plan.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">رقم الهاتف</label>
              <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                <Phone className="h-4 w-4 text-gray-400" />
                {plan.phone}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">النشاط</label>
              <p className="mt-1 text-sm text-gray-900">{plan.activity}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">العنوان</label>
              <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                {plan.address}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">الحالة</label>
            {plan.status === 'pending' ? (
                      <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(plan.status)}`}>
                        قيد الانتظار
                      </span>
                    ) : (
                      <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border text-blue-600 bg-blue-50 border-blue-200`}>
                        مكتمل
                      </span>
                    )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">المستندات</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">هوية المالك</label>
              <a 
  href={getFileUrl(plan.ownerId)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <FileText className="h-5 w-5" />
                عرض المستند
                <Download className="h-4 w-4" />
              </a>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">صك الملكية</label>
              <a 
                href={getFileUrl(plan.ownershipDoc)}
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <FileText className="h-5 w-5" />
                عرض المستند
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">التواريخ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">تاريخ الإنشاء</label>
            <p className="mt-1 text-sm text-gray-900">
              {formatArabicDate(plan.createdAt)}
            </p>
          </div>
          
          <div>
              {plan.status === 'completed' && (
                <p className="mt-1 text-sm text-blue-600">
                  تم التعديل إلى حالة مكتمل في {formatArabicDate(plan.updatedAt)}
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineeringPlanDetails;