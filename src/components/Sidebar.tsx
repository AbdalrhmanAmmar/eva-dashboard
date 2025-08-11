import React from 'react';
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  FileText, 
  Calendar,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Crown,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, activeSection, onSectionChange }) => {
  const menuItems = [
    { icon: Home, label: 'لوحة التحكم', id: 'dashboard' },
    { icon: BarChart3, label: 'التحليلات', id: 'analytics' },
    { icon: MessageSquare, label: 'رسائل العملاء', id: 'messages' },
    { icon: FileText, label: 'فورم الخدمات', id: 'services-form' },
    { icon: Settings, label: 'الإعدادات', id: 'settings' },
  ];

  const bottomItems = [
    { icon: HelpCircle, label: 'المساعدة' },
    { icon: LogOut, label: 'تسجيل الخروج' },
  ];

  return (
    <div className={`bg-white border-r border-border h-screen transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col shadow-soft`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 space-x-reverse">
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
              isCollapsed ? 'rotate-180' : ''
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
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  activeSection === item.id
                    ? 'bg-gradient-primary text-white shadow-soft'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                } w-full text-right`}
              >
                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'ml-3'}`} />
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
                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'ml-3'}`} />
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