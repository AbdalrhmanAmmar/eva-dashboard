import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import TechnicalReportImmediate from '../components/services/TechnicalReportImmediate';

import MaintenanceContract from '../components/services/MaintenanceContract';
import EngineeringPlan from '../components/services/EngineeringPlan';
import SafetyPlan from '../components/services/SafetyPlan';
import SafetySystems from '../components/services/SafetySystems';
import SystemRehabilitation from '../components/services/SystemRehabilitation';


const serviceTypes = [
  { 
    id: 'technical_report_immediate', 
    name: "تقرير فني فوري وغير فوري وشهاده تركيب ادوات السلامه",
    component: TechnicalReportImmediate
  },
  // { 
  //   id: 'technical_report_delayed', 
  //   name: 'تقرير فني غير فوري',
  //   component: TechnicalReportDelayed
  // },
  // { 
  //   id: 'safety_certificate', 
  //   name: 'شهادة تركيب أدوات السلامة',
  //   component: SafetyCertificate
  // },
  { 
    id: 'maintenance_contract', 
    name: 'عقد الصيانة',
    component: MaintenanceContract
  },
  { 
    id: 'engineering_plan', 
    name: 'مخطط هندسي',
    component: EngineeringPlan
  },
  { 
    id: 'safety_plan', 
    name: 'مخطط سلامة',
    component: SafetyPlan
  },
  { 
    id: 'safety_systems', 
    name: 'توريد وتركيب أنظمة السلامة',
    component: SafetySystems
  },
  { 
    id: 'system_rehabilitation', 
    name: 'إعادة تأهيل الأنظمة',
    component: SystemRehabilitation
  }
];

const ServicesForms: React.FC = () => {
  const [activeTab, setActiveTab] = useState(serviceTypes[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const ActiveComponent = serviceTypes.find(service => service.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">إدارة طلبات الخدمات</h1>
          <p className="text-muted-foreground mt-2">إدارة ومتابعة جميع طلبات الخدمات المختلفة</p>
        </div>
   
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl p-1 shadow-soft">
        <div className="flex overflow-x-auto">
          {serviceTypes.map((service) => (
            <button
              key={service.id}
              onClick={() => setActiveTab(service.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === service.id
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-secondary/50'
              }`}
            >
              {service.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={`البحث في طلبات ${serviceTypes.find(s => s.id === activeTab)?.name}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-secondary rounded-lg border-0 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Active Component */}
      {ActiveComponent && <ActiveComponent searchTerm={searchTerm} />}
    </div>
  );
};

export default ServicesForms;