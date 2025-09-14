import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Save, User, Globe, Building, MapPin, FileText, Receipt } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { getContactById, updateContact } from '../../api/Contact';
import { toast } from 'react-hot-toast';

interface ContactFormData {
  name: string;
  country: string;
  tax: boolean;
  address: {
    city: string;
    streetNumber: string;
    buildingNumber: string;
    area: string;
    fullAddress: string;
  };
}

const EditContact: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    country: '',
    tax: false,
    address: {
      city: '',
      streetNumber: '',
      buildingNumber: '',
      area: '',
      fullAddress: ''
    }
  });

  useEffect(() => {
    if (id) {
      fetchContact();
    }
  }, [id]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const contact = await getContactById(id!);
      setFormData({
        name: contact.name || '',
        country: contact.country || '',
        tax: contact.tax || false,
        address: {
          city: contact.address?.city || '',
          streetNumber: contact.address?.streetNumber || '',
          buildingNumber: contact.address?.buildingNumber || '',
          area: contact.address?.area || '',
          fullAddress: contact.address?.fullAddress || ''
        }
      });
    } catch (error) {
      console.error('Error fetching contact:', error);
      toast.error('فشل في تحميل بيانات جهة الاتصال');
      navigate('/contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    try {
      if (field.startsWith('address.')) {
        const addressField = field.split('.')[1];
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } catch (error) {
      console.error('Error in handleInputChange:', error);
      toast.error('حدث خطأ أثناء تحديث البيانات');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('اسم جهة الاتصال مطلوب');
      return;
    }

    if (!formData.country.trim()) {
      toast.error('الدولة مطلوبة');
      return;
    }

    try {
      setSaving(true);
      await updateContact(id!, formData);
      toast.success('تم تحديث بيانات جهة الاتصال بنجاح');
      navigate('/contacts');
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('فشل في تحديث بيانات جهة الاتصال');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contacts')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors duration-200"
          >
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">تعديل جهة الاتصال</h1>
            <p className="text-muted-foreground">تحديث بيانات جهة الاتصال</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              المعلومات الأساسية
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اسم جهة الاتصال *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="أدخل اسم جهة الاتصال"
                  className="w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الدولة *
                </label>
                <div className="relative">
                  <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="أدخل اسم الدولة"
                    className="pr-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              معلومات العنوان
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  المدينة
                </label>
                <div className="relative">
                  <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="أدخل اسم المدينة"
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  المنطقة
                </label>
                <Input
                  type="text"
                  value={formData.address.area}
                  onChange={(e) => handleInputChange('address.area', e.target.value)}
                  placeholder="أدخل اسم المنطقة"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  رقم الشارع
                </label>
                <Input
                  type="text"
                  value={formData.address.streetNumber}
                  onChange={(e) => handleInputChange('address.streetNumber', e.target.value)}
                  placeholder="أدخل رقم الشارع"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  رقم المبنى
                </label>
                <Input
                  type="text"
                  value={formData.address.buildingNumber}
                  onChange={(e) => handleInputChange('address.buildingNumber', e.target.value)}
                  placeholder="أدخل رقم المبنى"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                العنوان الكامل
              </label>
              <div className="relative">
                <FileText className="absolute right-3 top-3 text-muted-foreground w-4 h-4" />
                <textarea
                  value={formData.address.fullAddress}
                  onChange={(e) => handleInputChange('address.fullAddress', e.target.value)}
                  placeholder="أدخل العنوان الكامل"
                  className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-foreground resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              معلومات الضريبة
            </h3>
            
            <div className="flex items-center gap-3">
              <input
                key={`tax-${formData.tax}`}
                type="checkbox"
                id="tax"
                checked={formData.tax}
                onChange={(e) => handleInputChange('tax', e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="tax" className="text-sm font-medium text-foreground">
                خاضع للضريبة
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/contacts')}
              className="px-6 py-2 border border-border rounded-lg hover:bg-secondary/50 transition-all duration-200 font-medium text-foreground"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContact;