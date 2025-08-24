import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  TrendingUp,
  Settings, 
  FileText, 
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Crown,
  MessageSquare,
  Smartphone,
  Package,
  Warehouse,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const menuItems = [
    { icon: Home, label: t('sidebar.dashboard'), path: '/' },
    { icon: BarChart3, label: t('sidebar.analytics'), path: '/analytics' },
    { icon: TrendingUp, label: t('sidebar.metaAnalytics'), path: '/meta-analytics' },
    { icon: MessageSquare, label: t('sidebar.messages'), path: '/messages' },
    { icon: Smartphone, label: t('sidebar.smsMessages'), path: '/sms-messages' },
    { icon: FileText, label: t('sidebar.servicesForm'), path: '/services-form' },
    { icon: Package, label: t('sidebar.inventoryManagement'), path: '/inventory-management' }
  ];

  const warehouseItems = [
    { icon: Warehouse, label: t('sidebar.viewWarehouses'), path: '/warehouse-management' },
    { icon: ArrowUpDown, label: t('sidebar.priority'), path: '/warehouse-priority' },
    { icon: Plus, label: t('sidebar.addWarehouse'), path: '/warehouse-add' }
  ];

  const otherItems = [
    { icon: Settings, label: t('sidebar.settings'), path: '/settings' },
  ];

  const bottomItems = [
    { icon: HelpCircle, label: t('sidebar.help') },
    { icon: LogOut, label: t('sidebar.logout') },
  ];

  const handleLanguageClick = () => {
    const newLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    setCurrentLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  return (
    <div className={`bg-white border-l border-border h-screen transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col shadow-soft`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gradient">{t('brand.name')}</h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? '' : 'rotate-180'
            }`} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => navigate(item.path)}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  location.pathname === item.path
                    ? 'bg-gradient-primary text-white shadow-soft'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                } w-full ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
              >
                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : i18n.dir() === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
          
          {/* Warehouse Dropdown */}
          <li>
            <button
              onClick={() => !isCollapsed && setWarehouseDropdownOpen(!warehouseDropdownOpen)}
              className={`flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 group w-full ${
                i18n.dir() === 'rtl' ? 'text-right' : 'text-left'
              } ${
                location.pathname.includes('/warehouse') 
                  ? 'bg-gradient-primary text-white shadow-soft'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <div className="flex items-center">
                <Warehouse className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : i18n.dir() === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="font-medium">{t('sidebar.warehouses')}</span>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  warehouseDropdownOpen ? 'rotate-180' : ''
                }`} />
              )}
            </button>
            
            {/* Dropdown Items */}
            {!isCollapsed && warehouseDropdownOpen && (
              <ul className="mt-2 space-y-1 pl-6">
                {warehouseItems.map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={() => navigate(item.path)}
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
            )}
          </li>
          
          {/* Other Items */}
          {otherItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => navigate(item.path)}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  location.pathname === item.path
                    ? 'bg-gradient-primary text-white shadow-soft'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                } w-full ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'}`}
              >
                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : i18n.dir() === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Language Switcher */}
      <div className='mx-auto my-4'>
        <button
          className="btn-gradient rounded-md px-6 py-2 text-white font-medium transition-all hover:opacity-90"
          onClick={handleLanguageClick}
        >
          {currentLanguage === 'ar' ? t('language.switchToEnglish') : t('language.switchToArabic')}
        </button>
      </div>

      {/* Bottom Items */}
      <div className="p-4 border-t border-border mt-auto">
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
                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : i18n.dir() === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;