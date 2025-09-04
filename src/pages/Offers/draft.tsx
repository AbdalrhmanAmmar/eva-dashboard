import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Save, Download, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { IOfferWork, IWorkItem, getWorkItems, createWorkItem } from '../../api/offerAPI';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// مخطط التحقق باستخدام Zod
const workItemSchema = z.object({
  name: z.string()
    .min(3, 'يجب أن يكون اسم العمل至少 3 أحرف')
    .max(100, 'يجب أن لا يتجاوز اسم العمل 100 حرف')
});

type WorkItemFormData = z.infer<typeof workItemSchema>;

// مكون زر إضافة عمل جديد
function AddWorkItemBtn({ onWorkItemAdded }: { onWorkItemAdded?: (item: IWorkItem) => void }) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<WorkItemFormData>({
    resolver: zodResolver(workItemSchema)
  });

  const addWorkItem = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenModal(true);
    setSubmitError('');
    reset();
  };

  const closeModal = () => {
    setOpenModal(false);
    setSubmitError('');
    reset();
  };

  const onSubmit = async (data: WorkItemFormData) => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const newWorkItem = await createWorkItem(data.name);
      if (onWorkItemAdded) {
        onWorkItemAdded(newWorkItem);
      }

      toast.success('تم إضافة وصف العمل بنجاح!');
      closeModal();
    } catch (error: any) {
      console.error('Failed to create work item:', error);
      setSubmitError(error.response?.data?.message || 'حدث خطأ أثناء إضافة العمل');
      toast.error('فشل في إضافة وصف العمل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={addWorkItem}
        className="flex items-center justify-center gap-2 font-bold py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
      >
        <Plus className="w-5 h-5" />
        إضافة وصف عمل جديد
      </button>
      
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">إضافة وصف عمل جديد</h2>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  اسم العمل
                </label>
                <input 
                  id="name"
                  type="text" 
                  placeholder="أدخل وصف العمل" 
                  {...register('name')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      إضافة
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// مكون عرض قائمة الأعمال بشكل أنيق
function GetAllWorkItem({ onSelect }: { onSelect: (item: IWorkItem) => void }) {
  const [workItems, setWorkItems] = useState<IWorkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<IWorkItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchWorkItems = async () => {
      try {
        const items = await getWorkItems();
        setWorkItems(items);
      } catch (error: any) {
        console.error('Failed to fetch work items:', error);
        setError(error.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkItems();
  }, []);

  const handleSelect = (item: IWorkItem) => {
    setSelectedItem(item);
    setIsOpen(false);
    onSelect(item);
  };

  const filteredItems = workItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-primary">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
        <AlertCircle className="w-5 h-5 ml-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Select Box مع تصميم مخصص */}
      <div 
        className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-primary transition-colors shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedItem ? "text-gray-800" : "text-gray-500"}>
          {selectedItem ? selectedItem.name : "اختر عنصر من القائمة"}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {/* شريط البحث داخل القائمة */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="ابحث في القائمة..."
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          {/* عناصر القائمة */}
          <div className="max-h-48 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div
                  key={item._id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedItem?._id === item._id
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 text-gray-800'
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  {item.name}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                لا توجد نتائج
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// المكون الرئيسي لإنشاء العرض
function CreateOffer() {
  const [formData, setFormData] = useState({
    to: '',
    project: '',
    subject: '',
    offerValidity: '',
    paymentTerms: '',
  });
  
  const [works, setWorks] = useState<IOfferWork[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkItemSelect = (item: IWorkItem) => {
    // يتم التعامل مع العنصر المحدد هنا إذا لزم الأمر
  };

  const handleNewWorkItemAdded = (newItem: IWorkItem) => {
    // يمكن إضافة العنصر الجديد تلقائياً إلى القائمة إذا رغب المستخدم
    toast.info(`تم إضافة "${newItem.name}" إلى قائمة الأعمال`);
  };

  const addWorkItem = () => {
    // سيتم تعديل هذه الدالة لتعمل مع المكون الجديد
  };

  const removeWorkItem = (index: number) => {
    const newWorks = [...works];
    newWorks.splice(index, 1);
    setWorks(newWorks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ ...formData, works });
    toast.success('تم حفظ العرض بنجاح!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">إنشاء عرض جديد</h1>
        <p className="text-gray-600 mb-6">املأ التفاصيل أدناه لإنشاء عرض جديد للعميل</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* المعلومات الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">إلى</label>
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="اسم الجهة المستلمة"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المشروع</label>
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="اسم المشروع"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">الموضوع</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="موضوع العرض"
                required
              />
            </div>
          </div>
          
          <hr className="border-gray-200" />
          
          {/* إضافة أعمال للعرض */}
          <div>
            <div className='flex justify-between items-center mb-4'>
              <h2 className="text-xl font-semibold text-gray-800">أعمال العرض</h2>
              <AddWorkItemBtn onWorkItemAdded={handleNewWorkItemAdded} />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اختر العمل</label>
                  <GetAllWorkItem onSelect={handleWorkItemSelect} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الكمية</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={addWorkItem}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                إضافة إلى قائمة الأعمال
              </button>
            </div>
            
            {/* جدول الأعمال المضافة */}
            {works.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">اسم العمل</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الكمية</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">السعر</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإجمالي</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {works.map((work, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-center">{index + 1}</td>
                        <td className="px-4 py-3">
                          {typeof work.workItem === 'object' ? work.workItem.name : work.workItem}
                        </td>
                        <td className="px-4 py-3">{work.quantity}</td>
                        <td className="px-4 py-3">{work.price.toFixed(2)}</td>
                        <td className="px-4 py-3 font-medium">{(work.quantity * work.price).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeWorkItem(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="حذف"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-left font-semibold">المجموع الكلي</td>
                      <td className="px-4 py-3 font-bold text-primary">
                        {works.reduce((total, work) => total + (work.quantity * work.price), 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">لم يتم إضافة أي أعمال بعد</p>
              </div>
            )}
          </div>
          
          <hr className="border-gray-200" />
          
          {/* معلومات إضافية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صلاحية العرض</label>
              <input
                type="text"
                name="offerValidity"
                value={formData.offerValidity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="مثال: 30 يوم"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شروط الدفع</label>
              <input
                type="text"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="مثال: 50% مقدمة، 50% بعد التسليم"
              />
            </div>
          </div>
          
          {/* أزرار الإجراءات */}
          <div className="flex flex-col-reverse md:flex-row gap-4 justify-end pt-4">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              حفظ العرض
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              حفظ وتنزيل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOffer;