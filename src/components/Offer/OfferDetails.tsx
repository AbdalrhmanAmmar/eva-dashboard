import React from 'react';
import { Download, Printer, Share, ArrowRight } from 'lucide-react';

interface OfferDetailsProps {
  offer: {
    _id: string;
    order: number;
    offerName: string;
    to: string;
    project: string;
    subject: string;
    offerValidity: string;
    paymentTerms: string;
    createdBy: {
      name: string;
      email: string;
    };
    downloadsCount: number;
    createdAt: string;
    works: Array<{
      workItem: {
        name: string;
      };
      quantity: number;
      price: number;
      _id: string;
    }>;
  };
  onClose: () => void;
}

const OfferDetails: React.FC<OfferDetailsProps> = ({ offer, onClose }) => {
  // حساب الإجمالي
  const total = offer.works.reduce((sum, work) => sum + (work.quantity * work.price), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{offer.offerName}</h1>
              <p className="mt-2">رقم العرض: OFF-{offer.order.toString().padStart(3, '0')}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Company and Client Info */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">معلومات الشركة</h3>
              <p className="text-gray-600">شركة التقنية المتطورة</p>
              <p className="text-gray-600">info@techcompany.com</p>
              <p className="text-gray-600">+966112345678</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">معلومات العميل</h3>
              <p className="text-gray-600">{offer.to}</p>
              <p className="text-gray-600">المشروع: {offer.project}</p>
              <p className="text-gray-600">الموضوع: {offer.subject}</p>
            </div>
          </div>
        </div>

        {/* Offer Details */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">تفاصيل العرض</h3>
              <p className="text-gray-600">صلاحية العرض: {offer.offerValidity}</p>
              <p className="text-gray-600">شروط الدفع: {offer.paymentTerms}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">معلومات إضافية</h3>
              <p className="text-gray-600">تم الإنشاء بواسطة: {offer.createdBy.name}</p>
              <p className="text-gray-600">تاريخ الإنشاء: {new Date(offer.createdAt).toLocaleDateString('ar-SA')}</p>
              <p className="text-gray-600">عدد مرات التحميل: {offer.downloadsCount}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">البنود</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-right border">#</th>
                  <th className="p-3 text-right border">البند</th>
                  <th className="p-3 text-right border">الكمية</th>
                  <th className="p-3 text-right border">السعر</th>
                  <th className="p-3 text-right border">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {offer.works.map((work, index) => (
                  <tr key={work._id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-3 text-center border">{index + 1}</td>
                    <td className="p-3 text-right border">{work.workItem.name}</td>
                    <td className="p-3 text-center border">{work.quantity}</td>
                    <td className="p-3 text-left border">{work.price.toLocaleString()} ر.س</td>
                    <td className="p-3 text-left border">{(work.quantity * work.price).toLocaleString()} ر.س</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 font-semibold">
                  <td colSpan={4} className="p-3 text-right border">الإجمالي</td>
                  <td className="p-3 text-left border">{total.toLocaleString()} ر.س</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">ملاحظات</h3>
          <ul className="list-disc pr-5 text-gray-600 space-y-1">
            <li>هذا العرض ساري لمدة {offer.offerValidity} من تاريخه</li>
            <li>يشمل السعر الضريبة المضافة</li>
            <li>يشمل السعر التركيب والضمان لمدة سنة</li>
            <li>للاستفسار، يرجى التواصل مع قسم المبيعات</li>
          </ul>
        </div>

        {/* Bank Info */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">معلومات التحويل البنكي</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600"><span className="font-semibold">اسم البنك:</span> البنك الأهلي التجاري</p>
              <p className="text-gray-600"><span className="font-semibold">رقم الحساب:</span> 449000010006085172848</p>
            </div>
            <div>
              <p className="text-gray-600"><span className="font-semibold">اسم البنك:</span> الرياض</p>
              <p className="text-gray-600"><span className="font-semibold">IBAN:</span> SA2330000446880105127888</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex flex-wrap gap-3 justify-center">
          <button className="btn-primary flex items-center gap-2 py-2 px-6 rounded-md">
            <Download className="w-5 h-5" />
            تحميل العرض
          </button>
          <button className="btn-secondary flex items-center gap-2 py-2 px-6 rounded-md">
            <Printer className="w-5 h-5" />
            طباعة
          </button>
          <button className="btn-gradient flex items-center gap-2 py-2 px-6 rounded-md">
            <Share className="w-5 h-5" />
            مشاركة
          </button>
          <button className="btn-success flex items-center gap-2 py-2 px-6 rounded-md">
            الموافقة على العرض
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;