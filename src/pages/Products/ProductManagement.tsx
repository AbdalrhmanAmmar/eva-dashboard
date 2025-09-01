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
  Trash,
  X,
  AlertCircle
} from 'lucide-react';
import { getFileUrl } from '../../utils/fileUrl';
import { productAPI } from '../../api/prodcuts';
import { useNavigate } from 'react-router-dom';

// واجهة بيانات المنتج
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
}

// مكون المودال للحذف
const DeleteModal = ({ isOpen, onClose, onConfirm, product, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-95 animate-in fade-in-90 zoom-in-90">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">تأكيد الحذف</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-700 mb-2">هل أنت متأكد من رغبتك في حذف هذا المنتج؟</p>
              <p className="font-medium text-gray-900">{product?.name}</p>
              <p className="text-sm text-gray-500">هذا الإجراء لا يمكن التراجع عنه.</p>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4" />
                  حذف المنتج
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductManagement: React.FC = () => {
  const router = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  // جلب المنتجات من API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
      };

      const response = await productAPI.getAllProducts(params);
      setProducts(response.products);
      setTotalProducts(response.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProducts();
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      fetchProducts();
    }, 1000);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "المنتج,الكود,الكمية,السعر,الحالة\n" +
      products.map(product => 
        `${product.name},${product.sku},${product.quantity},${product.priceBeforeDiscount},${product.showProduct ? 'نشط' : 'غير نشط'}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // فتح مودال الحذف
  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // إغلاق مودال الحذف
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // تأكيد الحذف
  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    setDeleteLoading(true);
    try {
      await productAPI.deleteProduct(productToDelete._id);
      // إعادة جلب البيانات بعد الحذف
      fetchProducts();
      closeDeleteModal();
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // استخراج الفئات الفريدة من المنتجات
  const categories = ['all', ...Array.from(new Set(products.map(item => item.category)))];

  // حساب الإحصائيات
  const stats = {
    totalItems: totalProducts,
    activeItems: products.filter(item => item.showProduct).length,
    inactiveItems: products.filter(item => !item.showProduct).length,
    lowStockItems: products.filter(item => item.quantity < 10).length,
    totalValue: products.reduce((sum, item) => sum + (item.priceBeforeDiscount * item.quantity), 0)
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            إدارة المنتجات
          </h1>
          <p className="text-gray-600 mt-2">إدارة وعرض جميع المنتجات في المتجر</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <Filter className="w-4 h-4" />
            تصفية
          </button>
          
          <button 
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">إجمالي المنتجات</p>
              <p className="text-3xl font-bold mt-2">{stats.totalItems}</p>
            </div>
            <Package className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">منتجات غير نشطة</p>
              <p className="text-3xl font-bold mt-2">{stats.inactiveItems}</p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">منتجات نشطة</p>
              <p className="text-3xl font-bold mt-2">{stats.activeItems}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">قيمة المخزون</p>
              <p className="text-3xl font-bold mt-2">
                {(stats.totalValue / 10000).toFixed(1)}K
              </p>
              <p className="text-orange-100 text-xs">ريال سعودي</p>
            </div>
            <BarChart3 className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleCategoryFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              categoryFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            الكل
          </button>
          {categories.filter(cat => cat !== 'all').map(category => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                categoryFilter === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المنتجات (الاسم أو الكود)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Search className="ml-2" />
            بحث
          </button>

          <button 
            onClick={() => router('/product-create')}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
          </button>
        </form>
      </div>

      {/* Products table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المنتج</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الاسم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">رمز المنتج</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الكمية الحالية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">السعر</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-600">
                    <div className="py-8 flex flex-col items-center">
                      <Package className="w-12 h-12 text-gray-400 mb-2" />
                      <p>لا توجد منتجات</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={getFileUrl(`/uploads/product/${product.images[0]?.url}`)}
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.quantity.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.priceBeforeDiscount.toLocaleString()} ر.س</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.showProduct
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.showProduct ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => router(`/product-edit/${product._id}`)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" 
                          title="تعديل المنتج"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(product)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" 
                          title="حذف المنتج"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(prev.page - 1, 1),
                }))
              }
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              السابق
            </button>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
              disabled={products.length < pagination.limit}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              التالي
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                عرض <span className="font-medium">{products.length}</span> من{' '}
                <span className="font-medium">{totalProducts}</span> نتائج
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(prev.page - 1, 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">السابق</span>
                  &larr;
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  الصفحة {pagination.page}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                  disabled={products.length < pagination.limit}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">التالي</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for low stock items */}
      {stats.lowStockItems > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">تنبيه: يوجد منتجات منخفضة المخزون</h3>
              <p className="text-red-600">
                يوجد {stats.lowStockItems} منتج بكمية منخفضة. يرجى مراجعة هذه المنتجات وإعادة تخزينها.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        product={productToDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ProductManagement;