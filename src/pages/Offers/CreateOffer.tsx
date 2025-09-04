import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Trash2, Loader2, AlertCircle, GripVertical } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { createOffer } from '../../api/offerAPI';

// مخطط Zod للعرض بالكامل
const offerSchema = z.object({
  offerName: z.string().min(1, 'اسم العرض مطلوب'),
  to: z.string().min(1, 'اسم الجهة المستلمة مطلوب'),
  project: z.string().min(1, 'اسم المشروع مطلوب'),
  subject: z.string().min(1, 'موضوع العرض مطلوب'),
  works: z.array(z.object({
    workItem: z.string().min(1, 'اسم العمل مطلوب'),
    quantity: z.number().min(1, 'الكمية يجب أن تكون على الأقل 1'),
    price: z.number().min(0, 'السعر يجب أن يكون على الأقل 0')
  })).min(1, 'يجب إضافة عمل واحد على الأقل'),
  offerValidity: z.string().min(1, 'صلاحية العرض مطلوبة'),
  paymentTerms: z.string().min(1, 'شروط الدفع مطلوبة')
});

type OfferFormData = z.infer<typeof offerSchema>;

// المكون الرئيسي لإنشاء العرض
function CreateOffer() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [newWorkItem, setNewWorkItem] = useState({
    workItem: '',
    quantity: 1,
    price: 0
  });

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      works: [],
      offerValidity: "30 يوم",
      paymentTerms: "50% مقدمة، 50% بعد التسليم"
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "works"
  });

  const watchWorks = watch("works");
  const totalAmount = watchWorks?.reduce((total, work) => {
    return total + (work.quantity || 0) * (work.price || 0);
  }, 0) || 0;
  const taxAmount = totalAmount * 0.15;
  const totalWithTax = totalAmount + taxAmount;

  // إرسال النموذج
  const onSubmit = async (data: OfferFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      
      // تحضير البيانات للإرسال
      const offerData = {
        offerName: data.offerName,
        to: data.to,
        project: data.project,
        subject: data.subject,
        works: data.works,
        offerValidity: data.offerValidity,
        paymentTerms: data.paymentTerms
      };
      
      // إرسال البيانات إلى الخادم
      const newOffer = await createOffer(offerData);
      console.log('عرض جديد:', newOffer);
      toast.success('تم إنشاء العرض بنجاح!');
      
      // إعادة تعيين النموذج بعد النجاح
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error('Failed to create offer:', error);
      const errorMessage = error.response?.data?.message || 'فشل في إنشاء العرض';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // إضافة عمل جديد
  const addWork = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!newWorkItem.workItem.trim()) {
      toast.error('يرجى إدخال اسم العمل');
      return;
    }
    
    append({ 
      workItem: newWorkItem.workItem,
      quantity: newWorkItem.quantity, 
      price: newWorkItem.price 
    });
    
    // إعادة تعيين الحقول
    setNewWorkItem({
      workItem: '',
      quantity: 1,
      price: 0
    });
  };

  // منع تأثير الإضافات على الصفحة
  useEffect(() => {
    // إضافة فئة خاصة للصفحة لمنع تداخل الإضافات
    document.body.classList.add('offer-creation-page');
    
    return () => {
      document.body.classList.remove('offer-creation-page');
    };
  }, []);

  return (
    <div className='max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen'>
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-lg font-medium">جاري حفظ العرض...</p>
          </div>
        </div>
      )}
      
      <div className='bg-white rounded-xl shadow-soft p-6 mb-6'>
        <div className='mb-6'>
          <h1 className="text-2xl font-bold text-primary mb-2">إنشاء عرض جديد</h1>
          <p className="text-gray-600">املأ التفاصيل أدناه لإنشاء عرض جديد للعميل</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="offer-form">
          {/* المعلومات الأساسية */}
          <div className='mb-6'>
            <div className='mb-4'>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم العرض</label>
              <Input 
                type="text" 
                placeholder="أدخل اسم العرض" 
                className="w-full" 
                {...register('offerName')}
              />
              {errors.offerName && (
                <p className="mt-1 text-sm text-red-600">{errors.offerName.message}</p>
              )}
            </div>
            
            <div className='bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">إلى</label>
                <Input 
                  type="text" 
                  placeholder="اسم الجهة المستلمة" 
                  {...register('to')}
                />
                {errors.to && (
                  <p className="mt-1 text-sm text-red-600">{errors.to.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المشروع</label>
                <Input 
                  type="text" 
                  placeholder="اسم المشروع" 
                  {...register('project')}
                />
                {errors.project && (
                  <p className="mt-1 text-sm text-red-600">{errors.project.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الموضوع</label>
                <Input 
                  type="text" 
                  placeholder="موضوع العرض" 
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-200 my-6" />

          {/* أعمال العرض */}
          <div className='mb-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className="text-lg font-semibold text-gray-800">أعمال العرض</h2>
            </div>

            <div className='bg-gray-50 p-4 rounded-lg mb-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم العمل</label>
                  <Input 
                    type="text" 
                    placeholder="أدخل اسم العمل" 
                    value={newWorkItem.workItem}
                    onChange={(e) => setNewWorkItem({...newWorkItem, workItem: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الكمية</label>
                  <Input 
                    type="number" 
                    min="1"
                    className="w-full"
                    value={newWorkItem.quantity}
                    onChange={(e) => setNewWorkItem({...newWorkItem, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.01"
                    className="w-full"
                    value={newWorkItem.price}
                    onChange={(e) => setNewWorkItem({...newWorkItem, price: Number(e.target.value)})}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addWork}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                إضافة إلى قائمة الأعمال
              </button>
            </div>

            {/* جدول الأعمال المضافة */}
            {fields.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">اسم العمل</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الكمية</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">السعر</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإجمالي</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fields.map((field, index) => {
                      const quantity = watch(`works.${index}.quantity`);
                      const price = watch(`works.${index}.price`);
                      const total = (quantity || 0) * (price || 0);
                      
                      return (
                        <tr key={field.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-center">{index + 1}</td>
                          <td className="px-4 py-3">
                            <Input
                              type="text"
                              placeholder="اسم العمل"
                              {...register(`works.${index}.workItem`)}
                              className="w-full"
                            />
                            {errors.works?.[index]?.workItem && (
                              <p className="text-xs text-red-600 mt-1">{errors.works[index]?.workItem?.message}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="1"
                              {...register(`works.${index}.quantity`, { valueAsNumber: true })}
                              className="w-20"
                            />
                            {errors.works?.[index]?.quantity && (
                              <p className="text-xs text-red-600 mt-1">{errors.works[index]?.quantity?.message}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...register(`works.${index}.price`, { valueAsNumber: true })}
                              className="w-24"
                            />
                            {errors.works?.[index]?.price && (
                              <p className="text-xs text-red-600 mt-1">{errors.works[index]?.price?.message}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">{total.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="حذف"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* تذييل الجدول مع الحسابات */}
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="font-semibold">المجموع الكلي</p>
                      <p className="text-lg font-bold text-primary">{totalAmount.toFixed(2)} ر.س</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">ضريبة القيمة المضافة 15%</p>
                      <p className="text-lg font-bold text-primary">{taxAmount.toFixed(2)} ر.س</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">الإجمالي شامل الضريبة</p>
                      <p className="text-lg font-bold text-primary">{totalWithTax.toFixed(2)} ر.س</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">لم يتم إضافة أي أعمال بعد</p>
                {errors.works && (
                  <p className="text-sm text-red-600 mt-2">{errors.works.message}</p>
                )}
              </div>
            )}
          </div>

          <hr className="border-gray-200 my-6" />

          {/* معلومات إضافية */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صلاحية العرض</label>
              <Input 
                type="text" 
                placeholder="مثال: 30 يوم" 
                {...register('offerValidity')}
              />
              {errors.offerValidity && (
                <p className="mt-1 text-sm text-red-600">{errors.offerValidity.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شروط الدفع</label>
              <Input 
                type="text" 
                placeholder="مثال: 50% مقدمة، 50% بعد التسليم" 
                {...register('paymentTerms')}
              />
              {errors.paymentTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentTerms.message}</p>
              )}
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
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              حفظ العرض
            </button>
          </div>

          {submitError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 inline ml-2" />
              <span>{submitError}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateOffer;