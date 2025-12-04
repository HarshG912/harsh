import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useAnalyticsTheme } from "@/hooks/use-analytics-theme";
import Home from "./pages/Home";
import TenantMenu from "./pages/TenantMenu";
import TenantCart from "./pages/TenantCart";
import TenantBilling from "./pages/TenantBilling";
import TenantAdmin from "./pages/TenantAdmin";
import TenantManagement from "./pages/TenantManagement";
import TenantAnalytics from "./pages/TenantAnalytics";
import Chef from "./pages/Chef";
import UniversalAdmin from "./pages/UniversalAdmin";
import TenantRegistration from "./pages/TenantRegistration";
import Auth from "./pages/Auth";
import Plans from "./pages/Plans";
import Checkout from "./pages/Checkout";
import Waiter from "./pages/Waiter";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { TenantProvider } from "./contexts/TenantContext";
import { TenantLayout } from "./components/layouts/TenantLayout";
import { TableNormalizer } from "./components/layouts/TableNormalizer";
import { UniversalAdminRoute } from "./components/routes/UniversalAdminRoute";
import { TenantRoute } from "./components/routes/TenantRoute";
import PlansOpen from "@/pages/plansopen";
import PaymentProcessing from "./pages/PaymentProcessing";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import SetupPassword from "./pages/SetupPassword";

const queryClient = new QueryClient();

const ThemeInitializer = () => {
  useAnalyticsTheme();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeInitializer />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Home & Policy Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/payment-processing" element={<PaymentProcessing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Public Plans Page - No Login Required */}
            <Route path="/plansopen" element={<PlansOpen />} />
            <Route path="/subscribe/:planId" element={<SubscriptionCheckout />} />
            <Route path="/setup-password" element={<SetupPassword />} />

            {/* Universal Admin Routes */}
            <Route
              path="/admin"
              element={
                <UniversalAdminRoute>
                  <UniversalAdmin />
                </UniversalAdminRoute>
              }
            />
            <Route
              path="/admin/register-tenant"
              element={
                <UniversalAdminRoute>
                  <TenantRegistration />
                </UniversalAdminRoute>
              }
            />
            <Route
              path="/admin/tenant/:tenantId"
              element={
                <UniversalAdminRoute>
                  <TenantManagement />
                </UniversalAdminRoute>
              }
            />

            {/* Auth Route */}
            <Route path="/auth" element={<Auth />} />

            {/* Tenant-specific routes */}
            <Route path="/:tenantId" element={<TenantLayout />}>
               {/* Table routes with normalization to prevent leading zeros bypass */}
              <Route element={<TableNormalizer />}>
                <Route path="table/:tableNumber" element={<TenantMenu />} />
                <Route path="cart/:tableNumber" element={<TenantCart />} />
              </Route>
              <Route path="billing" element={<TenantBilling />} />
              <Route
                path="admin"
                element={
                  <TenantRoute allowedRoles={["tenant_admin"]}>
                    <TenantAdmin />
                  </TenantRoute>
                }
              />
              <Route
                path="chef"
                element={
                  <TenantRoute allowedRoles={["chef"]}>
                    <Chef />
                  </TenantRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <TenantRoute allowedRoles={["manager"]}>
                    <TenantAnalytics />
                  </TenantRoute>
                }
              />
              <Route
                path="plans"
                element={
                  <TenantRoute allowedRoles={["tenant_admin"]}>
                    <Plans />
                  </TenantRoute>
                }
              />
              <Route
                path="checkout/:planId"
                element={
                  <TenantRoute allowedRoles={["tenant_admin"]}>
                    <Checkout />
                  </TenantRoute>
                }
              />
              <Route
                path="waiter"
                element={
                  <TenantRoute allowedRoles={["waiter"]}>
                    <TenantProvider>
                      <Waiter />
                    </TenantProvider>
                  </TenantRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
