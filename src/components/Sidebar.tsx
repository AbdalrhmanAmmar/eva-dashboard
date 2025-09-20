import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  TrendingUp,
  Settings, 
  FileText, 
  HelpCircle,
  LogOut,
  Crown,
  MessageSquare,
  Smartphone,
  Package,
  Warehouse,
  ArrowUpDown,
  Plus,
  ClipboardList,
  X,
  ChevronDown,
  Move3d
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileMenuOpen = false, 
  onMobileMenuToggle 
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: t('sidebar.dashboard'), path: '/' },
    { icon: BarChart3, label: t('sidebar.analytics'), path: '/analytics' },
    { icon: BarChart3, label: "العملاء", path: '/users' },
    { icon: BarChart3, label: "العروض", path: '/offers' },
    { icon: TrendingUp, label: t('sidebar.metaAnalytics'), path: '/meta-analytics' },
    { icon: MessageSquare, label: t('sidebar.messages'), path: '/messages' },
    { icon: Smartphone, label: t('sidebar.smsMessages'), path: '/sms-messages' },
    { icon: FileText, label: t('sidebar.servicesForm'), path: '/services-form' },

  ];

  const warehouseItems = [
    { icon: Warehouse, label: t('sidebar.viewWarehouses'), path: '/warehouse-management' },
    { icon: Package, label: t('sidebar.quantityManagement'), path: '/inventory-management' },
    { icon: ClipboardList, label: t('sidebar.inventoryCount'), path: '/inventory-show' },
    { icon: Move3d , label:"نقل كميات مخازن", path: '/all-transfer-warehouse' },
    { icon: ArrowUpDown, label: t('sidebar.priority'), path: '/warehouse-priority' },
  ];

  const productItems = [
    { icon: Package, label: t('sidebar.viewProducts'), path: '/product-management' },
    { icon: Plus, label: t('sidebar.addProduct'), path: '/product-create' }
  ];

  const otherItems = [
    { icon: Settings, label: t('sidebar.settings'), path: '/settings' },
  ];

  const bottomItems = [
    { icon: HelpCircle, label: t('sidebar.help') },
    { icon: LogOut, label: t('sidebar.logout') },
  ];

  // إغلاق القائمة المنسدلة الأخرى عند فتح واحدة
  const toggleWarehouseDropdown = () => {
    setWarehouseDropdownOpen(!warehouseDropdownOpen);
    setProductsDropdownOpen(false);
  };

  const toggleProductsDropdown = () => {
    setProductsDropdownOpen(!productsDropdownOpen);
    setWarehouseDropdownOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    // إغلاق القائمة الجانبية على الأجهزة المحمولة بعد التنقل
    if (onMobileMenuToggle && window.innerWidth < 1024) {
      onMobileMenuToggle();
    }
  };

  return (
<div
  className={`bg-white border-l border-border h-screen transition-all duration-300 ease-in-out w-64 flex flex-col shadow-soft fixed top-0 lg:static z-50
    ${isMobileMenuOpen ? 'translate-x-0 fixed' : '-translate-x-full lg:w-0'}`}
>
      {/* Header */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">

          {isMobileMenuOpen && (
                <div className=" items-center gap-3 flex">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gradient">{t('brand.name')}</h1>
          </div>

          )}

      
          
          {/* زر إغلاق القائمة على الأجهزة المحمولة */}
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="p-2 hover:bg-secondary rounded-lg transition-colors lg:hidden "
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation with scroll */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  location.pathname === item.path
                    ? 'bg-gradient-primary text-white shadow-soft'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                } w-full ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
              >
                <item.icon className={`w-5 h-5 ${i18n.dir() === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
          
          {/* Warehouse Dropdown */}
          <li>
            <button
              onClick={toggleWarehouseDropdown}
              className={`flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 group w-full ${
                i18n.dir() === 'rtl' ? 'text-right' : 'text-left'
              } ${
                location.pathname.includes('/warehouse') 
                  ? 'bg-gradient-primary text-white shadow-soft'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <div className="flex items-center">
                <Warehouse className={`w-5 h-5 ${i18n.dir() === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                <span className="font-medium">{t('sidebar.warehouses')}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                warehouseDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {/* Dropdown Items with animation */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              warehouseDropdownOpen ? 'max-h-96' : 'max-h-0'
            }`}>
              <ul className="mt-2 space-y-1 pl-6">
                {warehouseItems.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group w-full ${
                        i18n.dir() === 'rtl' ? 'text-right' : 'text-left'
                      } text-sm ${
                        location.pathname === item.path
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Products Dropdown */}
          <li>
            <button
              onClick={toggleProductsDropdown}
              className={`flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 group w-full ${
                i18n.dir() === 'rtl' ? 'text-right' : 'text-left'
              } ${
                location.pathname.includes('/product') 
                  ? 'bg-gradient-primary text-white shadow-soft'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <div className="flex items-center">
                <Package className={`w-5 h-5 ${i18n.dir() === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                <span className="font-medium">{t('sidebar.products')}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                productsDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {/* Dropdown Items with animation */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              productsDropdownOpen ? 'max-h-96' : 'max-h-0'
            }`}>
              <ul className="mt-2 space-y-1 pl-6">
                {productItems.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group w-full ${
                        i18n.dir() === 'rtl' ? 'text-right' : 'text-left'
                      } text-sm ${
                        location.pathname === item.path
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          {/* Other Items */}
          {otherItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  location.pathname === item.path
                    ? 'bg-gradient-primary text-white shadow-soft'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                } w-full ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
              >
                <item.icon className={`w-5 h-5 ${i18n.dir() === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Items */}

      {isMobileMenuOpen && (
            <div className="p-4 border-t border-border mt-auto flex-shrink-0">
        <ul className="space-y-2">
          {bottomItems.map((item, index) => (
            <li key={index}>
              <button
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 w-full ${
                  i18n.dir() === 'rtl' ? 'text-right' : 'text-left'
                } ${
                  item.label === t('sidebar.logout') 
                    ? 'text-destructive hover:bg-destructive/10' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 ${i18n.dir() === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      )}
  
    </div>
  );
};

export default Sidebar;