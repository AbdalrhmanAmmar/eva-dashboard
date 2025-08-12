import React from 'react';
import StatsCard from '../components/StatsCard';
import ProjectsTable from '../components/ProjectsTable';
import RecentActivities from '../components/RecentActivities';
import { MessageSquare, Users, FileText, TrendingUp } from 'lucide-react';
import { useMessages } from '../context/messages.context';

const Dashboard: React.FC = () => {
  const { messagesCount } = useMessages();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="رسائل العملاء"
          value={messagesCount}
          change="2 جديدة"
          changeType="positive"
          icon={MessageSquare}
          gradient={true}
        />
        <StatsCard
          title="المستخدمين النشطين"
          value={1247}
          change="12%"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="المشاريع المكتملة"
          value={89}
          change="8%"
          changeType="positive"
          icon={FileText}
        />
        <StatsCard
          title="معدل النمو"
          value={23}
          change="3%"
          changeType="negative"
          icon={TrendingUp}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Table */}
        <div className="lg:col-span-2">
          <ProjectsTable />
        </div>
        
        {/* Recent Activities */}
        <div className="lg:col-span-1">
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;