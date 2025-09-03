import { PlusCircle, Search, User, ClipboardList } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Input } from '../../../components/ui/input'
import { getAllInventories, Inventory } from '../../../api/inventoryAPI'
import { formatArabicDate } from '../../../utils/formatDate'
import { useSearchParams, useNavigate } from 'react-router-dom'

function InventoryShow() {
  const [inventoryData, setInventoryData] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // الحصول على قيمة البحث من URL أو استخدام القيمة الافتراضية
  const search = searchParams.get('search') || ''

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        setLoading(true)
        const res = await getAllInventories(1, 10, search, undefined, undefined, "-createdAt")
        setInventoryData(res.data)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchInventories()
  }, [search])

  // تحديث معلمة البحث في URL
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      searchParams.set('search', value)
    } else {
      searchParams.delete('search')
    }
    setSearchParams(searchParams)
  }

  // دالة للتنقل إلى صفحة إنشاء جرد جديد
  const handleCreateInventory = () => {
    navigate('/warehouse-inventory')
  }
  // دالة للتنقل إلى صفحة تفاصيل الجرد
  const handleViewDetails = (id: string) => {
    navigate(`/inventory-show/${id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">جرد المخزون</h1>
          <p className="text-muted-foreground mt-2">يمكنك التحكم في المخزون والمعلومات والجرد</p>
        </div>
        
        <button 
          className='btn-gradient flex items-center gap-2 py-3 px-6 rounded-md'
          onClick={handleCreateInventory}
        >
          <PlusCircle className="w-5 h-5" />
          انشاء جرد المخزون
        </button>
      </div>

      {/* Search */}
      <div className='bg-card border border-border rounded-xl p-4'>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            type='search' 
            placeholder='البحث باستخدام رقم الجرد او اسم الجرد'
            value={search}
            onChange={handleSearchChange}
            className="pr-10"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-3 text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : inventoryData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-secondary/50 to-secondary/30">
                <tr>
                  <th className=" text-right text-sm font-semibold text-foreground">رقم الجرد</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">اسم الجرد</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">منشئ الجرد</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">تاريخ الإنشاء</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المخزن</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((item, index) => (
                  <tr 
                    key={item._id} 
                    className={`border-b border-border hover:bg-secondary/30 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/10'
                    }`}
                  >
                    <td className=" font-semibold bg-primary/10  text-primary text-center rounded-full">{item.globalOrder}</td>
                    <td  className="px-6 py-4 font-medium text-foreground">
                        
                         <span>{item.name}</span>
                         <span> | </span>
                         <span> {item.order} </span>
                         <span>{item.type ==="full" ? "كلي" : "جزئي"}</span>
                         </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{item.createdBy?.name || "غير محدد"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{formatArabicDate(item.createdAt)}</td>
                    <td className="px-6 py-4">{item.warehouse?.name || "غير محدد"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "completed" 
                          ? "bg-green-100 text-green-800" 
                          : item.status === "draft" 
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {item.status === "completed" ? "مكتمل" : 
                         item.status === "draft" ? "مسودة" : 
                         item.status === "in_progress" ? "قيد التنفيذ" : item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(item._id)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <ClipboardList className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد عمليات جرد</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإضافة جرد جديد لمخزونك</p>
            <button 
              className="btn-gradient flex items-center gap-2 mx-auto py-2 px-4 rounded-md"
              onClick={handleCreateInventory}
            >
              <PlusCircle className="w-4 h-4" />
              إنشاء جرد جديد
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryShow