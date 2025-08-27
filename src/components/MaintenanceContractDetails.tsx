import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Phone,
  FileText,
  HardHat,
  Factory,
  Home,
  X,
  MapPin,
  Shield,
  Scale,
  Download,
  ArrowRight
} from 'lucide-react';
import { getMaintenanceContractById } from '../api/ServiceForm';
import { getFileUrl } from '../utils/fileUrl';


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

const MaintenanceContractDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<IMaintenanceContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getMaintenanceContractById(id);
        setContract(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Factory className="w-5 h-5" />;
      case 'individual':
        return <Home className="w-5 h-5" />;
      default:
        return <HardHat className="w-5 h-5" />;
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
          <X className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-lg">
        <span>لم يتم العثور على عقد الصيانة</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-900">تفاصيل عقد الصيانة</h1>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowRight className="h-5 w-5" />
          العودة للقائمة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1 */}
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <HardHat className="h-5 w-5 text-blue-500" />
              المعلومات الأساسية
            </h3>
          </div>

          <div className="space-y-3">
            <DetailItem icon={<HardHat />} label="نوع الكيان" value={
              <div className="flex items-center gap-1">
                {getEntityTypeIcon(contract.entityType)}
                {getEntityTypeText(contract.entityType)}
              </div>
            } />
            <DetailItem icon={<FileText />} label="الاسم" value={contract.name} />
            <DetailItem icon={<FileText />} label="رقم السجل التجاري" value={contract.commercialRegisterNumber} />
            <DetailItem icon={<Scale />} label="رقم القطعة" value={contract.pieceNumber} />
            <DetailItem icon={<Phone />} label="الهاتف" value={contract.phone} />
            <DetailItem icon={<FileText />} label="البريد الإلكتروني" value={contract.email} />
            <DetailItem icon={<FileText />} label="النشاط" value={contract.activity} />
            <DetailItem icon={<MapPin />} label="العنوان" value={contract.address} />
            <DetailItem icon={<FileText />} label="المساحة" value={contract.area} />
            <DetailItem icon={<FileText />} label="رقم المخطط" value={contract.planNumber} />
            <DetailItem icon={<Scale />} label="رقم الضريبة" value={contract.vatNumber} />
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              معلومات السلامة
            </h3>
          </div>

          <div className="space-y-3">
            <DetailItem icon={<Shield />} label="نوع الطفايات" value={contract.extinguisherType} />
            <DetailItem icon={<Scale />} label="وزن الطفايات" value={contract.extinguisherWeight} />
            <DetailItem icon={<Shield />} label="عدد الطفايات" value={contract.extinguisherCount} />
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">أنظمة الحماية:</h4>
              <ul className="space-y-2">
                {contract.systems.map((system, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="font-medium">{system.system}:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      system.status === 'working' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {system.status === 'working' ? 'يعمل' : 'لا يعمل'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">المستندات المرفقة:</h4>
            <div className="flex flex-wrap gap-2">
              {contract.maintenanceContract && (
                <DocumentLink 
                  url={getFileUrl(contract.maintenanceContract)} 
                  label="عقد الصيانة" 
                />
              )}
              {contract.rentContract && (
                <DocumentLink 
                  url={getFileUrl(contract.rentContract)} 
                  label="عقد الإيجار" 
                />
              )}
              {contract.commercialRegisterFile && (
                <DocumentLink 
                  url={contract.commercialRegisterFile} 
                  label="السجل التجاري" 
                />
              )}
              {contract.buildingLicense && (
                <DocumentLink 
                  url={getFileUrl(contract.buildingLicense)} 
                  label="رخصة البناء" 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for detail items
const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-500 mt-0.5">
      {React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4' })}
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="text-sm text-gray-900 mt-1">{value || 'غير متوفر'}</div>
    </div>
  </div>
);

// Helper component for document links
const DocumentLink: React.FC<{ url: string, label: string }> = ({ url, label }) => (
  <a
    href={getFileUrl(url)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
  >
    <Download className="h-4 w-4" />
    {label}
  </a>
);

export default MaintenanceContractDetails;