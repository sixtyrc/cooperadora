import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import OrderForm from './pages/OrderForm'
import OrderQuery from './pages/OrderQuery'
import PaymentPage from './pages/PaymentPage'
import AdminLayout from './admin/AdminLayout'
import LoginPage from './admin/LoginPage'
import DashboardPage from './admin/DashboardPage'
import CampaignsPage from './admin/CampaignsPage'
import ProductsPage from './admin/ProductsPage'
import OrdersPage from './admin/OrdersPage'
import PaymentsPage from './admin/PaymentsPage'
import DeliveriesPage from './admin/DeliveriesPage'
import ReportsPage from './admin/ReportsPage'
import SettingsPage from './admin/SettingsPage'
import UsersPage from './admin/UsersPage'
import AuditPage from './admin/AuditPage'
import HelpPage from './admin/HelpPage'
import PWAStatus from './components/PWAStatus'

export default function App() {
  return (
    <BrowserRouter>
      <PWAStatus />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/campanas" element={<Campaigns />} />
          <Route path="/campanas/:slug" element={<CampaignDetail />} />
          <Route path="/campanas/:slug/pedir" element={<OrderForm />} />
          <Route path="/consultar" element={<OrderQuery />} />
          <Route path="/pagar/:code" element={<PaymentPage />} />
        </Route>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="campanas" element={<CampaignsPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pagos" element={<PaymentsPage />} />
          <Route path="entregas" element={<DeliveriesPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="auditoria" element={<AuditPage />} />
          <Route path="ayuda" element={<HelpPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
