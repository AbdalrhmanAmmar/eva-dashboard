// @ts-nocheck



import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../../components/ui/input"; 
import { Switch } from "../../components/ui/switch"; 
import { Loader, X, Upload, Image as ImageIcon, Plus, Star, Trash2, AlertCircle, Check, ChevronDown, Package, Truck, ShieldOff, Tag, Box, Gauge, Minus, Maximize } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "../../components/ui/Button";
import { productAPI } from "../../api/prodcuts";
import { getAllWarehouses } from "../../api/warehouseAPI";
import { Label } from "../../components/ui/label";

const { createProduct, getAllProducts, updateProduct, deleteProduct } = productAPI;

// Schema validation
const productSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  sku: z.string().min(1, "رمز المنتج مطلوب"),
  barcode: z.string().optional(),
  weight: z.number().min(0, "الوزن يجب أن يكون موجب").optional(),
  priceBeforeDiscount: z.number().min(0, "السعر يجب أن يكون موجب"),
  discountAmount: z.number().min(0).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  showDiscount: z.boolean(),
  quantity: z.number().min(0, "الكمية يجب أن تكون موجبة"),
  category: z.string().min(1, "التصنيف مطلوب"),
  warehouse: z.string().min(1, "المخزن مطلوب"),
  tag: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  showQuantity: z.boolean(),
  showRatings: z.boolean(),
  showTag: z.boolean(),
  isActive: z.boolean(),
  similarProducts: z.array(z.string()).optional(),
  requiresShipping: z.boolean(),
  taxExempt: z.boolean(),
  costPrice: z.number().min(0).optional(),
  minOrder: z.number().min(1).optional(),
  maxOrder: z.number().min(1).optional(),
  keywords: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ImagePreview = {
  url: string;
  isMain: boolean;
  file?: File;
  id: string;
};

// مكون رفع الصور مع سحب وإفلات
const ImageUploader = ({ 
  previews, 
  setPreviews, 
  mainImageName, 
  setMainImageName 
}: {
  previews: ImagePreview[];
  setPreviews: (previews: ImagePreview[]) => void;
  mainImageName: string;
  setMainImageName: (name: string) => void;
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const newPreviews = acceptedFiles.slice(0, 5 - previews.length).map(file => ({
        url: URL.createObjectURL(file),
        isMain: false,
        file,
        id: Math.random().toString(36).substring(2, 9),
      }));
      
      if (previews.length === 0 && newPreviews.length > 0) {
        newPreviews[0].isMain = true;
        setMainImageName(newPreviews[0].file?.name || "");
      }
      
      setPreviews([...previews, ...newPreviews]);
    }
  }, [previews, setPreviews, setMainImageName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
  });

  const removeImage = (id: string) => {
    const newPreviews = previews.filter(p => p.id !== id);
    const removedPreview = previews.find(p => p.id === id);
    
    if (removedPreview?.isMain && newPreviews.length > 0) {
      newPreviews[0].isMain = true;
      setMainImageName(newPreviews[0].file?.name || newPreviews[0].url.split('/').pop() || "");
    }
    
    setPreviews(newPreviews);
  };

  const setAsMainImage = (id: string) => {
    const newPreviews = previews.map(preview => ({
      ...preview,
      isMain: preview.id === id
    }));
    
    setPreviews(newPreviews);
    const mainPreview = newPreviews.find(p => p.isMain);
    setMainImageName(
      mainPreview?.file?.name || 
      mainPreview?.url.split('/').pop() || 
      ""
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(previews);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setPreviews(items);
  };

  return (
    <div>
      <Label htmlFor="images">صور المنتج (الحد الأقصى 5 صور)</Label>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-background/50"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary">قم بإسقاط الصور هنا...</p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-primary" />
            <p className="text-foreground">اسحب وأسقط الصور هنا، أو انقر للاختيار</p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG, WEBP (الحد الأقصى 5MB لكل صورة)
            </p>
          </div>
        )}
      </div>

      {/* Image Previews with Drag and Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="images" direction="horizontal">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
            >
              {previews.map((preview, index) => (
                <Draggable key={preview.id} draggableId={preview.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="relative group h-24 rounded-md overflow-hidden border border-border/20"
                    >
                      <img
                        src={preview.url}
                        alt={`Preview ${index}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsMainImage(preview.id);
                        }}
                        className={`absolute top-1 left-1 p-1 rounded-full ${
                          preview.isMain 
                            ? 'bg-yellow-400 text-yellow-900' 
                            : 'bg-white/80 text-gray-600 hover:bg-yellow-100'
                        }`}
                        title={preview.isMain ? "الصورة الرئيسية" : "تحديد كصورة رئيسية"}
                      >
                        <Star className="h-3 w-3" fill={preview.isMain ? "currentColor" : "none"} />
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(preview.id);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف الصورة"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {preview.isMain && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-xs text-center py-0.5">
                          رئيسية
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

// مكون مفاتيح التبديل
const ProductToggles = ({ control }: { control: any }) => {
  const toggles = [
    {
      name: "showDiscount",
      label: "إظهار الخصم",
      icon: <Tag className="h-4 w-4" />,
      description: "إظهار نسبة الخصم على صفحة المنتج"
    },
    {
      name: "showQuantity",
      label: "إظهار الكمية",
      icon: <Box className="h-4 w-4" />,
      description: "إظهار الكمية المتبقية من المنتج"
    },
    {
      name: "showRatings",
      label: "إظهار التقييمات",
      icon: <Star className="h-4 w-4" />,
      description: "إظهار تقييمات العملاء للمنتج"
    },
    {
      name: "showTag",
      label: "إظهار العلامة",
      icon: <Tag className="h-4 w-4" />,
      description: "إظهار العلامة المميزة على المنتج"
    },
  ];

  return (
  <div className="space-y-3">
      <h3 className="font-medium text-foreground">إعدادات المنتج</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {toggles.map((toggle) => (
          <div key={toggle.name} className="flex items-center gap-4 p-3 bg-background/50 rounded-md border border-border/20">
            <div className="flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary">
              {toggle.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Controller
                  name={toggle.name}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className={`${field.value ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'} shadow-md`}
                    />
                  )}
                />
                <label htmlFor={toggle.name}>{toggle.label}</label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{toggle.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// المكون الرئيسي
export default function AddProductClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [mainImageName, setMainImageName] = useState("");
  const [showSimilarProducts, setShowSimilarProducts] = useState(false);
  const [similarProductsSearch, setSimilarProductsSearch] = useState("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      weight: 0,
      priceBeforeDiscount: 0,
      discountAmount: 0,
      discountPercentage: 0,
      showDiscount: false,
      quantity: 0,
      category: "",
      warehouse: "",
      tag: "",
      description: "",
      shortDescription: "",
      showQuantity: false,
      showRatings: false,
      showTag: false,
      isActive: true,
      similarProducts: [],
      requiresShipping: true,
      taxExempt: false,
      costPrice: 0,
      minOrder: 1,
      maxOrder: 100,
      keywords: "",
    },
  });

  const { watch, setValue, control, handleSubmit, reset, formState, register } = form;
  const priceBeforeDiscount = watch("priceBeforeDiscount");
  const discountAmount = watch("discountAmount");
  const discountPercentage = watch("discountPercentage");
  const similarProducts = watch("similarProducts") || [];

  // Fetch products and warehouses
const fetchData = async () => {
  console.log('1. fetchData started');
  setIsLoading(true);
  
  try {
    console.log('2. Making API calls...');
    
    const [productsResponse, warehousesResponse] = await Promise.all([
      getAllProducts(),
      getAllWarehouses()
    ]);

    console.log('3. Products response:', productsResponse);
    console.log('4. Warehouses response:', warehousesResponse);

    // معالجة المنتجات
    if (productsResponse && (productsResponse.success || Array.isArray(productsResponse))) {
      const productsData = productsResponse.products || productsResponse;
      console.log('5. Products data:', productsData);
      setProducts(productsData);
      const uniqueCategories = [...new Set(productsData.map(p => p.category))];
      setCategories(uniqueCategories);
    }

    // معالجة المخازن - جميع الاحتمالات
    let warehousesData = [];
    
    if (warehousesResponse && warehousesResponse.success) {
      warehousesData = warehousesResponse.warehouses || [];
      console.log('6. Warehouses from success path:', warehousesData);
    } 
    else if (warehousesResponse && warehousesResponse.data) {
      warehousesData = warehousesResponse.data.warehouses || warehousesResponse.data || [];
      console.log('7. Warehouses from data path:', warehousesData);
    } 
    else if (Array.isArray(warehousesResponse)) {
      warehousesData = warehousesResponse;
      console.log('8. Warehouses from array path:', warehousesData);
    } 
    else if (warehousesResponse && typeof warehousesResponse === 'object') {
      // بحث عن أي مصفوفة في الرد
      for (const key in warehousesResponse) {
        if (Array.isArray(warehousesResponse[key])) {
          warehousesData = warehousesResponse[key];
          console.log('9. Warehouses from object key:', key, warehousesData);
          break;
        }
      }
    }
    else {
      console.log('10. No warehouses data found in response');
    }

    console.log('11. Final warehouses data:', warehousesData);
    setWarehouses(warehousesData);

  } catch (error) {
    console.error('12. Error in fetchData:', error);
    toast.error("حدث خطأ أثناء جلب البيانات");
  } finally {
    console.log('13. fetchData completed');
    setIsLoading(false);
  }
};
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate discount automatically
  useEffect(() => {
    if (priceBeforeDiscount && discountPercentage) {
      const calculatedAmount = parseFloat(
        (priceBeforeDiscount * discountPercentage / 100).toFixed(2)
      );
      setValue("discountAmount", calculatedAmount, { shouldValidate: true });
    }
  }, [priceBeforeDiscount, discountPercentage, setValue]);

  useEffect(() => {
    if (priceBeforeDiscount && discountAmount) {
      const calculatedPercentage = parseFloat(
        (discountAmount / priceBeforeDiscount * 100).toFixed(2)
      );
      setValue("discountPercentage", calculatedPercentage, { shouldValidate: true });
    }
  }, [priceBeforeDiscount, discountAmount, setValue]);

  // Reset form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      reset({
        name: editingProduct?.name || "",
        sku: editingProduct?.sku || "",
        barcode: editingProduct?.barcode || "",
        weight: editingProduct?.weight || 0,
        priceBeforeDiscount: editingProduct?.priceBeforeDiscount || 0,
        discountAmount: editingProduct?.discountAmount || 0,
        discountPercentage: editingProduct?.discountPercentage || 0,
        showDiscount: editingProduct?.showDiscount || false,
        quantity: editingProduct?.quantity || 0,
        category: editingProduct?.category || "",
        warehouse: editingProduct?.warehouse || "",
        tag: editingProduct?.tag || "",
        description: editingProduct?.description || "",
        shortDescription: editingProduct?.shortDescription || "",
        showQuantity: editingProduct?.showQuantity || false,
        showRatings: editingProduct?.showRatings || false,
        showTag: editingProduct?.showTag || false,
        isActive: editingProduct?.isActive ?? true,
        similarProducts: editingProduct?.similarProducts || [],
        requiresShipping: editingProduct?.requiresShipping ?? true,
        taxExempt: editingProduct?.taxExempt ?? false,
        costPrice: editingProduct?.costPrice || 0,
        minOrder: editingProduct?.minOrder || 1,
        maxOrder: editingProduct?.maxOrder || 100,
        keywords: editingProduct?.keywords || "",
      });
      
      if (editingProduct?.images) {
        const initialPreviews = editingProduct.images.map((img: any) => ({
          url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${img.url}`,
          isMain: img.isMain,
          id: img._id || Math.random().toString(36).substring(2, 9),
        }));
        setPreviews(initialPreviews);
        
        const mainImg = editingProduct.images.find((img: any) => img.isMain);
        setMainImageName(mainImg?.url || "");
      } else {
        setPreviews([]);
        setMainImageName("");
      }
    }
  }, [editingProduct, reset]);

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    reset({
      name: "",
      sku: "",
      barcode: "",
      weight: 0,
      priceBeforeDiscount: 0,
      discountAmount: 0,
      discountPercentage: 0,
      showDiscount: false,
      quantity: 0,
      category: "",
      warehouse: "",
      tag: "",
      description: "",
      shortDescription: "",
      showQuantity: false,
      showRatings: false,
      showTag: false,
      isActive: true,
      similarProducts: [],
      requiresShipping: true,
      taxExempt: false,
      costPrice: 0,
      minOrder: 1,
      maxOrder: 100,
      keywords: "",
    });
    setPreviews([]);
    setMainImageName("");
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setValue("category", newCategory.trim());
      setNewCategory("");
      toast.success("تمت إضافة الفئة بنجاح");
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("sku", values.sku);
      formData.append("barcode", values.barcode || "");
      formData.append("weight", values.weight?.toString() || "0");
      formData.append("priceBeforeDiscount", values.priceBeforeDiscount.toString());
      formData.append("priceAfterDiscount", (values.priceBeforeDiscount - (values.discountAmount || 0)).toString());
      formData.append("discountAmount", values.discountAmount?.toString() || "0");
      formData.append("discountPercentage", values.discountPercentage?.toString() || "0");
      formData.append("showDiscount", values.showDiscount.toString());
      formData.append("quantity", values.quantity.toString());
      formData.append("category", values.category);
      formData.append("warehouse", values.warehouse);
      formData.append("tag", values.tag || "");
      formData.append("description", values.description || "");
      formData.append("shortDescription", values.shortDescription || "");
      formData.append("showQuantity", values.showQuantity.toString());
      formData.append("showRatings", values.showRatings.toString());
      formData.append("showTag", values.showTag.toString());
      formData.append("isActive", values.isActive.toString());
      formData.append("requiresShipping", values.requiresShipping.toString());
      formData.append("taxExempt", values.taxExempt.toString());
      formData.append("costPrice", values.costPrice?.toString() || "0");
      formData.append("minOrder", values.minOrder?.toString() || "1");
      formData.append("maxOrder", values.maxOrder?.toString() || "100");
      formData.append("keywords", values.keywords || "");
      
      // Add similar products
      values.similarProducts?.forEach(productId => {
        formData.append("similarProducts", productId);
      });
      
      // Add new images
      previews.forEach((preview) => {
        if (preview.file) {
          formData.append("images", preview.file);
        }
      });
      
      // Add existing images
      if (editingProduct?.images) {
        editingProduct.images.forEach((image: any) => {
          formData.append("existingImages", image.url);
        });
      }
      
      // Add main image
      if (mainImageName) {
        formData.append("mainImageName", mainImageName);
      }

      let response;
      if (editingProduct && editingProduct._id) {
        response = await updateProduct(editingProduct._id, formData);
      } else {
        response = await createProduct(formData);
      }

      if (response.success) {
        toast.success(editingProduct ? "تم تحديث المنتج بنجاح" : "تم إضافة المنتج بنجاح");
        fetchData();
        if (!editingProduct) {
          handleNewProduct();
        }
      } else {
        toast.error(response.message || "حدث خطأ أثناء حفظ المنتج");
      }
    } catch (error: any) {
      console.log(error)
      toast.error(error.message || "حدث خطأ أثناء حفظ المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!productId) {
      toast.error("معرف المنتج غير صالح");
      return;
    }

    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    
    try {
      const response = await deleteProduct(productId);
      if (response.success) {
        toast.success("تم حذف المنتج بنجاح");
        setProducts(products.filter(product => product._id !== productId));
        if (editingProduct?._id === productId) {
          handleNewProduct();
        }
      } else {
        toast.error(response.message || "حدث خطأ أثناء حذف المنتج");
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حذف المنتج");
    }
  };

  const getMainImage = (product: any) => {
    if (!product.images || product.images.length === 0) return null;
    const mainImg = product.images.find((img: any) => img.isMain);
    return mainImg || product.images[0];
  };

  const toggleSimilarProduct = (productId: string) => {
    const currentSimilar = similarProducts || [];
    if (currentSimilar.includes(productId)) {
      setValue("similarProducts", currentSimilar.filter(id => id !== productId));
    } else {
      setValue("similarProducts", [...currentSimilar, productId]);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(similarProductsSearch.toLowerCase()) &&
    (!editingProduct || product._id !== editingProduct?._id)
  );

  return (
    <div className="p-6 bg-transparent min-h-screen my-6">
      <div className="flex flex-col lg:flex-row gap-6 rtl">
        {/* Right Side - Product Form */}
        <div className="lg:w-2/3 bg-card rounded-lg shadow overflow-hidden border border-border/20">
          <div className="p-4 border-b border-border/20 flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground">
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h2>
            <Button 
              onClick={handleNewProduct}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              منتج جديد
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Image Upload Section */}
            <ImageUploader 
              previews={previews}
              setPreviews={setPreviews}
              mainImageName={mainImageName}
              setMainImageName={setMainImageName}
            />

            {/* Product Name */}
            <div>
              <label htmlFor="name">اسم المنتج *</label>
              <Input
                id="name"
                {...register("name")}
                placeholder="أدخل اسم المنتج"
                className={`mt-1 bg-background/50 ${formState.errors.name ? "border-red-500" : "border-border/20"}`}
              />
              {formState.errors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formState.errors.name.message}
                </p>
              )}
            </div>

            {/* SKU, Barcode, Weight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="sku">رمز المنتج (SKU) *</label>
                <Input
                  id="sku"
                  {...register("sku")}
                  placeholder="أدخل رمز المنتج"
                  className={`mt-1 bg-background/50 ${formState.errors.sku ? "border-red-500" : "border-border/20"}`}
                />
                {formState.errors.sku && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formState.errors.sku.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="barcode">رمز الباركود</label>
                <Input
                  id="barcode"
                  {...register("barcode")}
                  placeholder="أدخل رمز الباركود"
                  className="mt-1 bg-background/50 border-border/20"
                />
              </div>

              <div>
                <label htmlFor="weight">الوزن (كجم)</label>
                <Input
                  id="weight"
                  type="number"
                  {...register("weight", {
                    valueAsNumber: true,
                  })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="mt-1 bg-background/50 border-border/20"
                />
              </div>
            </div>

            {/* Price and Discount Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="priceBeforeDiscount">قيمة المنتج*</label>
                <Input
                  id="priceBeforeDiscount"
                  type="number"
                  {...register("priceBeforeDiscount", {
                    valueAsNumber: true,
                  })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`mt-1 bg-background/50 ${formState.errors.priceBeforeDiscount ? "border-red-500" : "border-border/20"}`}
                />
                {formState.errors.priceBeforeDiscount && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formState.errors.priceBeforeDiscount.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="discountAmount">قيمة الخصم</label>
                <Input
                  id="discountAmount"
                  type="number"
                  {...register("discountAmount", {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setValue("discountAmount", value);
                    }
                  })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="mt-1 bg-background/50 border-border/20"
                />
              </div>

              <div>
                <label htmlFor="discountPercentage">نسبة الخصم %</label>
                <Input
                  id="discountPercentage"
                  type="number"
                  {...register("discountPercentage", {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setValue("discountPercentage", value);
                    }
                  })}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="mt-1 bg-background/50 border-border/20"
                />
              </div>
            </div>

            {/* Warehouse Selection */}
            <div>
              <label htmlFor="warehouse">المخزن *</label>
              <select
                id="warehouse"
                {...register("warehouse")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/50 text-foreground mt-1 ${
                  formState.errors.warehouse ? "border-red-500" : "border-border/20 focus:border-primary/50"
                }`}
              >
                <option value="">اختر مخزن</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
              {formState.errors.warehouse && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formState.errors.warehouse.message}
                </p>
              )}
            </div>

            {/* Final Price Display */}
            <div className="bg-background/50 p-4 rounded-md border border-border/20">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">السعر الأصلي:</span>
                  <span className="text-muted-foreground">
                    {priceBeforeDiscount?.toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">السعر بعد الخصم:</span>
                  <span className="text-lg font-bold text-primary">
                    {(priceBeforeDiscount - (discountAmount || 0)).toFixed(2)} ر.س
                  </span>
                </div>
                {watch("showDiscount") && discountAmount && discountAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">قيمة الخصم:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">
                        {discountAmount?.toFixed(2)} ر.س
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        {discountPercentage?.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category">التصنيف *</label>
                <div className="flex gap-2 mt-1">
                  <select
                    id="category"
                    {...register("category")}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/50 text-foreground ${
                      formState.errors.category ? "border-red-500" : "border-border/20 focus:border-primary/50"
                    }`}
                  >
                    <option value="">اختر تصنيف</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {formState.errors.category && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formState.errors.category.message}
                  </p>
                )}
              </div>

           {/* Quantity and Order Limits */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
    <label htmlFor="quantity">الكمية *</label>
    <Input
      id="quantity"
      type="number"
      {...register("quantity", {
        valueAsNumber: true,
      })}
      placeholder="0"
      min="0"
      className={`mt-1 bg-background/50 ${formState.errors.quantity ? "border-red-500" : "border-border/20"}`}
    />
    {formState.errors.quantity && (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {formState.errors.quantity.message}
      </p>
    )}
  </div>

  <div>
    <label htmlFor="minOrder">الحد الأدنى للطلب</label>
    <Input
      id="minOrder"
      type="number"
      {...register("minOrder", {
        valueAsNumber: true,
      })}
      placeholder="1"
      min="1"
      className="mt-1 bg-background/50 border-border/20"
    />
    {formState.errors.minOrder && (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {formState.errors.minOrder.message}
      </p>
    )}
  </div>

  <div>
    <label htmlFor="maxOrder">الحد الأقصى للطلب</label>
    <Input
      id="maxOrder"
      type="number"
      {...register("maxOrder", {
        valueAsNumber: true,
      })}
      placeholder="100"
      min="1"
      className="mt-1 bg-background/50 border-border/20"
    />
    {formState.errors.maxOrder && (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {formState.errors.maxOrder.message}
      </p>
    )}
  </div>
</div>
            </div>

            {/* Add New Category */}
            <div className="bg-background/50 p-3 rounded-md border border-border/20">
              <label className="text-sm font-medium text-foreground mb-1">إضافة تصنيف جديد</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="أدخل اسم تصنيف جديد"
                  className="flex-1 bg-background/50 border-border/20"
                />
                <Button
                  type="button"
                  onClick={addCategory}
                  className="whitespace-nowrap bg-green-600 hover:bg-green-600/90"
                >
                  إضافة تصنيف
                </Button>
              </div>
            </div>

            {/* Tag Input */}
            <div>
              <label htmlFor="tag">العلامة (Tag)</label>
              <Input
                id="tag"
                {...register("tag")}
                placeholder="أدخل علامة للمنتج (اختياري)"
                className="mt-1 bg-background/50 border-border/20"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description">الوصف الكامل</label>
              <textarea
                id="description"
                {...register("description")}
                placeholder="أدخل وصفاً كاملاً للمنتج"
                rows={5}
                className="w-full px-3 py-2 border border-border/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 bg-background/50 text-foreground mt-1"
              />
            </div>

            {/* Short Description */}
            <div>
              <label htmlFor="shortDescription">وصف مختصر</label>
              <textarea
                id="shortDescription"
                {...register("shortDescription")}
                placeholder="أدخل وصفاً مختصراً للمنتج"
                rows={3}
                className="w-full px-3 py-2 border border-border/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 bg-background/50 text-foreground mt-1"
              />
            </div>

            {/* Product Toggles */}
            <ProductToggles control={control} />

            {/* Similar Products Section */}
            <div className="space-y-3">
              <div 
                className="flex items-center justify-between p-3 bg-background/50 rounded-md border border-border/20 cursor-pointer"
                onClick={() => setShowSimilarProducts(!showSimilarProducts)}
              >
                <div className="flex items-center gap-4">
                  <label htmlFor="similarProducts">المنتجات المشابهة</label>
                  {similarProducts.length > 0 && (
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                      {similarProducts.length} منتج
                    </span>
                  )}
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${showSimilarProducts ? 'rotate-180' : ''}`} />
              </div>

              {showSimilarProducts && (
                <div className="bg-background/50 p-4 rounded-md border border-border/20 space-y-3">
                  <Input
                    placeholder="ابحث عن منتجات..."
                    value={similarProductsSearch}
                    onChange={(e) => setSimilarProductsSearch(e.target.value)}
                    className="bg-background border-border/20"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <div 
                          key={product._id} 
                          className="flex items-center gap-3 p-2 hover:bg-background/30 rounded cursor-pointer"
                          onClick={() => toggleSimilarProduct(product._id)}
                        >
                          <div className="h-10 w-10 rounded-md overflow-hidden relative flex-shrink-0">
                            {getMainImage(product) ? (
                              <Image
                                width={40}
                                height={40}
                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${getMainImage(product).url}`}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-background/50 flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {product.priceBeforeDiscount?.toFixed(2)} ر.س
                            </p>
                          </div>
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            similarProducts.includes(product._id) 
                              ? 'bg-primary border-primary text-white' 
                              : 'border-border/30 text-transparent'
                          }`}>
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        لا توجد منتجات متاحة
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-border/20">
              <Button
                type="button"
                onClick={handleNewProduct}
                disabled={isSubmitting}
                variant="outline"
                className="border-border/20 hover:bg-background/50"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || previews.length === 0}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 inline mr-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  editingProduct ? "تحديث المنتج" : "حفظ المنتج"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Left Side - Product Settings */}
        <div className="lg:w-1/3 bg-card rounded-lg shadow overflow-hidden border border-border/20 h-fit sticky top-6">
          <div className="p-4 border-b border-border/20">
            <h2 className="text-lg font-bold text-foreground">إعدادات المنتج</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* حالة المنتج */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background/50 to-background rounded-lg border border-border/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">حالة المنتج</h3>
                  <p className="text-sm text-muted-foreground">
                    {watch('isActive') ? 'المنتج ظاهر للعملاء' : 'المنتج مخفي'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={watch('isActive')} 
                onChange={(checked) => setValue('isActive', checked)}
              />
            </div>

            {/* يتطلب شحن */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background/50 to-background rounded-lg border border-border/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">يتطلب شحن</h3>
                  <p className="text-sm text-muted-foreground">
                    {watch('requiresShipping') ? 'يحتاج إلى شحن' : 'لا يتطلب شحن'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={watch('requiresShipping')} 
                onChange={(checked) => setValue('requiresShipping', checked)}
              />
            </div>

            {/* معفي من الضريبة */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-background/50 to-background rounded-lg border border-border/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <ShieldOff className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">معفي من الضريبة</h3>
                  <p className="text-sm text-muted-foreground">
                    {watch('taxExempt') ? 'معفي من الضريبة' : 'خاضع للضريبة'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={watch('taxExempt')} 
                onChange={(checked) => setValue('taxExempt', checked)}
              />
            </div>

            {/* جدولة الخصم */}
            <div className="p-4 bg-gradient-to-r from-background/50 to-background rounded-lg border border-border/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Tag className="h-5 w-5 text-yellow-500" />
                  جدولة الخصم
                </h3>
                <Switch 
                  checked={watch('showDiscount')} 
                  onChange={(checked) => setValue('showDiscount', checked)}
                />
              </div>

              {watch('showDiscount') && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      تاريخ البداية
                    </label>
                    <Input
                      type="datetime-local"
                      className="bg-background border-border/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      تاريخ النهاية
                    </label>
                    <Input
                      type="datetime-local"
                      className="bg-background border-border/20"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-border/20">
                      إضافة خصم
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600">
                      حفظ الجدولة
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* المنتجات المشابهة */}
            <div className="p-4 bg-gradient-to-r from-background/50 to-background rounded-lg border border-border/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">المنتجات المشابهة</h3>
                    <p className="text-sm text-muted-foreground">
                      {showSimilarProducts ? 'وضع التعديل مفعل' : 'انقر لتفعيل وضع التعديل'}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={showSimilarProducts} 
                  onChange={(checked) => {
                    setShowSimilarProducts(checked);
                  }}
                />
              </div>

              {similarProducts.length > 0 ? (
                <div className="space-y-3">
                  {similarProducts.map(productId => {
                    const product = products.find(p => p._id === productId);
                    if (!product) return null;
                    
                    return (
                      <div 
                        key={productId} 
                        className={`group flex items-center gap-3 p-2 rounded cursor-pointer transition-all ${
                          showSimilarProducts 
                            ? 'hover:bg-background/30 active:scale-[0.98]' 
                            : 'opacity-90 hover:opacity-100'
                        }`}
                      >
                        <div className="h-12 w-12 rounded-md overflow-hidden relative flex-shrink-0 border border-border/20">
                          {getMainImage(product) ? (
                            <Image
                              width={48}
                              height={48}
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${getMainImage(product).url}`}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-background/50 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {product.priceBeforeDiscount?.toFixed(2)} ر.س
                            {product.showDiscount && product.discountAmount > 0 && (
                              <span className="text-red-500 mr-2">
                                (خصم {product.discountAmount?.toFixed(2)} ر.س)
                              </span>
                            )}
                          </p>
                        </div>
                        
                        {showSimilarProducts && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSimilarProduct(productId);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    {showSimilarProducts ? 'قم بإضافة منتجات مشابهة' : 'لا توجد منتجات مشابهة'}
                  </p>
                </div>
              )}
            </div>
            {/* Order Limits Summary */}
<div className="flex justify-between items-center">
  <span className="text-sm text-muted-foreground">حدود الطلب:</span>
  <span className="text-sm">
    {watch('minOrder') || 1} - {watch('maxOrder') || 100}
  </span>
</div>

            {/* ملخص السعر */}
            <div className="p-4 bg-gradient-to-r from-background/50 to-background rounded-lg border border-border/20">
              <h3 className="font-medium text-foreground flex items-center gap-2 mb-3">
                <Gauge className="h-5 w-5 text-green-500" />
                ملخص السعر
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">السعر الأصلي:</span>
                  <span className="font-medium">{priceBeforeDiscount?.toFixed(2)} ر.س</span>
                </div>
                
                {watch('showDiscount') && discountAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">قيمة الخصم:</span>
                      <span className="text-red-500">-{discountAmount?.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">نسبة الخصم:</span>
                      <span className="text-red-500">{discountPercentage?.toFixed(0)}%</span>
                    </div>
                  </>
                )}

                <div className="border-t border-border/20 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">السعر النهائي:</span>
                    <span className="text-lg font-bold text-primary">
                      {(priceBeforeDiscount - (discountAmount || 0)).toFixed(2)} ر.س
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}