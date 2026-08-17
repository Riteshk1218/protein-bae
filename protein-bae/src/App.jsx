import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TruckLocation from './components/TruckLocation'
import Menu from './components/Menu'
import WhyProteinBae from './components/WhyProteinBae'
import HowItWorks from './components/HowItWorks'
import AboutUs from './components/AboutUs'
import BusinessModel from './components/BusinessModel'
import Partnerships from './components/Partnerships'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import StickyMobileOrder from './components/StickyMobileOrder'
import CartDrawer from './components/CartDrawer'
import WelcomePopup from './components/WelcomePopup'

// Admin and customer-account routes pull in extra weight (forms, polling)
// that most visitors never need, and the truck map pulls in Leaflet --
// all are only fetched once something actually asks for them.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const CustomerLogin = lazy(() => import('./pages/customer/CustomerLogin'))
const CustomerRegister = lazy(() => import('./pages/customer/CustomerRegister'))
const ForgotPassword = lazy(() => import('./pages/customer/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/customer/ResetPassword'))
const MyOrders = lazy(() => import('./pages/customer/MyOrders'))
const CustomerOrderDetail = lazy(() => import('./pages/customer/CustomerOrderDetail'))
const TrackOrder = lazy(() => import('./pages/customer/TrackOrder'))

function Site() {
  return (
    <div className="bg-offwhite">
      <Navbar />
      <main>
        <Hero />
        <TruckLocation />
        <Menu />
        <WhyProteinBae />
        <HowItWorks />
        <AboutUs />
        <BusinessModel />
        <Partnerships />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileOrder />
      {/* spacer so the sticky mobile order bar never overlaps footer content */}
      <div className="lg:hidden h-20" aria-hidden="true" />
      <CartDrawer />
      <WelcomePopup />
    </div>
  )
}

function PageFallback() {
  return <div className="min-h-screen bg-offwhite" />
}

function withSuspense(Component) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  )
}

export default function App() {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Site />} />
            <Route path="/admin" element={withSuspense(AdminLogin)} />
            <Route path="/admin/dashboard" element={withSuspense(AdminDashboard)} />
            <Route path="/login" element={withSuspense(CustomerLogin)} />
            <Route path="/register" element={withSuspense(CustomerRegister)} />
            <Route path="/forgot-password" element={withSuspense(ForgotPassword)} />
            <Route path="/reset-password" element={withSuspense(ResetPassword)} />
            <Route path="/my-orders" element={withSuspense(MyOrders)} />
            <Route path="/my-orders/:id" element={withSuspense(CustomerOrderDetail)} />
            <Route path="/track/:id" element={withSuspense(TrackOrder)} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </CustomerAuthProvider>
  )
}
