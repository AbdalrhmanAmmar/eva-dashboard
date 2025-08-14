import React from 'react';
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

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = React.useState(false);

  const menuItems = [
    { icon: Home, label: 'لوحة التحكم', path: '/' },
    { icon: BarChart3, label: 'التحليلات', path: '/analytics' },
    { icon: TrendingUp, label: 'تحليلات Meta', path: '/meta-analytics' },
    { icon: MessageSquare, label: 'رسائل العملاء', path: '/messages' },
    { icon: Smartphone, label: 'رسائل SMS', path: '/sms-messages' },
    { icon: FileText, label: 'فورم الخدمات', path: '/services-form' },
    { icon: Package, label: 'إدارة الكميات', path: '/inventory-management' }
  ];

  const warehouseItems = [
    { icon: Warehouse, label: 'عرض المخازن', path: '/warehouse-management' },
    { icon: ArrowUpDown, label: 'أولوية السحب', path: '/warehouse-priority' },
    { icon: Plus, label: 'إضافة مخزن', path: '/warehouse-add' }
  ];

  const otherItems = [
    { icon: Settings, label: 'الإعدادات', path: '/settings' },
  ];

  const bottomItems = [
    { icon: HelpCircle, label: 'المساعدة' },
    { icon: LogOut, label: 'تسجيل الخروج' },
  ];

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
              <h1 className="text-xl font-bold text-gradient">إيفاء</h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
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
                } w-full text-right`}
              >
                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
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
              className={`flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 group w-full text-right ${
                location.pathname.includes('/warehouse') 
                  ? 'bg-gradient-primary text-white shadow-soft'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <div className="flex items-center">
                <Warehouse className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="font-medium">المخازن</span>
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
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group w-full text-right text-sm ${
                        location.pathname === item.path
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
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
                } w-full text-right`}
              >
                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Items */}
      <div className="p-4 border-t border-border">
        <ul className="space-y-2">
          {bottomItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground ${
                  item.label === 'تسجيل الخروج' ? 'text-destructive hover:bg-destructive/10' : ''
                }`}
              >
                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;