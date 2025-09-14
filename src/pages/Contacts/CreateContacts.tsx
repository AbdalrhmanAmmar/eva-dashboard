
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createContact, ContactPayload } from "../../api/Contact";
import { ArrowLeft, User, Globe, MapPin, Building, Hash, FileText, Check, Loader2 } from "lucide-react";

const addressSchema = z.object({
  city: z.string().optional(),
  streetNumber: z.string().optional(),
  buildingNumber: z.string().optional(),
  area: z.string().optional(),
  fullAddress: z.string().optional(),
});

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "الاسم يجب أن يحتوي على حرفين على الأقل")
    .max(60, "الاسم طويل جداً"),
  country: z
    .string()
    .min(2, "البلد يجب أن يحتوي على حرفين على الأقل"),
  tax: z.boolean(),
  address: addressSchema.optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

function CreateContacts() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      country: "",
      tax: false,
      address: {
        city: "",
        streetNumber: "",
        buildingNumber: "",
        area: "",
        fullAddress: "",
      },
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsLoading(true);
      
      // التحقق من صحة البيانات قبل الإرسال
      if (!data.name || !data.country) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        return;
      }
      
      const contactData: ContactPayload = {
        name: data.name.trim(),
        country: data.country.trim(),
        tax: data.tax,
        address: data.address && Object.values(data.address).some(val => val && val.trim()) ? {
          city: data.address.city?.trim() || undefined,
          streetNumber: data.address.streetNumber?.trim() || undefined,
          buildingNumber: data.address.buildingNumber?.trim() || undefined,
          area: data.address.area?.trim() || undefined,
          fullAddress: data.address.fullAddress?.trim() || undefined,
        } : undefined,
      };

      console.log('إرسال البيانات:', contactData);
      const result = await createContact(contactData);
      console.log('نتيجة الإرسال:', result);
      
      toast.success("تم إنشاء جهة الاتصال بنجاح!");
      reset();
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(-1);
      }, 1000);
      
    } catch (error: any) {
      console.error('خطأ في إنشاء جهة الاتصال:', error);
      const errorMessage = error?.message || "حدث خطأ أثناء إنشاء جهة الاتصال";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>العودة</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2">
              إنشاء جهة اتصال جديدة
            </h1>
            <p className="text-muted-foreground text-lg">
              أضف معلومات جهة الاتصال الجديدة بسهولة
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
          <div className="p-6" style={{background: 'var(--gradient-primary)'}}>
            <h2 className="text-2xl font-bold text-primary-foreground flex items-center gap-3">
              <User className="w-7 h-7" />
              معلومات جهة الاتصال
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                 <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                   <User className="w-4 h-4 text-primary" />
                   اسم جهة الاتصال *
                 </label>
                 <input
                   {...register("name")}
                   type="text"
                   className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-card"
                   placeholder="أدخل اسم جهة الاتصال"
                   disabled={isLoading}
                 />
                 {errors.name && (
                   <p className="text-destructive text-sm flex items-center gap-1">
                     <span className="w-4 h-4 rounded-full bg-destructive/10 flex items-center justify-center text-xs">!</span>
                     {errors.name.message}
                   </p>
                 )}
               </div>

               {/* Country Field */}
               <div className="space-y-2">
                 <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                   <Globe className="w-4 h-4 text-primary" />
                   البلد *
                 </label>
                 <input
                   {...register("country")}
                   type="text"
                   className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-card"
                   placeholder="أدخل اسم البلد"
                   disabled={isLoading}
                 />
                 {errors.country && (
                   <p className="text-destructive text-sm flex items-center gap-1">
                     <span className="w-4 h-4 rounded-full bg-destructive/10 flex items-center justify-center text-xs">!</span>
                     {errors.country.message}
                   </p>
                 )}
               </div>
            </div>

            {/* Tax Checkbox */}
             <div className="bg-muted/30 rounded-xl p-6 border border-border">
               <div className="flex items-center gap-3">
                 <input
                   {...register("tax")}
                   type="checkbox"
                   id="tax"
                   className="w-5 h-5 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                   disabled={isLoading}
                 />
                 <label htmlFor="tax" className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
                   <Hash className="w-4 h-4 text-primary" />
                   خاضع للضريبة
                 </label>
               </div>
               <p className="text-xs text-muted-foreground mt-2 mr-8">
                 حدد هذا الخيار إذا كانت جهة الاتصال خاضعة للضريبة
               </p>
             </div>

            {/* Address Section */}
             <div className="space-y-6">
               <div className="flex items-center gap-2 text-lg font-bold text-foreground border-b border-border pb-2">
                 <MapPin className="w-5 h-5 text-primary" />
                 معلومات العنوان (اختيارية)
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* City */}
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-foreground">
                     المدينة
                   </label>
                   <input
                     {...register("address.city")}
                     type="text"
                     className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-card"
                     placeholder="أدخل اسم المدينة"
                     disabled={isLoading}
                   />
                 </div>

                 {/* Area */}
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-foreground">
                     المنطقة
                   </label>
                   <input
                     {...register("address.area")}
                     type="text"
                     className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-card"
                     placeholder="أدخل اسم المنطقة"
                     disabled={isLoading}
                   />
                 </div>

                 {/* Street Number */}
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-foreground">
                     رقم الشارع
                   </label>
                   <input
                     {...register("address.streetNumber")}
                     type="text"
                     className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-card"
                     placeholder="أدخل رقم الشارع"
                     disabled={isLoading}
                   />
                 </div>

                 {/* Building Number */}
                 <div className="space-y-2">
                   <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                     <Building className="w-4 h-4 text-primary" />
                     رقم المبنى
                   </label>
                   <input
                     {...register("address.buildingNumber")}
                     type="text"
                     className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-card"
                     placeholder="أدخل رقم المبنى"
                     disabled={isLoading}
                   />
                 </div>
               </div>

               {/* Full Address */}
               <div className="space-y-2">
                 <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                   <FileText className="w-4 h-4 text-primary" />
                   العنوان الكامل
                 </label>
                 <textarea
                   {...register("address.fullAddress")}
                   rows={3}
                   className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-background hover:bg-card resize-none"
                   placeholder="أدخل العنوان الكامل (اختياري)"
                   disabled={isLoading}
                 />
               </div>
             </div>

            {/* Submit Button */}
             <div className="flex gap-4 pt-6 border-t border-border">
               <button
                 type="button"
                 onClick={() => navigate(-1)}
                 className="flex-1 px-6 py-3 border border-border text-foreground rounded-xl hover:bg-muted transition-all duration-200 font-semibold"
                 disabled={isLoading}
               >
                 إلغاء
               </button>
               
               <button
                 type="submit"
                 disabled={isLoading || isSubmitting}
                 className="flex-1 px-6 py-3 btn-gradient rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 style={{background: isLoading || isSubmitting ? 'var(--muted)' : 'var(--gradient-primary)'}}
               >
                 {isLoading ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     جاري الحفظ...
                   </>
                 ) : (
                   <>
                     <Check className="w-5 h-5" />
                     حفظ جهة الاتصال
                   </>
                 )}
               </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateContacts;