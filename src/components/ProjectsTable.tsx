import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Calendar, Users, CheckCircle } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  client: string;
  status: 'active' | 'completed' | 'pending';
  progress: number;
  deadline: string;
  team: number;
}

const ProjectsTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const projects: Project[] = [
    {
      id: 1,
      name: 'تطوير موقع الشركة',
      client: 'شركة التقنية المتقدمة',
      status: 'active',
      progress: 75,
      deadline: '2024-02-15',
      team: 5
    },
    {
      id: 2,
      name: 'تطبيق الهاتف المحمول',
      client: 'متجر الإلكترونيات',
      status: 'active',
      progress: 45,
      deadline: '2024-03-01',
      team: 3
    },
    {
      id: 3,
      name: 'نظام إدارة المحتوى',
      client: 'مؤسسة الإعلام',
      status: 'completed',
      progress: 100,
      deadline: '2024-01-20',
      team: 4
    },
    {
      id: 4,
      name: 'منصة التجارة الإلكترونية',
      client: 'سوق الأزياء',
      status: 'pending',
      progress: 20,
      deadline: '2024-04-10',
      team: 6
    },
    {
      id: 5,
      name: 'تحديث النظام القديم',
      client: 'البنك الوطني',
      status: 'active',
      progress: 60,
      deadline: '2024-02-28',
      team: 2
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'معلق';
      default:
        return status;
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">المشاريع الحالية</h3>
          <button className="btn-gradient text-sm">
            مشروع جديد +
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث في المشاريع..."
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
              <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">المشروع</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">العميل</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">الحالة</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">التقدم</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">الموعد النهائي</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">الفريق</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project, index) => (
              <tr key={project.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${
                index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/20'
              }`}>
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{project.name}</div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{project.client}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{project.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{project.deadline}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 space-x-reverse text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{project.team} أعضاء</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="p-1 hover:bg-secondary rounded transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-secondary/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>عرض {filteredProjects.length} من {projects.length} مشروع</span>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button className="px-3 py-1 hover:bg-secondary rounded transition-colors">السابق</button>
            <button className="px-3 py-1 bg-primary text-white rounded">1</button>
            <button className="px-3 py-1 hover:bg-secondary rounded transition-colors">2</button>
            <button className="px-3 py-1 hover:bg-secondary rounded transition-colors">التالي</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;