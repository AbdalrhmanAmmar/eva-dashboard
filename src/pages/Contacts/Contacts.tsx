import React, { useState, useEffect } from 'react';
import { Search, Users, Phone, Mail, MapPin, Calendar, User, Building, Globe, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { getContacts, deleteContact } from '../../api/Contact';
import { formatArabicDate } from '../../utils/formatDate';
import { toast } from 'react-hot-toast';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';

interface Contact {
  _id: string;
  name: string;
  country: string;
  tax: boolean;
  address?: {
    city: string;
    streetNumber: string;
    buildingNumber: string;
    area: string;
    fullAddress: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [taxFilter, setTaxFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; contact: Contact | null }>({ isOpen: false, contact: null });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getContacts();
      setContacts(response.data);
      setFilteredContacts(response.data);
    } catch (err) {
      toast.error('فشل في تحميل جهات الاتصال');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    let filtered = contacts;

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.address?.city && contact.address.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.address?.area && contact.address.area.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (countryFilter) {
      filtered = filtered.filter(contact =>
        contact.country.toLowerCase().includes(countryFilter.toLowerCase())
      );
    }

    if (taxFilter) {
      filtered = filtered.filter(contact =>
        taxFilter === 'true' ? contact.tax : !contact.tax
      );
    }

    setFilteredContacts(filtered);
  }, [searchTerm, countryFilter, taxFilter, contacts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCountryFilter('');
    setTaxFilter('');
    setShowFilters(false);
  };

  const handleEdit = (contact: Contact) => {
    navigate(`/contacts/edit/${contact._id}`);
  };

  const handleDeleteClick = (contact: Contact) => {
    setDeleteModal({ isOpen: true, contact });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.contact) return;
    
    try {
      setDeleting(true);
      await deleteContact(deleteModal.contact._id);
      toast.success('تم حذف جهة الاتصال بنجاح');
      setDeleteModal({ isOpen: false, contact: null });
      fetchContacts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('فشل في حذف جهة الاتصال');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, contact: null });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">إدارة جهات الاتصال</h1>
          <p className="text-muted-foreground mt-2">يمكنك إدارة جهات الاتصال والمعلومات الخاصة بها</p>
        </div>
        <button className='btn-gradient rounded-md ' onClick={()=>{navigate("/Create-Contract")}}>
            اضف جهه اتصال جديده
        </button>
      </div>

      {/* Search and Filters */}
      <div className='bg-card border border-border rounded-xl p-6 space-y-4'>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              type='search' 
              placeholder='البحث باستخدام الاسم، الدولة، المدينة أو المنطقة'
              value={searchTerm}
              onChange={handleSearchChange}
              className="pr-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-2 border border-border rounded-lg hover:bg-secondary/50 transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Search className="w-4 h-4" />
            فلاتر متقدمة
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">الدولة</label>
                <Input
                  type="text"
                  placeholder="فلترة حسب الدولة"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">حالة الضريبة</label>
                <select
                  value={taxFilter}
                  onChange={(e) => setTaxFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-foreground"
                >
                  <option value="">جميع الحالات</option>
                  <option value="true">خاضع للضريبة</option>
                  <option value="false">غير خاضع للضريبة</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all duration-200 font-medium"
                >
                  مسح الفلاتر
                </button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              عرض {filteredContacts.length} من أصل {contacts.length} جهة اتصال
            </div>
          </div>
        )}
      </div>

      {/* Contacts Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-3 text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-secondary/50 to-secondary/30">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الاسم</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الدولة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المدينة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المنطقة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">العنوان الكامل</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">حالة الضريبة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">تاريخ الإنشاء</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact, index) => (
                  <tr 
                    key={contact._id} 
                    className={`border-b border-border hover:bg-secondary/30 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/10'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{contact.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{contact.address?.city || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{contact.address?.area || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-foreground text-sm">
                        {contact.address?.fullAddress || 'غير محدد'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {contact.tax ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            خاضع للضريبة
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            غير خاضع
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{formatArabicDate(contact.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(contact)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
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
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">لا توجد جهات اتصال</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'لم يتم العثور على نتائج تطابق البحث' : 'لم يتم إضافة أي جهات اتصال بعد'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف جهة الاتصال"
        message="هل أنت متأكد من رغبتك في حذف جهة الاتصال هذه؟"
        itemName={deleteModal.contact?.name}
        loading={deleting}
      />
    </div>
  );
};

export default Contacts;