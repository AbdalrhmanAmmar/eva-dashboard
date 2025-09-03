import { useState, useEffect } from 'react';
import { Search, Package, Warehouse, ArrowRight, MoveHorizontal } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock data للمخازن والمنتجات
const mockWarehouses = [
  { _id: '1', name: 'المخزن الرئيسي', location: 'الرياض' },
  { _id: '2', name: 'مخزن الفرع الأول', location: 'جدة' },
  { _id: '3', name: 'مخزن الفرع الثاني', location: 'الدمام' },
];

const mockProducts = [
  { _id: '101', name: 'جهاز لاب توب ديل', sku: 'LT-DELL-001', quantity: 15, warehouse: '1' },
  { _id: '102', name: 'شاشة سامسونج 24 بوصة', sku: 'MON-S24-002', quantity: 8, warehouse: '1' },
  { _id: '103', name: 'لوحة مفاتيح لاسلكية', sku: 'KB-WL-003', quantity: 25, warehouse: '2' },
  { _id: '104', name: 'ماوس لاسلكي', sku: 'MS-WL-004', quantity: 30, warehouse: '2' },
  { _id: '105', name: 'سماعات رأس', sku: 'HP-HD-005', quantity: 12, warehouse: '3' },
];

function TransferQuantities() {
  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [destinationWarehouse, setDestinationWarehouse] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // تصفية المنتجات بناءً على المخزن المحدد ونتيجة البحث
  useEffect(() => {
    let filtered = mockProducts;
    
    if (sourceWarehouse) {
      filtered = filtered.filter(product => product.warehouse === sourceWarehouse);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.includes(searchTerm) || product.sku.includes(searchTerm)
      );
    }
    
    setFilteredProducts(filtered);
  }, [sourceWarehouse, searchTerm]);

  const handleTransfer = () => {
    if (!sourceWarehouse || !destinationWarehouse || !selectedProduct || !quantity) {
      toast.error('يرجى ملء جميع الحقول المطلوبة', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (sourceWarehouse === destinationWarehouse) {
      toast.error('لا يمكن نقل المنتج إلى نفس المخزن', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const product = mockProducts.find(p => p._id === selectedProduct);
    if (parseInt(quantity) > product.quantity) {
      toast.error('الكمية المطلوبة تتجاوز الكمية المتاحة', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // في التطبيق الحقيقي، هنا نرسل طلب API لنقل الكمية
    toast.success(`تم نقل ${quantity} وحدة من المنتج بنجاح`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // إعادة تعيين الحقول
    setSelectedProduct('');
    setQuantity('');
  };

  const getProductDetails = (productId) => {
    const product = mockProducts.find(p => p._id === productId);
    return product ? `${product.name} (${product.sku}) - المتاح: ${product.quantity}` : '';
  };

  const getWarehouseName = (id) => {
    const warehouse = mockWarehouses.find(w => w._id === id);
    return warehouse ? `${warehouse.name} - ${warehouse.location}` : '';
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">نقل الكميات بين المخازن</h1>
          <p className="text-muted-foreground mt-2">يمكنك نقل المنتجات بين المخازن المختلفة</p>
        </div>
        
        <div className="flex items-center gap-2 text-blue-600">
          <MoveHorizontal className="w-6 h-6" />
          <span className="font-medium">نقل كميات</span>
        </div>
      </div>

      {/* نقل الكميات */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* مخزن المصدر */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-blue-500" />
              مخزن المصدر
            </h3>
            
            <div className="relative">
              <select 
                value={sourceWarehouse} 
                onChange={(e) => setSourceWarehouse(e.target.value)}
                className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">اختر مخزن المصدر</option>
                {mockWarehouses.map(warehouse => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name} - {warehouse.location}
                  </option>
                ))}
              </select>
            </div>

            {sourceWarehouse && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    type="search" 
                    placeholder="ابحث عن منتج"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>

                <div className="relative">
                  <select 
                    value={selectedProduct} 
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">اختر المنتج</option>
                    {filteredProducts.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.sku}) - المتاح: {product.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الكمية المراد نقلها</label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="أدخل الكمية"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* مخزن الوجهة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-green-500" />
              مخزن الوجهة
            </h3>
            
            <div className="relative">
              <select 
                value={destinationWarehouse} 
                onChange={(e) => setDestinationWarehouse(e.target.value)}
                className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">اختر مخزن الوجهة</option>
                {mockWarehouses
                  .filter(warehouse => warehouse._id !== sourceWarehouse)
                  .map(warehouse => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name} - {warehouse.location}
                    </option>
                  ))
                }
              </select>
            </div>

            {selectedProduct && (
              <div className="p-4 bg-secondary/20 rounded-lg border border-border">
                <h4 className="font-medium mb-2">تفاصيل النقل</h4>
                <div className="space-y-2 text-sm">
                  <p>المنتج: {getProductDetails(selectedProduct)}</p>
                  <p>الكمية: {quantity}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-blue-600">
                      {getWarehouseName(sourceWarehouse)}
                    </span>
                    <ArrowRight className="w-4 h-4 mx-2" />
                    <span className="text-green-600">
                      {getWarehouseName(destinationWarehouse)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={handleTransfer}
          className="btn-gradient flex items-center gap-2 py-3 px-6 rounded-md"
          disabled={!sourceWarehouse || !destinationWarehouse || !selectedProduct || !quantity}
        >
          <MoveHorizontal className="w-5 h-5" />
          تنفيذ عملية النقل
        </Button>
      </div>

      {/* قائمة المنتجات في مخزن المصدر */}
      {sourceWarehouse && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-gradient-to-r from-secondary/50 to-secondary/30">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              المنتجات في {mockWarehouses.find(w => w._id === sourceWarehouse)?.name}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/20">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">اسم المنتج</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">SKU</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">الكمية المتاحة</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts
                  .filter(product => product.warehouse === sourceWarehouse)
                  .map((product, index) => (
                    <tr 
                      key={product._id}
                      className={`border-b border-border hover:bg-secondary/30 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/10'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4">{product.sku}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {product.quantity} وحدة
                        </span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransferQuantities;