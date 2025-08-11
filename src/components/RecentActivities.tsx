import React from 'react';
import { Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface Activity {
  id: number;
  type: 'user' | 'project' | 'task' | 'alert';
  title: string;
  description: string;
  time: string;
  user?: string;
}

const RecentActivities: React.FC = () => {
  const activities: Activity[] = [
    {
      id: 1,
      type: 'user',
      title: 'مستخدم جديد',
      description: 'انضم سارة أحمد إلى المنصة',
      time: 'منذ 5 دقائق',
      user: 'سارة أحمد'
    },
    {
      id: 2,
      type: 'project',
      title: 'مشروع مكتمل',
      description: 'تم إنجاز مشروع تطوير الموقع بنجاح',
      time: 'منذ 15 دقيقة'
    },
    {
      id: 3,
      type: 'task',
      title: 'مهمة مكتملة',
      description: 'تم الانتهاء من مراجعة التصميمات',
      time: 'منذ 30 دقيقة'
    },
    {
      id: 4,
      type: 'alert',
      title: 'تنبيه نظام',
      description: 'تم تحديث النظام إلى الإصدار الجديد',
      time: 'منذ ساعة'
    },
    {
      id: 5,
      type: 'user',
      title: 'تسجيل دخول',
      description: 'محمد علي سجل دخول جديد',
      time: 'منذ ساعتين'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'project':
        return <FileText className="w-4 h-4" />;
      case 'task':
        return <CheckCircle className="w-4 h-4" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-600 bg-blue-50';
      case 'project':
        return 'text-green-600 bg-green-50';
      case 'task':
        return 'text-purple-600 bg-purple-50';
      case 'alert':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">الأنشطة الأخيرة</h3>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          عرض الكل
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 space-x-reverse group hover:bg-secondary/50 rounded-lg p-3 -m-3 transition-all duration-200">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {activity.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {activity.description}
              </p>
              <div className="flex items-center mt-2 space-x-2 space-x-reverse">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium py-2 hover:bg-primary/5 rounded-lg transition-all duration-200">
          عرض المزيد من الأنشطة
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;