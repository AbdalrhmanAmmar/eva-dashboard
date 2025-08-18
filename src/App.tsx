import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ServicesForms from './pages/ServiceForms';
import Layout from './components/Layout';
import Messages from './pages/Messages';
import AddServiceForm from './pages/AddServiceForm';
import MetaAnalytics from './pages/MetaAnalytics';
import InventoryManagement from './pages/InventoryManagement';
import WarehousePriority from './pages/WarehousePriority';

import WarehousePage from './pages/Warehouse';
import SmsMessages from './pages/SmsMessage';
import CreateWarehouse from './pages/CreateWarehouse';
import Products from './pages/Products';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="messages" element={<Messages />} />
          <Route path="sms-messages" element={<SmsMessages />} />
          <Route path="analytics" element={<Analytics />} />
                    <Route path="meta-analytics" element={<MetaAnalytics />} />

          <Route path="services-form" element={<ServicesForms />} />
          <Route path="services-form/add-serviceForm" element={<AddServiceForm />} />
          <Route path="inventory-management" element={<InventoryManagement />} />
          <Route path="warehouse-priority" element={<WarehousePriority />} />
          <Route path="warehouse-management" element={<WarehousePage />} />
          <Route path="warehouse-create" element={<CreateWarehouse />} />
          <Route path="settings" element={<Settings />} />
                    <Route path="products" element={<Products />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;