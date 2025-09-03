import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Package, 
  Calendar, 
  User, 
  FileText, 
  Building,
  ClipboardList,
  Hash,
  Tag,
  Clock,
  Edit,
  Printer,
  Download
} from 'lucide-react'
import { getInventoryById, Inventory } from '../../../api/inventoryAPI'
import { formatArabicDate } from '../../../utils/formatDate'
import { getFileUrl } from '../../../utils/fileUrl'

function InventoryShowById() {
  const { id } = useParams<{ id: string }>()
  const [inventory, setInventory] = useState<Inventory>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true)
        const data = await getInventoryById(id!)
        console.log(data)

        setInventory(data) // لاحظت أن البيانات تأتي في data.data
      } catch (error) {
        console.error("Error fetching inventory:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchInventory()
    }

  
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="mr-3 text-muted-foreground">جاري تحميل البيانات...</span>
      </div>
    )
  }

  if (!inventory) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">لم يتم العثور على عملية الجرد</h3>
        <p className="text-muted-foreground">تعذر تحميل بيانات عملية الجرد المطلوبة</p>
      </div>
    )
  }

type Status = 'draft' | 'in_progress' | 'completed' | 'cancelled';

  const getStatusText = (status:Status) => {
    switch(status) {
      case 'draft': return 'مسودة'
      case 'in_progress': return 'قيد التنفيذ'
      case 'completed': return 'مكتمل'
      case 'cancelled': return 'ملغى'
      default: return status
    }
  }

  type typetext = "full" | "partial"
  const getTypeText = (type:typetext) => {
    switch(type) {
      case 'full': return 'جرد كامل'
      case 'partial': return 'جرد جزئي'
      default: return type
    }
  }

  // دالة للحصول على لون الحالة
  const getStatusColor = (status:Status) => {
    switch(status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">تفاصيل عملية الجرد</h1>
          <p className="text-muted-foreground mt-2">عرض كافة تفاصيل عملية الجرد والمنتجات المشمولة</p>
        </div>
        
        <div className="flex gap-2">
          <button className="btn-outline flex items-center gap-2 py-2 px-4 rounded-md">
            <Edit className="w-4 h-4" />
            تعديل
          </button>
          <button className="btn-outline flex items-center gap-2 py-2 px-4 rounded-md">
            <Printer className="w-4 h-4" />
            طباعة
          </button>
          <button className="btn-gradient flex items-center gap-2 py-2 px-4 rounded-md">
            <Download className="w-4 h-4" />
            تصدير
          </button>
        </div>
      </div>

      {/* معلومات أساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رقم الجرد</p>
              <p className="font-semibold">{inventory.globalOrder}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المخزن</p>
              <p className="font-semibold">{inventory.warehouse?.name || "غير محدد"}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">نوع الجرد</p>
              <p className="font-semibold">{getTypeText(inventory.type)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الحالة</p>
              <p className={`font-semibold px-2 py-1 rounded-full text-xs ${getStatusColor(inventory.status)}`}>
                {getStatusText(inventory.status)}
              </p>
            </div>
          </div>
        </div>
      </div>

        {/* معلومات إضافية */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              معلومات المنشئ
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">اسم المنشئ</p>
                <p className="font-medium">{inventory.createdBy?.name || "غير محدد"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium">{inventory.createdBy?.email || "غير محدد"}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              معلومات الوقت
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                <p className="font-medium">{formatArabicDate(inventory.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p className="font-medium">{formatArabicDate(inventory.updatedAt)}</p>
              </div>
            </div>
          </div>

          {inventory.notes && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                الملاحظات
              </h2>
              <p className="text-muted-foreground">{inventory.notes}</p>
            </div>
          )}
        </div>

        {/* قائمة المنتجات */}
        <div className="lg:col-span-12">
          <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
            <div className="border-b border-border p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                المنتجات المشمولة في الجرد
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {inventory.items?.length || 0} منتج
                </span>
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/30">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">المنتج</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">رمز المنتج sku</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">الكمية في المخزن</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">الكمية المحجوزة</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">الكمية التوقعه</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">الكمية المجروده</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground"> صافي الكمية المجروده بعد خصم المحجوز</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">الجرد قبل خروج الكمية المحجوزه </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">الجرد بعد خروج الكمية المحجوزه </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">العجز</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">تكلفه العجز</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.items && inventory.items.length > 0 ? (
                    inventory.items.map((item, index) => {
                      const difference = item.product.quantity - item.reservedQuantity 
                      const netCounted = item.countedQuantity - item.reservedQuantity

                      const Invbefor = item.product.quantity - item.countedQuantity
                      const Invafter = difference - item.countedQuantity

                      const deficit = difference - netCounted
                      const totalDeficit = deficit * item.product.priceBeforeDiscount

                      return (
                        <tr key={index} className="border-b border-border hover:bg-secondary/20 transition-colors">
                          <td className="px-6 py-4 ">
                              {item.product.images && item.product.images.length > 0 ? (
                                <img
                                  src={getFileUrl(`/uploads/product/${item.product.images[0].url}`)}
                                  alt={item.product.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                                  <Package className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                             
                          </td>
                          <td className="px-6 py-4 text-start">
                            <span>{item.product.name}</span>
                            <span>{item.product.sku}</span>
                          </td>
                          <td className="px-6 py-4 text-start">{item.product.quantity}</td>
                          <td className="px-6 py-4 text-start ">{item.reservedQuantity}</td>
                          <td className={`px-6 py-4 text-start font-semibold ${
                            difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {difference > 0 ? `+${difference}` : difference}
                          </td>
                          <td>
                                                      <td className="px-6 py-4 text-start ">{item.countedQuantity}</td>


                          </td>
                           <td className={`px-6 py-4 text-start font-semibold ${
                            netCounted > 0 ? 'text-green-600' : netCounted < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {netCounted > 0 ? `+${netCounted}` : netCounted}
                          </td>
                                <td className={`px-6 py-4 text-start font-semibold ${
                                    Invbefor > 0 ? 'text-green-600' : Invbefor < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                    {Invbefor > 0 ? `+${Invbefor}` : Invbefor}
                                </td>
                                <td className={`px-6 py-4 text-start font-semibold ${
                                    Invafter > 0 ? 'text-green-600' : Invafter < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                    {Invafter > 0 ? `+${Invafter}` : Invafter}
                                </td>
                                <td className={`px-6 py-4 text-start font-semibold ${
                                    deficit > 0 ? 'text-green-600' : deficit < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                    {deficit > 0 ? `+${deficit}` : deficit}
                                </td>
                                <td className={`px-6 py-4 text-start font-semibold ${
                                    totalDeficit > 0 ? 'text-green-600' : totalDeficit < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                    {totalDeficit > 0 ? `+${totalDeficit}` : totalDeficit}
                                </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                        لا توجد منتجات في عملية الجرد هذه
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  )
}

export default InventoryShowById