import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Building,
  Briefcase,
  Hash,
  Upload,
  File,
  X,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { addUser, CreateUserData } from '../api/user';

// Zod Schema
const addressSchema = z.object({
  country: z.string().min(1, 'الدولة مطلوبة'),
  city: z.string().min(1, 'المدينة مطلوبة'),
  district: z.string().min(1, 'الحي مطلوب'),
  street: z.string().min(1, 'الشارع مطلوب'),
  buildingNumber: z.string().min(1, 'رقم المبنى مطلوب'),
  unitNumber: z.string().optional(),
  apartmentNumber: z.string().optional(),
  postalCode: z.string().min(1, 'الرمز البريدي مطلوب'),
  addressDetails: z.string().optional(),
  isDefault: z.boolean().default(false)
});

const userSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  phoneNumber: z.string().min(9, 'رقم الجوال يجب أن يكون 9 أرقام على الأقل'),
  gender: z.enum(['male', 'female'], { required_error: 'الجنس مطلوب' }),
  entityType: z.enum(['individual', 'company', 'organization'], { required_error: 'نوع الحساب مطلوب' }),
  entityName: z.string().optional(),
  accountRole: z.enum(['owner', 'employee']).optional(),
  jobTitle: z.string().optional(),
  addresses: z.array(addressSchema).min(1, 'عنوان واحد على الأقل مطلوب'),
  commercialRecordNumber: z.string().optional(),
  taxNumber: z.string().optional(),
  nationalAddressNumber: z.string().optional(),
  vatRegistrationStatus: z.enum(['not_registered', 'registered'], { required_error: 'حالة التسجيل في ضريبة القيمة المضافة مطلوبة' }),
  vatRegistrationNumber: z.string().optional(),
  commercialRecordFile: z.instanceof(File).optional(),
  taxFile: z.instanceof(File).optional(),
  nationalAddressFile: z.instanceof(File).optional()
}).refine((data) => {
  if (data.entityType !== 'individual') {
    return data.entityName && data.entityName.length > 0;
  }
  return true;
}, {
  message: 'اسم الشركة/المؤسسة مطلوب',
  path: ['entityName']
}).refine((data) => {
  if (data.accountRole === 'employee') {
    return data.jobTitle && data.jobTitle.length > 0;
  }
  return true;
}, {
  message: 'المسمى الوظيفي مطلوب للموظف',
  path: ['jobTitle']
}).refine((data) => {
  if (data.vatRegistrationStatus === 'registered') {
    return data.vatRegistrationNumber && data.vatRegistrationNumber.length > 0;
  }
  return true;
}, {
  message: 'رقم التسجيل الضريبي مطلوب للجهات المسجلة في ضريبة القيمة المضافة',
  path: ['vatRegistrationNumber']
});

type UserFormData = z.infer<typeof userSchema>;

const saudiCities = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران',
  'تبوك', 'بريدة', 'خميس مشيط', 'حائل', 'الجبيل', 'الطائف', 'ينبع', 'أبها',
  'نجران', 'الباحة', 'عرعر', 'سكاكا', 'جازان'
];

const genderOptions = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' }
];

const entityTypes = [
  { value: 'individual', label: 'فرد', icon: User },
  { value: 'organization', label: 'مؤسسة', icon: Building },
  { value: 'company', label: 'شركة', icon: Briefcase }
];

const accountRoles = [
  { value: 'owner', label: 'مالك' },
  { value: 'employee', label: 'موظف' }
];

const vatRegistrationOptions = [
  { value: 'not_registered', label: 'جهة الاتصال غير مسجلة في ضريبة القيمة المضافة في السعودية' },
  { value: 'registered', label: 'جهة الاتصال مسجلة في ضريبة القيمة المضافة في السعودية' }
];

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    register
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      addresses: [{
        country: 'السعودية',
        city: '',
        district: '',
        street: '',
        buildingNumber: '',
        unitNumber: '',
        apartmentNumber: '',
        postalCode: '',
        addressDetails: '',
        isDefault: true
      }],
      entityType: 'individual',
      gender: 'male',
      vatRegistrationStatus: 'not_registered'
    },
    mode: 'onChange'
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: 'addresses'
  });

  const watchedEntityType = watch('entityType');
  const watchedAccountRole = watch('accountRole');
  const watchedVatRegistrationStatus = watch('vatRegistrationStatus');

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      const userData: CreateUserData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        entityType: data.entityType,
        entityName: data.entityName,
        accountRole: data.accountRole,
        jobTitle: data.jobTitle,
        addresses: data.addresses,
        commercialRecordNumber: data.commercialRecordNumber,
        taxNumber: data.taxNumber,
        nationalAddressNumber: data.nationalAddressNumber,
        vatRegistrationStatus: data.vatRegistrationStatus,
        vatRegistrationNumber: data.vatRegistrationNumber,
        commercialRecordFile: data.commercialRecordFile,
        taxFile: data.taxFile,
        nationalAddressFile: data.nationalAddressFile
      };

      const response = await addUser(userData);
      toast.success('تم إنشاء المستخدم بنجاح! تم إرسال كود التحقق إلى البريد الإلكتروني');
      navigate('/users');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء المستخدم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (fieldName: keyof UserFormData, file: File | null) => {
    setValue(fieldName, file as any);
  };

  const addNewAddress = () => {
    appendAddress({
      country: 'السعودية',
      city: '',
      district: '',
      street: '',
      buildingNumber: '',
      unitNumber: '',
      apartmentNumber: '',
      postalCode: '',
      addressDetails: '',
      isDefault: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/users')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              إنشاء مستخدم جديد
            </h1>
            <p className="text-muted-foreground">أدخل جميع بيانات المستخدم الجديد</p>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      الاسم الكامل *
                    </Label>
                    <Controller
                      name="fullName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="fullName"
                          placeholder="أدخل الاسم الكامل"
                          className={errors.fullName ? 'border-destructive' : ''}
                        />
                      )}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      البريد الإلكتروني *
                    </Label>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="example@domain.com"
                          className={errors.email ? 'border-destructive' : ''}
                        />
                      )}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      كلمة المرور *
                    </Label>
                    <div className="relative">
                      <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="أدخل كلمة المرور"
                            className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      رقم الجوال *
                    </Label>
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="phoneNumber"
                          placeholder="05xxxxxxxx"
                          className={errors.phoneNumber ? 'border-destructive' : ''}
                        />
                      )}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      الجنس *
                    </Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                            <SelectValue placeholder="اختر الجنس" />
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gender && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Entity Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    معلومات الكيان
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      نوع الحساب *
                    </Label>
                    <Controller
                      name="entityType"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 gap-3">
                          {entityTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <div
                                key={type.value}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                  field.value === type.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => field.onChange(type.value)}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="w-5 h-5" />
                                  <span className="font-medium">{type.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    />
                    {errors.entityType && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.entityType.message}
                      </p>
                    )}
                  </div>

                  {watchedEntityType !== 'individual' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="entityName">
                          اسم {watchedEntityType === 'company' ? 'الشركة' : 'المؤسسة'} *
                        </Label>
                        <Controller
                          name="entityName"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="entityName"
                              placeholder={`أدخل اسم ${watchedEntityType === 'company' ? 'الشركة' : 'المؤسسة'}`}
                              className={errors.entityName ? 'border-destructive' : ''}
                            />
                          )}
                        />
                        {errors.entityName && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.entityName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>دور الحساب</Label>
                        <Controller
                          name="accountRole"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر دور الحساب" />
                              </SelectTrigger>
                              <SelectContent>
                                {accountRoles.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      {watchedAccountRole === 'employee' && (
                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">
                            المسمى الوظيفي *
                          </Label>
                          <Controller
                            name="jobTitle"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="jobTitle"
                                placeholder="أدخل المسمى الوظيفي"
                                className={errors.jobTitle ? 'border-destructive' : ''}
                              />
                            )}
                          />
                          {errors.jobTitle && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.jobTitle.message}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="commercialRecordNumber">
                            رقم السجل التجاري
                          </Label>
                          <Controller
                            name="commercialRecordNumber"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="commercialRecordNumber"
                                placeholder="أدخل رقم السجل التجاري"
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="taxNumber">
                            الرقم الضريبي
                          </Label>
                          <Controller
                            name="taxNumber"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="taxNumber"
                                placeholder="أدخل الرقم الضريبي"
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nationalAddressNumber">
                            رقم العنوان الوطني
                          </Label>
                          <Controller
                            name="nationalAddressNumber"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="nationalAddressNumber"
                                placeholder="أدخل رقم العنوان الوطني"
                              />
                            )}
                          />
                        </div>

                        {/* VAT Registration Section */}
                        <div className="space-y-4 border-t pt-4">
                          <div className="space-y-3">
                            <Label className="text-base font-semibold">
                              التسجيل في ضريبة القيمة المضافة *
                            </Label>
                            <Controller
                              name="vatRegistrationStatus"
                              control={control}
                              render={({ field }) => (
                                <div className="space-y-3">
                                  {vatRegistrationOptions.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                                      <input
                                        type="radio"
                                        id={option.value}
                                        value={option.value}
                                        checked={field.value === option.value}
                                        onChange={() => field.onChange(option.value)}
                                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-2"
                                      />
                                      <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
                                        {option.label}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            />
                            {errors.vatRegistrationStatus && (
                              <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.vatRegistrationStatus.message}
                              </p>
                            )}
                          </div>

                          {watchedVatRegistrationStatus === 'registered' && (
                            <div className="space-y-2">
                              <Label htmlFor="vatRegistrationNumber">
                                رقم التسجيل الضريبي *
                              </Label>
                              <Controller
                                name="vatRegistrationNumber"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    id="vatRegistrationNumber"
                                    placeholder="أدخل رقم التسجيل الضريبي"
                                    className={errors.vatRegistrationNumber ? 'border-destructive' : ''}
                                  />
                                )}
                              />
                              {errors.vatRegistrationNumber && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.vatRegistrationNumber.message}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Addresses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    العناوين
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewAddress}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة عنوان
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {addressFields.map((field, index) => (
                  <div key={field.id} className="p-6 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">العنوان {index + 1}</h3>
                      {addressFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAddress(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>الدولة *</Label>
                        <Controller
                          name={`addresses.${index}.country`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="الدولة"
                              className={errors.addresses?.[index]?.country ? 'border-destructive' : ''}
                            />
                          )}
                        />
                        {errors.addresses?.[index]?.country && (
                          <p className="text-sm text-destructive">
                            {errors.addresses[index]?.country?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>المدينة *</Label>
                        <Controller
                          name={`addresses.${index}.city`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={errors.addresses?.[index]?.city ? 'border-destructive' : ''}>
                                <SelectValue placeholder="اختر المدينة" />
                              </SelectTrigger>
                              <SelectContent>
                                {saudiCities.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.addresses?.[index]?.city && (
                          <p className="text-sm text-destructive">
                            {errors.addresses[index]?.city?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>الحي *</Label>
                        <Controller
                          name={`addresses.${index}.district`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="الحي"
                              className={errors.addresses?.[index]?.district ? 'border-destructive' : ''}
                            />
                          )}
                        />
                        {errors.addresses?.[index]?.district && (
                          <p className="text-sm text-destructive">
                            {errors.addresses[index]?.district?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>الشارع *</Label>
                        <Controller
                          name={`addresses.${index}.street`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="الشارع"
                              className={errors.addresses?.[index]?.street ? 'border-destructive' : ''}
                            />
                          )}
                        />
                        {errors.addresses?.[index]?.street && (
                          <p className="text-sm text-destructive">
                            {errors.addresses[index]?.street?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>رقم المبنى *</Label>
                        <Controller
                          name={`addresses.${index}.buildingNumber`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="رقم المبنى"
                              className={errors.addresses?.[index]?.buildingNumber ? 'border-destructive' : ''}
                            />
                          )}
                        />
                        {errors.addresses?.[index]?.buildingNumber && (
                          <p className="text-sm text-destructive">
                            {errors.addresses[index]?.buildingNumber?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>الرمز البريدي *</Label>
                        <Controller
                          name={`addresses.${index}.postalCode`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="الرمز البريدي"
                              className={errors.addresses?.[index]?.postalCode ? 'border-destructive' : ''}
                            />
                          )}
                        />
                        {errors.addresses?.[index]?.postalCode && (
                          <p className="text-sm text-destructive">
                            {errors.addresses[index]?.postalCode?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>رقم الوحدة</Label>
                        <Controller
                          name={`addresses.${index}.unitNumber`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="رقم الوحدة (اختياري)"
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>رقم الشقة</Label>
                        <Controller
                          name={`addresses.${index}.apartmentNumber`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="رقم الشقة (اختياري)"
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>تفاصيل العنوان</Label>
                      <Controller
                        name={`addresses.${index}.addressDetails`}
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="تفاصيل إضافية عن العنوان (اختياري)"
                            rows={3}
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Controller
                        name={`addresses.${index}.isDefault`}
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label>العنوان الافتراضي</Label>
                    </div>
                  </div>
                ))}
                {errors.addresses && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.addresses.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* File Uploads Section */}
          {watchedEntityType !== 'individual' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    المرفقات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="commercialRecordFile">
                        ملف السجل التجاري
                      </Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="commercialRecordFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('commercialRecordFile', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="commercialRecordFile" className="cursor-pointer">
                          <File className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">اضغط لرفع الملف</p>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxFile">
                        ملف الشهادة الضريبية
                      </Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="taxFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('taxFile', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="taxFile" className="cursor-pointer">
                          <File className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">اضغط لرفع الملف</p>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nationalAddressFile">
                        ملف العنوان الوطني
                      </Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="nationalAddressFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('nationalAddressFile', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="nationalAddressFile" className="cursor-pointer">
                          <File className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">اضغط لرفع الملف</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex justify-center"
          >
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="px-12 py-3 text-lg font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  إنشاء المستخدم
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;