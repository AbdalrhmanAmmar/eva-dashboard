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
import SmsMessages from './pages/SmsMessage';

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
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;