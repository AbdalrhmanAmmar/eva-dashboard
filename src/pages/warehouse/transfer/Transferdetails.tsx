import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTransactionById, Transaction } from "../../../api/TransferWarehouse";
import { 
  Package, 
  Calendar, 
 
  FileText, 
  ClipboardList,
  Hash,
  Tag,
  Clock,
  Truck,
  Warehouse,
  DollarSign,
  PackageCheck,
  ArrowDown
} from 'lucide-react';
import { formatArabicDate } from "../../../utils/formatDate";
import { useNavigate } from "react-router-dom";

function TransferDetails() {
    const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const response = await getTransactionById(id);
        console.log(response.data);
        if (response.success) {
          setTransaction(response.data);
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchTransaction();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="mr-3 text-muted-foreground">جاري تحميل البيانات...</span>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">لم يتم العثور على عملية النقل</h3>
        <p className="text-muted-foreground">تعذر تحميل بيانات عملية النقل المطلوبة</p>
      </div>
    );
  }

  type Status = 'completed' | 'pending' | 'rejected';

  const getStatusText = (status: Status) => {
    switch(status) {
      case 'completed': return 'مكتمل';
      case 'pending': return 'قيد الانتظار';
      case 'rejected': return 'ملغى';
      default: return status;
    }
  };

  const getStatusColor = (status: Status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch(type) {
      case 'transfer': return 'نقل بين المخازن';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">تفاصيل عملية النقل</h1>
          <p className="text-muted-foreground mt-2">عرض كافة تفاصيل عملية النقل والمنتجات المنقولة</p>
        </div>
        <button onClick={() => navigate("create-transfer-warehouse")} className="btn-gradient rounded-md">انشاء عملية نقل جديده</button>
        
 
      </div>

      {/* معلومات أساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رقم المعاملة</p>
              <p className="font-semibold">{transaction.transactionId}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">نوع المعاملة</p>
              <p className="font-semibold">{getTransactionTypeText(transaction.transactionType)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">القيمة الإجمالية</p>
              <p className="font-semibold">{transaction.totalValue.toLocaleString()} ر.س</p>
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
              <p className={`font-semibold px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                {getStatusText(transaction.status)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* معلومات المخازن */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
              مسار النقل
            </h2>
            <div className="space-y-6">
              {/* المخزن المصدر */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Warehouse className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">المخزن المصدر</h3>
                  <p className="text-lg font-bold text-blue-700">{transaction.sourceWarehouse.name}</p>
                  <div className="flex gap-4 mt-2 text-sm text-blue-600">
                    <span>{transaction.sourceWarehouse.city}</span>
                    <span>•</span>
                    <span>{transaction.sourceWarehouse.district}</span>
                  </div>
                </div>
              </div>

              {/* السهم */}
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <ArrowDown className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* المخزن المستلم */}
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <PackageCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">المخزن المستلم</h3>
                  <p className="text-lg font-bold text-green-700">{transaction.targetWarehouse.name}</p>
                  <div className="flex gap-4 mt-2 text-sm text-green-600">
                    <span>{transaction.targetWarehouse.city}</span>
                    <span>•</span>
                    <span>{transaction.targetWarehouse.district}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              معلومات الوقت
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">تاريخ المعاملة</p>
                <p className="font-medium">{formatArabicDate(transaction.transactionDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                <p className="font-medium">{formatArabicDate(transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p className="font-medium">{formatArabicDate(transaction.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              الإحصائيات
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">إجمالي المنتجات</span>
                <span className="font-semibold">{transaction.totalItems} منتج</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">عدد الأصناف</span>
                <span className="font-semibold">{transaction.transferredProducts.length} صنف</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">القيمة الإجمالية</span>
                <span className="font-semibold text-primary">{transaction.totalValue.toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>

          {transaction.notes && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                الملاحظات
              </h2>
              <p className="text-muted-foreground">{transaction.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* قائمة المنتجات المنقولة */}
      <div>
        <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              المنتجات المنقولة
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                {transaction.transferredProducts.length} منتج
              </span>
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">المنتج</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">SKU</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">الكمية</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">سعر الوحدة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">القيمة الإجمالية</th>
                </tr>
              </thead>
              <tbody>
                {transaction.transferredProducts.map((product, index) => (
                  <tr key={product._id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.product.images && product.product.images.length > 0 ? (
                          <img
                            src={`/uploads/product/${product.product.images[0].url}`}
                            alt={product.productName}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="text-right">
                          <p className="font-medium">{product.productName}</p>
                          {product.product.description && (
                            <p className="text-sm text-muted-foreground">{product.product.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-secondary px-2 py-1 rounded text-sm">{product.product.sku}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold">{product.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 text-primary font-semibold">{product.unitPrice.toLocaleString()} ر.س</td>
                    <td className="px-6 py-4 text-green-600 font-semibold">{product.totalValue.toLocaleString()} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransferDetails;