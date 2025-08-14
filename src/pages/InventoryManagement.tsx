import React, { useState } from 'react';
import { 
  Package, 
  ClipboardList, 
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
  Archive
} from 'lucide-react';

interface InventoryItem {
  id: string;
  productName: string;
  productCode: string;
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
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([
    {
      id: '1',
      productName: 'جهاز كمبيوتر محمول',
      productCode: 'LPT-001',
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
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  // Filter data based on search and category
  const filteredData = inventoryData.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totals = {
    warehouseQuantity: inventoryData.reduce((sum, item) => sum + item.warehouseQuantity, 0),
    reservedQuantity: inventoryData.reduce((sum, item) => sum + item.reservedQuantity, 0),
    expectedQuantity: inventoryData.reduce((sum, item) => sum + item.expectedQuantity, 0),
    countedQuantity: inventoryData.reduce((sum, item) => sum + item.countedQuantity, 0),
    shortage: inventoryData.reduce((sum, item) => sum + item.shortage, 0),
    shortageCost: inventoryData.reduce((sum, item) => sum + item.shortageCost, 0)
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

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "المنتج,الكود,الكمية في المخزن,الكمية المحجوزة,الكمية المتوقعة,الكمية المجرودة,العجز,تكلفة العجز\n" +
      inventoryData.map(item => 
        `${item.productName},${item.productCode},${item.warehouseQuantity},${item.reservedQuantity},${item.expectedQuantity},${item.countedQuantity},${item.shortage},${item.shortageCost}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = ['all', ...Array.from(new Set(inventoryData.map(item => item.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">إدارة الكميات في المخزن</h1>
          <p className="text-muted-foreground mt-2">متابعة وإدارة مخزون المنتجات والكميات</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">إجمالي المنتجات</p>
              <p className="text-3xl font-bold mt-2">{stats.totalItems}</p>
            </div>
            <Package className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">منتجات بها عجز</p>
              <p className="text-3xl font-bold mt-2">{stats.itemsWithShortage}</p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">منتجات متوازنة</p>
              <p className="text-3xl font-bold mt-2">{stats.itemsInStock}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">تكلفة العجز</p>
              <p className="text-3xl font-bold mt-2">{totals.shortageCost.toLocaleString()}</p>
              <p className="text-orange-100 text-xs">ريال سعودي</p>
            </div>
            <BarChart3 className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Archive className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">ملخص الكميات</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">إجمالي العجز:</span>
                <span className={`font-bold mr-2 ${totals.shortage > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {totals.shortage} وحدة
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">الكمية المتوقعة:</span>
                <span className="font-bold mr-2 text-blue-500">{totals.expectedQuantity.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">الكمية المجرودة:</span>
                <span className="font-bold mr-2 text-purple-500">{totals.countedQuantity.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">تكلفة العجز:</span>
                <span className="font-bold mr-2 text-red-500">{totals.shortageCost.toLocaleString()} ريال</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث في المنتجات (الاسم أو الكود)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 min-w-[180px]"
          >
            <option value="all">جميع الفئات</option>
            {categories.filter(cat => cat !== 'all').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-secondary/50 to-secondary/30">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">#</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المنتج</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الكود</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الكمية في المخزن</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المحجوزة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المتوقعة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المجرودة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">العجز/الزيادة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">تكلفة العجز</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الإجراءات</th>
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
                  <td className="px-6 py-4 text-sm font-medium">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">{item.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                      {item.productCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{item.warehouseQuantity.toLocaleString()}</td>
                  <td className="px-6 py-4 text-orange-600 font-medium">{item.reservedQuantity.toLocaleString()}</td>
                  <td className="px-6 py-4 text-blue-600 font-medium">{item.expectedQuantity.toLocaleString()}</td>
                  <td className="px-6 py-4 text-purple-600 font-medium">{item.countedQuantity.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.shortage > 0 ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 font-bold">-{item.shortage}</span>
                        </>
                      ) : item.shortage < 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-bold">+{Math.abs(item.shortage)}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-bold">متوازن</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.shortageCost > 0 ? (
                      <span className="text-red-600 font-bold">
                        {item.shortageCost.toLocaleString()} ريال
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="عرض التفاصيل">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="جرد">
                        <ClipboardList className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors" title="تعديل">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="bg-gradient-to-r from-primary/10 to-primary/5 border-t-2 border-primary/20 font-bold">
                <td colSpan={3} className="px-6 py-4 text-right font-bold text-primary">الإجمالي</td>
                <td className="px-6 py-4 font-bold text-primary">{totals.warehouseQuantity.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-primary">{totals.reservedQuantity.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-primary">{totals.expectedQuantity.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-primary">{totals.countedQuantity.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${totals.shortage > 0 ? 'text-red-600' : totals.shortage < 0 ? 'text-green-600' : 'text-primary'}`}>
                    {totals.shortage > 0 ? `-${totals.shortage}` : totals.shortage < 0 ? `+${Math.abs(totals.shortage)}` : 'متوازن'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${totals.shortageCost > 0 ? 'text-red-600' : 'text-primary'}`}>
                    {totals.shortageCost > 0 ? `${totals.shortageCost.toLocaleString()} ريال` : '-'}
                  </span>
                </td>
                <td className="px-6 py-4"></td>
              </tr>
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

      {/* Alert for items with shortage */}
      {stats.itemsWithShortage > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">تنبيه: يوجد منتجات بها عجز</h3>
              <p className="text-red-600">
                يوجد {stats.itemsWithShortage} منتج بها عجز في الكمية بتكلفة إجمالية {totals.shortageCost.toLocaleString()} ريال. 
                يرجى مراجعة هذه المنتجات واتخاذ الإجراءات اللازمة.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;