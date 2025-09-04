import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../../components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createWorkItem, IWorkItem } from '../../api/offerAPI';
import { toast } from 'react-toastify';

// تعريف مخطط التحقق باستخدام Zod
const workItemSchema = z.object({
  name: z.string()
    .min(3, "يجب ان يكون الاسم لا يقل عن 3 احرف")
    .max(100, 'يجب أن لا يتجاوز اسم العمل 100 حرف')
});

// نوع البيانات المستنتج من المخطط
type WorkItemFormData = z.infer<typeof workItemSchema>;

function AddWorkItemBtn({ onWorkItemAdded }: { onWorkItemAdded?: (item: IWorkItem) => void }) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<WorkItemFormData>({
    resolver: zodResolver(workItemSchema)
  });

  const addWorkItem = (e: React.MouseEvent) => {
    e.preventDefault(); // إضافة هذا السطر لمنع السلوك الافتراضي
    e.stopPropagation(); // منع انتشار الحدث
    setOpenModal(true);
    setSubmitError('');
    reset(); // إعادة تعيين الحقول عند فتح النافذة
  };

  const closeModal = () => {
    setOpenModal(false);
    setSubmitError('');
    reset(); // إعادة تعيين الحقول عند الإغلاق
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
      closeModal(); // إغلاق النافذة بعد النجاح
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
        type="button" // التأكد من أن النوع button
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

export default AddWorkItemBtn;