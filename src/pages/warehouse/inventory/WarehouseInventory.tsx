// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import { getAllWarehouses, getProductsByWarehouse } from "../../../api/warehouseAPI";
// import { useAuthStore } from './../../../stores/authStore';
import { Loader2, Plus, Trash2, AlertCircle, CheckCircle, Search, Filter } from "lucide-react";
import { createInventoryCount } from "../../../api/inventoryAPI";

interface Warehouse {
  _id: string;
  name: string;
  location?: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  costPrice: number;
  images?: { url: string }[];
}

interface InventoryItem {
  productId: string;
  countedQuantity: number;
}

interface InventoryCount {
  _id: string;
  name: string;
  warehouse: {
    _id: string;
    name: string;
  };
  type: string;
  notes: string;
  status: string;
  createdAt: string;
  items: {
    product: {
      _id: string;
      name: string;
      sku: string;
      quantity: number;
      reservedQuantity: number;
      damagedQuantity: number;
      costPrice: number;
      images?: { url: string }[];
    };
    countedQuantity: number;
  }[];
}

type InventoryFilterTab = 'all' | 'counted' | 'uncounted' | 'matched' | 'mismatched';

const InventoryCountForm = ({ 
  warehouses,
  onSuccess,
  initialWarehouse = ""
}: {
  warehouses: Warehouse[];
  onSuccess: () => void;
  initialWarehouse?: string;
}) => {
//   const { user } = useAuthStore();
  const [form, setForm] = useState({
    warehouse: initialWarehouse,
    name: "",
    type: "full",
    notes: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [bulkCount, setBulkCount] = useState<number | null>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState<InventoryFilterTab>('all');

  useEffect(() => {
    if (form.warehouse) {
      fetchProducts();
    }
  }, [form.warehouse]);

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const { success, products } = await getProductsByWarehouse(form.warehouse);
      console.log(`success`,success)
      if (success) {
        setProducts(products);
        console.log(`products,`,products)
        setBulkCount(null);
        if (form.type === "full") {
          setInventoryItems(products.map(product => ({
            productId: product._id,
            countedQuantity: 0
          })));
        } else {
          setInventoryItems([]);
        }
      }
    } catch (err) {
      setErrorMsg("فشل في تحميل قائمة المنتجات");
      console.error(err);
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setForm({ ...form, type: value as "full" | "partial" });
    if (value === "full") {
      setInventoryItems(products.map(product => ({
        productId: product._id,
        countedQuantity: 0
      })));
    } else {
      setInventoryItems([]);
    }
    setBulkCount(null);
    setActiveFilterTab('all');
  };

  const handleCountedQuantityChange = (productId: string, value: number) => {
    setInventoryItems(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId ? { ...item, countedQuantity: value } : item
        );
      } else {
        return [...prev, { productId, countedQuantity: value }];
      }
    });
  };

  const removeProduct = (productId: string) => {
    setInventoryItems(prev => prev.filter(item => item.productId !== productId));
  };

  const toggleProductSelection = (productId: string) => {
    setInventoryItems(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem) {
        return prev.filter(item => item.productId !== productId);
      } else {
        return [
          ...prev,
          {
            productId,
            countedQuantity: 0
          }
        ];
      }
    });
  };

  const applyBulkCount = () => {
    if (bulkCount === null) return;
    
    if (form.type === "full") {
      setInventoryItems(products.map(product => ({
        productId: product._id,
        countedQuantity: bulkCount
      })));
    } else {
      setInventoryItems(prev =>
        prev.map(item => ({
          ...item,
          countedQuantity: bulkCount
        }))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'completed') => {
    e.preventDefault();
    
    if (!form.warehouse) {
      setErrorMsg("يجب اختيار مخزن");
      return;
    }

    if (form.type === "partial" && inventoryItems.length === 0) {
      setErrorMsg("يجب اختيار منتجات على الأقل للجرد الجزئي");
      return;
    }

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const items = form.type === "full" 
        ? products.map(product => ({
            product: product._id,
            countedQuantity: inventoryItems.find(i => i.productId === product._id)?.countedQuantity || 0
          }))
        : inventoryItems.map(item => ({
            product: item.productId,
            countedQuantity: item.countedQuantity
          }));

      const response = await createInventoryCount({
        ...form,
        items,
        selectedProducts: form.type === "partial" ? inventoryItems.map(item => item.productId) : [],
        createdBy: "user.id",
        status
      });
      
      if (response.success) {
        setSuccessMsg(status === 'completed' ? "تم إنشاء الجرد بنجاح" : "تم حفظ المسودة بنجاح");
        if (status === 'completed') {
          setForm({
            warehouse: warehouses.length > 0 ? warehouses[0]._id : "",
            name: "",
            type: "full",
            notes: "",
          });
          setInventoryItems([]);
          setBulkCount(null);
          onSuccess();
        }
      } else {
        setErrorMsg(response.message || "حدث خطأ أثناء إنشاء الجرد");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "حدث خطأ أثناء إنشاء الجرد");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilteredProducts = () => {
    const itemsToShow = form.type === "full" 
      ? products 
      : products.filter(product => 
          inventoryItems.some(item => item.productId === product._id)
        ).map(product => ({
          ...product,
          countedQuantity: inventoryItems.find(item => item.productId === product._id)?.countedQuantity || 0
        }));

    switch (activeFilterTab) {
      case 'counted':
        return itemsToShow.filter(item => {
          const countedItem = inventoryItems.find(i => i.productId === item._id);
          return countedItem && countedItem.countedQuantity > 0;
        });
      case 'uncounted':
        return itemsToShow.filter(item => {
          const countedItem = inventoryItems.find(i => i.productId === item._id);
          return !countedItem || countedItem.countedQuantity === 0;
        });
      case 'matched':
        return itemsToShow.filter(item => {
          const countedItem = inventoryItems.find(i => i.productId === item._id);
          return countedItem && countedItem.countedQuantity === item.quantity;
        });
      case 'mismatched':
        return itemsToShow.filter(item => {
          const countedItem = inventoryItems.find(i => i.productId === item._id);
          return countedItem && countedItem.countedQuantity !== item.quantity && countedItem.countedQuantity > 0;
        });
      default:
        return itemsToShow;
    }
  };

  const filteredProductsToShow = getFilteredProducts();

  const totalProducts = form.type === "full" ? products.length : inventoryItems.length;
  const countedProducts = inventoryItems.filter(item => item.countedQuantity > 0).length;
  const matchedProducts = inventoryItems.filter(item => {
    const product = products.find(p => p._id === item.productId);
    return product && item.countedQuantity === product.quantity;
  }).length;
  const mismatchedProducts = countedProducts - matchedProducts;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">إنشاء جرد جديد</h2>
      
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-700 text-right">
              اسم الجرد
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="مثال: جرد أكتوبر"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
            />
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-700 text-right">
              نوع الجرد
            </label>
            <select
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
            >
              <option value="full">جرد كلي</option>
              <option value="partial">جرد جزئي</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block mb-2 text-sm font-medium text-gray-700 text-right">
              المخزن
            </label>
            <select
              value={form.warehouse}
              onChange={(e) => setForm({...form, warehouse: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
            >
              <option value="">اختر مخزن</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name} {warehouse.location && `(${warehouse.location})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 text-right">
            ملاحظات
          </label>
          <textarea
            name="notes"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
            value={form.notes}
            onChange={handleChange}
            placeholder="أي ملاحظات إضافية..."
          />
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {form.type === "full" ? "جرد كلي لجميع المنتجات" : "جرد جزئي للمنتجات المحددة"}
            </h3>
            <div className="flex items-center gap-2">
              <span className="bg-gray-200 px-2 py-1 rounded text-sm">
                {form.type === "full" ? products.length : inventoryItems.length} / {products.length} منتج
              </span>
              {form.type === "partial" && (
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                  onClick={() => setShowProductSelector(true)}
                >
                  <Plus size={16} />
                  إضافة منتجات
                </button>
              )}
            </div>
          </div>

          {fetchingProducts ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              <span className="mr-2">جاري تحميل المنتجات...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              لا توجد منتجات في هذا المخزن
            </div>
          ) : (
            <div className="space-y-4">
              {form.type === "full" && (
                <div className="flex items-center gap-4 p-3 bg-gray-100 rounded-md">
                  <span className="whitespace-nowrap">تطبيق كمية موحدة للكل:</span>
                  <input
                    type="number"
                    min="0"
                    value={bulkCount ?? ""}
                    onChange={(e) => setBulkCount(parseInt(e.target.value) || null)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    onClick={applyBulkCount}
                    disabled={bulkCount === null}
                  >
                    تطبيق
                  </button>
                </div>
              )}

              <div className="bg-white rounded-lg border">
                <div className="flex justify-between items-center border-b p-4">
                  <div className="flex gap-4">
                    <button
                      className={`px-3 py-1 rounded ${activeFilterTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => setActiveFilterTab('all')}
                    >
                      الكل ({totalProducts})
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${activeFilterTab === 'counted' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => setActiveFilterTab('counted')}
                    >
                      مجرود ({countedProducts})
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${activeFilterTab === 'uncounted' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => setActiveFilterTab('uncounted')}
                    >
                      غير مجرود ({totalProducts - countedProducts})
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${activeFilterTab === 'matched' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => setActiveFilterTab('matched')}
                    >
                      مطابق ({matchedProducts})
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${activeFilterTab === 'mismatched' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => setActiveFilterTab('mismatched')}
                    >
                      غير مطابق ({mismatchedProducts})
                    </button>
                  </div>
                  <Filter size={16} className="text-gray-500" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        {form.type === "partial" && (
                          <th className="px-3 py-2 text-center font-medium text-gray-700">
                            حذف
                          </th>
                        )}
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          الصورة
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700">
                          المنتج
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          المخزون
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          المحجوز
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          المتوقع
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          المجرود
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          الحالة
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          الصافي
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          قبل الخصم
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          بعد الخصم
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          العجز
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-gray-700">
                          التكلفة
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProductsToShow.map((product) => {
                        const countedItem = inventoryItems.find(item => item.productId === product._id);
                        const countedQuantity = countedItem?.countedQuantity || 0;
                        const isMatched = countedQuantity === product.quantity;
                        const netInventory = countedQuantity - product.reservedQuantity;
                        const shortage = Math.max(0, (product.quantity - product.reservedQuantity) - countedQuantity);
                        const shortageCost = Math.max(0, shortage * product.costPrice).toFixed(2);
                        
                        return (
                          <tr key={product._id} className="border-b hover:bg-gray-50">
                            {form.type === "partial" && (
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100"
                                  onClick={() => removeProduct(product._id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            )}
                            
                            <td className="px-3 py-2 text-center">
                              {product.images?.[0] && (
                                <img
                                  src={`http://localhost:4000/uploads/product/${product.images[0].url}`}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="rounded object-cover mx-auto"
                                />
                              )}
                            </td>
                            
                            <td className="px-3 py-2">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{product.name}</span>
                                <span className="text-sm text-gray-500">{product.sku}</span>
                              </div>
                            </td>
                            
                            <td className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">{product.quantity}</span>
                                <span className="text-xs text-gray-500">المخزون</span>
                              </div>
                            </td>
                            
                            <td className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-blue-600">{product.reservedQuantity}</span>
                                <span className="text-xs text-gray-500">محجوز</span>
                              </div>
                            </td>
                            
                            <td className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-purple-600">
                                  {product.quantity - product.reservedQuantity}
                                </span>
                                <span className="text-xs text-gray-500">متوقع</span>
                              </div>
                            </td>
                            
                            <td className="px-3 py-2 text-center">
                              <input
                                type="number"
                                min="0"
                                value={countedQuantity}
                                onChange={(e) => 
                                  handleCountedQuantityChange(
                                    product._id, 
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className={`w-20 px-2 py-1 border rounded text-center ${
                                  countedQuantity > 0 && !isMatched ? 'border-yellow-500 bg-yellow-50' : ''
                                } ${
                                  isMatched && countedQuantity > 0 ? 'border-green-500 bg-green-50' : ''
                                }`}
                              />
                            </td>
                            
                            <td className="px-3 py-2 text-center">
                              {countedQuantity > 0 ? (
                                isMatched ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                                    <CheckCircle size={12} />
                                    مطابق
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                                    <AlertCircle size={12} />
                                    غير مطابق
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                                  غير مجرود
                                </span>
                              )}
                            </td>
                            
                            <td className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">{netInventory}</span>
                                <span className="text-xs text-gray-500">الصافي</span>
                              </div>
                            </td>
                            
                            <td className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">{product.quantity}</span>
                                <span className="text-xs text-gray-500">قبل الخصم</span>
                              </div>
                            </td>
                            
                            <td className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">{product.quantity - product.reservedQuantity}</span>
                                <span className="text-xs text-gray-500">بعد الخصم</span>
                              </div>
                            </td>
                            
                            <td className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center">
                                <span className={`font-medium ${shortage > 0 ? 'text-red-600' : ''}`}>
                                  {shortage}
                                </span>
                                <span className="text-xs text-gray-500">العجز</span>
                              </div>
                            </td>
                            
                            <td className="px-3 py-2 text-center">
                              <div className="flex flex-col items-center">
                                <span className={`font-medium ${shortage > 0 ? 'text-red-600' : ''}`}>
                                  {shortageCost} ج.م
                                </span>
                                <span className="text-xs text-gray-500">التكلفة</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <strong>خطأ:</strong> {errorMsg}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <strong>نجاح:</strong> {successMsg}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            onClick={() => {
              setForm({
                warehouse: warehouses.length > 0 ? warehouses[0]._id : "",
                name: "",
                type: "full",
                notes: "",
              });
              setInventoryItems([]);
              setBulkCount(null);
              setErrorMsg("");
              setSuccessMsg("");
              setActiveFilterTab('all');
            }}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading || (form.type === "partial" && inventoryItems.length === 0)}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 inline" size={16} />
                جاري الحفظ...
              </>
            ) : (
              "حفظ كمسودة"
            )}
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            onClick={(e) => handleSubmit(e, 'completed')}
            disabled={loading || (form.type === "partial" && inventoryItems.length === 0)}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 inline" size={16} />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2 inline" />
                إنشاء الجرد
              </>
            )}
          </button>
        </div>
      </form>

      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">اختر المنتجات للجرد الجزئي</h3>
              <button onClick={() => setShowProductSelector(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                placeholder="ابحث عن منتج..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-12 px-3 py-2"></th>
                    <th className="px-3 py-2 text-right">الصورة</th>
                    <th className="px-3 py-2 text-right">اسم المنتج</th>
                    <th className="px-3 py-2 text-right">SKU</th>
                    <th className="px-3 py-2 text-right">الكمية الحالية</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const isSelected = inventoryItems.some(item => item.productId === product._id);
                    return (
                      <tr 
                        key={product._id} 
                        className={`cursor-pointer ${isSelected ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                        onClick={() => toggleProductSelection(product._id)}
                      >
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProductSelection(product._id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-3 py-2">
                          {product.images?.[0] && (
                            <img
src={getFileUrl(`/uploads/product/${product.images[0]?.url}`)}                              alt={product.name}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">{product.name}</td>
                        <td className="px-3 py-2">{product.sku}</td>
                        <td className="px-3 py-2 text-right">{product.quantity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                onClick={() => setShowProductSelector(false)}
              >
                إلغاء
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setShowProductSelector(false)}
              >
                تأكيد الاختيار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WarehouseInventory = () => {
  const [activeTab, setActiveTab] = useState<'count' | 'history'>('count');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [fetchingWarehouses, setFetchingWarehouses] = useState(true);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const { success, warehouses } = await getAllWarehouses();
        if (success) {
          setWarehouses(warehouses);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingWarehouses(false);
      }
    };

    fetchWarehouses();
  }, []);

  const handleSuccess = () => {
    setActiveTab('history');
  };

  return (
    <div className="container mx-auto py-8 space-y-8 my-10">
      <div className="flex justify-around items-center flex-row-reverse">
        <h1 className="text-3xl font-bold text-gray-900">إدارة جرد المخازن</h1>
        
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'count' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('count')}
          >
            جرد الكميات
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('history')}
          >
            سجل الجرد
          </button>
        </div>
      </div>

      {fetchingWarehouses ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="mr-2">جاري تحميل البيانات...</span>
        </div>
      ) : activeTab === 'count' ? (
        <InventoryCountForm 
          warehouses={warehouses} 
          onSuccess={handleSuccess}
          initialWarehouse={warehouses[0]?._id || ""}
        />
      ) : (
        <div>سجل الجرد سيظهر هنا</div>
      )}
    </div>
  );
};

export default WarehouseInventory;