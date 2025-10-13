import React, { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ClipboardList, 
  Filter, 
  Download, 
  Search,

  Banknote,
  DollarSign,
  Percent,
  Archive,
  Plus,
  Trash2,
  Building
} from 'lucide-react';
import { getAllProductInWarehouse, WarehouseProductsFilters } from '../api/warehouseAPI';

const InventoryManagement: React.FC = () => {
  const navigate = useNavigate();

 

  const [searchTerm, setSearchTerm] = useState('');

  // عرض المنتجات القادمة من الـ API في جدول أسفل الصفحة
  interface DisplayProduct {
    _id: string;
    name: string;
    sku: string;
    price: number; // السعر قبل الخصم
    quantity: number; // الكمية في المخزن
    warehouseName?: string;
    location?: string;
  }
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [warehouseOptions, setWarehouseOptions] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

        console.log(selectedWarehouse)

        // إعداد فلاتر جلب المنتجات من الـ API
        const [filters, setFilters] = useState<WarehouseProductsFilters>({
          sort: 'name',
          order: 'asc',
          page: 1,
          limit: 20,
        });

        const loadProducts = async () => {
          try {
            setIsLoading(true);
            const response: any = await getAllProductInWarehouse({
              ...filters,
              warehouseId: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
              term: searchTerm || undefined,
            });

            // تحويل الاستجابة إلى قائمة منتجات مسطحة للعرض
            let products: DisplayProduct[] = [];
            if (response.warehouses) {
              // بناء خيارات المخازن من الاستجابة
              const opts = (response.warehouses || []).map((w: any) => ({ id: w.id ?? w._id, name: w.name }));
              setWarehouseOptions(opts);
              products = response.warehouses.flatMap((w: any) =>
                (w.products || []).map((p: any) => ({
                  _id: p._id,
                  name: p.name,
                  sku: p.sku,
                  price: p.priceBeforeDiscount,
                  quantity: p.quantity,
                  warehouseName: w.name,
                  location: w.location,
                }))
              );
            } else if (response.products) {
              products = (response.products || []).map((p: any) => ({
                _id: p._id,
                name: p.name,
                sku: p.sku,
                price: p.priceBeforeDiscount,
                quantity: p.quantity,
                warehouseName: p.warehouse?.name,
                location: p.warehouse ? `${p.warehouse.city}, ${p.warehouse.district}` : undefined,
              }));
            }

            setDisplayProducts(products);
          } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
          } finally {
            setIsLoading(false);
          }
        };
      
    
  

  // Filter data based on search (تم حذف فلترة الفئات)
  // لم تعد هناك بيانات تجريبية. يتم الاعتماد على بيانات API فقط.


