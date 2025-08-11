import React, { useState } from 'react';
import { Search, RefreshCw, MessageSquare, Phone, User, Calendar, Filter } from 'lucide-react';

interface CustomerMessage {
  id: number;
  orderForm: string;
  fullName: string;
  phoneNumber: string;
  details: string;
  date: string;
  status: 'new' | 'read' | 'replied';
}

const CustomerMessages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Static data for customer messages
  const messages: CustomerMessage[] = [
    {
      id: 1,
      orderForm: 'ORD-001',
      fullName: 'أحمد محمد علي',
      phoneNumber: '+966501234567',
      details: 'أريد الاستفسار عن خدمات التطوير المتاحة لديكم وكيفية البدء في مشروع جديد لتطوير موقع إلكتروني متكامل',
      date: '2024-01-15',
      status: 'new'
    },
    {
      id: 2,
      orderForm: 'ORD-002',
      fullName: 'فاطمة أحمد',
      phoneNumber: '+966507654321',
      details: 'مرحباً، أحتاج إلى تطوير تطبيق جوال لمتجري الإلكتروني مع إمكانية الدفع الإلكتروني',
      date: '2024-01-14',
      status: 'read'
    },
    {
      id: 3,
      orderForm: 'ORD-003',
      fullName: 'محمد سالم',
      phoneNumber: '+966512345678',
      details: 'أبحث عن حلول تقنية لإدارة المحتوى وأنظمة إدارة العلاقات مع العملاء',
      date: '2024-01-13',
      status: 'replied'
    },
    {
      id: 4,
      orderForm: 'ORD-004',
      fullName: 'نورا عبدالله',
      phoneNumber: '+966598765432',
      details: 'هل يمكنكم مساعدتي في تطوير منصة تعليمية إلكترونية مع نظام إدارة الطلاب؟',
      date: '2024-01-12',
      status: 'new'
    },
    {
      id: 5,
      orderForm: 'ORD-005',
      fullName: 'خالد الأحمد',
      phoneNumber: '+966523456789',
      details: 'أحتاج إلى استشارة تقنية حول أفضل الحلول لتطوير نظام إدارة المخزون',
      date: '2024-01-11',
      status: 'read'
    },
    {
      id: 6,
      orderForm: 'ORD-006',
      fullName: 'سارة محمد',
      phoneNumber: '+966534567890',
      details: 'مرحباً، أريد تطوير موقع شخصي احترافي مع مدونة ومعرض أعمال',
      date: '2024-01-10',
      status: 'replied'
    }
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'read':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'replied':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'جديدة';
      case 'read':
        return 'مقروءة';
      case 'replied':
        return 'تم الرد';
      default:
        return status;
    }
  };

  const filteredMessages = messages.filter((message) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      message.fullName.toLowerCase().includes(searchLower) ||
      message.phoneNumber.includes(searchTerm) ||
      message.details.toLowerCase().includes(searchLower) ||
      message.orderForm.toLowerCase().includes(searchLower)
    );
  });

  const messageStats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الرسائل</p>
              <p className="text-3xl font-bold text-foreground mt-2">{messageStats.total}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">رسائل جديدة</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{messageStats.new}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">رسائل مقروءة</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{messageStats.read}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <MessageSquare className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">تم الرد عليها</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{messageStats.replied}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">رسائل العملاء</h3>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="btn-gradient text-sm flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="البحث في الرسائل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200"
              />
            </div>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">رقم الطلب</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">اسم العميل</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">رقم الهاتف</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">التفاصيل</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">التاريخ</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <MessageSquare className="w-12 h-12 text-muted-foreground/50" />
                      <span className="text-muted-foreground">لا توجد رسائل</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message, index) => (
                  <tr key={message.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${
                    index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/20'
                  }`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-primary">{message.orderForm}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-foreground">{message.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{message.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                        {message.details}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{message.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(message.status)}`}>
                        {getStatusText(message.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>عرض {filteredMessages.length} من {messages.length} رسالة</span>
            <div className="flex items-center space-x-2 space-x-reverse">
              <button className="px-3 py-1 hover:bg-secondary rounded transition-colors">السابق</button>
              <button className="px-3 py-1 bg-primary text-white rounded">1</button>
              <button className="px-3 py-1 hover:bg-secondary rounded transition-colors">2</button>
              <button className="px-3 py-1 hover:bg-secondary rounded transition-colors">التالي</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMessages;