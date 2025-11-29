import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberForm from './pages/MemberForm';

import Staff from './pages/Staff';
import StaffForm from './pages/StaffForm';
import Appointments from './pages/Appointments';
import AppointmentForm from './pages/AppointmentForm';
import Sales from './pages/Sales';
import SalesForm from './pages/SalesForm';
import Reports from './pages/Reports';
import Enquiries from './pages/Enquiries';

import EnquiryForm from './pages/EnquiryForm';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Attendance from './pages/Attendance';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceView from './pages/InvoiceView';
import Payments from './pages/Payments';
import Classes from './pages/Classes';
import ClassForm from './pages/ClassForm';
import ClassView from './pages/ClassView';
import Notifications from './pages/Notifications';
import NotificationForm from './pages/NotificationForm';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="members/new" element={<MemberForm />} />
        <Route path="members/edit/:id" element={<MemberForm />} />
        <Route path="staff" element={<Staff />} />
        <Route path="staff/new" element={<StaffForm />} />
        <Route path="staff/edit/:id" element={<StaffForm />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="appointments/new" element={<AppointmentForm />} />
        <Route path="sales" element={<Sales />} />
        <Route path="sales/new" element={<SalesForm />} />
        <Route path="reports" element={<Reports />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="enquiries/new" element={<EnquiryForm />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/:id" element={<InvoiceView />} />
        <Route path="payments" element={<Payments />} />
        <Route path="classes" element={<Classes />} />
        <Route path="classes/new" element={<ClassForm />} />
        <Route path="classes/edit/:id" element={<ClassForm />} />
        <Route path="classes/:id" element={<ClassView />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="notifications/new" element={<NotificationForm />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
