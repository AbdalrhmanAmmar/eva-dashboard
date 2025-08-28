import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Phone, User, Edit, Copy, Mail, MapPin, Calendar, 
  Shield, MessageCircle, ShoppingCart, Star, AlertCircle, 
  Trash2, FileText, Check, X, Building
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../api/getUser';
import { Switch } from '../components/ui/switch';

interface Address {
  _id?: string;
  country: string;
  city: string;
  buildingNumber: string;
  unitNumber?: string;
  apartmentNumber?: string;
  addressDetails?: string;
  fullAddress?: string;
  isDefault?: boolean;
}

interface IUser {
  _id: string;
  phone: string;
  entityType: string;
  verificationStatus: string;
  hasLoggedIn: boolean;
  role: string;
  points: number;
  accountVerified: boolean;
  addresses: Address[];
  createdAt: string;
  name: string;
  accountRole: string;
  commercialRecordNumber?: string;
  email?: string;
  entityName?: string;
  nationalAddressNumber?: string;
  taxNumber?: string;
  commercialRecordFile?: string;
  gender?: string;
  emailVerified?: boolean;
  resetPasswordExpire?: string;
  resetPasswordToken?: string;
  status?: string;
  taxFile?: string;
  nationalAddressFile?: string;
}

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      const data = await adminAPI.getUserDetails(id!);
      setUser(data.user);
      setIsBlocked(data.user.status === 'blocked');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAction = async (userId: string, action: "approve" | "reject") => {
    try {
      const response = await adminAPI.verifyEntity(userId, action);
      toast.success(response.message);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تغيير حالة التحقق");
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${type} بنجاح`);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory'
    };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  const getEntityTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      individual: 'فرد',
      company: 'شركة',
      organization: 'منظمة'
    };
    return typeMap[type] || 'غير محدد';
  };

  const getVerificationStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      approved: 'تم التحقق',
      pending: 'قيد المراجعة',
      rejected: 'مرفوض'
    };
    return statusMap[status] || 'غير محدد';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="mr-3 text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">خطأ في تحميل البيانات</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="font-semibold text-yellow-800">المستخدم غير موجود</h3>
            <p className="text-yellow-600">لم يتم العثور على المستخدم المطلوب</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">ملف المستخدم</h1>
            <p className="text-muted-foreground mt-2">عرض وإدارة بيانات المستخدم</p>
          </div>
        </div>
      </div>

      {/* User Stats Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-soft">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-white/20">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-blue-100 mt-1">
              {getEntityTypeText(user.entityType)} • {user.points} نقطة
            </p>
          </div>
          <div className="mr-auto flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{user.hasLoggedIn ? 'نشط' : 'غير نشط'}</div>
              <div className="text-sm text-blue-100">الحالة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getVerificationStatusText(user.verificationStatus)}</div>
              <div className="text-sm text-blue-100">التحقق</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl shadow-soft">
            <div className="p-6 border-b border-border bg-gradient-to-r from-secondary/50 to-secondary/30">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                البيانات الشخصية
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopy(user.phone, 'رقم الهاتف')}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => window.open(`https://wa.me/${user.phone}`, '_blank')}
                      className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium">{user.email || "غير متوفر"}</p>
                  </div>
                  {user.email && (
                    <button 
                      onClick={() => handleCopy(user.email!, 'البريد الإلكتروني')}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">نوع الكيان</p>
                    <p className="font-medium">{getEntityTypeText(user.entityType)}</p>
                  </div>
                </div>
              </div>

              {/* Organization Details */}
              {user.entityType !== 'individual' && (
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="text-lg font-semibold text-primary mb-4">
                    تفاصيل {user.entityType === 'company' ? 'الشركة' : 'المنظمة'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">اسم الكيان</p>
                      <p className="font-medium">{user.entityName || 'غير متوفر'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">السجل التجاري</p>
                      <p className="font-medium">{user.commercialRecordNumber || 'غير متوفر'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الرقم الضريبي</p>
                      <p className="font-medium">{user.taxNumber || 'غير متوفر'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">العنوان الوطني</p>
                      <p className="font-medium">{user.nationalAddressNumber || 'غير متوفر'}</p>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="mt-4 flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">حالة التحقق</p>
                      <p className="font-medium">{getVerificationStatusText(user.verificationStatus)}</p>
                    </div>
                    {user.verificationStatus === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyAction(id!, "approve")}
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          title="قبول التحقق"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerifyAction(id!, "reject")}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          title="رفض التحقق"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  {user.commercialRecordFile && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">المستندات</p>
                      <button 
                        onClick={() => window.open(`http://localhost:4000${user.commercialRecordFile}`, '_blank')}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        عرض السجل التجاري
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-card border border-border rounded-xl shadow-soft">
            <div className="p-6 border-b border-border bg-gradient-to-r from-secondary/50 to-secondary/30">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                إعدادات الحساب
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <span className="font-medium">الدفع عند الاستلام</span>
                </div>
                <Switch 
                  checked={cashOnDelivery}
                  onCheckedChange={setCashOnDelivery}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="font-medium">حظر المستخدم</span>
                </div>
                <Switch 
                  checked={isBlocked}
                  onCheckedChange={setIsBlocked}
                />
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-card border border-border rounded-xl shadow-soft">
            <div className="p-6 border-b border-border bg-gradient-to-r from-secondary/50 to-secondary/30">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                إحصائيات المستخدم
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                  <p className="text-blue-100 text-sm">النقاط</p>
                  <p className="text-2xl font-bold">{user.points}</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                  <p className="text-green-100 text-sm">المستوى</p>
                  <p className="text-lg font-bold">
                    {user.points >= 1000 ? 'فضي' : 'برونزي'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-card border border-border rounded-xl shadow-soft">
            <div className="p-6 border-b border-border bg-gradient-to-r from-secondary/50 to-secondary/30">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                العناوين
              </h3>
            </div>
            
            <div className="p-6">
              {user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((address, index) => (
                    <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{address.country} - {address.city}</p>
                          <p className="text-sm text-muted-foreground">
                            مبنى {address.buildingNumber}
                            {address.unitNumber && `, وحدة ${address.unitNumber}`}
                            {address.apartmentNumber && `, شقة ${address.apartmentNumber}`}
                          </p>
                          {address.addressDetails && (
                            <p className="text-sm text-muted-foreground mt-1">{address.addressDetails}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد عناوين مسجلة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;