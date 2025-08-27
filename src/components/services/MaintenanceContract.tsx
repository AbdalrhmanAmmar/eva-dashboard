import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  Search,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  HardHat,
  Factory,
  FileDigit,
  Mail,
  AlertCircle,
  Ruler,
  Home,
  X,
  MapPin,
  Shield,
  Scale,
  CheckSquare,
  Download
} from 'lucide-react';
import { getMaintenanceContracts, updateMaintenanceContractStatus } from '../../api/ServiceForm';
import { useNavigate } from 'react-router-dom';
import { getFileUrl } from '../../utils/fileUrl';

interface ISystem {
  system: string;
  status: string;
  _id: string;
}

interface IMaintenanceContract {
  _id: string;
  entityType: string;
  name: string;
  commercialRegisterNumber: string;
  pieceNumber: string;
  maintenanceContract: string;
  rentContract: string;
  commercialRegisterFile: string;
  buildingLicense: string;
  phone: string;
  email: string;
  activity: string;
  vatNumber: string;
  extinguisherType: string;
  extinguisherWeight: string;
  extinguisherCount: string;
  address: string;
  planNumber: string;
  area: string;
  systems: ISystem[];
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

const MaintenanceContractComponent: React.FC = () => {
  const [contracts, setContracts] = useState<IMaintenanceContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{key: keyof IMaintenanceContract; direction: 'asc' | 'desc'} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const response = await getMaintenanceContracts();
        const contractsWithStatus = response.data.map(contract => ({
          ...contract,
          status: contract.status || 'pending'
        }));
        setContracts(contractsWithStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    // تحديد الحالة الجديدة بناءً على الحالة الحالية
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    
    setUpdatingId(id);
    try {
      await updateMaintenanceContractStatus(id, newStatus);
      setContracts(prevContracts =>
        prevContracts.map(contract =>
          contract._id === id ? { ...contract, status: newStatus } : contract
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الحالة');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.phone.includes(searchTerm) ||
      contract.commercialRegisterNumber.includes(searchTerm) ||
      contract.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedContracts = React.useMemo(() => {
    if (!sortConfig) return filteredContracts;

    return [...filteredContracts].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredContracts, sortConfig]);

  const totalPages = Math.ceil(sortedContracts.length / itemsPerPage);
  const paginatedContracts = sortedContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key: keyof IMaintenanceContract) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckSquare className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 w-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      completed: 'مكتمل',
      rejected: 'مرفوض'
    };
    return status ? statusMap[status] || status : 'غير محدد';
  };

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Factory className="w-4 h-4" />;
      case 'individual':
        return <Home className="w-4 h-4" />;
      default:
        return <HardHat className="w-4 h-4" />;
    }
  };

  const getEntityTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      company: 'شركة',
      individual: 'فرد',
      other: 'أخرى'
    };
    return typeMap[type] || type;
  };

  const openContractDetails = (contract: IMaintenanceContract) => {
    navigate(`/maintenance-contracts/${contract._id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الهاتف أو السجل التجاري..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="approved">موافق عليه</option>
            <option value="completed">مكتمل</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع الكيان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاسم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الهاتف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                النشاط
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التفاصيل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedContracts.length > 0 ? (
              paginatedContracts.map((contract) => (
                <tr key={contract._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      {getEntityTypeIcon(contract.entityType)}
                      {getEntityTypeText(contract.entityType)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contract.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {contract.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contract.activity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(contract.status)}`}>
                      {getStatusIcon(contract.status)}
                      {getStatusText(contract.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => openContractDetails(contract)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      عرض التفاصيل
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(contract._id, contract.status || 'pending')}
                        disabled={updatingId === contract._id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50 flex items-center gap-1"
                      >
                        {updatingId === contract._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                            جاري التحديث...
                          </>
                        ) : (
                          <>
                            <CheckSquare className="h-4 w-4" />
                            تم الإكمال
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  لا توجد بيانات متاحة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              التالي
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                عرض <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedContracts.length)}</span> من{' '}
                <span className="font-medium">{sortedContracts.length}</span> نتائج
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">الأولى</span>
                  <span>«</span>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">السابق</span>
                  <ChevronUp className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">التالي</span>
                  <ChevronDown className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">الأخيرة</span>
                  <span>»</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceContractComponent;