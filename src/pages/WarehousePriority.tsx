import React, { useState, useEffect } from 'react';
import { 
  Package, 
  GripVertical, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  X,
  ArrowUpDown,
  Warehouse,
  MapPin,
  Building
} from 'lucide-react';
import { getAllWarehouses } from '../api/warehouseAPI';

interface WarehouseItem {
  _id: string;
  name: string;
  country: string;
  city: string;
  isActive: boolean;
  order: number;
}

const WarehousePriority: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // جلب البيانات من API
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        setError(null);
        
     
        const data = await getAllWarehouses();
        const sortedWarehouses = data.warehouses.sort((a, b) => a.order - b.order);
        
        // بيانات تجريبية مرتبة حسب الأولوية
    
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setWarehouses(sortedWarehouses.sort((a, b) => a.order - b.order));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
        console.error('خطأ في جلب المخازن:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  const handleDragStart = (e: React.DragEvent, warehouseId: string) => {
    setIsDragging(true);
    setDraggedItem(warehouseId);
    e.dataTransfer.setData('text/plain', warehouseId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    
    const draggedIndex = warehouses.findIndex(w => w._id === draggedId);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    const newWarehouses = [...warehouses];
    const [draggedWarehouse] = newWarehouses.splice(draggedIndex, 1);
    newWarehouses.splice(targetIndex, 0, draggedWarehouse);

    // Update order numbers
    const updatedWarehouses = newWarehouses.map((warehouse, index) => ({
      ...warehouse,
      order: index + 1
    }));

    setWarehouses(updatedWarehouses);
    setIsDragging(false);
    setDraggedItem(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // محاكاة API call للحفظ
      // const updatePromises = warehouses.map(warehouse => 
      //   updateWarehouse(warehouse._id, { order: warehouse.order })
      // );
      // await Promise.all(updatePromises);
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('تم حفظ ترتيب المخازن:', warehouses);
      
      // يمكن إضافة toast notification هنا
      // toast.success('تم تحديث ترتيب المخازن بنجاح');
      
    } catch (err) {
      setError('حدث خطأ أثناء حفظ الترتيب');
      console.error('خطأ في الحفظ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // إعادة جلب البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));
      // يمكن إعادة استدعاء fetchWarehouses هنا
    } catch (err) {
      setError('حدث خطأ أثناء تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newWarehouses = [...warehouses];
    [newWarehouses[index], newWarehouses[index - 1]] = [newWarehouses[index - 1], newWarehouses[index]];
    
    // Update order numbers
    const updatedWarehouses = newWarehouses.map((warehouse, idx) => ({
      ...warehouse,
      order: idx + 1
    }));
    
    setWarehouses(updatedWarehouses);
  };

  const moveDown = (index: number) => {
    if (index === warehouses.length - 1) return;
    const newWarehouses = [...warehouses];
    [newWarehouses[index], newWarehouses[index + 1]] = [newWarehouses[index + 1], newWarehouses[index]];
    
    // Update order numbers
    const updatedWarehouses = newWarehouses.map((warehouse, idx) => ({
      ...warehouse,
      order: idx + 1
    }));
    
    setWarehouses(updatedWarehouses);
  };

  // Loading state
  if (loading && warehouses.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">جاري تحميل المخازن...</h3>
          <p className="text-muted-foreground">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center py-12 text-red-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">حدث خطأ في جلب البيانات</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (warehouses.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center py-12">
          <Warehouse className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">لا توجد مخازن متاحة</h3>
          <p className="text-muted-foreground">لم يتم العثور على أي مخازن للعرض</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">أولوية السحب من المخازن</h1>
          <p className="text-muted-foreground mt-2">
            قم بترتيب المخازن حسب أولوية السحب - اسحب وأفلت لإعادة الترتيب
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          
          <button 
            onClick={handleSave}
            disabled={loading}
            className="btn-gradient flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'جاري الحفظ...' : 'حفظ الترتيب'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">خطأ</h3>
              <p className="text-red-600">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="mr-auto p-1 hover:bg-red-100 rounded"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-full">
            <ArrowUpDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">كيفية إعادة الترتيب</h3>
            <p className="text-blue-600 mt-1">
              اسحب المخزن من أيقونة الإمساك وأفلته في المكان المطلوب، أو استخدم أزرار الأسهم للتحريك
            </p>
          </div>
        </div>
      </div>

      {/* Warehouses List */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="p-6 border-b border-border bg-gradient-to-r from-secondary/50 to-secondary/30">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            قائمة المخازن مرتبة حسب الأولوية
          </h3>
        </div>

        <div className="divide-y divide-border">
          {warehouses.map((warehouse, index) => (
            <div
              key={warehouse._id}
              draggable
              onDragStart={(e) => handleDragStart(e, warehouse._id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-6 transition-all duration-200 ${
                draggedItem === warehouse._id 
                  ? 'bg-primary/10 scale-105 shadow-lg' 
                  : 'hover:bg-secondary/30'
              } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="flex items-center gap-3">
                  <GripVertical className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {warehouse.order}
                  </div>
                </div>

                {/* Warehouse Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Warehouse className="w-5 h-5 text-primary" />
                    <h4 className="text-lg font-semibold text-foreground">{warehouse.name}</h4>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      warehouse.isActive 
                        ? 'bg-green-100 text-green-600 border border-green-200' 
                        : 'bg-red-100 text-red-600 border border-red-200'
                    }`}>
                      {warehouse.isActive ? 'نشط' : 'غير نشط'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{warehouse.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{warehouse.city}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="تحريك لأعلى"
                  >
                    <ArrowUpDown className="w-4 h-4 rotate-180" />
                  </button>
                  
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === warehouses.length - 1}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="تحريك لأسفل"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <h3 className="text-lg font-semibold text-green-800">ملخص الترتيب</h3>
            <p className="text-green-600">
              إجمالي المخازن: {warehouses.length} • 
              المخازن النشطة: {warehouses.filter(w => w.isActive).length} • 
              المخازن غير النشطة: {warehouses.filter(w => !w.isActive).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehousePriority;