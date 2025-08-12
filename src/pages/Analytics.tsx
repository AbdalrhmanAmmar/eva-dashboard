import React from 'react';
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import StatsCard from '../components/StatsCard';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">التحليلات والإحصائيات</h1>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي الزيارات"
          value={15420}
          change="15%"
          changeType="positive"
          icon={BarChart3}
        />
        <StatsCard
          title="معدل التحويل"
          value={3.2}
          change="0.5%"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatsCard
          title="المستخدمين الجدد"
          value={892}
          change="22%"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="معدل النشاط"
          value={67}
          change="5%"
          changeType="negative"
          icon={Activity}
        />
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-4">الزيارات الشهرية</h3>
          <div className="h-64 bg-secondary/30 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">مخطط الزيارات الشهرية</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-4">توزيع المستخدمين</h3>
          <div className="h-64 bg-secondary/30 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">مخطط توزيع المستخدمين</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;