import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Settings, 
  ChevronDown, 
  ClipboardList, 
  ScrollText, 
  Edit, 
  X,
  Building,
  MapPin,
  Activity,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllWarehouses, updateWarehouse, Warehouse } from '../api/warehouseAPI';
import { Switch } from '../components/ui/switch';

const WarehousePage: React.FC = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    country: '',
    city: '',
    district: '',
    street: ''
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const data = await getAllWarehouses();
      const sortedWarehouses = data.warehouses.sort((a, b) => (a.order || 0) - (b.order || 0));
      setWarehouses(sortedWarehouses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const toggleActiveStatus = async (id: string, newStatus: boolean) => {
    try {
      const response = await updateWarehouse(id, { isActive: newStatus });
      
      if (response.success) {
        setWarehouses(prev =>
          prev.map(wh =>
            wh._id === id ? { ...wh, isActive: newStatus } : wh
          )
        );
      } else {
        throw new Error(response.message || 'فشل في تحديث الحالة');
      }
    } catch (err) {
      console.error('Error updating warehouse status:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الحالة');
      
      // Revert the change
      setWarehouses(prev =>
        prev.map(wh =>
          wh._id === id ? { ...wh, isActive: !newStatus } : wh
        )
      );
    }
  };

  const openEditModal = (warehouse: Warehouse) => {
    setCurrentWarehouse(warehouse);
    setEditFormData({
      name: warehouse.name,
      country: warehouse.country,
      city: warehouse.city,
      district: warehouse.district,
      street: warehouse.street
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentWarehouse(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWarehouse) return;

    try {
      const response = await updateWarehouse(currentWarehouse._id, editFormData);
      
      if (response.success) {
        setWarehouses(prev =>
          prev.map(wh =>
            wh._id === currentWarehouse._id ? { ...wh, ...editFormData } : wh
          )
        );
        closeEditModal();
      } else {
        throw new Error(response.message || 'فشل في تحديث المخزن');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التحديث');
    }
  };

  const activeCount = warehouses.filter(wh => wh.isActive).length;
  const totalCount = warehouses.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="mr-3 text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">خطأ في تحميل البيانات</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      {isEditModalOpen && currentWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-large w-full max-w-md border border-border">
            <div className="flex justify-between items-center border-b border-border p-6">
              <h3 className="text-xl font-semibold text-foreground">تعديل المخزن</h3>
              <button 
                onClick={closeEditModal}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    اسم المخزن
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
                    الدولة
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={editFormData.country}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                    المدينة
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={editFormData.city}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-foreground mb-2">
                    المنطقة
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={editFormData.district}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-foreground mb-2">
                    الشارع
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={editFormData.street}
                    onChange={handleEditFormChange}
                    className="w-full px-4 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-gradient flex items-center gap-2"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">إدارة المخازن</h1>
          <p className="text-muted-foreground mt-2">إدارة ومتابعة جميع المخازن والمستودعات</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Dropdown Menu */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-soft"
            >
              <Settings className="w-5 h-5" />
              خيارات إضافية
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-card rounded-xl shadow-large border border-border z-10">
                <div className="py-2">
                  <button
                    onClick={() => navigate('/warehouse/view')}
                    className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors gap-3"
                  >
                    <Package className="w-4 h-4 text-primary" />
                    إدارة الكميات
                  </button>
                  <button
                    onClick={() => navigate('/warehouse/inventory')}
                    className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors gap-3"
                  >
                    <ClipboardList className="w-4 h-4 text-primary" />
                    جرد المخزون
                  </button>
                  <button
                    onClick={() => navigate('/warehouse-priority')}
                    className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors gap-3"
                  >
                    <ScrollText className="w-4 h-4 text-primary" />
                    أولوية السحب من المخزون
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigate('/warehouse-create')}
            className="btn-gradient flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة مخزن
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-soft">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-white/20">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">إحصائيات المخازن</h3>
            <p className="text-blue-100 mt-1">
              عدد المخازن النشطة{' '}
              <span className="font-bold text-white">{activeCount}</span> من
              أصل <span className="font-bold text-white">{totalCount}</span>
            </p>
          </div>

          
          <div className="mr-auto flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{activeCount}</div>
              <div className="text-sm text-blue-100">نشط</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalCount - activeCount}</div>
              <div className="text-sm text-blue-100">غير نشط</div>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouses Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-secondary/50 to-secondary/30">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الترتيب</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">اسم المخزن</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الموقع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse, index) => (
                <tr 
                  key={warehouse._id} 
                  className={`border-b border-border hover:bg-secondary/30 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/10'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                        {warehouse.order || index + 1}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{warehouse.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {warehouse.district} - {warehouse.street}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-foreground">{warehouse.city}</div>
                        <div className="text-sm">{warehouse.country}</div>
                      </div>
                    </div>
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap text-ring">
                    <Switch
                      checked={warehouse.isActive}
                      onChange={(checked) => toggleActiveStatus(warehouse._id!, checked)}
                      className={`${
                        warehouse.isActive ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span className="sr-only">تفعيل/تعطيل</span>
                      <span
                        className={`${
                          warehouse.isActive ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/edit-warehouse/${warehouse._id}`)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="تعديل المخزن"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {/* <button
                        onClick={() => navigate(`/warehouse/details/${warehouse._id}`)}
                        className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {warehouses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد مخازن</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإضافة مخزن جديد لإدارة المخزون</p>
            <button
              onClick={() => navigate('/warehouse/create')}
              className="btn-gradient"
            >
              إضافة مخزن جديد
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default WarehousePage;