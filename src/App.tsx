import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCard from './components/StatsCard';
import RecentActivities from './components/RecentActivities';
import ProjectsTable from './components/ProjectsTable';
import CustomerMessages from './components/CustomerMessages';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  Clock,
  Target,
  Award,
  MessageSquare
} from 'lucide-react';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false); // Close mobile menu when section changes
  };
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 right-0 z-50 transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={handleSidebarToggle}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={handleMobileMenuToggle} />
        
        <main className="flex-1 p-6 space-y-6">
          {activeSection === 'messages' ? (
            <CustomerMessages />
          ) : (
            <>
              {/* Messages Count Card */}
              <div className="max-w-md animate-fade-in">
                <StatsCard
                  title="رسائل العملاء"
                  value="6"
                  change="2 جديدة"
                  changeType="positive"
                  icon={MessageSquare}
                  gradient={true}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;