import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientesPage from '@/pages/ClientesPage';
import SimuladorPage from '@/pages/SimuladorPage';
import PropostasPage from '@/pages/PropostasPage';
import ContratosPage from '@/pages/ContratosPage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import SimulacaoPublicaPage from '@/pages/SimulacaoPublicaPage';
import LeadsPage from '@/pages/LeadsPage';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AppRoutes() {
  const { session, signOut } = useAuth();

  return (
    <Routes>
      <Route path="/simular" element={<SimulacaoPublicaPage />} />
      <Route
        path="/login"
        element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DataProvider>
              <AppLayout onLogout={() => { void signOut(); }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/simulador" element={<SimuladorPage />} />
                  <Route path="/propostas" element={<PropostasPage />} />
                  <Route path="/contratos" element={<ContratosPage />} />
                  <Route path="/leads" element={<LeadsPage />} />
                  <Route path="/relatorios" element={<RelatoriosPage />} />
                  <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </DataProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
