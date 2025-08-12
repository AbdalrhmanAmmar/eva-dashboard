import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Globe, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: User },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'security', label: 'الأمان', icon: Shield },
    { id: 'appearance', label: 'المظهر', icon: Palette },
    { id: 'language', label: 'اللغة', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الإعدادات</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-4 shadow-soft">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-right ${
                    activeTab === tab.id
                      ? 'bg-gradient-primary text-white shadow-soft'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">الملف الشخصي</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">الاسم الأول</label>
                    <input
                      type="text"
                      defaultValue="أحمد"
                      className="w-full px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">الاسم الأخير</label>
                    <input
                      type="text"
                      defaultValue="محمد"
                      className="w-full px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      defaultValue="ahmed@example.com"
                      className="w-full px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      defaultValue="+966 50 123 4567"
                      className="w-full px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">نبذة شخصية</label>
                  <textarea
                    rows={4}
                    defaultValue="مدير نظام مع خبرة في إدارة المنصات الرقمية"
                    className="w-full px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">إعدادات الإشعارات</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <h3 className="font-medium">إشعارات البريد الإلكتروني</h3>
                      <p className="text-sm text-muted-foreground">تلقي إشعارات عبر البريد الإلكتروني</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <h3 className="font-medium">إشعارات الرسائل النصية</h3>
                      <p className="text-sm text-muted-foreground">تلقي إشعارات عبر الرسائل النصية</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">إعدادات الأمان</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">إعدادات المظهر</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">نمط المظهر</label>
                    <select className="w-full px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200">
                      <option>فاتح</option>
                      <option>داكن</option>
                      <option>تلقائي</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">اللون الأساسي</label>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full cursor-pointer border-2 border-white shadow-md"></div>
                      <div className="w-8 h-8 bg-green-500 rounded-full cursor-pointer border-2 border-white shadow-md"></div>
                      <div className="w-8 h-8 bg-purple-500 rounded-full cursor-pointer border-2 border-white shadow-md"></div>
                      <div className="w-8 h-8 bg-red-500 rounded-full cursor-pointer border-2 border-white shadow-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">إعدادات اللغة</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-2">اللغة</label>
                  <select className="w-full px-4 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200">
                    <option>العربية</option>
                    <option>English</option>
                    <option>Français</option>
                  </select>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-border mt-6">
              <button className="btn-gradient flex items-center gap-2">
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;