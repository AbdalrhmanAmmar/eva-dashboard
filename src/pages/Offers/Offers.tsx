import React, { useEffect, useState } from 'react';
import { PlusCircle, Search, User, Eye, Download, Edit, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/input'; 
import { useSearchParams, useNavigate } from 'react-router-dom';
import { formatArabicDate } from '../../utils/formatDate'; 
import { getAllOffers } from '../../api/offerAPI';
import { handleDownloadOffer } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';


// واجهة بيانات العرض بناءً على استجابة API الحقيقية
interface Offer {
  _id: string;
  order: number;
  offerName: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  downloadsCount: number;
  to: string;
  project: string;
  subject: string;
  offerValidity: string;
  paymentTerms: string;
  works: Array<{
    workItem: {
      _id: string;
      name: string;
    };
    quantity: number;
    price: number;
    _id: string;
  }>;
  __v: number;
}

function Offers() {
  const [offerData, setOfferData] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  

  
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await getAllOffers();
        console.log(`response`, response)
        
        if (response.success) {
          setOfferData(response.data);
          setFilteredOffers(response.data);
        } else {
          console.error('Failed to fetch offers');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setLoading(false);
      }
    };
    
    fetchOffers();
  }, []);

  useEffect(() => {
    // تطبيق البحث عند تغيير قيمة البحث
    if (search) {
      const filtered = offerData.filter(offer => 
        offer.offerName.toLowerCase().includes(search.toLowerCase()) ||
        `OFF-${offer.order.toString().padStart(3, '0')}`.includes(search)
      );
      setFilteredOffers(filtered);
    } else {
      setFilteredOffers(offerData);
    }
  }, [search, offerData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleCreateOffer = () => {
    navigate('/create-offer');
  };

  const handleViewDetails = async (id: string) => {
    try {
      toast.loading('جاري إنشاء ملف PDF...', { id: 'pdf-generation' });
      
      // استخدام الخدمة الخلفية لتحميل PDF
      const response = await fetch(`http://localhost:4000/api/offers/${id}/pdf`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل ملف PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Offer-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تحميل ملف PDF بنجاح', { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('فشل في تحميل ملف PDF', { id: 'pdf-generation' });
    }
  };

  const handleEditOffer = (id: string) => {
    navigate(`/edit-offer/${id}`);
  };

  const handleDeleteOffer = (id: string) => {
    // دالة حذف العرض
    if (window.confirm('هل أنت متأكد من أنك تريد حذف هذا العرض؟')) {
      console.log('حذف العرض:', id);
      // هنا سيتم استدعاء API للحذف
      setOfferData(prev => prev.filter(offer => offer._id !== id));
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      toast.loading('جاري إنشاء ملف PDF...', { id: 'pdf-generation' });
      
      // استخدام الخدمة الخلفية لتحميل PDF
      const response = await fetch(`http://localhost:3000/api/offers/${id}/pdf`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل ملف PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Offer-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تحميل ملف PDF بنجاح', { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('فشل في تحميل ملف PDF', { id: 'pdf-generation' });
    }
  };

  // دالة لتحديد حالة العرض بناءً على تاريخ الإنشاء
  const getOfferStatus = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 30 ? 'active' : 'expired';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">إدارة العروض</h1>
          <p className="text-muted-foreground mt-2">يمكنك إدارة العروض والمعلومات الخاصة بها</p>
        </div>
        
        <button 
          className='btn-gradient flex items-center gap-2 py-3 px-6 rounded-md'
          onClick={handleCreateOffer}
        >
          <PlusCircle className="w-5 h-5" />
          إنشاء عرض جديد
        </button>
      </div>

      {/* Search */}
      <div className='bg-card border border-border rounded-xl p-4'>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            type='search' 
            placeholder='البحث باستخدام رقم العرض أو اسم العرض'
            value={search}
            onChange={handleSearchChange}
            className="pr-10"
          />
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-3 text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : filteredOffers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-secondary/50 to-secondary/30">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">رقم العرض</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">اسم العرض</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">العميل</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المشروع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">منشئ العرض</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">تاريخ الإنشاء</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">عدد مرات التنزيل</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((item, index) => {
                  const status = getOfferStatus(item.createdAt);
                  return (
                    <tr 
                      key={item._id} 
                      className={`border-b border-border hover:bg-secondary/30 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/10'
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold bg-primary/10 text-primary text-center rounded-full">
                        OFF-{item.order.toString().padStart(3, '0')}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {item.offerName}
                      </td>
                      <td className="px-6 py-4">
                        {item.to}
                      </td>
                      <td className="px-6 py-4">
                        {item.project}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{item.createdBy?.name || "غير محدد"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{formatArabicDate(item.createdAt)}</td>
                      <td className="px-6 py-4">
                        <button
  onClick={() => navigate("/invoice/"+item._id)}
  className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
  title="تحميل العرض كـ PDF"
>
  <Download className="w-4 h-4" />
</button>
                        {item.downloadsCount}
                      </td>
                  
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(item._id)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditOffer(item._id)}
                            className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors"
                            title="تعديل العرض"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(item._id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="حذف العرض"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد عروض</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإضافة عرض جديد</p>
            <button 
              className="btn-gradient flex items-center gap-2 mx-auto py-2 px-4 rounded-md"
              onClick={handleCreateOffer}
            >
              <PlusCircle className="w-4 h-4" />
              إنشاء عرض جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Offers;