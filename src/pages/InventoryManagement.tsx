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
import { getAllWarehouses, getProductsByWarehouse, Warehouse } from '../api/warehouseAPI';
import { Product } from '../api/TransferWarehouse';

interface InventoryItem {
  id: string;
  productName: string;
  productCode: string;
  price: number;
  warehouseQuantity: number;
  reservedQuantity: number;
  expectedQuantity: number;
  countedQuantity: number;
  shortage: number;
  shortageCost: number;
  category: string;
  lastUpdated: string;
}

const InventoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([
    {
      id: '1',
      productName: 'جهاز كمبيوتر محمول',
      productCode: 'LPT-001',
      price: 4500,
      warehouseQuantity: 150,
      reservedQuantity: 30,
      expectedQuantity: 120,
      countedQuantity: 115,
      shortage: 5,
      shortageCost: 25000,
      category: 'إلكترونيات',
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      productName: 'هاتف ذكي',
      productCode: 'PHN-002',
      price: 3000,
      warehouseQuantity: 200,
      reservedQuantity: 45,
      expectedQuantity: 155,
      countedQuantity: 150,
      shortage: 5,
      shortageCost: 15000,
      category: 'إلكترونيات',
      lastUpdated: '2024-01-14'
    },
    {
      id: '3',
      productName: 'شاشة LED',
      productCode: 'MON-003',
      price: 1200,
      warehouseQuantity: 80,
      reservedQuantity: 10,
      expectedQuantity: 70,
      countedQuantity: 72,
      shortage: -2,
      shortageCost: 0,
      category: 'شاشات',
      lastUpdated: '2024-01-13'
    },
    {
      id: '4',
      productName: 'لوحة مفاتيح',
      productCode: 'KBD-004',
      price: 150,
      warehouseQuantity: 300,
      reservedQuantity: 60,
      expectedQuantity: 240,
      countedQuantity: 235,
      shortage: 5,
      shortageCost: 2500,
      category: 'ملحقات',
      lastUpdated: '2024-01-12'
    },
    {
      id: '5',
      productName: 'ماوس لاسلكي',
      productCode: 'MOU-005',
      price: 90,
      warehouseQuantity: 250,
      reservedQuantity: 40,
      expectedQuantity: 210,
      countedQuantity: 210,
      shortage: 0,
      shortageCost: 0,
      category: 'ملحقات',
      lastUpdated: '2024-01-11'
    }
  ]);

 

  const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
      const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        console.log(selectedWarehouse)

        const fetchProducts= async()=>{
          try{
            const product= await getProductsByWarehouse(selectedWarehouse)
            setProducts(product.products)
            console.log(product.products)
          }
          catch(error){
            console.log(error)

          }
        }
      
    
  

  // Filter data based on search (تم حذف فلترة الفئات)
  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = true; // سيتم استبدالها لاحقًا بحقل المخزن الحقيقي عبر الـ API
    return matchesSearch && matchesWarehouse;
  });
 const fetchWarehouses=async()=>{
    try{
      const data = await getAllWarehouses()
      console.log(data.warehouses)
      setWarehouses(data.warehouses)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchWarehouses()
  
  
  }, [])

