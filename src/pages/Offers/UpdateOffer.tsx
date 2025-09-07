import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Trash2, ChevronDown, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { updateOffer, getOfferById, IOffer } from '../../api/offerAPI';
import { useParams, useNavigate } from 'react-router-dom';

// schemas للعرض

const offerWorkSchema = z.object({
  workItemId: z.string().min(1, 'يجب اختيار عمل'),
  quantity: z.number().min(1, 'الكمية يجب أن تكون أكبر من صفر'),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر')
});

const offerSchema = z.object({
  offerName: z.string().min(1, 'اسم العرض مطلوب'),
  to: z.string().min(1, 'اسم الجهة المستلمة مطلوب'),
  project: z.string().min(1, 'اسم المشروع مطلوب'),
  subject: z.string().min(1, 'موضوع العرض مطلوب'),
  works: z.array(offerWorkSchema).min(1, 'يجب إضافة عمل واحد على الأقل'),
  validity: z.string().min(1, 'مدة صلاحية العرض مطلوبة'),
  paymentTerms: z.string().min(1, 'شروط الدفع مطلوبة')
});

type OfferFormData = z.infer<typeof offerSchema>;

// تم إزالة مكونات AddWorkItemBtn و WorkItemSelect

// المكون الرئيسي لتحديث العرض
function UpdateOffer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      works: [],
      validity: "30 يوم",
      paymentTerms: "نقداً عند التسليم"
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'works'
  });

  const watchWorks = watch('works');
  const totalAmount = watchWorks.reduce((sum, work) => {
    return sum + ((work.quantity || 0) * (work.price || 0));
  }, 0);

  // جلب بيانات العرض وأوصاف الأعمال
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [offerData] = await Promise.all([
          getOfferById(id!),
        ]);
        
        // تعبئة النموذج ببيانات العرض الحالية
        setValue('offerName', offerData.offerName || '');
        setValue('to', offerData.to);
        setValue('project', offerData.project);
        setValue('subject', offerData.subject);
        setValue('validity', offerData.offerValidity || '30 يوم');
        setValue('paymentTerms', offerData.paymentTerms || 'نقداً عند التسليم');
        
        // تعبئة الأعمال
        const works = offerData.works.map(work => ({
          workItemId: typeof work.workItem === 'string' ? work.workItem : work.workItem._id,
          quantity: work.quantity,
          price: work.price
        }));
        setValue('works', works);
        
        // setWorkItems(workItemsData); // تم إزالة هذا السطر لأن workItemsData غير معرف
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
        toast.error('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, setValue]);

  const onSubmit = async (data: OfferFormData) => {
    try {
      const offerData = {
        offerName: data.offerName,
        to: data.to,
        project: data.project,
        subject: data.subject,
        workItems: data.works.map(work => ({
          workItem: work.workItemId,
          quantity: work.quantity,
          price: work.price
        })),
        totalAmount,
        offerValidity: data.validity,
        paymentTerms: data.paymentTerms
      };

      await updateOffer(id!, offerData);
      toast.success('تم تحديث العرض بنجاح');
      navigate('/offers');
    } catch (error: any) {
      console.error('Error updating offer:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تحديث العرض';
      toast.error(errorMessage);
    }
  };

  // تم إزالة دالة handleAddWorkItem و addWork

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
    <div className='max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen'>
      <div className='bg-white rounded-xl shadow-soft p-6 mb-6'>
        <div className='mb-6 flex items-center gap-4'>
          <button
            onClick={() => navigate('/offers')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للعروض
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary mb-2">تحديث العرض</h1>
            <p className="text-gray-600">قم بتعديل التفاصيل أدناه لتحديث العرض</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }}>
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

          {/* إدارة الأعمال */}
          <div className='mb-6'>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">أوصاف الأعمال</h2>
            
            {/* جدول الأعمال */}
            {fields.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-3 text-center">#</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">اسم العمل</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">الكمية</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">السعر</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">المجموع</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => {
                      const total = (watchWorks[index]?.quantity || 0) * (watchWorks[index]?.price || 0);
                      
                      return (
                        <tr key={field.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-center">{index + 1}</td>
                          <td className="px-4 py-3">
                            <Input
                              type="text"
                              {...register(`works.${index}.workItemId`)}
                              placeholder="اسم العمل"
                              className="w-full"
                            />
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
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-left font-semibold">المجموع الكلي</td>
                      <td className="px-4 py-3 font-bold text-primary">
                        {totalAmount.toFixed(2)}
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
                {errors.works && (
                  <p className="text-sm text-red-600 mt-2">{errors.works.message}</p>
                )}
              </div>
            )}
          </div>

          <hr className="border-gray-200 my-6" />

          {/* معلومات إضافية */}
          <div className='mb-6'>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">معلومات إضافية</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مدة صلاحية العرض</label>
                <Input 
                  type="text" 
                  placeholder="مثال: 30 يوم" 
                  {...register('validity')}
                />
                {errors.validity && (
                  <p className="mt-1 text-sm text-red-600">{errors.validity.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">شروط الدفع</label>
                <Input 
                  type="text" 
                  placeholder="مثال: نقداً عند التسليم" 
                  {...register('paymentTerms')}
                />
                {errors.paymentTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentTerms.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div className='flex justify-end gap-4'>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/offers')}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-dark text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري التحديث...
                </>
              ) : (
                'تحديث العرض'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateOffer;