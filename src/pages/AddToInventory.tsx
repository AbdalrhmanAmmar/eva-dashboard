import React, { useEffect, useMemo, useState, useRef } from "react";
import { Loader2, Package, Building as WarehouseIcon, StickyNote, Plus, X, Trash2, Boxes, PlusCircle, TrendingUp, Percent, Banknote } from "lucide-react";
import { Button } from "../components/ui/button";

interface Warehouse {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  images?: { url: string }[];
  serialNumber?: string;
  price?: number;
}

const mockWarehouses: Warehouse[] = [
  { _id: "w1", name: "المخزن الرئيسي" },
  { _id: "w2", name: "مخزن الفرع - شمال" },
  { _id: "w3", name: "مخزن الفرع - جنوب" },
];

const mockProductsByWarehouse: Record<string, Product[]> = {
  w1: [
    { _id: "p1", name: "منتج A", sku: "SKU-A-001", quantity: 120, reservedQuantity: 10, images: [{ url: "laptop1.jpg" }], serialNumber: "SN-A-001", price: 399.5 },
    { _id: "p2", name: "منتج B", sku: "SKU-B-002", quantity: 80, reservedQuantity: 5, images: [{ url: "iphone1.jpg" }], serialNumber: "SN-B-002", price: 249.9 },
    { _id: "p3", name: "منتج C", sku: "SKU-C-003", quantity: 35, reservedQuantity: 2, images: [{ url: "voucher1.jpg" }], serialNumber: "SN-C-003", price: 99.0 },
  ],
  w2: [
    { _id: "p4", name: "منتج D", sku: "SKU-D-004", quantity: 50, reservedQuantity: 8, images: [{ url: "bundle1.jpg" }], serialNumber: "SN-D-004", price: 149.75 },
    { _id: "p5", name: "منتج E", sku: "SKU-E-005", quantity: 20, reservedQuantity: 1, images: [{ url: "laptop1.jpg" }], serialNumber: "SN-E-005", price: 799.0 },
  ],
  w3: [
    { _id: "p6", name: "منتج F", sku: "SKU-F-006", quantity: 200, reservedQuantity: 25, images: [{ url: "iphone1.jpg" }], serialNumber: "SN-F-006", price: 59.9 },
  ],
};

