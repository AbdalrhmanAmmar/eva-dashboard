import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Building, 
  Globe, 
  Phone, 
  Hash, 
  Save, 
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { createWarehouse } from '../api/warehouseAPI';
import { toast } from 'react-toastify';
import InteractiveMap from '../components/InteractiveMap';

const CreateWarehouse: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    district: "",
    street: "",
    phoneNum: "",
    Buildingnumber: "",
  });
  
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({ 
    lat: null, 
    lng: null 
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // دالة لتحديث الموقع من الخريطة
  const handleLocationChange = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  };

  // دالة لجلب الإحداثيات من العنوان
  const fetchCoordinates = async () => {
    const { country, city, district, street, Buildingnumber } = formData;
    if (!country || !city || !district || !street) {
      setCoordinates({ lat: null, lng: null });
      return;
    }

    setFetchingLocation(true);
    const address = `${Buildingnumber} ${street}, ${district}, ${city}, ${country}`;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setCoordinates({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
      } else {
        setCoordinates({ lat: null, lng: null });
      }
    } catch (err) {
      console.error("Failed to fetch coordinates:", err);
      setCoordinates({ lat: null, lng: null });
    } finally {
      setFetchingLocation(false);
    }
  };
const extractCoordinatesFromLink = (link: string) => {
  try {
    let lat: number | null = null;
    let lng: number | null = null;

    // ✅ Google Maps format: https://www.google.com/maps/place/.../@24.7136,46.6753,17z
    const googleRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const googleMatch = link.match(googleRegex);
    if (googleMatch) {
      lat = parseFloat(googleMatch[1]);
      lng = parseFloat(googleMatch[2]);
    }

    // ✅ OpenStreetMap format: https://www.openstreetmap.org/?mlat=24.7136&mlon=46.6753
    const osmRegex = /mlat=(-?\d+\.\d+)&mlon=(-?\d+\.\d+)/;
    const osmMatch = link.match(osmRegex);
    if (osmMatch) {
      lat = parseFloat(osmMatch[1]);
      lng = parseFloat(osmMatch[2]);
    }

    if (lat !== null && lng !== null) {
      setCoordinates({ lat, lng });
      toast.success("📍 تم جلب الموقع من الرابط بنجاح!");
    } else {
      toast.error("❌ الرابط غير صالح. برجاء إدخال رابط صحيح من الخريطة.");
    }
  } catch (err) {
    console.error("Error parsing map link:", err);
    toast.error("❌ فشل في قراءة الرابط.");
  }
};

  // تحديث الإحداثيات عند تغيير العنوان
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoordinates();
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.country, formData.city, formData.district, formData.street, formData.Buildingnumber]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const data = {
      ...formData,
      latitude: coordinates.lat,
      longitude: coordinates.lng
    };
    
    const response = await createWarehouse(data);
    
    toast.success('تم إنشاء المخزن بنجاح!', {
      position: 'top-right',
      autoClose: 3000,
    });

    // الانتظار قبل إعادة التوجيه
    setTimeout(() => {
      navigate('/warehouse-management');
    }, 1000); // تقليل الوقت إلى 1 ثانية
    
  } catch (err: any) {
    console.error('Error creating warehouse:', err);
    setError(err.response?.data?.message || err.message || "فشل في إنشاء المخزن");
    toast.error(err.response?.data?.message || err.message || "فشل في إنشاء المخزن", {
      position: 'top-right',
      autoClose: 5000,
    });
  } finally {
    setLoading(false);
  }
};

  const fullAddress = `${formData.Buildingnumber} ${formData.street}, ${formData.district}, ${formData.city}, ${formData.country}`.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/warehouse-management')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">إنشاء مخزن جديد</h1>
            <p className="text-muted-foreground mt-2">أضف مخزن جديد إلى النظام مع تحديد الموقع على الخريطة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* نموذج البيانات */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">معلومات المخزن</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اسم المخزن */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                اسم المخزن
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="أدخل اسم المخزن"
                className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                required
              />
            </div>

            {/* معلومات الموقع */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                معلومات الموقع
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    الدولة
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="أدخل الدولة"
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">المدينة</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="أدخل المدينة"
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">اسم الحي</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="أدخل اسم الحي"
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">اسم الشارع</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="أدخل اسم الشارع"
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    رقم المبنى
                  </label>
                  <input
                    type="text"
                    name="Buildingnumber"
                    value={formData.Buildingnumber}
                    onChange={handleChange}
                    placeholder="أدخل رقم المبنى"
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>

                

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    name="phoneNum"
                    value={formData.phoneNum}
                    onChange={handleChange}
                    placeholder="أدخل رقم الهاتف"
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>
              </div>
            </div>


            

            {/* رسائل الخطأ */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* أزرار الإجراءات */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-gradient flex items-center gap-2 flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    إنشاء المخزن
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/warehouse-management')}
                className="px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>

        {/* الخريطة */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">موقع المخزن</h3>
            </div>
            {fetchingLocation && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">جاري تحديد الموقع...</span>
              </div>
            )}
          </div>

          <div className="h-96 mb-4">
            {coordinates.lat && coordinates.lng ? (
              <InteractiveMap
                coordinates={{ lat: coordinates.lat, lng: coordinates.lng }}
                address={fullAddress}
                onLocationChange={handleLocationChange}
              />
            ) : (
              <div className="w-full h-full bg-secondary/30 rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">أدخل العنوان لعرض الموقع على الخريطة</p>
                  <p className="text-sm text-muted-foreground mt-2">يمكنك النقر على الخريطة أو سحب الدبوس لتحديد الموقع بدقة</p>
                </div>
              </div>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm font-medium">حالة تحديد الموقع</span>
              <span className={`text-sm font-medium flex items-center gap-1 ${
                coordinates.lat && coordinates.lng ? 'text-green-600' : 'text-orange-600'
              }`}>
                {coordinates.lat && coordinates.lng ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    تم تحديد الموقع
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    لم يتم تحديد الموقع
                  </>
                )}
              </span>
            </div>
            
            {coordinates.lat && coordinates.lng && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="text-sm font-medium text-primary mb-2">الإحداثيات الجغرافية:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">خط العرض:</span>
                    <span className="font-mono ml-2">{coordinates.lat.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">خط الطول:</span>
                    <span className="font-mono ml-2">{coordinates.lng.toFixed(6)}</span>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  💡 نصيحة: يمكنك سحب الدبوس الأحمر على الخريطة لتعديل الموقع بدقة أكبر
                </div>
              </div>
            )}
          </div>
          <div>
            <h1></h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWarehouse;