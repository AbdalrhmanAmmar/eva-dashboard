import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Phone, User, Edit, Copy, Mail, MapPin, Calendar, 
  Shield, MessageCircle, ShoppingCart, Star, AlertCircle, 
  Trash2, FileText, Check, X 
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '../api/getUser';
import { Navigate } from 'react-router-dom';
export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    country: '',
    city: '',
    buildingNumber: '',
    unitNumber: '',
    apartmentNumber: '',
    addressDetails: '',
    fullAddress: ''
  });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const router = Navigate();
const handleVerifyAction = async (userId: string, action: "approve" | "reject") => {
  try {
    const response = await adminAPI.verifyEntity(userId, action);
    toast.success(response.message);
    // تحديث بيانات المستخدم بعد التغيير
    setUser(response.user); // لو عندك setUser
  } catch (error: any) {
    toast.error(error.message || "حدث خطأ أثناء تغيير حالة التحقق");
  }
};


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await adminAPI.getUserDetails(params.id);
        setUser(data.user);
        setIsBlocked(data.user.status === 'blocked');
      } catch (err) {
        console.error('Error fetching user data:', err);
        toast.error('حدث خطأ أثناء جلب بيانات المستخدم');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.id]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${type} بنجاح`);
  };

  const handleDeleteUser = async () => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        // await adminAPI.deleteUser(params.id);
        toast.success('تم حذف المستخدم بنجاح');
        router.push('/dashboard/users');
      } catch (err) {
        toast.error('حدث خطأ أثناء حذف المستخدم');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'gregory',
      numberingSystem: 'arab'
    };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  const handleAddAddress = async () => {
    if (!newAddress.country || !newAddress.city || !newAddress.buildingNumber) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const updatedUser = await adminAPI.updateUser(user?._id || '', {
        address: newAddress
      });
      setUser(updatedUser.user);
      setIsAddingAddress(false);
      setNewAddress({ 
        country: '', 
        city: '', 
        buildingNumber: '',
        unitNumber: '',
        apartmentNumber: '',
        addressDetails: '',
        fullAddress: ''
      });
      toast.success('تمت إضافة العنوان بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة العنوان');
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddressId || !newAddress.country || !newAddress.city || !newAddress.buildingNumber) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const updatedAddresses = user?.addresses.map(addr => 
        addr._id === editingAddressId ? { ...newAddress, _id: editingAddressId } : addr
      ) || [];

      const updatedUser = await adminAPI.updateUser(user?._id || '', {
        addresses: updatedAddresses
      });
      setUser(updatedUser.user);
      setEditingAddressId(null);
      setNewAddress({ 
        country: '', 
        city: '', 
        buildingNumber: '',
        unitNumber: '',
        apartmentNumber: '',
        addressDetails: '',
        fullAddress: ''
      });
      toast.success('تم تحديث العنوان بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث العنوان');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;

    try {
      const updatedAddresses = user?.addresses.filter(addr => addr._id !== addressId) || [];
      const updatedUser = await adminAPI.updateUser(user?._id || '', {
        addresses: updatedAddresses
      });
      setUser(updatedUser.user);
      toast.success('تم حذف العنوان بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف العنوان');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const updatedAddresses = user?.addresses.map(addr => ({
        ...addr,
        isDefault: addr._id === addressId
      })) || [];

      const updatedUser = await adminAPI.updateUser(user?._id || '', {
        addresses: updatedAddresses
      });
      setUser(updatedUser.user);
      toast.success('تم تعيين العنوان الافتراضي بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تعيين العنوان الافتراضي');
    }
  };

  const startEditingAddress = (address: Address) => {
    setEditingAddressId(address._id || null);
    setNewAddress({
      country: address.country,
      city: address.city,
      buildingNumber: address.buildingNumber,
      unitNumber: address.unitNumber || '',
      apartmentNumber: address.apartmentNumber || '',
      addressDetails: address.addressDetails || '',
      fullAddress: address.fullAddress || ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-800 rounded-lg"></div>
                <div className="h-64 bg-gray-800 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-800 rounded-lg"></div>
                <div className="h-64 bg-gray-800 rounded-lg"></div>
                <div className="h-64 bg-gray-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/users')}
            className="flex items-center text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            العودة إلى قائمة المستخدمين
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-white">البيانات الشخصية</h1>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.hasLoggedIn === false ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                    {user.hasLoggedIn === false ? 'غير نشط' : 'نشط'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${isBlocked ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-200'}`}>
                    {isBlocked ? 'محظور' : 'غير محظور'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Name */}
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-gray-200">{user.name}</span>
                  </div>
                </div>
                
                {/* Phone */}
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-gray-200">{user.phone}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-blue-400 p-1"
                      onClick={() => handleCopy(user.phone, 'رقم الهاتف')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-green-400 p-1"
                      onClick={() => window.open(`https://wa.me/${user.phone}`, '_blank')}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-blue-300 p-1"
                      onClick={() => window.open(`tel:${user.phone}`)}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-gray-200">{user.email || "لا يوجد بريد إلكتروني"}</span>
                  </div>
                  {user.email && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-blue-400 p-1"
                      onClick={() => handleCopy(user.email || '', 'البريد الإلكتروني')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                    <User className="w-5 h-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">الجنس</p>
                      <p className="text-gray-200">{user.gender || "غير محدد"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">نوع الحساب</p>
                      <p className="text-gray-200">
                        {user.entityType === 'individual' ? 'فرد' : 
                         user.entityType === 'company' ? 'شركة' : 
                         user.entityType === 'organization' ? 'منظمة' : 'غير محدد'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">تاريخ التسجيل</p>
                      <p className="text-gray-200">{user.createdAt ? formatDate(user.createdAt) : 'غير محدد'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-400">البلد</p>
                      <p className="text-gray-200">
                        {user.addresses && user.addresses.length > 0 ? 
                          user.addresses.find(a => a.isDefault)?.country || user.addresses[0].country : 
                          "غير محدد"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show company/organization details if not individual */}
                {user.entityType !== 'individual' && (
                  <div className="mt-4 p-4 bg-gray-750 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">تفاصيل {user.entityType === 'company' ? 'الشركة' : 'المنظمة'}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-400">السجل التجاري</p>
                          <p className="text-gray-200">
                            {user.commercialRecordNumber || 'غير متوفر'}
                          </p>
                          {user.commercialRecordFile && (
                            <div className="mt-2">
                              <button 
                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${user.commercialRecordFile}`, '_blank')}
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                عرض ملف السجل التجاري
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-400">الرقم الضريبي</p>
                          <p className="text-gray-200">
                            {user.taxNumber || 'غير متوفر'}
                          </p>
                          {user.taxFile && (
                            <div className="mt-2">
                              <button 
                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${user.taxFile}`, '_blank')}
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                عرض ملف السجل الضريبي
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-400">عنوان الوطني</p>
                          <p className="text-gray-200">
                            {user.nationalAddressNumber || 'غير متوفر'}
                          </p>
                          {user.nationalAddressFile && (
                            <div className="mt-2">
                              <button 
                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${user.nationalAddressFile}`, '_blank')}
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                عرض ملف العنوان الوطني
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
  <div>
    <p className="text-xs text-gray-400">حالة التحقق</p>
    <p className="text-gray-200">
      {user.verificationStatus === 'approved' ? 'تم التحقق' : 
        user.verificationStatus === 'pending' ? 'قيد المراجعة' : 
        user.verificationStatus === 'rejected' ? 'مرفوض' : 'غير محدد'}
    </p>
  </div>

{user.verificationStatus === "pending" && (
  <div className="flex items-center gap-2 mt-2">
    <button
      onClick={() => handleVerifyAction(params.id, "approve")}
      className="p-2 bg-green-600 hover:bg-green-700 rounded text-white"
      title="قبول التحقق"
    >
      <Check className="w-4 h-4" />
    </button>
    <button
      onClick={() => handleVerifyAction(params.id, "reject")}
      className="p-2 bg-red-600 hover:bg-red-700 rounded text-white"
      title="رفض التحقق"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
)}
</div>
                    </div>

                    {/* عرض معاينة الصور في صف واحد إذا كانت موجودة */}
                  {(user.commercialRecordFile || user.taxFile || user.nationalAddressFile) && (
  <div className="mt-4">
    <h4 className="text-md font-semibold text-white mb-2">المستندات المرفوعة</h4>
    <div className="flex flex-wrap gap-4">
      
      {user.commercialRecordFile && (
        <div className="relative group w-32 h-32">
          <button 
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${user.commercialRecordFile}`, '_blank')}
            className="block w-full h-full"
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${user.commercialRecordFile}`}
              alt="السجل التجاري"
              fill
              className="object-contain rounded border border-gray-600 hover:border-blue-400 transition"
            />
          </button>
          <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center group-hover:opacity-100 opacity-0 transition">
            السجل التجاري
          </span>
        </div>
      )}

      {user.taxFile && (
        <div className="relative group w-32 h-32">
          <button 
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${user.taxFile}`, '_blank')}
            className="block w-full h-full"
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${user.taxFile}`}
              alt="السجل الضريبي"
              fill
              className="object-contain rounded border border-gray-600 hover:border-blue-400 transition"
            />
          </button>
          <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center group-hover:opacity-100 opacity-0 transition">
            السجل الضريبي
          </span>
        </div>
      )}

      {user.nationalAddressFile && (
        <div className="relative group w-32 h-32">
          <button 
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${user.nationalAddressFile}`, '_blank')}
            className="block w-full h-full"
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${user.nationalAddressFile}`}
              alt="العنوان الوطني"
              fill
              className="object-contain rounded border border-gray-600 hover:border-blue-400 transition"
            />
          </button>
          <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center group-hover:opacity-100 opacity-0 transition">
            العنوان الوطني
          </span>
        </div>
      )}
    </div>
  </div>
)}

                  </div>
                )}
              </div>
            </div>
            
            {/* Addresses Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">عناوين العميل</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                  onClick={() => {
                    setIsAddingAddress(true);
                    setEditingAddressId(null);
                    setNewAddress({ 
                      country: '', 
                      city: '', 
                      buildingNumber: '',
                      unitNumber: '',
                      apartmentNumber: '',
                      addressDetails: '',
                     
                    });
                  }}
                >
                  + إضافة عنوان
                </Button>
              </div>
              
              {(isAddingAddress || editingAddressId) && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {editingAddressId ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">الدولة*</label>
                      <input
                        type="text"
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">المدينة*</label>
                      <input
                        type="text"
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">رقم المبنى*</label>
                      <input
                        type="text"
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white"
                        value={newAddress.buildingNumber}
                        onChange={(e) => setNewAddress({...newAddress, buildingNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">رقم الوحدة</label>
                      <input
                        type="text"
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white"
                        value={newAddress.unitNumber}
                        onChange={(e) => setNewAddress({...newAddress, unitNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">رقم الشقة</label>
                      <input
                        type="text"
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white"
                        value={newAddress.apartmentNumber}
                        onChange={(e) => setNewAddress({...newAddress, apartmentNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">تفاصيل العنوان</label>
                      <input
                        type="text"
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white"
                        value={newAddress.addressDetails}
                        onChange={(e) => setNewAddress({...newAddress, addressDetails: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="defaultAddress"
                      className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                      checked={newAddress.isDefault || false}
                      onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                    />
                    <label htmlFor="defaultAddress" className="ms-2 text-sm font-medium text-gray-300">
                      تعيين كعنوان افتراضي
                    </label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                      onClick={() => {
                        setIsAddingAddress(false);
                        setEditingAddressId(null);
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-500"
                      onClick={editingAddressId ? handleUpdateAddress : handleAddAddress}
                      disabled={!newAddress.country || !newAddress.city || !newAddress.buildingNumber}
                    >
                      {editingAddressId ? 'تحديث العنوان' : 'حفظ العنوان'}
                    </Button>
                  </div>
                </div>
              )}
              
              {user.addresses && user.addresses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الدولة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">المدينة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">العنوان</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {user.addresses.map((address, index) => (
                        <tr key={index} className={address.isDefault ? 'bg-gray-750' : 'hover:bg-gray-750'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {address.country}
                            {address.isDefault && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-900 text-blue-200 rounded-full">افتراضي</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{address.city}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {address.buildingNumber && <span>مبنى {address.buildingNumber}</span>}
                            {address.unitNumber && <span>, وحدة {address.unitNumber}</span>}
                            {address.apartmentNumber && <span>, شقة {address.apartmentNumber}</span>}
                            {address.addressDetails && <p className="mt-1 text-gray-400">{address.addressDetails}</p>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                className="text-blue-400 hover:text-blue-300"
                                onClick={() => startEditingAddress(address)}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                className="text-red-400 hover:text-red-300"
                                onClick={() => address._id && handleDeleteAddress(address._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {!address.isDefault && (
                                <button 
                                  className="text-green-400 hover:text-green-300"
                                  onClick={() => address._id && handleSetDefaultAddress(address._id)}
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  لا توجد عناوين مسجلة لهذا العميل
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Account Settings Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">إعدادات حساب العميل</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="text-gray-200">الدفع عند الاستلام</span>
                  </div>
                  <Switch 
                    checked={cashOnDelivery}
                    onCheckedChange={setCashOnDelivery}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <span className="text-gray-200">حظر العميل</span>
                  </div>
                  <Switch 
                    checked={isBlocked}
                    onCheckedChange={setIsBlocked}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Statistics Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">إحصائيات العميل</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400">إجمالي عدد الطلبات</p>
                  <p className="text-white text-lg font-bold">0</p>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400">إجمالي الإنفاق</p>
                  <p className="text-white text-lg font-bold">0.00 SAR</p>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400">متوسط قيمة الطلب</p>
                  <p className="text-white text-lg font-bold">0.00 SAR</p>
                </div>
                
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400">النقاط</p>
                  <p className="text-white text-lg font-bold">{user.points || 0}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg col-span-2">
                  <p className="text-sm text-gray-400">المستوى</p>
                  <p className="text-white text-lg font-bold">
                    {user.points && user.points >= 1000 ? 'فضي' : 'برونزي'}
                  </p>
                  {user.points && (
                    <p className="text-yellow-500 text-sm">
                      {user.points < 1000 ? `تبقى ${1000 - user.points} نقطه للمستوى التالي` : 'مستوى ممتاز'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Recent Orders Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">أحدث الطلبات</h2>
              
              <div className="text-center py-8 text-gray-400">
                لا توجد طلبات
              </div>
            </div>
            
            {/* Favorites Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">قائمة المفضلة</h2>
              
              <div className="text-center py-8 text-gray-400">
                لا توجد عناصر في المفضلة
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

