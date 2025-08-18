import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Settings,
  ChevronDown,
  Star,
  ShoppingCart
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  priceBeforeDiscount: number;
  price: number;
  showProduct: boolean;
  category: string;
  images: Array<{ url: string }>;
  description: string;
  rating: number;
  sales: number;
  createdAt: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
  });

  // محاكاة بيانات المنتجات
  const mockProducts: Product[] = [
    {
      _id: '1',
      name: 'جهاز كمبيوتر محمول Dell XPS 13',
      sku: 'DELL-XPS-001',
      quantity: 25,
      priceBeforeDiscount: 4500,
      price: 3999,
      showProduct: true,
      category: 'normal',
      images: [{ url: 'laptop1.jpg' }],
      description: 'جهاز كمبيوتر محمول عالي الأداء',
      rating: 4.8,
      sales: 156,
      createdAt: '2024-01-15'
    },
    {
      _id: '2',
      name: 'هاتف iPhone 15 Pro',
      sku: 'APPLE-IP15-001',
      quantity: 45,
      priceBeforeDiscount: 5200,
      price: 4899,
      showProduct: true,
      category: 'normal',
      images: [{ url: 'iphone1.jpg' }],
      description: 'أحدث هاتف من آبل',
      rating: 4.9,
      sales: 289,
      createdAt: '2024-01-10'
    },
    {
      _id: '3',
      name: 'قسيمة شراء 500 ريال',
      sku: 'VOUCHER-500',
      quantity: 100,
      priceBeforeDiscount: 500,
      price: 500,
      showProduct: true,
      category: 'vouchers',
      images: [{ url: 'voucher1.jpg' }],
      description: 'قسيمة شراء بقيمة 500 ريال',
      rating: 5.0,
      sales: 78,
      createdAt: '2024-01-05'
    },
    {
      _id: '4',
      name: 'باقة الألعاب المتكاملة',
      sku: 'BUNDLE-GAMES-001',
      quantity: 15,
      priceBeforeDiscount: 1200,
      price: 999,
      showProduct: false,
      category: 'bundled',
      images: [{ url: 'bundle1.jpg' }],
      description: 'باقة تحتوي على 5 ألعاب',
      rating: 4.6,
      sales: 34,
      createdAt: '2024-01-01'
    }
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredProducts = mockProducts;
      
      // تطبيق فلاتر البحث
      if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // تطبيق فلتر الفئة
      if (categoryFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
      }
      
      // تطبيق فلتر الحالة
      if (statusFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
          statusFilter === 'active' ? product.showProduct : !product.showProduct
        );
      }
      
      setProducts(filteredProducts);
      setTotalProducts(filteredProducts.length);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.showProduct).length,
    inactive: products.filter(p => !p.showProduct).length,
    lowStock: products.filter(p => p.quantity < 10).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  };

  const categories = [
    { key: 'all', label: 'الكل', count: stats.total },
    { key: 'normal', label: 'المنتجات العادية', count: products.filter(p => p.category === 'normal').length },
    { key: 'vouchers', label: 'القسائم', count: products.filter(p => p.category === 'vouchers').length },
    { key: 'bundled', label: 'المنتجات المجمعة', count: products.filter(p => p.category === 'bundled').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">إدارة المنتجات</h1>
          <p className="text-muted-foreground mt-2">إدارة ومتابعة جميع المنتجات والمخزون</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              <Settings className="w-4 h-4" />
              خيارات إضافية
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-2">
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary w-full text-right">
                  <Download className="w-4 h-4" />
                  تصدير المنتجات
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary w-full text-right">
                  <Upload className="w-4 h-4" />
                  استيراد المنتجات
                </button>
              </div>
            </div>
          </div>
          
          <button className="btn-gradient flex items-center gap-2">
            <Plus className="w-4 h-4" />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي المنتجات</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">المنتجات النشطة</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">مخزون منخفض</p>
              <p className="text-2xl font-bold">{stats.lowStock}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">قيمة المخزون</p>
              <p className="text-2xl font-bold">{stats.totalValue.toLocaleString()}</p>
              <p className="text-orange-100 text-xs">ريال سعودي</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">إجمالي المبيعات</p>
              <p className="text-2xl font-bold">{products.reduce((sum, p) => sum + p.sales, 0)}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => handleCategoryFilter(category.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                categoryFilter === category.key
                  ? 'bg-gradient-primary text-white shadow-soft'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {category.label}
              <span className="mr-2 px-2 py-1 text-xs rounded-full bg-white/20">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Status Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث في المنتجات (الاسم أو رمز المنتج)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 min-w-[180px]"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">المنتجات النشطة</option>
            <option value="inactive">المنتجات غير النشطة</option>
          </select>
          
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-12 h-12 text-primary animate-spin" />
          <span className="mr-3 text-lg">جاري تحميل المنتجات...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">لا توجد منتجات</h3>
          <p className="text-muted-foreground">لم يتم العثور على منتجات تطابق معايير البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 group">
              {/* Product Image */}
              <div className="relative mb-4">
                <div className="w-full h-48 bg-secondary rounded-lg overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                  product.showProduct 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {product.showProduct ? 'نشط' : 'غير نشط'}
                </div>
                {product.priceBeforeDiscount > product.price && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    خصم {Math.round(((product.priceBeforeDiscount - product.price) / product.priceBeforeDiscount) * 100)}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">رمز المنتج: {product.sku}</p>
                </div>

                {/* Rating and Sales */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {product.sales} مبيعة
                  </div>
                </div>

                {/* Price and Stock */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{product.price} ريال</span>
                      {product.priceBeforeDiscount > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.priceBeforeDiscount} ريال
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    product.quantity < 10 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    المخزون: {product.quantity}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Eye className="w-4 h-4" />
                    عرض
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {products.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              عرض {products.length} من إجمالي {totalProducts} منتج
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-lg border border-border bg-card disabled:opacity-50"
              >
                السابق
              </button>
              <span className="px-4 py-2 rounded-lg bg-primary text-white">
                {pagination.page}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={products.length < pagination.limit}
                className="px-4 py-2 rounded-lg border border-border bg-card disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;