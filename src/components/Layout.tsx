import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
        
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;