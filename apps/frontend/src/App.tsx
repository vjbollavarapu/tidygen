import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import ClientManagement from "./pages/ClientManagement";
import InventoryManagement from "./pages/InventoryManagement";
import FinanceManagement from "./pages/FinanceManagement";
import HRManagement from "./pages/HRManagement";
import Analytics from "./pages/Analytics";
import Scheduling from "./pages/Scheduling";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } />
          <Route path="/clients" element={
            <MainLayout>
              <ClientManagement />
            </MainLayout>
          } />
          <Route path="/scheduling" element={
            <MainLayout>
              <Scheduling />
            </MainLayout>
          } />
          <Route path="/inventory" element={
            <MainLayout>
              <InventoryManagement />
            </MainLayout>
          } />
          <Route path="/finance" element={
            <MainLayout>
              <FinanceManagement />
            </MainLayout>
          } />
          <Route path="/hr" element={
            <MainLayout>
              <HRManagement />
            </MainLayout>
          } />
          <Route path="/analytics" element={
            <MainLayout>
              <Analytics />
            </MainLayout>
          } />
          <Route path="/reports" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Reports</h1>
                <p className="text-muted-foreground">Reports module coming soon...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/notifications" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Notifications</h1>
                <p className="text-muted-foreground">Notifications center coming soon...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/settings" element={
            <MainLayout>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </div>
            </MainLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
