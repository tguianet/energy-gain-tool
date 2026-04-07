import { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from '@/contexts/DataContext';
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
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Página pública — acessível sem login */}
            <Route path="/simular" element={<SimulacaoPublicaPage />} />

            {/* Rotas internas */}
            <Route
              path="/*"
              element={
                !loggedIn ? (
                  <LoginPage onLogin={() => setLoggedIn(true)} />
                ) : (
                  <DataProvider>
                    <AppLayout onLogout={() => setLoggedIn(false)}>
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
                )
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
