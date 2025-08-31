// @ts-nocheck

import { useEffect, useState, useMemo } from "react";
import { Loader2, Users, Phone, User, Search, ChevronRight, Shield, Building2, ArrowUp, ArrowDown, Mail, BadgeCheck, Filter, X, Calendar, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { adminAPI } from "../api/getUser";
import { Link } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  createdAt: string;
  role?: string;
  accountVerified?: boolean;
  entityType?: "individual" | "organization" | "company";
  entityName?: string;
  commercialRecordNumber?: string;
  taxNumber?: string;
  points?: number;
  ordersCount?: number;
  servicesCount?: number;
  ordersTrend?: number;
  level?: string;
  country?: string;
  city?: string;
  maintenanceContractActive?: boolean;
  isActive?: boolean;
  verificationStatus?: "pending" | "approved" | "rejected";
}

type FilterCriteria = {
  gender?: string;
  level?: string;
  country?: string;
  city?: string;
  minOrders?: number;
  maxOrders?: number;
  minPoints?: number;
  maxPoints?: number;
  startDate?: string;
  endDate?: string;
  accountVerified?: boolean;
  maintenanceContract?: boolean;
  isActive?: boolean;
  entityType?: "individual" | "organization" | "company";
};

type SortConfig = {
  key: string;
  direction: 'ascending' | 'descending';
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"individual" | "company" | "organization">("individual");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterCriteria>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    individuals: 0,
    companies: 0,
    organizations: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    totalChange: 0,
    individualsChange: 0,
    companiesChange: 0,
    organizationsChange: 0,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getAllUsers();
        if (response.success) {
          setUsers(response.users);
          console.log(`response`, response)
          
          // Calculate statistics
          const individuals = response.users.filter(u => u.entityType === "individual").length;
          const companies = response.users.filter(u => u.entityType === "company").length;
          const organizations = response.users.filter(u => u.entityType === "organization").length;
          const activeUsers = response.users.filter(u => u.isActive).length;
          const verifiedUsers = response.users.filter(u => u.accountVerified).length;
          
          setStats({
            total: response.users.length,
            individuals,
            companies,
            organizations,
            activeUsers,
            inactiveUsers: response.users.length - activeUsers,
            verifiedUsers,
            unverifiedUsers: response.users.length - verifiedUsers,
            totalChange: 5, // These would come from API in real app
            individualsChange: 2,
            companiesChange: 8,
            organizationsChange: -3,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const options = {
      genders: new Set<string>(),
      levels: new Set<string>(),
      countries: new Set<string>(),
      cities: new Set<string>(),
    };

    users.forEach(user => {
      if (user.gender) options.genders.add(user.gender);
      if (user.level) options.levels.add(user.level);
      if (user.country) options.countries.add(user.country);
      if (user.city) options.cities.add(user.city);
    });

    return {
      genders: Array.from(options.genders),
      levels: Array.from(options.levels),
      countries: Array.from(options.countries),
      cities: Array.from(options.cities),
    };
  }, [users]);

  const applyFilters = () => {
    setAppliedFilters({...filters});
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({});
    setAppliedFilters({});
    setShowFilters(false);
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedUsers = () => {
    let sortableUsers = [...filteredUsers];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  };

  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.phone.includes(searchTerm) || 
                         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.entityName && user.entityName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Entity type filter
    let matchesEntityType = true;
    if (activeTab === "individual") {
      matchesEntityType = user.entityType === "individual";
    } else if (activeTab === "company") {
      matchesEntityType = user.entityType === "company";
    } else if (activeTab === "organization") {
      matchesEntityType = user.entityType === "organization";
    }
    
    // Applied filters
    const matchesFilters = (
      (!appliedFilters.gender || user.gender === appliedFilters.gender) &&
      (!appliedFilters.level || user.level === appliedFilters.level) &&
      (!appliedFilters.country || user.country === appliedFilters.country) &&
      (!appliedFilters.city || user.city === appliedFilters.city) &&
      (!appliedFilters.minOrders || (user.ordersCount || 0) >= appliedFilters.minOrders) &&
      (!appliedFilters.maxOrders || (user.ordersCount || 0) <= appliedFilters.maxOrders) &&
      (!appliedFilters.minPoints || (user.points || 0) >= appliedFilters.minPoints) &&
      (!appliedFilters.maxPoints || (user.points || 0) <= appliedFilters.maxPoints) &&
      (!appliedFilters.startDate || new Date(user.createdAt) >= new Date(appliedFilters.startDate)) &&
      (!appliedFilters.endDate || new Date(user.createdAt) <= new Date(appliedFilters.endDate)) &&
      (appliedFilters.accountVerified === undefined || user.accountVerified === appliedFilters.accountVerified) &&
      (appliedFilters.maintenanceContract === undefined || 
       user.maintenanceContractActive === appliedFilters.maintenanceContract) &&
      (appliedFilters.isActive === undefined || user.isActive === appliedFilters.isActive) &&
      (appliedFilters.entityType === undefined || user.entityType === appliedFilters.entityType)
    );
    
    return matchesSearch && matchesEntityType && matchesFilters;
  });

  const sortedUsers = getSortedUsers();

  const renderTrendIndicator = (trend?: number) => {
    if (trend === undefined) return null;
    
    if (trend > 0) {
      return (
        <span className="flex items-center text-green-500">
          <ArrowUp className="w-4 h-4" />
          <span>{trend}%</span>
        </span>
      );
    } else if (trend < 0) {
      return (
        <span className="flex items-center text-red-500">
          <ArrowDown className="w-4 h-4" />
          <span>{Math.abs(trend)}%</span>
        </span>
      );
    } else {
      return <span className="text-gray-500">0%</span>;
    }
  };

  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronUp className="w-4 h-4 opacity-0 group-hover:opacity-70 transition-opacity" />;
    }
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp className="w-4 h-4 text-primary" /> : 
      <ChevronDown className="w-4 h-4 text-primary" />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "اختر تاريخ";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
              <p className="text-gray-600 text-sm">
                إجمالي المستخدمين: <span className="text-blue-600 font-medium">{filteredUsers.length}</span> من <span className="font-medium">{users.length}</span>
                {Object.keys(appliedFilters).length > 0 && (
                  <span className="text-orange-500 mr-2"> (تم تطبيق الفلاتر)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pr-10 p-2.5"
                placeholder="ابحث بالاسم أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm ${showFilters ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <Filter className="w-4 h-4" />
              <span>الفلاتر</span>
              {Object.keys(appliedFilters).length > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {Object.keys(appliedFilters).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Entity Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الكيان</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={filters.entityType || ""}
                  onChange={(e) => setFilters({
                    ...filters, 
                    entityType: e.target.value as "individual" | "company" | "organization" | undefined
                  })}
                >
                  <option value="">الكل</option>
                  <option value="individual">أفراد</option>
                  <option value="company">شركات</option>
                  <option value="organization">مؤسسات</option>
                </select>
              </div>

              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={filters.gender || ""}
                  onChange={(e) => setFilters({...filters, gender: e.target.value || undefined})}
                >
                  <option value="">الكل</option>
                  {filterOptions.genders.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={filters.level || ""}
                  onChange={(e) => setFilters({...filters, level: e.target.value || undefined})}
                >
                  <option value="">الكل</option>
                  {filterOptions.levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدولة</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={filters.country || ""}
                  onChange={(e) => setFilters({...filters, country: e.target.value || undefined})}
                >
                  <option value="">الكل</option>
                  {filterOptions.countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={filters.city || ""}
                  onChange={(e) => setFilters({...filters, city: e.target.value || undefined})}
                >
                  <option value="">الكل</option>
                  {filterOptions.cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Orders Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الطلبات</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="الحد الأدنى"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={filters.minOrders || ""}
                    onChange={(e) => setFilters({...filters, minOrders: e.target.value ? parseInt(e.target.value) : undefined})}
                  />
                  <input
                    type="number"
                    placeholder="الحد الأقصى"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={filters.maxOrders || ""}
                    onChange={(e) => setFilters({...filters, maxOrders: e.target.value ? parseInt(e.target.value) : undefined})}
                  />
                </div>
              </div>

              {/* Points Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">النقاط</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="الحد الأدنى"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={filters.minPoints || ""}
                    onChange={(e) => setFilters({...filters, minPoints: e.target.value ? parseInt(e.target.value) : undefined})}
                  />
                  <input
                    type="number"
                    placeholder="الحد الأقصى"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={filters.maxPoints || ""}
                    onChange={(e) => setFilters({...filters, maxPoints: e.target.value ? parseInt(e.target.value) : undefined})}
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التسجيل</label>
                <div className="flex gap-2">
                  <div className="relative w-full">
                    <button
                      onClick={() => setDatePickerOpen(!datePickerOpen)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-right flex justify-between items-center"
                    >
                      <span>{formatDate(filters.startDate)}</span>
                      <Calendar className="w-4 h-4 text-gray-500" />
                    </button>
                    {datePickerOpen && (
                      <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-full">
                        <div className="flex justify-between items-center mb-2">
                          <button 
                            onClick={() => setDatePickerOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <h3 className="text-sm font-medium text-gray-900">اختر تاريخ</h3>
                        </div>
                        <input
                          type="date"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          value={filters.startDate || ""}
                          onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        />
                        <span className="block text-center text-gray-500 my-1">إلى</span>
                        <input
                          type="date"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                          value={filters.endDate || ""}
                          onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        />
                        <button
                          onClick={() => {
                            setFilters({...filters, startDate: undefined, endDate: undefined});
                            setDatePickerOpen(false);
                          }}
                          className="mt-2 w-full text-sm text-red-600 hover:text-red-800"
                        >
                          مسح التاريخ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Verification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حالة التوثيق</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={filters.accountVerified === undefined ? "" : filters.accountVerified ? "true" : "false"}
                  onChange={(e) => setFilters({
                    ...filters, 
                    accountVerified: e.target.value === "" ? undefined : e.target.value === "true"
                  })}
                >
                  <option value="">الكل</option>
                  <option value="true">موثق</option>
                  <option value="false">غير موثق</option>
                </select>
              </div>

              {/* User Activity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حالة النشاط</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={filters.isActive === undefined ? "" : filters.isActive ? "true" : "false"}
                  onChange={(e) => setFilters({
                    ...filters, 
                    isActive: e.target.value === "" ? undefined : e.target.value === "true"
                  })}
                >
                  <option value="">الكل</option>
                  <option value="true">نشط</option>
                  <option value="false">غير نشط</option>
                </select>
              </div>

              {/* Maintenance Contract */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عقد الصيانة</label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={filters.maintenanceContract === undefined ? "" : filters.maintenanceContract ? "true" : "false"}
                  onChange={(e) => setFilters({
                    ...filters, 
                    maintenanceContract: e.target.value === "" ? undefined : e.target.value === "true"
                  })}
                >
                  <option value="">الكل</option>
                  <option value="true">نشط</option>
                  <option value="false">غير نشط</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                مسح الكل
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        )}

        {/* Applied Filters Tags */}
        {Object.keys(appliedFilters).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(appliedFilters).map(([key, value]) => {
              if (value === undefined || value === "") return null;
              
              let displayText = "";
              switch (key) {
                case "gender":
                  displayText = `الجنس: ${value}`;
                  break;
                case "level":
                  displayText = `المستوى: ${value}`;
                  break;
                case "country":
                  displayText = `الدولة: ${value}`;
                  break;
                case "city":
                  displayText = `المدينة: ${value}`;
                  break;
                case "minOrders":
                  displayText = `الحد الأدنى للطلبات: ${value}`;
                  break;
                case "maxOrders":
                  displayText = `الحد الأقصى للطلبات: ${value}`;
                  break;
                case "minPoints":
                  displayText = `الحد الأدنى للنقاط: ${value}`;
                  break;
                case "maxPoints":
                  displayText = `الحد الأقصى للنقاط: ${value}`;
                  break;
                case "startDate":
                  displayText = `من تاريخ: ${formatDate(value)}`;
                  break;
                case "endDate":
                  displayText = `إلى تاريخ: ${formatDate(value)}`;
                  break;
                case "accountVerified":
                  displayText = `التوثيق: ${value ? "موثق" : "غير موثق"}`;
                  break;
                case "maintenanceContract":
                  displayText = `عقد الصيانة: ${value ? "نشط" : "غير نشط"}`;
                  break;
                case "isActive":
                  displayText = `النشاط: ${value ? "نشط" : "غير نشط"}`;
                  break;
                case "entityType":
                  displayText = `نوع الكيان: ${
                    value === "individual" ? "فرد" : 
                    value === "company" ? "شركة" : "مؤسسة"
                  }`;
                  break;
                default:
                  return null;
              }

              return (
                <div 
                  key={key} 
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-3 py-1.5 rounded-full"
                >
                  <span>{displayText}</span>
                  <button
                    onClick={() => {
                      const newFilters = {...appliedFilters};
                      delete newFilters[key as keyof FilterCriteria];
                      setAppliedFilters(newFilters);
                      setFilters(newFilters);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {Object.keys(appliedFilters).length > 1 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full hover:bg-gray-200"
              >
                <span>مسح الكل</span>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Users Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 text-sm">إجمالي المستخدمين</p>
                <h3 className="text-xl font-bold text-white mt-1">{stats.total}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {renderTrendIndicator(stats.totalChange)}
                  <span className="text-xs text-blue-200">من أصل {users.length}</span>
                </div>
              </div>
              <div className="p-2 bg-white/20 rounded-full">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Individuals Card */}
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-4 text-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100 text-sm">الأفراد</p>
                <h3 className="text-xl font-bold text-white mt-1">{stats.individuals}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {renderTrendIndicator(stats.individualsChange)}
                  <span className="text-xs text-green-200">
                    {((stats.individuals / stats.total) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-2 bg-white/20 rounded-full">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Companies Card */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-4 text-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-purple-100 text-sm">الشركات</p>
                <h3 className="text-xl font-bold text-white mt-1">{stats.companies}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {renderTrendIndicator(stats.companiesChange)}
                  <span className="text-xs text-purple-200">
                    {((stats.companies / stats.total) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-2 bg-white/20 rounded-full">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Organizations Card */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg p-4 text-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-orange-100 text-sm">المؤسسات</p>
                <h3 className="text-xl font-bold text-white mt-1">{stats.organizations}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {renderTrendIndicator(stats.organizationsChange)}
                  <span className="text-xs text-orange-200">
                    {((stats.organizations / stats.total) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-2 bg-white/20 rounded-full">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">المستخدمون النشطون</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.activeUsers}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.activeUsers / stats.total) * 100 || 0).toFixed(1)}% من إجمالي المستخدمين
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <BadgeCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Inactive Users Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">المستخدمون غير النشطين</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.inactiveUsers}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.inactiveUsers / stats.total) * 100 || 0).toFixed(1)}% من إجمالي المستخدمين
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <X className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          {/* Verified Users Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">الحسابات الموثقة</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.verifiedUsers}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.verifiedUsers / stats.total) * 100 || 0).toFixed(1)}% من إجمالي المستخدمين
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Unverified Users Card */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">الحسابات غير الموثقة</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{stats.unverifiedUsers}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.unverifiedUsers / stats.total) * 100 || 0).toFixed(1)}% من إجمالي المستخدمين
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === "individual" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => {
              setActiveTab("individual");
              setFilters({...filters, maintenanceContract: undefined});
            }}
          >
            <User className="w-4 h-4" />
            الأفراد
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === "company" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => {
              setActiveTab("company");
              setFilters({...filters, gender: undefined});
            }}
          >
            <Building2 className="w-4 h-4" />
            الشركات
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === "organization" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => {
              setActiveTab("organization");
              setFilters({...filters, gender: undefined});
            }}
          >
            <Building2 className="w-4 h-4" />
            المؤسسات
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead className="text-xs text-gray-700 bg-gray-100 border-b border-gray-200">
                  {activeTab === "individual" ? (
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right">#</th>
                      <th scope="col" className="px-6 py-3 text-right">الاسم</th>
                      <th scope="col" className="px-6 py-3 text-right">المستوى</th>
                      <th scope="col" className="px-6 py-3 text-right">رقم الجوال</th>
                      <th scope="col" className="px-6 py-3 text-right">البريد الإلكتروني</th>
                      <th scope="col" className="px-6 py-3 text-right">الجنس</th>
                      <th scope="col" className="px-6 py-3 text-right">الدولة/المدينة</th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-right cursor-pointer group"
                        onClick={() => requestSort("ordersCount")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>عدد الطلبات</span>
                          {renderSortIcon("ordersCount")}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-right cursor-pointer group"
                        onClick={() => requestSort("points")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>النقاط</span>
                          {renderSortIcon("points")}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">الحالة</th>
                      <th scope="col" className="px-6 py-3 text-right">الملف الشخصي</th>
                    </tr>
                  ) : (
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right">#</th>
                      <th scope="col" className="px-6 py-3 text-right">اسم الكيان</th>
                      <th scope="col" className="px-6 py-3 text-right">المستوى</th>
                      <th scope="col" className="px-6 py-3 text-right">عقد الصيانة</th>
                      <th scope="col" className="px-6 py-3 text-right">صاحب الحساب</th>
                      <th scope="col" className="px-6 py-3 text-right">رقم الجوال</th>
                      <th scope="col" className="px-6 py-3 text-right">السجل التجاري</th>
                      <th scope="col" className="px-6 py-3 text-right">الرقم الضريبي</th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-right cursor-pointer group"
                        onClick={() => requestSort("ordersCount")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>عدد الطلبات</span>
                          {renderSortIcon("ordersCount")}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-right cursor-pointer group"
                        onClick={() => requestSort("servicesCount")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>عدد الخدمات</span>
                          {renderSortIcon("servicesCount")}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-right cursor-pointer group"
                        onClick={() => requestSort("points")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>النقاط</span>
                          {renderSortIcon("points")}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">الحالة</th>
                      <th scope="col" className="px-6 py-3 text-right">الملف الشخصي</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {sortedUsers.length > 0 ? (
                    sortedUsers.map((user, index) => (
                      <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                        
                        {activeTab === "individual" ? (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{user.name}</span>
                                {user.role === 'admin' && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full w-fit mt-1 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    مدير
                                  </span>
                                )}
                                {user.accountVerified && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full w-fit mt-1 flex items-center gap-1">
                                    <BadgeCheck className="w-3 h-3" />
                                    موثق
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">{user.level || "-"}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{user.phone}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span>{user.email || "-"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">{user.gender || "-"}</td>
                            <td className="px-6 py-4">
                              {user.country || "-"} / {user.city || "-"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 justify-start">
                                <span>{user.ordersCount || 0}</span>
                                {renderTrendIndicator(user.ordersTrend)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-start">
                                {user.points || 0}
                              </div>
                            </td>
                            {/* <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'نشط' : 'غير نشط'}
                              </span>
                            </td> */}
                            <td className="px-6 py-4">
                              <Link 
                                to={`/users/${user._id}`}
                                className="flex items-center justify-end gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <span>عرض الملف</span>
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{user.entityName || "-"}</span>
                                {user.role === 'admin' && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full w-fit mt-1 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    مدير
                                  </span>
                                )}
                                {user.accountVerified && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full w-fit mt-1 flex items-center gap-1">
                                    <BadgeCheck className="w-3 h-3" />
                                    موثق
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">{user.level || "-"}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${user.maintenanceContractActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {user.maintenanceContractActive ? 'نشط' : 'غير نشط'}
                              </span>
                            </td>
                            <td className="px-6 py-4">{user.name || "-"}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{user.phone}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">{user.commercialRecordNumber || "-"}</td>
                            <td className="px-6 py-4">{user.taxNumber || "-"}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 justify-end">
                                <span>{user.ordersCount || 0}</span>
                                {renderTrendIndicator(user.ordersTrend)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end">
                                {user.servicesCount || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end">
                                {user.points || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                user.verificationStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                                user.verificationStatus === "approved" ? "bg-green-100 text-green-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {user.verificationStatus === "pending" ? "في الانتظار" :
                                 user.verificationStatus === "approved" ? "تم القبول" : "مرفوض"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Link 
                                to={`/dashboard/users/${user._id}`}
                                className="flex items-center justify-end gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <span>عرض الملف</span>
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={activeTab === "individual" ? 10 : 13} className="px-6 py-4 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center py-8">
                          <Search className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">لا توجد نتائج مطابقة للبحث</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {searchTerm || Object.keys(appliedFilters).length > 0 ? 
                              "حاول تغيير كلمات البحث أو إزالة بعض الفلاتر" : 
                              `لا يوجد ${activeTab === "individual" ? "أفراد" : activeTab === "company" ? "شركات" : "مؤسسات"} مسجلين حتى الآن`}
                          </p>
                          {(searchTerm || Object.keys(appliedFilters).length > 0) && (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setFilters({});
                                setAppliedFilters({});
                              }}
                              className="mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-blue-600 transition-colors"
                            >
                              مسح البحث والفلاتر
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 px-4 py-3 bg-white rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-2 md:mb-0">
              عرض <span className="font-medium text-gray-900">1</span> إلى <span className="font-medium text-gray-900">{filteredUsers.length}</span> من <span className="font-medium text-gray-900">{users.length}</span> مستخدم
            </div>
            <div className="flex gap-2">
              <button 
                className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50" 
                disabled
              >
                السابق
              </button>
              <button 
                className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50" 
                disabled
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}