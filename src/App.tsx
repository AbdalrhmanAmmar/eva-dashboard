import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Users from './pages/Users';
import DetailPage from './pages/DetailPage';
import EngineeringPlanDetails from './pages/EngineeringPlanDetails';
import UserProfilePage from './pages/UserProfilePage';
import MaintenanceContractDetails from './components/MaintenanceContractDetails';
import ProductManagement from './pages/Products/ProductManagement';
import ProductForm from './pages/Products/ProductForm';
import WarehouseEdit from './pages/warehouse/WarehouseEdit';
import WarehouseInventory from './pages/warehouse/inventory/WarehouseInventory';
import InventoryShow from './pages/warehouse/inventory/InventoryShow';
import InventoryShowById from './pages/warehouse/inventory/InventoryShowById';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import TransferQuantities from './pages/warehouse/TransferQuantities';
import Offers from './pages/Offers';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="messages" element={<Messages />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserProfilePage />} />
          <Route path="sms-messages" element={<SmsMessages />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="meta-analytics" element={<MetaAnalytics />} />
          <Route path="services-form" element={<ServicesForms />} />
          <Route path="services-form/add-serviceForm" element={<AddServiceForm />} />
          <Route path="inventory-management" element={<InventoryManagement />} />
          <Route path="warehouse-priority" element={<WarehousePriority />} />
          <Route path="warehouse-management" element={<WarehousePage />} />
          <Route path="/safety-requests/:id" element={<DetailPage />} />
          <Route path="/engineering-plans/:id" element={<EngineeringPlanDetails />} />
          <Route path="/maintenance-contracts/:id" element={<MaintenanceContractDetails />} />
          <Route path="/Product-Management" element={<ProductManagement />} />
          <Route path="/product-create" element={<ProductForm />} />
          <Route path="/edit-warehouse/:id" element={<WarehouseEdit />} />
          <Route path="/warehouse-inventory" element={<WarehouseInventory />} />
          <Route path="/transfer-quantities" element={<TransferQuantities />} />
          <Route path="/inventory-show" element={<InventoryShow />} />
          <Route path="/inventory-show/:id" element={<InventoryShowById />} />
          <Route path="warehouse-create" element={<CreateWarehouse />} />
          <Route path="settings" element={<Settings />} />
          <Route path="offers" element={<Offers />} />
          <Route path="products" element={<Products />} />
        </Route>
        
        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;