const AddToInventory: React.FC = () => {
  const [requestName, setRequestName] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<{ product: Product; addQuantity: number | null }[]>([]);
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  const [optionSearch, setOptionSearch] = useState("");
  // Barcode scanning helpers
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanValue, setScanValue] = useState("");
  const [isTypingQty, setIsTypingQty] = useState(false);

  // عند تغيير المخزن، نفرغ المنتجات المختارة والقائمة المعلقة ونغلق قائمة الإضافة
  useEffect(() => {
    setSelectedProducts([]);
    setPendingSelection([]);
    setAddMenuOpen(false);
    setOptionSearch("");
  }, [warehouseId]);

  const products = useMemo(() => {
    setIsLoading(true);
    const items = warehouseId ? mockProductsByWarehouse[warehouseId] || [] : [];
    // محاكاة تحميل سريع
    setTimeout(() => setIsLoading(false), 300);
    return items;
  }, [warehouseId]);

  const availableOptions = useMemo(() => {
    const pool = warehouseId ? mockProductsByWarehouse[warehouseId] || [] : [];
    // استبعاد المنتجات المضافة بالفعل لمنع التكرار
    const existingIds = new Set(selectedProducts.map(sp => sp.product._id));
    return pool.filter(p => !existingIds.has(p._id));
  }, [warehouseId, selectedProducts]);

  const filteredOptions = useMemo(() => {
    const q = optionSearch.trim().toLowerCase();
    if (!q) return availableOptions;
    return availableOptions.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.serialNumber?.toLowerCase?.() || "").includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  }, [availableOptions, optionSearch]);

  const handleAddProduct = (p: Product) => {
    setSelectedProducts(prev => [...prev, { product: p, addQuantity: null }]);
    setAddMenuOpen(false);
  };

  const updateAddQuantity = (id: string, qty: number | null) => {
    setSelectedProducts(prev => prev.map(sp => sp.product._id === id ? { ...sp, addQuantity: qty } : sp));
  };

  const removeSelectedProduct = (id: string) => {
    setSelectedProducts(prev => prev.filter(sp => sp.product._id !== id));
  };

  const togglePendingSelection = (id: string) => {
    setPendingSelection(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const confirmSelection = () => {
    if (!warehouseId) return;
    const pool = warehouseId ? mockProductsByWarehouse[warehouseId] || [] : [];
    const itemsToAdd = pool.filter(p => pendingSelection.includes(p._id));
    setSelectedProducts(prev => {
      const existing = new Set(prev.map(sp => sp.product._id));
      const newItems = itemsToAdd.filter(p => !existing.has(p._id)).map(p => ({ product: p, addQuantity: null }));
      return [...prev, ...newItems];
    });
    setPendingSelection([]);
    setAddMenuOpen(false);
  };

  // معالجة نتيجة المسح: مطابقة الرقم التسلسلي أو SKU ضمن المخزن المحدد
  const processScan = (code: string) => {
    if (!warehouseId) return;
    const pool = warehouseId ? mockProductsByWarehouse[warehouseId] || [] : [];
    const match = pool.find(p => (p.serialNumber && p.serialNumber === code) || p.sku === code);
    if (match) {
      setSelectedProducts(prev => {
        // منع التكرار إذا كان المنتج مضافًا بالفعل
        if (prev.some(sp => sp.product._id === match._id)) return prev;
        return [...prev, { product: match, addQuantity: null }];
      });
    }
  };

  // إبقاء مدخل المسح في التركيز عندما يكون هناك مخزن محدد ولا توجد كتابة في خانة الكمية
  useEffect(() => {
    if (warehouseId && !addMenuOpen && !isTypingQty) {
      const t = setTimeout(() => {
        scanInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [warehouseId, addMenuOpen, isTypingQty, selectedProducts]);

  // ملخصات الحسابات للمنتجات المختارة والتي تم إدخال كمية لها
  const metrics = useMemo(() => {
    const withQty = selectedProducts.filter(sp => (sp.addQuantity ?? 0) > 0);
    const totalSelectedCount = withQty.length;
    const totalAddedQty = withQty.reduce((sum, sp) => sum + (sp.addQuantity ?? 0), 0);
    const totalStockSelected = withQty.reduce((sum, sp) => sum + (sp.product.quantity ?? 0), 0);
    const avgIncreasePercent = totalStockSelected > 0 ? (totalAddedQty / totalStockSelected) * 100 : 0;
    const totalAddedCost = withQty.reduce((sum, sp) => sum + ((sp.product.price ?? 0) * (sp.addQuantity ?? 0)), 0);
    return { totalSelectedCount, totalAddedQty, avgIncreasePercent, totalAddedCost };
  }, [selectedProducts]);

  const handleSubmit = () => {
    // إجراء شكلي فقط
    console.log("Submit request", { requestName, warehouseId, notes, items: selectedProducts });
    alert("تم تقديم الطلب (شكلًا فقط)");
  };

  const handleSaveDraft = () => {
    // إجراء شكلي فقط
    console.log("Save draft", { requestName, warehouseId, notes, items: selectedProducts });
    alert("تم الحفظ كمسودة (شكلًا فقط)");
  };

  return (
    <div className="space-y-6">
      {/* مدخل مخفي لالتقاط الباركود من ماسح لوحة المفاتيح */}
      <input
        ref={scanInputRef}
        type="text"
        value={scanValue}
        onChange={(e) => setScanValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const code = scanValue.trim();
            if (code) processScan(code);
            setScanValue('');
          }
        }}
        aria-hidden="true"
        className="absolute -left-[10000px] -top-[10000px] opacity-0"
        tabIndex={0}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">إضافة إلى المخزون</h1>
      </div>

      {/* ملخص المؤشرات المطلوبة - دائمًا في الأعلى */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* إجمالي عدد المنتجات */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-soft relative min-h-[120px] flex items-center">
          <div className="pl-20">
            <p className="text-sm font-medium text-muted-foreground">إجمالي عدد المنتجات</p>
            <p className="text-2xl font-bold mt-2 text-foreground">{metrics.totalSelectedCount}</p>
          </div>
          <Boxes className="w-12 h-12 text-primary absolute left-6 top-1/2 -translate-y-1/2" />
        </div>
        {/* إجمالي كمية المخزون المضافة */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-soft relative min-h-[120px] flex items-center">
          <div className="pl-20">
            <p className="text-sm font-medium text-muted-foreground">إجمالي كمية المخزون المضافة</p>
            <p className="text-2xl font-bold mt-2 text-foreground">{metrics.totalAddedQty}</p>
          </div>
          <PlusCircle className="w-12 h-12 text-primary absolute left-6 top-1/2 -translate-y-1/2" />
        </div>
        {/* متوسط ارتفاع نسبة مخزون المنتجات المختارة */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-soft relative min-h-[120px] flex items-center">
          <div className="pl-20">
            <p className="text-sm font-medium text-muted-foreground">متوسط ارتفاع نسبة مخزون المنتجات المختارة</p>
            <p className="text-2xl font-bold mt-2 text-foreground">{metrics.avgIncreasePercent.toFixed(2)}%</p>
          </div>
          <TrendingUp className="w-12 h-12 text-primary absolute left-6 top-1/2 -translate-y-1/2" />
        </div>
        {/* إجمالي تكلفة المخزون المضاف */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-soft relative min-h-[120px] flex items-center">
          <div className="pl-20">
            <p className="text-sm font-medium text-muted-foreground">إجمالي تكلفة المخزون المضاف</p>
            <p className="text-2xl font-bold mt-2 text-foreground">{metrics.totalAddedCost.toFixed(2)} ر.س</p>
          </div>
          <Banknote className="w-12 h-12 text-primary absolute left-6 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl shadow-soft p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">اسم طلب إضافة المخزون</label>
            <div className="relative">
              <input
                type="text"
                placeholder="أدخل اسم الطلب"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:ring-2 focus:ring-primary focus:bg-white"
              />
              <StickyNote className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">المخزن المراد إضافة المخزون له</label>
            <div className="relative">
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:ring-2 focus:ring-primary"
              >
                <option value="">اختر مخزنًا</option>
                {mockWarehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
              <WarehouseIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-muted-foreground mb-1">ملاحظة</label>
            <input
              type="text"
              placeholder="أدخل ملاحظة (اختياري)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:ring-2 focus:ring-primary focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">المنتجات</h2>
          {isLoading && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> جارٍ تحميل المنتجات...
            </span>
          )}
        </div>

        {/* شريط أدوات أعلى الجدول */}
        <div className="flex items-center justify-between mb-4">
          {/* زر إضافة */}
          <div className="flex items-center mr-auto">
            <Button 
              type="button"
              variant="default"
              className="gap-2"
              disabled={!warehouseId || availableOptions.length === 0}
              onClick={() => setAddMenuOpen(true)}
            >
              <Plus className="w-4 h-4" />
              إضافة
            </Button>
          </div>
        </div>

        {/* مودال اختيار المنتجات من المخزن المحدد فقط */}
        {addMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setAddMenuOpen(false)} />
            <div className="relative bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-soft border border-border">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">اختيار المنتجات</h3>
                <button className="p-2 hover:bg-secondary rounded-md" onClick={() => setAddMenuOpen(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* محتوى القائمة */}
              <div className="flex-1 overflow-y-auto">
                {availableOptions.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">لا توجد منتجات متاحة للإضافة لهذا المخزن</div>
                ) : (
                  <>
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="ابحث بالاسم، الرقم التسلسلي أو SKU"
                        value={optionSearch}
                        onChange={(e) => setOptionSearch(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary rounded-lg border border-border focus:ring-2 focus:ring-primary focus:bg-white"
                      />
                    </div>
                    {filteredOptions.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">لا توجد نتائج مطابقة للبحث</div>
                    ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50">
                        <th className="w-12 px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer"
                            checked={filteredOptions.length > 0 && filteredOptions.every(p => pendingSelection.includes(p._id))}
                            onChange={() => {
                              const allSelected = filteredOptions.length > 0 && filteredOptions.every(p => pendingSelection.includes(p._id));
                              if (allSelected) {
                                // إلغاء تحديد العناصر الظاهرة فقط
                                setPendingSelection(prev => prev.filter(id => !filteredOptions.some(p => p._id === id)));
                              } else {
                                // إضافة العناصر الظاهرة فقط بدون فقدان الاختيارات السابقة
                                setPendingSelection(prev => {
                                  const set = new Set(prev);
                                  filteredOptions.forEach(p => set.add(p._id));
                                  return Array.from(set);
                                });
                              }
                            }}
                            aria-label="اختيار الكل"
                          />
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">المنتج</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">الرقم التسلسلي</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOptions.map((p, idx) => (
                        <tr key={p._id} className={`border-b border-border ${idx % 2 === 0 ? 'bg-transparent' : 'bg-secondary/20'}`}>
                          <td className="w-12 px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={pendingSelection.includes(p._id)}
                              onChange={() => togglePendingSelection(p._id)}
                              className="h-4 w-4 cursor-pointer"
                              aria-label={`اختيار ${p.name}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                {p.images?.[0]?.url ? (
                                  <img
                                    src={`/uploads/product/${p.images[0].url}`}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{p.name}</div>
                              </div>
                            </div>
                          </td>
                          {/* Serial Number */}
                          <td className="px-4 py-3 text-muted-foreground">{p.serialNumber || '-'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  عدد المختارات: {pendingSelection.length}
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => setAddMenuOpen(false)}>إلغاء</Button>
                  <Button type="button" variant="default" disabled={pendingSelection.length === 0} onClick={confirmSelection}>تأكيد الاختيار</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* جدول العناصر المختارة فقط */}
        {warehouseId === "" && (
          <div className="text-sm text-muted-foreground text-center">الرجاء اختيار مخزن لعرض المنتجات.</div>
        )}

        {warehouseId && selectedProducts.length === 0 && !isLoading && (
          <div className="text-sm text-muted-foreground text-center">لا توجد منتجات مضافة بعد. استخدم زر إضافة لاختيار المنتجات.</div>
        )}

        {selectedProducts.length > 0 && (
          <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">م</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">المنتج</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">الرقم التسلسلي</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">SKU</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">السعر</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">المتاح</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">المحجوز</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">الكمية المراد إضافتها</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">حذف</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((sp, index) => (
                  <tr
                    key={sp.product._id}
                    className={`border-b border-border hover:bg-secondary/30 transition-colors ${
                      index % 2 === 0 ? "bg-transparent" : "bg-secondary/20"
                    }`}
                  >
                    {/* رقم تسلسلي */}
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">{index + 1}</td>
                    {/* دمج الصورة داخل خانة المنتج */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          {sp.product.images?.[0]?.url ? (
                            <img
                              src={`/uploads/product/${sp.product.images[0].url}`}
                              alt={sp.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{sp.product.name}</div>
                        </div>
                      </div>
                    </td>
                    {/* Serial Number */}
                    <td className="px-4 py-3 text-muted-foreground">{sp.product.serialNumber || '-'}</td>
                    {/* SKU */}
                    <td className="px-4 py-3 text-muted-foreground">{sp.product.sku}</td>
                    {/* السعر */}
                    <td className="px-4 py-3 text-muted-foreground">{sp.product.price != null ? `${sp.product.price.toFixed(2)} ر.س` : '-'}</td>
                    {/* المتاح */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-muted-foreground">{sp.product.quantity}</span>
                    </td>
                    {/* المحجوز */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-muted-foreground">{sp.product.reservedQuantity}</span>
                    </td>
                    {/* إدخال الكمية المراد إضافتها - أرقام صحيحة فقط وبدون قيمة افتراضية */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={sp.addQuantity ?? ''}
                        onKeyDown={(e) => {
                          const blocked = ['.', ',', '-', '+', 'e', 'E'];
                          if (blocked.includes(e.key)) e.preventDefault();
                        }}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const cleaned = raw.replace(/[^0-9]/g, '');
                          const qty = cleaned === '' ? null : parseInt(cleaned, 10);
                          updateAddQuantity(sp.product._id, qty);
                        }}
                        onFocus={() => setIsTypingQty(true)}
                        onBlur={() => setIsTypingQty(false)}
                        className="w-24 px-2 py-1 bg-secondary rounded-lg border border-border text-center focus:ring-2 focus:ring-primary"
                        placeholder=""
                        aria-label="الكمية المراد إضافتها"
                      />
                    </td>
                    {/* زر حذف في عمود مستقل */}
                    <td className="px-4 py-3 text-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        aria-label="حذف المنتج"
                        onClick={() => removeSelectedProduct(sp.product._id)}
                        className="mx-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

        {/* أزرار الإجراءات أسفل الصفحة */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            حفظ كمسودة
          </Button>
          <Button type="button" variant="default" onClick={handleSubmit} disabled={!warehouseId || selectedProducts.length === 0}>
            تقديم الطلب
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddToInventory;