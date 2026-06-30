import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import OrderForm from './pages/OrderForm'
import OrderQuery from './pages/OrderQuery'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/campanas" element={<Campaigns />} />
          <Route path="/campanas/:slug" element={<CampaignDetail />} />
          <Route path="/campanas/:slug/pedir" element={<OrderForm />} />
          <Route path="/consultar" element={<OrderQuery />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
