import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { AdminRoute, ClienteRoute } from '@/components/RoleRoute';
import AppLayout from '@/components/AppLayout';
import ClienteLayout from '@/components/ClienteLayout';
import LoginPage from '@/pages/LoginPage';
import CadastroPage from '@/pages/CadastroPage';
import DashboardPage from '@/pages/DashboardPage';
import ClientesPage from '@/pages/ClientesPage';
import SimuladorPage from '@/pages/SimuladorPage';
import PropostasPage from '@/pages/PropostasPage';
import ContratosPage from '@/pages/ContratosPage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import SimulacaoPublicaPage from '@/pages/SimulacaoPublicaPage';
import LeadsPage from '@/pages/LeadsPage';
import ClienteInicioPage from '@/pages/cliente/ClienteInicioPage';
import MinhaSimulacaoPage from '@/pages/cliente/MinhaSimulacaoPage';
import MeuCadastroPage from '@/pages/cliente/MeuCadastroPage';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AppRoutes() {
  const { session, role, signOut } = useAuth();
  const loggedInHome = role === 'admin' ? '/dashboard' : '/app/inicio';

  return (
    <Routes>
      <Route path="/simular" element={<SimulacaoPublicaPage />} />
      <Route path="/cadastro" element={session ? <Navigate to={loggedInHome} replace /> : <CadastroPage />} />
      <Route
        path="/login"
        element={session ? <Navigate to={loggedInHome} replace /> : <LoginPage />}
      />

      {/* Área do cliente */}
      <Route
        path="/app/*"
        element={
          <ClienteRoute>
            <ClienteLayout onLogout={() => { void signOut(); }}>
              <Routes>
                <Route path="/" element={<Navigate to="/app/inicio" replace />} />
                <Route path="/inicio" element={<ClienteInicioPage />} />
                <Route path="/minha-simulacao" element={<MinhaSimulacaoPage />} />
                <Route path="/meu-cadastro" element={<MeuCadastroPage />} />
                <Route path="*" element={<Navigate to="/app/inicio" replace />} />
              </Routes>
            </ClienteLayout>
          </ClienteRoute>
        }
      />

      {/* Área administrativa */}
      <Route
        path="/*"
        element={
          <AdminRoute>
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
          </AdminRoute>
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
