import { useState, useEffect } from 'react';
import { Search, Package, Warehouse, ArrowRight, MoveHorizontal, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getAllActiveWarehouses,
  getProductsByWarehouse,
  transferProducts,
  validateTransferQuantities,
  calculateTransferValue,
  type Warehouse as WarehouseType,
  type Product,
  type TransferItem,
} from '../../api/TransferWarehouse';

interface SelectedProduct extends Product {
  selectedQuantity: number;
}

// Component for individual product transfer card
interface ProductTransferCardProps {
  product: Product;
  onAddTransfer: (productId: string, quantity: number) => void;
  isInTransferList: boolean;
}

function ProductTransferCard({ product, onAddTransfer, isInTransferList }: ProductTransferCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAddTransfer(product._id, quantity);
    setQuantity(1);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
      <div className="flex-1">
        <h4 className="font-medium text-sm">{product.name}</h4>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-xs text-muted-foreground">الكود: {product.sku}</p>
          <Badge variant={product.quantity > 10 ? "default" : "destructive"} className="text-xs">
            متاح: {product.quantity}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          max={product.quantity}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1)))}
          className="w-16 h-8 text-center text-xs"
          disabled={isInTransferList}
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={isInTransferList || product.quantity === 0}
          className="h-8 px-3 text-xs"
        >
          {isInTransferList ? (
            <AlertCircle className="h-3 w-3" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

function TransferQuantities() {
  // State management
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [destinationWarehouse, setDestinationWarehouse] = useState('');
  const [sourceProducts, setSourceProducts] = useState<Product[]>([]);
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  // Load warehouses on component mount
  useEffect(() => {
    loadWarehouses();
  }, []);

  // Load products when source warehouse changes
  useEffect(() => {
    if (sourceWarehouse) {
      loadSourceProducts();
    } else {
      setSourceProducts([]);
      setTransferItems([]);
    }
  }, [sourceWarehouse]);

  // Calculate total value when transfer items change
  useEffect(() => {
    if (sourceWarehouse && transferItems.length > 0) {
      calculateTotalValue();
    } else {
      setTotalValue(0);
    }
  }, [transferItems, sourceWarehouse]);

  // Load all active warehouses
  const loadWarehouses = async () => {
    try {
      const response = await getAllActiveWarehouses();
      if (response.success && response.data) {
        setWarehouses(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب المخازن');
    }
  };

  // Load products from source warehouse
  const loadSourceProducts = async () => {
    if (!sourceWarehouse) return;
    
    setLoading(true);
    try {
      const response = await getProductsByWarehouse(sourceWarehouse);
      if (response.success && response.products) {
        setSourceProducts(response.products);
      } else {
        toast.error(response.message);
        setSourceProducts([]);
      }
    } catch (error) {
      toast.error('حدث خطأ في جلب منتجات المخزن');
      setSourceProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle product selection in modal
  const handleProductSelection = (product: Product) => {
    const isSelected = selectedProducts.some(p => p._id === product._id);
    
    if (isSelected) {
      // Remove product from selection
      setSelectedProducts(prev => prev.filter(p => p._id !== product._id));
    } else {
      // Add product to selection with default quantity of 1
      const selectedProduct: SelectedProduct = {
        ...product,
        selectedQuantity: 1
      };
      setSelectedProducts(prev => [...prev, selectedProduct]);
    }
  };

  // Handle quantity change for selected products
  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = sourceProducts.find(p => p._id === productId);
    if (!product) return;
    
    // Clamp quantity between 1 and available quantity
    const clampedQuantity = Math.max(1, Math.min(product.quantity, quantity));
    
    setSelectedProducts(selectedProducts.map(p => 
      p._id === productId 
        ? { ...p, selectedQuantity: clampedQuantity }
        : p
    ));
  };

  // Remove selected product
  const removeSelectedProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
  };

  // Calculate total transfer value
  const calculateTotalValue = async () => {
    if (!sourceWarehouse || transferItems.length === 0) return;
    
    try {
      const response = await calculateTransferValue(sourceWarehouse, transferItems);
      if (response.success && response.totalValue !== undefined) {
        setTotalValue(response.totalValue);
      }
    } catch (error) {
      console.error('خطأ في حساب القيمة:', error);
    }
  };

  // Add product to transfer list
  const addTransferItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      toast.error('يجب أن تكون الكمية أكبر من صفر');
      return;
    }

    const product = sourceProducts.find(p => p._id === productId);
    if (!product) {
      toast.error('المنتج غير موجود');
      return;
    }

    if (quantity > product.quantity) {
      toast.error(`الكمية المطلوبة أكبر من المتوفر (${product.quantity})`);
      return;
    }

    const existingIndex = transferItems.findIndex(item => item.productId === productId);
    if (existingIndex >= 0) {
      const updatedItems = [...transferItems];
      updatedItems[existingIndex].quantity = quantity;
      setTransferItems(updatedItems);
    } else {
      setTransferItems([...transferItems, { productId, quantity }]);
    }
  };

  // Remove product from transfer list
  const removeTransferItem = (productId: string) => {
    setTransferItems(transferItems.filter(item => item.productId !== productId));
  };

  // Handle transfer execution
  const handleTransfer = async () => {
    if (!sourceWarehouse || !destinationWarehouse || selectedProducts.length === 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (sourceWarehouse === destinationWarehouse) {
      toast.error('لا يمكن نقل المنتج إلى نفس المخزن');
      return;
    }

    // Convert selectedProducts to transferItems format
    const transferItemsFromSelected: TransferItem[] = selectedProducts.map(product => ({
      productId: product._id,
      quantity: product.selectedQuantity
    }));

    // Validate transfer quantities
    try {
      const validationResponse = await validateTransferQuantities(sourceWarehouse, transferItemsFromSelected);
      if (!validationResponse.success) {
        toast.error(validationResponse.message);
        return;
      }
    } catch (error) {
      toast.error('حدث خطأ في التحقق من الكميات');
      return;
    }

    setTransferring(true);
    try {
      const response = await transferProducts({
        sourceWarehouseId: sourceWarehouse,
        destinationWarehouseId: destinationWarehouse,
        items: transferItemsFromSelected,
        notes: 'نقل كميات بين المخازن'
      });

      if (response.success) {
        toast.success('تم نقل المنتجات بنجاح');
        // Reset form
        setSelectedProducts([]);
        setDestinationWarehouse('');
        // Reload source products to reflect new quantities
        loadSourceProducts();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء نقل المنتجات');
    } finally {
      setTransferring(false);
    }
  };

  const getProductDetails = (productId) => {
    const product = sourceProducts.find(p => p._id === productId);
    return product ? `${product.name} (${product.sku}) - المتاح: ${product.quantity}` : '';
  };

  const getWarehouseName = (id) => {
    const warehouse = warehouses.find(w => w._id === id);
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
            
            <div className="space-y-3">
              <div className="relative">
                <select 
                  value={sourceWarehouse} 
                  onChange={(e) => setSourceWarehouse(e.target.value)}
                  className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">اختر مخزن المصدر</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name} - {warehouse.location}
                    </option>
                  ))}
                </select>
              </div>
              
              {sourceWarehouse && (
                <Button
                  onClick={() => setShowProductModal(true)}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                  إضافة منتجات من المخزن
                </Button>
              )}
            </div>
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
                {warehouses
                  .filter(warehouse => warehouse._id !== sourceWarehouse)
                  .map(warehouse => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name} - {warehouse.location}
                    </option>
                  ))
                }
              </select>
            </div>

            {/* قسم المنتجات المحددة للنقل */}
            {selectedProducts.length > 0 && (
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <MoveHorizontal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold">المنتجات المحددة للنقل</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedProducts.length} منتج</Badge>
                    {totalValue > 0 && (
                      <Badge variant="outline">القيمة الإجمالية: {totalValue.toLocaleString()} ر.س</Badge>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">الصورة</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">اسم المنتج</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">الكود</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">الكمية المتاحة</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">الكمية المطلوبة</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">القيمة</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.map(product => (
                        <tr key={product._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-center">
                            {product.images?.[0] ? (
                              <img
                                src={`/uploads/product/${product.images[0].url}`}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover mx-auto shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{product.name}</span>
                              <span className="text-sm text-muted-foreground">{product.sku}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="outline">{product.sku}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={product.quantity > 10 ? "default" : "destructive"}>
                              {product.quantity}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Input
                              type="number"
                              min="1"
                              max={product.quantity}
                              value={product.selectedQuantity}
                              onChange={(e) => handleQuantityChange(product._id, parseInt(e.target.value) || 1)}
                              className="w-20 text-center mx-auto"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-medium">
                              {(product.priceBeforeDiscount * product.selectedQuantity).toLocaleString()} ر.س
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeSelectedProduct(product._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* زر النقل */}
        <div className="flex justify-center">
          <Button 
            onClick={handleTransfer}
            disabled={!sourceWarehouse || !destinationWarehouse || selectedProducts.length === 0 || transferring}
            className="px-8 py-3 text-lg"
          >
            {transferring ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                جاري النقل...
              </>
            ) : (
              <>
                <ArrowRight className="ml-2 h-5 w-5" />
                تنفيذ عملية النقل
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal اختيار المنتجات */}
      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">اختيار المنتجات للنقل</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowProductModal(false)} 
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن منتج..."
                className="pr-10"
                value={modalSearchTerm}
                onChange={(e) => setModalSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-1 overflow-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="w-12 px-4 py-3 text-center text-sm font-semibold text-foreground">اختيار</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">الصورة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">اسم المنتج</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">الكود</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">الكمية المتاحة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourceProducts
                      .filter(product => 
                        product.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                        product.sku.toLowerCase().includes(modalSearchTerm.toLowerCase())
                      )
                      .map((product) => {
                        const isSelected = selectedProducts.some(p => p._id === product._id);
                        const selectedProduct = selectedProducts.find(p => p._id === product._id);
                        
                        return (
                          <tr 
                            key={product._id} 
                            className={`border-b border-border hover:bg-muted/30 transition-colors ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleProductSelection(product)}
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              {product.images?.[0] ? (
                                <img
                                  src={`/uploads/product/${product.images[0].url}`}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover mx-auto shadow-sm"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto">
                                  <Package className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{product.name}</span>
                                <span className="text-sm text-muted-foreground">{product.sku}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant="outline">{product.sku}</Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={product.quantity > 10 ? "default" : "destructive"}>
                                {product.quantity}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t border-border">
              <div className="text-sm text-muted-foreground">
                تم اختيار {selectedProducts.length} منتج
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowProductModal(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={() => {
                    setShowProductModal(false);
                    setModalSearchTerm('');
                  }}
                  disabled={selectedProducts.length === 0}
                >
                  تأكيد الاختيار ({selectedProducts.length} منتج)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Old Product Selector Modal - Remove this section */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">اختر المنتجات من {getWarehouseName(sourceWarehouse)}</h3>
              <button 
                onClick={() => setShowProductSelector(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <input
                placeholder="ابحث عن منتج..."
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-12 px-3 py-2">اختيار</th>
                    <th className="px-3 py-2 text-right">الصورة</th>
                    <th className="px-3 py-2 text-right">اسم المنتج</th>
                    <th className="px-3 py-2 text-right">SKU</th>
                    <th className="px-3 py-2 text-right">الكمية المتاحة</th>
                    <th className="px-3 py-2 text-right">الكمية المطلوبة</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceProducts
                    .filter(product => 
                      product.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                      product.sku.toLowerCase().includes(modalSearchQuery.toLowerCase())
                    )
                    .map((product) => {
                      const isSelected = transferItems.some(item => item.productId === product._id);
                      const selectedItem = transferItems.find(item => item.productId === product._id);
                      
                      return (
                        <tr 
                          key={product._id} 
                          className={`${isSelected ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                        >
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  addTransferItem(product._id, 1);
                                } else {
                                  removeTransferItem(product._id);
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            {product.images?.[0] && (
                              <img
                                src={`/uploads/product/${product.images[0]?.url}`}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                            )}
                          </td>
                          <td className="px-3 py-2">{product.name}</td>
                          <td className="px-3 py-2">{product.sku}</td>
                          <td className="px-3 py-2 text-right">
                            <Badge variant={product.quantity > 10 ? "default" : "destructive"}>
                              {product.quantity}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {isSelected && (
                              <Input
                                type="number"
                                min="1"
                                max={product.quantity}
                                value={selectedItem?.quantity || 1}
                                onChange={(e) => {
                                  const newQuantity = Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1));
                                  addTransferItem(product._id, newQuantity);
                                }}
                                className="w-20 h-8 text-center"
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline"
                onClick={() => setShowProductSelector(false)}
              >
                إلغاء
              </Button>
              <Button 
                onClick={() => {
                  setShowProductSelector(false);
                  setModalSearchQuery('');
                }}
              >
                تأكيد الاختيار ({transferItems.length} منتج)
              </Button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default TransferQuantities;