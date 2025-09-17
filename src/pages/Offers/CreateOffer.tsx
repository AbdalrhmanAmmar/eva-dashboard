import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Plus, Trash2, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { createWorkItem,  IWorkItem, createOffer, IOffer } from '../../api/offerAPI';

// مخطط Zod للعمل الفردي
const workItemSchema = z.object({
  name: z.string()
    .min(3, "يجب ان يكون الاسم لا يقل عن 3 احرف")
    .max(100, 'يجب أن لا يتجاوز اسم العمل 100 حرف')
});

// مخطط Zod للعرض بالكامل
const offerSchema = z.object({
  offerName: z.string().min(1, 'اسم العرض مطلوب'),
  to: z.string().min(1, 'اسم الجهة المستلمة مطلوب'),
  project: z.string().min(1, 'اسم المشروع مطلوب'),
  subject: z.string().min(1, 'موضوع العرض مطلوب'),
  works: z.array(z.object({
    workItemId: z.string().min(1, 'يجب اختيار عمل'),
    quantity: z.number().min(1, 'الكمية يجب أن تكون على الأقل 1'),
    price: z.number().min(0, 'السعر يجب أن يكون على الأقل 0')
  })).min(1, 'يجب إضافة عمل واحد على الأقل'),
  validity: z.string().min(1, 'صلاحية العرض مطلوبة'),
  paymentTerms: z.string().min(1, 'شروط الدفع مطلوبة')
});

type OfferFormData = z.infer<typeof offerSchema>;

// مكون زر إضافة عمل جديد
function AddWorkItemBtn({ onWorkItemAdded }: { onWorkItemAdded?: (item: IWorkItem) => void }) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(workItemSchema)
  });

  const addWorkItem = (e: React.MouseEvent) => {

    setOpenModal(true);
    setSubmitError('');
    reset();
  };

  const closeModal = () => {
    setOpenModal(false);
    setSubmitError('');
    reset();
  };

  const onSubmit = async (data: { name: string }) => {
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
        className="flex items-center justify-center gap-2 font-bold py-3 btn-gradient hover:bg-primary-dark text-white rounded-md transition-colors"
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
                <Input 
                  id="name"
                  type="text" 
                  placeholder="أدخل وصف العمل" 
                  {...register('name')}
                  className={errors.name ? 'border-red-500 focus:ring-red-500' : ''}
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
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
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

// مكون اختيار العمل من القائمة
function WorkItemSelect({ 
  workItems, 
  value,
  onChange,
  error 
}: { 
  workItems: IWorkItem[]; 
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const selectedItem = workItems.find(item => item._id === value) || null;

  const handleSelect = (item: IWorkItem) => {
    onChange(item._id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div 
        className={`flex items-center justify-between p-3 border rounded-lg bg-white cursor-pointer hover:border-primary transition-colors shadow-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedItem ? "text-gray-800" : "text-gray-500"}>
          {selectedItem ? selectedItem.name : "اختر عنصر من القائمة"}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {workItems.map(item => (
            <div
              key={item._id}
              className={`p-3 cursor-pointer transition-colors ${
                value === item._id
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleSelect(item)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// المكون الرئيسي لإنشاء العرض
function CreateOffer() {
  const [workItems, setWorkItems] = useState<IWorkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [newWorkItem, setNewWorkItem] = useState<{name: string; quantity: number; price: number}>({
    name: '',
    quantity: 1,
    price: 0
  });

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      works: [],
      validity: "30 يوم",
      paymentTerms: "50% مقدمة، 50% بعد التسليم"
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "works"
  });

  const watchWorks = watch("works");

  // حساب الإجمالي
  const totalAmount = watchWorks?.reduce((total, work) => {
    return total + (work.quantity || 0) * (work.price || 0);
  }, 0) || 0;

  // // جلب عناصر العمل عند التحميل
  // useEffect(() => {
  //   const fetchWorkItems = async () => {
  //     try {
  //       const items = await getWorkItems();
  //       setWorkItems(items);
  //     } catch (error: any) {
  //       console.error('Failed to fetch work items:', error);
  //       setError(error.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchWorkItems();
  // }, []);

  const onSubmit = async (data: OfferFormData) => {
    try {
      // تحضير البيانات للإرسال
      const offerData = {
        name: data.offerName,
        to: data.to,
        project: data.project,
        subject: data.subject,
        workItems: data.works.map(work => ({
          workItem: work.workItemId,
          quantity: work.quantity,
          price: work.price
        })),
        totalAmount,
        validity: data.validity,
        paymentTerms: data.paymentTerms
      };
      
      // إرسال البيانات إلى الخادم
      const newOffer = await createOffer(offerData);
      console.log('عرض جديد:', newOffer);
      toast.success('تم إنشاء العرض بنجاح!');
      
    } catch (error: any) {
      console.error('Failed to create offer:', error);
      const errorMessage = error.response?.data?.message || 'فشل في إنشاء العرض';
      toast.error(errorMessage);
    }
  };

  const handleAddWorkItem = (newWorkItem: IWorkItem) => {
    setWorkItems(prev => [...prev, newWorkItem]);
  };

  const addWork = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!newWorkItem.workDescription.trim()) {
       toast.error('يرجى إدخال وصف العمل');
       return;
     }
     
     if (newWorkItem.quantity <= 0) {
       toast.error('يرجى إدخال كمية صحيحة');
       return;
     }
     
     if (newWorkItem.price < 0) {
       toast.error('يرجى إدخال سعر صحيح');
       return;
     }
     
     append({ 
       workDescription: newWorkItem.workDescription, 
       quantity: newWorkItem.quantity, 
       price: newWorkItem.price 
     });
     
     // إعادة تعيين الحقول
     setNewWorkItem({
       workDescription: '',
       quantity: 1,
       price: 0
     });
    
    toast.success('تم إضافة العمل بنجاح!');
  };

  if (!loading) {
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
        <div className='mb-6'>
          <h1 className="text-2xl font-bold text-primary mb-2">إنشاء عرض جديد</h1>
          <p className="text-gray-600">املأ التفاصيل أدناه لإنشاء عرض جديد للعميل</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
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
  

            <div className='bg-gray-50 p-4 rounded-lg mb-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اختر العمل</label>
                  <Input 
                
                    value={newWorkItem.name}
                    onChange={(e) => setNewWorkItem({...newWorkItem, name: (e.target.value)})}
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
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">اسم العمل</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الكمية</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">السعر</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإجمالي</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fields.map((field, index) => {
                      const workItem = workItems.find(item => item._id === watchWorks[index]?.workItemId);
                      const total = (watchWorks[index]?.quantity || 0) * (watchWorks[index]?.price || 0);
                      
                      return (
                        <tr key={field.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-center">{index + 1}</td>
                          <td className="px-4 py-3">
                            <WorkItemSelect
                              workItems={workItems}
                              value={watchWorks[index]?.workItemId || ''}
                              onChange={(value) => setValue(`works.${index}.workItemId`, value)}
                              error={errors.works?.[index]?.workItemId?.message}
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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صلاحية العرض</label>
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
        </form>
      </div>
    </div>
  );
}

export default CreateOffer;