useEffect(() => {
  // جلب المنتجات عند تغيير المخزن أو البحث أو الفلاتر
  loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedWarehouse, searchTerm, filters.sort, filters.order, filters.page, filters.limit])
  
  // الحسابات تعتمد على بيانات العرض القادمة من الـ API
  const totals = {
    warehouseQuantity: displayProducts.reduce((sum, item) => sum + (item.quantity || 0), 0),
    expectedQuantity: displayProducts.length, // الكمية المتوقعة لكل منتج = 1
    totalInventoryCost: displayProducts.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0),
    totalExpectedInventoryCost: displayProducts.reduce((sum, item) => sum + (item.price || 0), 0)
  };

  const stats = {
    totalItems: displayProducts.length,
    itemsInStock: displayProducts.filter(item => (item.quantity || 0) > 0).length
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const exportData = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('تقرير المخزون', {
        views: [{ rightToLeft: true, state: 'frozen', ySplit: 1 }],
        pageSetup: {
          orientation: 'portrait',
          paperSize: 9, // A4
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 }
        }
      });
      // تحويل لون الثيم الأساسي (HSL) إلى ARGB لاستخدامه في الإكسل
      const hslToRgb = (h: number, s: number, l: number) => {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const hp = h / 60;
        const x = c * (1 - Math.abs((hp % 2) - 1));
        let r1 = 0, g1 = 0, b1 = 0;
        if (0 <= hp && hp < 1) { r1 = c; g1 = x; }
        else if (1 <= hp && hp < 2) { r1 = x; g1 = c; }
        else if (2 <= hp && hp < 3) { g1 = c; b1 = x; }
        else if (3 <= hp && hp < 4) { g1 = x; b1 = c; }
        else if (4 <= hp && hp < 5) { r1 = x; b1 = c; }
        else if (5 <= hp && hp < 6) { r1 = c; b1 = x; }
        const m = l - c / 2;
        const r = Math.round((r1 + m) * 255);
        const g = Math.round((g1 + m) * 255);
        const b = Math.round((b1 + m) * 255);
        return { r, g, b };
      };
      const parsePrimaryToArgb = () => {
        try {
          const hsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
          const [hStr, sStr, lStr] = hsl.split(' ');
          const h = parseFloat(hStr);
          const s = parseFloat(sStr) / 100;
          const l = parseFloat(lStr) / 100;
          const { r, g, b } = hslToRgb(h, s, l);
          const toHex = (v: number) => v.toString(16).padStart(2, '0').toUpperCase();
          return 'FF' + toHex(r) + toHex(g) + toHex(b);
        } catch {
          return 'FF6E56CF'; // لون افتراضي في حال فشل القراءة
        }
      };
      const primaryArgb = parsePrimaryToArgb();
      // تكرار صف العنوان في كل صفحة مطبوعة
      // @ts-ignore
      sheet.pageSetup.printTitlesRow = '1:1';

      // Header styling
      const headerRow = sheet.addRow([
        '#',
        'المنتج',
        'رمز SKU',
        'سعر المنتج',
        'الكمية في المخزن',
        'الكمية المتوقعة',
        'قيمة مخزون المنتج',
        'قيمة مخزون المنتج المتوقعة',
        'المخزن',
      ]);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryArgb } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        };
      });
      // زيادة ارتفاع صف العنوان لتحسين التباعد
      headerRow.height = 22;

      // Data rows من displayProducts
      displayProducts.forEach((item, index) => {
        const row = sheet.addRow([
          index + 1,
          item.name,
          item.sku,
          item.price || 0,
          item.quantity || 0,
          1,
          (item.price || 0) * (item.quantity || 0),
          (item.price || 0) * 1,
          item.warehouseName || '',
        ]);
        row.eachCell((cell, colNumber) => {
          const isMoney = colNumber === 4 || colNumber === 7 || colNumber === 8; // price and totals
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          };
          if (isMoney) {
            cell.numFmt = '#,##0';
          } else if (typeof cell.value === 'number') {
            cell.numFmt = '#,##0';
          }
        });
      });

      // Auto-fit column widths based on header and content lengths
      const headers = [
        '#',
        'المنتج',
        'رمز SKU',
        'سعر المنتج',
        'الكمية في المخزن',
        'الكمية المتوقعة',
        'قيمة مخزون المنتج',
        'قيمة مخزون المنتج المتوقعة',
        'المخزن',
      ];
      const maxLens = headers.map(h => h.length);
      maxLens[0] = Math.max(maxLens[0], String(displayProducts.length).length);
      displayProducts.forEach((item) => {
        maxLens[1] = Math.max(maxLens[1], item.name.length);
        maxLens[2] = Math.max(maxLens[2], (item.sku || '').length);
        maxLens[3] = Math.max(maxLens[3], (item.price || 0).toLocaleString().length);
        maxLens[4] = Math.max(maxLens[4], (item.quantity || 0).toLocaleString().length);
        maxLens[5] = Math.max(maxLens[5], String(1).length);
        maxLens[6] = Math.max(maxLens[6], ((item.price || 0) * (item.quantity || 0)).toLocaleString().length);
        maxLens[7] = Math.max(maxLens[7], ((item.price || 0) * 1).toLocaleString().length);
        maxLens[8] = Math.max(maxLens[8], (item.warehouseName || '').length);
      });
      const minWidths = [6, 14, 12, 12, 12, 12, 14, 14, 14];
      const maxWidths = [9, 40, 20, 16, 16, 16, 30, 32, 24];
      const padding = 4;
      maxLens.forEach((len, i) => {
        const w = Math.min(Math.max(len + padding, minWidths[i]), maxWidths[i]);
        sheet.getColumn(i + 1).width = w;
      });
      // ضبط عرض عمود "الكمية في المخزن" إلى 15 كعرض ثابت مناسب
      sheet.getColumn(5).width = 20;
      if ((sheet.getColumn(6).width || 0) < 18) sheet.getColumn(6).width = 18;

      // Footer totals similar to UI cards
      const totalsRow = sheet.addRow([
        '',
        'الإجماليات',
        '',
        '',
        displayProducts.reduce((sum, i) => sum + (i.quantity || 0), 0),
        displayProducts.length,
        displayProducts.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 0)), 0),
        displayProducts.reduce((sum, i) => sum + (i.price || 0), 0),
      ]);
      totalsRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'right' };
        if (colNumber >= 5) cell.numFmt = '#,##0';
        if (colNumber >= 7) cell.numFmt = '#,##0';
      });

      // Arabic-friendly default font
      // زيادة ارتفاع الصفوف الافتراضي وتحسين الخط العربي
      // @ts-ignore
      sheet.properties.defaultRowHeight = 20;
      sheet.eachRow((row) => row.eachCell((cell) => {
        cell.font = { ...(cell.font || {}), name: 'Tahoma' };
      }));

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'inventory_report.xlsx');
    } catch (err) {
      console.error('Excel export failed', err);
    }
  };

  // تم حذف دوال قديمة مرتبطة ببيانات تجريبية

  // تم حذف قائمة الفئات، لذلك لا حاجة لمتغير categories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">إدارة الكميات في المخزن</h1>
          <p className="text-muted-foreground mt-2">متابعة وإدارة مخزون المنتجات والكميات</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Add Inventory */}
          <button 
            onClick={() => navigate('/warehouse-inventory/add')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة مخزون
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {/* إجمالي عدد المنتجات */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-soft relative min-h-[120px] flex items-center">
          <div className="pl-20 mt-[20px]">
            <p className="text-sm font-medium text-muted-foreground -mt-[35px]">إجمالي عدد المنتجات</p>
            <p className="text-2xl font-bold mt-[20px] text-foreground">{stats.totalItems}</p>
          </div>
          <Package className="w-12 h-12 text-primary absolute left-6 top-1/2 -translate-y-1/2" />
        </div>

        {/* إجمالي كمية المخزون */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-soft relative min-h-[120px] flex items-center">
          <div className="pl-20 mt-[20px]">
            <p className="text-sm font-medium text-muted-foreground -mt-[35px]">إجمالي كمية المخزون</p>
            <p className="text-2xl font-bold mt-[20px] text-foreground">{totals.warehouseQuantity.toLocaleString()}</p>
          </div>
          <Archive className="w-12 h-12 text-primary absolute left-6 top-1/2 -translate-y-1/2" />
        </div>

        {/* إجمالي كمية المخزون المتوقعة */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-soft relative min-h-[120px] flex items-center">
          <div className="pl-20 mt-[10px]">
            <p className="text-sm font-medium text-muted-foreground truncate whitespace-nowrap -mt-[35px]">إجمالي كمية المخزون المتوقعة</p>
            <p className="text-2xl font-bold mt-[20px] text-foreground">{totals.expectedQuantity.toLocaleString()}</p>
          </div>
          <ClipboardList className="w-12 h-12 text-primary absolute left-6 top-1/2 -translate-y-1/2" />
        </div>

        {/* منتجات متوازنة (نسبة مئوية) */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-soft relative min-h-[120px] flex items-center">
          <div className="pl-20 mt-[10px]">
            <p className="text-sm font-medium text-muted-foreground -mt-[35px]">منتجات متوازنة</p>
            <p className="text-2xl font-bold mt-[20px] text-foreground">{stats.totalItems ? Math.round((stats.itemsInStock / stats.totalItems) * 100) : 0}</p>
          </div>
          <Percent className="w-12 h-12 text-primary absolute left-6 top-1/2 -translate-y-1/2" />
        </div>

        {/* إجمالي تكلفة المخزون */}
        <div className="bg-white border border-border p-6 rounded-xl shadow-soft relative min-h-[120px] flex items-center">
          <div className="pl-20 mt-[10px]">
            <p className="text-sm font-medium text-muted-foreground truncate whitespace-nowrap -mt-[35px]">إجمالي تكلفة المخزون</p>
            <p className="text-2xl font-bold mt-[20px] text-foreground">{totals.totalInventoryCost.toLocaleString()}</p>
          </div>
          <Banknote className="w-12 h-12 text-primary absolute left-6 top-1/2 -translate-y-1/2" />
        </div>

        {/* إجمالي تكلفة المخزون المتوقعة */}
        <div className="bg-white border border-border p-4 rounded-xl shadow-soft relative min-h-[120px] flex items-center">
          <div className="pl-20 mt-[10px]">
            <p className="text-sm font-medium text-muted-foreground truncate whitespace-nowrap -mt-[35px]">إجمالي تكلفة المخزون المتوقعة</p>
            <p className="text-2xl font-bold mt-[20px] text-foreground">{totals.totalExpectedInventoryCost.toLocaleString()}</p>
          </div>
          <DollarSign className="w-12 h-12 text-primary absolute left-6 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* تم حذف قسم "ملخص الكميات" بناءً على طلب المستخدم */}

      {/* Actions Above Filters */}
      <div className="flex items-center justify-start mb-2">
        <div className="flex items-center gap-3">
          {/* زر تصفية أعلى البطاقة بمحاذاة اليمين */}
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Filter className="w-4 h-4" />
            تصفية
          </button>
          {/* زر التصدير بجانب زر التصفية بدون مسافة */}
          <button 
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-white text-foreground border border-primary rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
        </div>
      </div>

      {/* Filters - Responsive */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* بحث بالاسم */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
            />
          </div>

          {/* بحث بالكود SKU */}
          <input
            type="text"
            placeholder="بحث بالكود SKU..."
            value={filters.sku || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, sku: e.target.value || undefined }))}
            className="w-full py-3 px-4 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
          />

          {/* اختيار المخزن */}
          <div className="relative">
            <Building className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
            >
              <option value="all">كل المخازن</option>
              {warehouseOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          {/* المتوفر فقط */}
          <div className="flex items-center gap-2">
            <input
              id="inStock"
              type="checkbox"
              checked={!!filters.inStock}
              onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
              className="w-5 h-5"
            />
            <label htmlFor="inStock" className="text-sm">المتوفر فقط</label>
          </div>

          {/* الحد الأدنى/الأقصى للكمية */}
          <input
            type="number"
            min={0}
            placeholder="الحد الأدنى للكمية"
            value={filters.minQty ?? ''}
            onChange={(e) => setFilters(prev => ({ ...prev, minQty: e.target.value ? Number(e.target.value) : undefined }))}
            className="w-full py-3 px-4 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
          />
          <input
            type="number"
            min={0}
            placeholder="الحد الأقصى للكمية"
            value={filters.maxQty ?? ''}
            onChange={(e) => setFilters(prev => ({ ...prev, maxQty: e.target.value ? Number(e.target.value) : undefined }))}
            className="w-full py-3 px-4 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
          />

          {/* الحد الأدنى/الأقصى للسعر */}
          <input
            type="number"
            min={0}
            placeholder="الحد الأدنى للسعر"
            value={filters.minPrice ?? ''}
            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
            className="w-full py-3 px-4 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
          />
          <input
            type="number"
            min={0}
            placeholder="الحد الأقصى للسعر"
            value={filters.maxPrice ?? ''}
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
            className="w-full py-3 px-4 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
          />

          {/* الترتيب */}
          <select
            value={filters.sort}
            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            className="w-full py-3 px-4 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
          >
            <option value="name">الاسم</option>
            <option value="sku">الكود</option>
            <option value="quantity">الكمية</option>
            <option value="priceBeforeDiscount">السعر</option>
          </select>
          <select
            value={filters.order}
            onChange={(e) => setFilters(prev => ({ ...prev, order: e.target.value as 'asc' | 'desc' }))}
            className="w-full py-3 px-4 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
          >
            <option value="asc">تصاعدي</option>
            <option value="desc">تنازلي</option>
          </select>

          {/* الترقيم */}
          <input
            type="number"
            min={1}
            placeholder="صفحة"
            value={filters.page ?? 1}
            onChange={(e) => setFilters(prev => ({ ...prev, page: Number(e.target.value) }))}
            className="w-full py-3 px-4 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
          />
          <input
            type="number"
            min={1}
            placeholder="عدد العناصر"
            value={filters.limit ?? 20}
            onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value) }))}
            className="w-full py-3 px-4 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white"
          />
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Filter className="w-4 h-4" />
            تطبيق الفلاتر
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedWarehouse('all');
              setFilters({ sort: 'name', order: 'asc', page: 1, limit: 20 });
              loadProducts();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-foreground border border-primary rounded-lg"
          >
            إعادة الضبط
          </button>
        </div>
      </div>

      {/* Table - المنتجات مع القيم الحالية والمتوقعة */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden max-w-full">
        <div className="overflow-x-hidden max-w-full">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary/50 to-primary/30">
              <tr>
                <th className="px-3 md:px-6 py-4 text-right text-sm font-semibold text-foreground">#</th>
                <th className="px-3 md:px-6 py-4 text-right text-sm font-semibold text-foreground">المنتج</th>
                <th className="px-3 md:px-6 py-4 text-right text-sm font-semibold text-foreground">رمز SKU</th>
                <th className="px-3 md:px-6 py-4 text-right text-sm font-semibold text-foreground">سعر المنتج</th>
                <th className="px-3 md:px-6 py-4 text-right text-sm font-semibold text-foreground">الكمية في المخزن</th>
                <th className="px-3 md:px-6 py-4 text-right text-sm font-semibold text-foreground">الكمية المتوقعة</th>
                <th className="px-3 md:px-6 py-4 text-right text-sm font-semibold text-foreground">قيمة مخزون المنتج</th>
                <th className="px-3 md:px-6 py-4 text-right text-sm font-semibold text-foreground">قيمة مخزون المنتج المتوقعة</th>
                <th className="px-3 md:px-6 py-4 text-right text-sm font-semibold text-foreground">المخزن</th>

              </tr>
            </thead>
            <tbody>
              {displayProducts.map((item, index) => (
                <tr 
                  key={item._id} 
                  className={`border-b border-border hover:bg-secondary/30 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/10'
                  }`}
                >
                  <td className="px-3 md:px-6 py-4 text-sm font-medium">{index + 1}</td>
                  <td className="px-3 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground whitespace-normal break-words">{item.name}</div>
                        {item.location && (
                          <div className="text-xs text-muted-foreground truncate">{item.location}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4">
                    <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded break-all inline-block max-w-full">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 font-medium break-words">{item.price.toLocaleString()}</td>
                  <td className="px-3 md:px-6 py-4 font-medium break-words">{item.quantity.toLocaleString()}</td>
                  <td className="px-3 md:px-6 py-4 text-blue-600 font-medium break-words">1</td>
                  <td className="px-3 md:px-6 py-4 font-medium break-words">{(item.price * item.quantity).toLocaleString()}</td>
                  <td className="px-3 md:px-6 py-4 font-medium break-words">{(item.price * 1).toLocaleString()}</td>
                  <td className="px-3 md:px-6 py-4 font-medium break-words">{item.warehouseName || '-'}</td>
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>
        {displayProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">لم يتم العثور على منتجات تطابق معايير البحث</p>
          </div>
        )}
      </div>

      {/* تم حذف تنبيه "يوجد منتجات بها عجز" بناءً على طلب المستخدم */}
    </div>
  );
};

export default InventoryManagement;