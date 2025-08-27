import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  RefreshCw, 
  Filter, 
  Download, 
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  BarChart3,
  Archive,
  Plus,
  ChevronDown,
  Settings,
  Upload,
  Image as ImageIcon,
  Star,
  X,
  Loader,
  Tag,
  Box,
  Truck,
  ShieldOff,
  Gauge,
  Trash2
} from 'lucide-react';
import { getAllWarehouses } from '../../api/warehouseAPI';
import { productAPI } from '../../api/prodcuts';

interface Product {
  _id: string;
  name: string;
  description: string;
  priceBeforeDiscount: number;
  priceAfterDiscount: number;
  quantity: number;
  showQuantity: boolean;
  showProduct: boolean;
  showDiscount: boolean;
  images: { url: string; isMain: boolean; order: number; _id: string }[];
  category: string;
  tag: string;
  showTag: boolean;
  shortDescription: string;
  averageRating: number;
  numberOfReviews: number;
  sku: string;
  barcode: string;
  weight: number;
  requiresShipping: boolean;
  isTaxExempt: boolean;
  createdAt: string;
  discounts: any[];
  relatedProducts: string[];
  showRelatedProduct: boolean;
  warehouse: string;
  createdBy: string | null;
  minOrder?: number;
  maxOrder?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  keywords: string;
}

interface ImagePreview {
  url: string;
  isMain: boolean;
  file?: File;
  id: string;
}

const ProductForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [mainImageName, setMainImageName] = useState("");
  const [showSimilarProducts, setShowSimilarProducts] = useState(false);
  const [similarProductsSearch, setSimilarProductsSearch] = useState("");

  const [formData, setFormData] = useState({
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
    similarProducts: [] as string[],
    requiresShipping: true,
    taxExempt: false,
    costPrice: 0,
    minOrder: 1,
    maxOrder: 100,
    keywords: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // محاكاة لجلب البيانات من API
   const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsResponse, warehousesResponse] = await Promise.all([
        productAPI.getAllProducts(),
        getAllWarehouses()
      ]);
      
      if (productsResponse.success) {
        setProducts(productsResponse.products);
        const uniqueCategories = [...new Set(productsResponse.products.map(p => p.category))];
        setCategories(uniqueCategories);
      }
      
      if (warehousesResponse.success) {
        setWarehouses(warehousesResponse.warehouses);
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    console.log(warehouses)
  }, [warehouses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // مسح الخطأ عند التعديل
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = "اسم المنتج مطلوب";
    if (!formData.sku) newErrors.sku = "رمز المنتج مطلوب";
    if (!formData.category) newErrors.category = "التصنيف مطلوب";
    if (!formData.warehouse) newErrors.warehouse = "المخزن مطلوب";
    if (formData.quantity < 0) newErrors.quantity = "الكمية يجب أن تكون موجبة";
    if (formData.priceBeforeDiscount < 0) newErrors.priceBeforeDiscount = "السعر يجب أن يكون موجب";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // محاكاة عملية الحفظ
    setTimeout(() => {
      console.log('Form data:', formData);
      setIsSubmitting(false);
      alert(editingProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
      
      if (!editingProduct) {
        // Reset form after successful submission for new product
        setFormData({
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
      }
    }, 2000);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setFormData({
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
    setErrors({});
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || "",
      weight: product.weight || 0,
      priceBeforeDiscount: product.priceBeforeDiscount,
      discountAmount: product.priceBeforeDiscount - product.priceAfterDiscount,
      discountPercentage: ((product.priceBeforeDiscount - product.priceAfterDiscount) / product.priceBeforeDiscount) * 100,
      showDiscount: product.showDiscount,
      quantity: product.quantity,
      category: product.category,
      warehouse: product.warehouse,
      tag: product.tag || "",
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      showQuantity: product.showQuantity,
      showRatings: true, // Assuming this is always true based on the data
      showTag: product.showTag,
      isActive: product.showProduct,
      similarProducts: product.relatedProducts || [],
      requiresShipping: product.requiresShipping,
      taxExempt: product.isTaxExempt,
      costPrice: 0, // Not in the sample data
      minOrder: product.minOrder || 1,
      maxOrder: product.maxOrder || 100,
      keywords: product.keywords || "",
    });

    if (product.images && product.images.length > 0) {
      const initialPreviews = product.images.map(img => ({
        url: `http://localhost:4000/uploads/${img.url}`,
        isMain: img.isMain,
        id: img._id
      }));
      setPreviews(initialPreviews);
      
      const mainImg = product.images.find(img => img.isMain);
      setMainImageName(mainImg?.url || "");
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      // محاكاة عملية الحذف
      setProducts(prev => prev.filter(p => p._id !== productId));
      if (editingProduct && editingProduct._id === productId) {
        handleNewProduct();
      }
      alert("تم حذف المنتج بنجاح");
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory("");
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
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
  };

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

  const toggleSimilarProduct = (productId: string) => {
    const currentSimilar = formData.similarProducts;
    if (currentSimilar.includes(productId)) {
      setFormData(prev => ({
        ...prev,
        similarProducts: currentSimilar.filter(id => id !== productId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        similarProducts: [...currentSimilar, productId]
      }));
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(similarProductsSearch.toLowerCase()) &&
    (!editingProduct || product._id !== editingProduct._id)
  );

  const getMainImage = (product: Product) => {
    if (!product.images || product.images.length === 0) return null;
    const mainImg = product.images.find(img => img.isMain);
    return mainImg || product.images[0];
  };

  // حساب السعر بعد الخصم تلقائياً
  useEffect(() => {
    if (formData.priceBeforeDiscount && formData.discountPercentage) {
      const calculatedAmount = parseFloat(
        (formData.priceBeforeDiscount * formData.discountPercentage / 100).toFixed(2)
      );
      setFormData(prev => ({ ...prev, discountAmount: calculatedAmount }));
    }
  }, [formData.priceBeforeDiscount, formData.discountPercentage]);

  useEffect(() => {
    if (formData.priceBeforeDiscount && formData.discountAmount) {
      const calculatedPercentage = parseFloat(
        (formData.discountAmount / formData.priceBeforeDiscount * 100).toFixed(2)
      );
      setFormData(prev => ({ ...prev, discountPercentage: calculatedPercentage }));
    }
  }, [formData.priceBeforeDiscount, formData.discountAmount]);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h1>
          <p className="text-gray-600 mt-2">إدارة وعرض جميع المنتجات في المتجر</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          
          <button 
            onClick={handleNewProduct}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            منتج جديد
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Right Side - Product Form */}
        <div className="lg:w-2/3 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h2>
            <button 
              onClick={handleNewProduct}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              منتج جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صور المنتج (الحد الأقصى 5 صور)</label>
              <div
                className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors bg-blue-50"
              >
                <input type="file" multiple className="hidden" />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-blue-500" />
                  <p className="text-gray-700">اسحب وأسقط الصور هنا، أو انقر للاختيار</p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, WEBP (الحد الأقصى 5MB لكل صورة)
                  </p>
                </div>
              </div>

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {previews.map((preview, index) => (
                    <div key={preview.id} className="relative group h-24 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={preview.url}
                        alt={`Preview ${index}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setAsMainImage(preview.id)}
                        className={`absolute top-1 left-1 p-1 rounded-full ${
                          preview.isMain 
                            ? 'bg-yellow-400 text-yellow-900' 
                            : 'bg-white/80 text-gray-600 hover:bg-yellow-100'
                        }`}
                        title={preview.isMain ? "الصورة الرئيسية" : "تحديد كصورة رئيسية"}
                      >
                        <Star className="h-3 w-3" fill={preview.isMain ? "currentColor" : "none"} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(preview.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف الصورة"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {preview.isMain && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center py-0.5">
                          رئيسية
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج *</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم المنتج"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* SKU, Barcode, Weight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">رمز المنتج (SKU) *</label>
                <input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="أدخل رمز المنتج"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                    errors.sku ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.sku}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">رمز الباركود</label>
                <input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="أدخل رمز الباركود"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">الوزن (كجم)</label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>
            </div>

            {/* Price and Discount Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="priceBeforeDiscount" className="block text-sm font-medium text-gray-700 mb-1">قيمة المنتج*</label>
                <input
                  id="priceBeforeDiscount"
                  name="priceBeforeDiscount"
                  type="number"
                  value={formData.priceBeforeDiscount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                    errors.priceBeforeDiscount ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.priceBeforeDiscount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.priceBeforeDiscount}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="discountAmount" className="block text-sm font-medium text-gray-700 mb-1">قيمة الخصم</label>
                <input
                  id="discountAmount"
                  name="discountAmount"
                  type="number"
                  value={formData.discountAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-1">نسبة الخصم %</label>
                <input
                  id="discountPercentage"
                  name="discountPercentage"
                  type="number"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>
            </div>

            {/* Warehouse Selection */}
            <div>
              <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700 mb-1">المخزن *</label>
              <select
                id="warehouse"
                name="warehouse"
                value={formData.warehouse}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                  errors.warehouse ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">اختر مخزن</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
              {errors.warehouse && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.warehouse}
                </p>
              )}
            </div>

            {/* Final Price Display */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">السعر الأصلي:</span>
                  <span className="text-gray-600">
                    {formData.priceBeforeDiscount.toFixed(2)} ر.س
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">السعر بعد الخصم:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {(formData.priceBeforeDiscount - formData.discountAmount).toFixed(2)} ر.س
                  </span>
                </div>
                {formData.showDiscount && formData.discountAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">قيمة الخصم:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">
                        {formData.discountAmount.toFixed(2)} ر.س
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        {formData.discountPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Order Limits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">الكمية *</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                    errors.quantity ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.quantity}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="minOrder" className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للطلب</label>
                <input
                  id="minOrder"
                  name="minOrder"
                  type="number"
                  value={formData.minOrder}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="maxOrder" className="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للطلب</label>
                <input
                  id="maxOrder"
                  name="maxOrder"
                  type="number"
                  value={formData.maxOrder}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">التصنيف *</label>
              <div className="flex gap-2">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                    errors.category ? "border-red-500" : "border-gray-300"
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
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Add New Category */}
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">إضافة تصنيف جديد</label>
              <div className="flex gap-2">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="أدخل اسم تصنيف جديد"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <button
                  type="button"
                  onClick={addCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  إضافة تصنيف
                </button>
              </div>
            </div>

            {/* Tag Input */}
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">العلامة (Tag)</label>
              <input
                id="tag"
                name="tag"
                value={formData.tag}
                onChange={handleInputChange}
                placeholder="أدخل علامة للمنتج (اختياري)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">الوصف الكامل</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="أدخل وصفاً كاملاً للمنتج"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>

            {/* Short Description */}
            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">وصف مختصر</label>
              <textarea
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="أدخل وصفاً مختصراً للمنتج"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>

            {/* Product Toggles */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">إعدادات المنتج</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "showDiscount", label: "إظهار الخصم", icon: <Tag className="h-4 w-4" /> },
                  { name: "showQuantity", label: "إظهار الكمية", icon: <Box className="h-4 w-4" /> },
                  { name: "showRatings", label: "إظهار التقييمات", icon: <Star className="h-4 w-4" /> },
                  { name: "showTag", label: "إظهار العلامة", icon: <Tag className="h-4 w-4" /> },
                ].map((toggle) => (
                  <div key={toggle.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center justify-center p-2 rounded-full bg-blue-100 text-blue-600">
                      {toggle.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name={toggle.name}
                          checked={formData[toggle.name as keyof typeof formData] as boolean}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={toggle.name} className="text-gray-700">{toggle.label}</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Products Section */}
            <div className="space-y-3">
              <div 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 cursor-pointer"
                onClick={() => setShowSimilarProducts(!showSimilarProducts)}
              >
                <div className="flex items-center gap-4">
                  <label className="text-gray-700">المنتجات المشابهة</label>
                  {formData.similarProducts.length > 0 && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                      {formData.similarProducts.length} منتج
                    </span>
                  )}
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${showSimilarProducts ? 'rotate-180' : ''}`} />
              </div>

              {showSimilarProducts && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3">
                  <input
                    placeholder="ابحث عن منتجات..."
                    value={similarProductsSearch}
                    onChange={(e) => setSimilarProductsSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <div 
                          key={product._id} 
                          className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => toggleSimilarProduct(product._id)}
                        >
                          <div className="h-10 w-10 rounded-md overflow-hidden relative flex-shrink-0">
                            {getMainImage(product) ? (
                              <img
                                src={`http://localhost:4000/uploads/${getMainImage(product)?.url}`}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                            <p className="text-xs text-gray-500">
                              {product.priceBeforeDiscount.toFixed(2)} ر.س
                            </p>
                          </div>
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            formData.similarProducts.includes(product._id) 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'border-gray-300 text-transparent'
                          }`}>
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        لا توجد منتجات متاحة
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleNewProduct}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting || previews.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  editingProduct ? "تحديث المنتج" : "حفظ المنتج"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Left Side - Product Settings */}
        <div className="lg:w-1/3 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 h-fit sticky top-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">إعدادات المنتج</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* حالة المنتج */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">حالة المنتج</h3>
                  <p className="text-sm text-gray-500">
                    {formData.isActive ? 'المنتج ظاهر للعملاء' : 'المنتج مخفي'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {/* يتطلب شحن */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">يتطلب شحن</h3>
                  <p className="text-sm text-gray-500">
                    {formData.requiresShipping ? 'يحتاج إلى شحن' : 'لا يتطلب شحن'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                name="requiresShipping"
                checked={formData.requiresShipping}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {/* معفي من الضريبة */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <ShieldOff className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">معفي من الضريبة</h3>
                  <p className="text-sm text-gray-500">
                    {formData.taxExempt ? 'معفي من الضريبة' : 'خاضع للضريبة'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                name="taxExempt"
                checked={formData.taxExempt}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {/* جدولة الخصم */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-yellow-500" />
                  جدولة الخصم
                </h3>
                <input
                  type="checkbox"
                  name="showDiscount"
                  checked={formData.showDiscount}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {formData.showDiscount && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      تاريخ البداية
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      تاريخ النهاية
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button type="button" className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                      إضافة خصم
                    </button>
                    <button type="button" className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors">
                      حفظ الجدولة
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* المنتجات المشابهة */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">المنتجات المشابهة</h3>
                    <p className="text-sm text-gray-500">
                      {showSimilarProducts ? 'وضع التعديل مفعل' : 'انقر لتفعيل وضع التعديل'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showSimilarProducts}
                  onChange={() => setShowSimilarProducts(!showSimilarProducts)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {formData.similarProducts.length > 0 ? (
                <div className="space-y-3">
                  {formData.similarProducts.map(productId => {
                    const product = products.find(p => p._id === productId);
                    if (!product) return null;
                    
                    return (
                      <div 
                        key={productId} 
                        className={`group flex items-center gap-3 p-2 rounded cursor-pointer transition-all ${
                          showSimilarProducts 
                            ? 'hover:bg-white active:scale-[0.98]' 
                            : 'opacity-90 hover:opacity-100'
                        }`}
                      >
                        <div className="h-12 w-12 rounded-md overflow-hidden relative flex-shrink-0 border border-gray-200">
                          {getMainImage(product) ? (
                            <img
                              src={`http://localhost:4000/uploads/${getMainImage(product)?.url}`}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-700 truncate">{product.name}</h3>
                          <p className="text-xs text-gray-500">
                            {product.priceBeforeDiscount.toFixed(2)} ر.س
                            {product.showDiscount && (product.priceBeforeDiscount - product.priceAfterDiscount) > 0 && (
                              <span className="text-red-500 mr-2">
                                (خصم {(product.priceBeforeDiscount - product.priceAfterDiscount).toFixed(2)} ر.س)
                              </span>
                            )}
                          </p>
                        </div>
                        
                        {showSimilarProducts && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              type="button"
                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                              onClick={() => toggleSimilarProduct(productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    {showSimilarProducts ? 'قم بإضافة منتجات مشابهة' : 'لا توجد منتجات مشابهة'}
                  </p>
                </div>
              )}
            </div>

            {/* Order Limits Summary */}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>حدود الطلب:</span>
              <span>
                {formData.minOrder} - {formData.maxOrder}
              </span>
            </div>

            {/* ملخص السعر */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <h3 className="font-medium text-gray-700 flex items-center gap-2 mb-3">
                <Gauge className="h-5 w-5 text-green-500" />
                ملخص السعر
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">السعر الأصلي:</span>
                  <span className="font-medium">{formData.priceBeforeDiscount.toFixed(2)} ر.س</span>
                </div>
                
                {formData.showDiscount && formData.discountAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">قيمة الخصم:</span>
                      <span className="text-red-500">-{formData.discountAmount.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">نسبة الخصم:</span>
                      <span className="text-red-500">{formData.discountPercentage.toFixed(0)}%</span>
                    </div>
                  </>
                )}

                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">السعر النهائي:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {(formData.priceBeforeDiscount - formData.discountAmount).toFixed(2)} ر.س
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
};

export default ProductForm;