useEffect(() => {
  if (selectedWarehouse && selectedWarehouse !== 'all') {
    fetchProducts()
  }
}, [selectedWarehouse])
  
  
  

  // Calculate totals
  const totals = {
    warehouseQuantity: inventoryData.reduce((sum, item) => sum + item.warehouseQuantity, 0),
    reservedQuantity: inventoryData.reduce((sum, item) => sum + item.reservedQuantity, 0),
    expectedQuantity: inventoryData.reduce((sum, item) => sum + item.expectedQuantity, 0),
    countedQuantity: inventoryData.reduce((sum, item) => sum + item.countedQuantity, 0),
    shortage: inventoryData.reduce((sum, item) => sum + item.shortage, 0),
    shortageCost: inventoryData.reduce((sum, item) => sum + item.shortageCost, 0),
    // إجمالي تكلفة المخزون = سعر المنتج × الكمية في المخزن (مجموع لجميع المنتجات)
    totalInventoryCost: inventoryData.reduce((sum, item) => sum + (item.price * item.warehouseQuantity), 0),
    // إجمالي تكلفة المخزون المتوقعة = سعر المنتج × الكمية المتوقعة (مجموع لجميع المنتجات)
    totalExpectedInventoryCost: inventoryData.reduce((sum, item) => sum + (item.price * item.expectedQuantity), 0)
  };

  // Calculate statistics
  const stats = {
    totalItems: inventoryData.length,
    itemsWithShortage: inventoryData.filter(item => item.shortage > 0).length,
    itemsOverstock: inventoryData.filter(item => item.shortage < 0).length,
    itemsInStock: inventoryData.filter(item => item.shortage === 0).length
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
        'قيمة مخزون المنتج المتوقعة'
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

      // Data rows
      filteredData.forEach((item, index) => {
        const row = sheet.addRow([
          index + 1,
          item.productName,
          item.productCode,
          item.price,
          item.warehouseQuantity,
          item.expectedQuantity,
          item.price * item.warehouseQuantity,
          item.price * item.expectedQuantity,
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
        'قيمة مخزون المنتج المتوقعة'
      ];
      const maxLens = headers.map(h => h.length);
      filteredData.forEach((item) => {
        maxLens[0] = Math.max(maxLens[0], String(filteredData.length).length);
        maxLens[1] = Math.max(maxLens[1], item.productName.length);
        maxLens[2] = Math.max(maxLens[2], item.productCode.length);
        maxLens[3] = Math.max(maxLens[3], item.price.toLocaleString().length);
        maxLens[4] = Math.max(maxLens[4], item.warehouseQuantity.toLocaleString().length);
        maxLens[5] = Math.max(maxLens[5], item.expectedQuantity.toLocaleString().length);
        maxLens[6] = Math.max(maxLens[6], (item.price * item.warehouseQuantity).toLocaleString().length);
        maxLens[7] = Math.max(maxLens[7], (item.price * item.expectedQuantity).toLocaleString().length);
      });
      const minWidths = [6, 14, 12, 12, 12, 12, 14, 14];
      const maxWidths = [9, 40, 20, 16, 16, 16, 30, 32];
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
        filteredData.reduce((sum, i) => sum + i.warehouseQuantity, 0),
        filteredData.reduce((sum, i) => sum + i.expectedQuantity, 0),
        filteredData.reduce((sum, i) => sum + i.price * i.warehouseQuantity, 0),
        filteredData.reduce((sum, i) => sum + i.price * i.expectedQuantity, 0),
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

  // حذف منتج مع التأكيد والتحقق من أن الكمية تساوي 0
  const handleDelete = (item: InventoryItem) => {
    if (item.warehouseQuantity > 0) {
      alert('لا يمكن حذف منتج به مخزون. يجب أن تكون الكمية 0 لحذف المنتج من المخزن.');
      return;
    }
    const confirmed = window.confirm(`هل أنت متأكد من حذف المنتج "${item.productName}" من المستودع؟ لن يمكن التراجع عن هذه العملية.`);
    if (!confirmed) return;
    setInventoryData(prev => prev.filter(i => i.id !== item.id));
  };

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

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 md:order-2">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث في المنتجات (الاسم أو الكود)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
            />
          </div>

          {/* Warehouse Selector positioned to the right of search */}
          <div className="relative min-w-[220px] md:order-1">
            <Building className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
              title="اختيار المخزن"
            >
              {warehouses.map((item)=>{
                return <>
                                <option key={item._id} value={item._id}>{item.name}</option>

                </>

              })}

            </select>
          </div>

          
        </div>
      </div>

      {/* Table */}
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
                <th className="px-3 md:px-6 py-4 text-right text-sm font-semibold text-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr 
                  key={item.id} 
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
                        <div className="font-medium text-foreground whitespace-normal break-words">{item.productName}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4">
                    <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded break-all inline-block max-w-full">
                      {item.productCode}
                    </span>
                  </td>
            <td className="px-3 md:px-6 py-4 font-medium break-words">{item.price.toLocaleString()}</td>
                  <td className="px-3 md:px-6 py-4 font-medium break-words">{item.warehouseQuantity.toLocaleString()}</td>
                  <td className="px-3 md:px-6 py-4 text-blue-600 font-medium break-words">{item.expectedQuantity.toLocaleString()}</td>
            <td className="px-3 md:px-6 py-4 font-medium break-words">{(item.price * item.warehouseQuantity).toLocaleString()}</td>
            <td className="px-3 md:px-6 py-4 font-medium break-words">{(item.price * item.expectedQuantity).toLocaleString()}</td>
                  <td className="px-3 md:px-6 py-4">
                    <button
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={item.warehouseQuantity > 0 ? 'لا يمكن الحذف إلا عندما تكون الكمية 0' : 'حذف المنتج من المخزن'}
                      onClick={() => handleDelete(item)}
                      disabled={item.warehouseQuantity > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
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